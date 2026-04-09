import socket
import sys
import re
import json
import subprocess
import threading
import time

class JdbBridge:
    def __init__(self, port, main_class, classpath, entry_class=None):
        self.current_line = 1
        self.suppress_logs = False
        self.variables_cache = {}
        self.dumping_var = None   # Tracks which variable is currently being dumped
        self.dump_buffer = []     # Accumulates the multiline dump output
        self.dump_depth = 0      # Tracks nested braces in dumps
        self.running = True
        self.port = port
        self.main_class = main_class
        self.classpath = classpath
        # Use entry_class if provided, otherwise default to main_class
        self.entry_class = entry_class if entry_class else main_class
        
        self.jdb_process = None
        self.client_sock = None
        self.breakpoints = []
        self.lock = threading.Lock()

    def start(self):
        # 1. Start JDB (The actual debugger)
        # We tell it to run the class with the given classpath
        cmd = ['jdb', '-classpath', self.classpath, self.entry_class]
        print(f"[BRIDGE] Starting JDB: {' '.join(cmd)}")
        
        self.jdb_process = subprocess.Popen(
            cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=0,# Unbuffered
            # ADD THIS LINE: Run JDB inside the session folder so it finds input.txt
            cwd=self.classpath
        )
        
        # 2. Start Socket Server (To listen to your Adapter)
        server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        server.bind(('127.0.0.1', self.port))
        server.listen(1)
        print(f"[BRIDGE] Listening on port {self.port}...")
        
        # 3. Start reading JDB output in background
        threading.Thread(target=self._read_jdb_output, daemon=True).start()
        
        # 4. Wait for Adapter to connect
        conn, addr = server.accept()
        self.client_sock = conn
        self._handle_client()

    def _send_dap_event(self, event, body=None):
        msg = {
            "type": "event",
            "seq": 0,
            "event": event,
            "body": body or {}
        }
        self._send_json(msg)

    def _send_dap_response(self, request, success=True, body=None):
        msg = {
            "type": "response",
            "seq": 0,
            "request_seq": request['seq'],
            "command": request['command'],
            "success": success,
            "body": body or {}
        }
        self._send_json(msg)

    def _send_json(self, data):
        if not self.client_sock: return
        try:
            payload = json.dumps(data)
            msg = f"Content-Length: {len(payload)}\r\n\r\n{payload}"
            self.client_sock.sendall(msg.encode())
        except: pass

    def _write_jdb(self, cmd):
        """Send text command to JDB"""
        print(f"[BRIDGE -> JDB] Executing: {cmd}") # NEW DEBUG LOG
        if self.jdb_process:
            self.jdb_process.stdin.write(cmd + "\n")
            self.jdb_process.stdin.flush()

    def _read_jdb_output(self):
        """Read JDB output, parse variables, and strictly filter frontend logs"""

        while self.running and self.jdb_process:
            try:
                line = self.jdb_process.stdout.readline()
                if not line: break
                
                # Clean the line and strip the JDB prompt immediately
                line = line.strip()
                line = re.sub(r'^main\[\d+\]\s*>?[ \t]*', '', line)
                if not line: continue

                # --- 0. Multiline Dump Parsing (STRICT & DEPTH-AWARE) ---
                if self.dumping_var:
                    self.dump_buffer.append(line)
                    
                    # Track nested brackets to know when the object is fully dumped
                    if "{" in line:
                        self.dump_depth += line.count("{")
                    if "}" in line:
                        self.dump_depth -= line.count("}")
                        
                    if self.dump_depth <= 0:
                        # We've reached the very end of the complex array/object
                        formatted_val = " ".join(self.dump_buffer)
                        formatted_val = re.sub(r'\s+', ' ', formatted_val) # Remove extra spacing
                        formatted_val = formatted_val.replace(", }", " }")
                        
                        self.variables_cache[self.dumping_var] = formatted_val
                        
                        # Reset state
                        self.dumping_var = None
                        self.dump_buffer = []
                        self.dump_depth = 0
                    continue

                # STRICT detection of a JDB dump start (Matches EXACTLY "varName = {")
                dump_match = re.match(r'^([a-zA-Z0-9_$]+)\s*=\s*\{$', line)
                if dump_match and dump_match.group(1) in self.variables_cache:
                    self.dumping_var = dump_match.group(1)
                    self.dump_buffer = ["{"]
                    self.dump_depth = 1
                    self.suppress_logs = True # Hide dump output from frontend
                    continue

                # --- 1. Standard Variable Parsing ---
                if " = " in line and not line.startswith("[") and not line.endswith(';') and "Method arguments:" not in line and "Local variables:" not in line:
                    parts = line.split(" = ", 1)
                    if len(parts) == 2:
                        var_name = parts[0].strip()
                        var_val = parts[1].strip()
                        print(f"[BRIDGE DEBUG] Found Var: {var_name} Val: {var_val}") # NEW DEBUG LOG
                        
                        # INTERCEPT BACKGROUND ARRAY EVALUATIONS
                        # Inside _read_jdb_output, when intercepting Arrays.toString
                        if "java.util.Arrays." in var_name or "String.valueOf" in var_name or '"" +' in var_name:
                            match = re.search(r'(?:ToString|deepToString|valueOf|\+)\s*\(([a-zA-Z0-9_$]+)\)', var_name, re.IGNORECASE)
                            clean_name = match.group(1).strip() if match else var_name.replace('"" +', '').strip()
    
                            if var_val.startswith('"') and var_val.endswith('"'):
                                var_val = var_val[1:-1]

                            # Update cache with CLEAN name, overwriting the "instance of" entry
                            self.variables_cache[clean_name] = var_val
                            self.suppress_logs = True
                            self._send_dap_event("variables_update", {"variables": {clean_name: var_val}})
                            continue

                        # Store the initial memory address or primitive value
                        
                        # TRIGGER BACKGROUND EVALUATION BASED ON DATATYPE
                        if "instance of" in var_val:
                            print(f"[BRIDGE DEBUG] Triggering eval for {var_name} (Type detected)") # NEW DEBUG LOG
                            if "][" in var_val: 
                                # 2D Array or higher (e.g., int[][3])
                                self._write_jdb(f'print java.util.Arrays.deepToString({var_name})')
                            elif "[" in var_val: 
                                # 1D Array (e.g., int[5] or String[3])
                                self._write_jdb(f'print java.util.Arrays.toString({var_name})')
                            elif "HashMap" in var_val or "Map" in var_val or "List" in var_val:
                                # Forces the use of .toString() instead of 'dump'
                                self._write_jdb(f'print "" + {var_name}')
                            elif "java.lang." in var_val: 
                                # Wrapper classes (Integer, Double, String)
                                self._write_jdb(f'print {var_name}')
                            else: 
                                # Custom Objects (Nodes, Trees, HashMaps) fall back to multiline dump
                                self._write_jdb(f'dump {var_name}')
                        self.variables_cache[var_name] = var_val        
                # --- 2. Noise Detection Logic ---
                is_noise = False
                
                # A. Detect start of variable dumps (Noise block start)
                if "Method arguments:" in line or "Local variables:" in line:
                    self.suppress_logs = True
                    is_noise = True
                
                # B. Detect JDB Prompts (Noise block end)
                # Matches "main[1] >" or just ">"
                if line == ">" or (line.startswith("main[") and line.endswith(">")):
                    self.suppress_logs = False
                    is_noise = True

                # C. Check active suppression
                if self.suppress_logs:
                    is_noise = True

                # D. Single-line noise patterns
                if "Breakpoint hit:" in line or "Step completed:" in line: is_noise = True
                if "Set uncaught" in line or "Set deferred" in line: is_noise = True
                if "VM Started:" in line: is_noise = True
                if "The application exited" in line: is_noise = True
                
                # E. Source code echo filter (Lines starting with number)
                # E.g. "4            String s = "";"
                if re.match(r'^\d+\s+.*', line): is_noise = True

                # --- 3. Send to Frontend (Only if NOT noise) ---
                if line and not is_noise:
                    self._send_dap_event("output", {"category": "stdout", "output": line + "\n"})

                # --- 4. Event Triggering ---
                if "Breakpoint hit:" in line or "Step completed:" in line:
                    self.variables_cache = {} # Clear old vars
                    self._write_jdb("locals") # Trigger update
                    
                    match = re.search(r'line=(\d+)', line)
                    if match: self.current_line = int(match.group(1))
                    
                    self._send_dap_event("stopped", {"reason": "breakpoint", "threadId": 1})
                
                elif "The application exited" in line:
                    self._send_dap_event("terminated")
                    self.running = False
                    break
                    
                elif "Exception occurred:" in line:
                    self._send_dap_event("stopped", {"reason": "exception", "threadId": 1})
                    
            except Exception as e:
                print(f"Bridge Read Error: {e}")
                break
    def _handle_client(self):
        """Read JSON requests from Adapter"""
        buffer = b""
        while True:
            chunk = self.client_sock.recv(4096)
            if not chunk: break
            buffer += chunk
            
            while b"\r\n\r\n" in buffer:
                header, rest = buffer.split(b"\r\n\r\n", 1)
                content_length = int(header.split(b"Content-Length: ")[1])
                if len(rest) < content_length: break
                
                body = rest[:content_length]
                buffer = rest[content_length:]
                
                request = json.loads(body)
                self._process_dap_request(request)

    def _process_dap_request(self, req):
        cmd = req['command']
        
        # --- Translate DAP Requests to JDB Commands ---
        
        if cmd == 'initialize':
            self._send_dap_response(req)
            self._send_dap_event("initialized")
            
        elif cmd == 'attach' or cmd == 'launch':
            self._send_dap_response(req)
            
        elif cmd == 'setBreakpoints':
            # JDB syntax: stop at MyClass:10
            bps = req['arguments']['breakpoints']
            for bp in bps:
                target_class = "Solution"
                self._write_jdb(f"stop at {target_class}:{bp['line']}")
            
            # Tell frontend they are verified
            self._send_dap_response(req, body={
                "breakpoints": [{"verified": True, "line": b['line']} for b in bps]
            })
            
        elif cmd == 'configurationDone':
            time.sleep(0.5) # Small delay to ensure breakpoints are set
            self._write_jdb("run") # Start the program
            self._send_dap_response(req)
            
        elif cmd == 'threads':
            self._send_dap_response(req, body={"threads": [{"id": 1, "name": "main"}]})
            
        elif cmd == 'stackTrace':
            self._send_dap_response(req, body={
                "stackFrames": [{
                    "id": 1, 
                    "name": "Main", 
                    "line": self.current_line, # USE PARSED LINE NUMBER
                    "column": 1,
                    "source": {"name": f"{self.main_class}.java", "path": f"{self.main_class}.java"}
                }]
            })
        # --- NEW: Handle Scopes Request ---
        elif cmd == 'scopes':
            # We return a single "Locals" scope with reference ID 1
            self._send_dap_response(req, body={
                "scopes": [{
                    "name": "Locals",
                    "variablesReference": 1, # This ID is passed to 'variables' request next
                    "expensive": False
                }]
            })
            
        elif cmd == 'next':     self._write_jdb("next"); self._send_dap_response(req)
        elif cmd == 'stepIn':   self._write_jdb("step"); self._send_dap_response(req)
        elif cmd == 'continue': self._write_jdb("cont"); self._send_dap_response(req)
        # --- Updated Variables Request ---
        elif cmd == 'variables':
            # Return the variables we captured in the reader loop
            vars_list = [
                {"name": k, "value": v, "variablesReference": 0} 
                for k, v in self.variables_cache.items()
            ]
            self._send_dap_response(req, body={"variables": vars_list})

        elif cmd == 'disconnect':
            self._write_jdb("exit")
            self._send_dap_response(req)
            sys.exit(0)

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, required=True)
    parser.add_argument("--classpath", required=True)
    parser.add_argument("--main", required=True)
    # Add this new arg
    parser.add_argument("--entry-class", required=False)
    args = parser.parse_args()
    
    bridge = JdbBridge(args.port, args.main, args.classpath, args.entry_class)
    bridge.start()