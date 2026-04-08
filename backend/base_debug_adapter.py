"""
Base Debug Adapter with extensive debugging and proper DAP flow
"""
import shutil
import traceback
import gevent
from gevent import socket, subprocess, time
from gevent.queue import Queue
from gevent.event import Event
from gevent.lock import Semaphore
import json
from abc import ABC, abstractmethod
from typing import Dict, List, Any, Optional, Callable
from enum import Enum
import os

class DebuggerState(Enum):
    DISCONNECTED = "disconnected"
    INITIALIZING = "initializing"
    RUNNING = "running"
    PAUSED = "paused"
    TERMINATED = "terminated"


class DAPMessage:
    """Represents a DAP protocol message"""
    def __init__(self, msg_type: str, data: dict):
        self.type = msg_type
        self.data = data
        
    @property
    def command(self) -> Optional[str]:
        return self.data.get('command')
    
    @property
    def event(self) -> Optional[str]:
        return self.data.get('event')
    
    @property
    def body(self) -> dict:
        return self.data.get('body', {})


class BaseDebugAdapter(ABC):
    """
    Abstract base class for all debug adapters.
    Handles DAP protocol communication and threading.
    """
    
    def __init__(self, file_path: str, port: int, on_event: Optional[Callable] = None,work_dir: Optional[str] = None):
        self.file_path = os.path.realpath(file_path)
        self.port = port
        self.on_event = on_event
        self.work_dir = work_dir
        self._resources_cleaned_up = False
        # Connection
        self.process: Optional[subprocess.Popen] = None
        self.sock: Optional[socket.socket] = None
        
        # Protocol
        self.seq = 1
        self.state = DebuggerState.DISCONNECTED
        
        # Threading
        self.message_queue = Queue()
        self.listener_greenlet = None
        self.stop_event = Event()
        self.dap_initialized_event = Event()
        # Response tracking
        self.pending_responses: Dict[int, Queue] = {}
        self.response_lock = Semaphore()
        
        # DAP state
        self.thread_id: Optional[int] = None
        self.current_frame_id: Optional[int] = None
        
        # Debug flag
        self.debug = False
    
    def log(self, msg: str):
        """Debug logging"""
        if self.debug:
            print(f"[ADAPTER-{self.port}] {msg}")
    
    @abstractmethod
    def _start_debug_server(self) -> subprocess.Popen:
        """Start the language-specific debug server process."""
        pass
    
    @abstractmethod
    def get_language(self) -> str:
        """Return language name"""
        pass
    
    def start(self, timeout: float = 10.0) -> bool:
        """Start the debug session"""
        self.log("=== Starting Debug Session ===")
        self.state = DebuggerState.INITIALIZING
        
        # 1. Start debug server process
        try:
            self.log("Starting debug server process...")
            self.process = self._start_debug_server()
            self.log(f"Process started with PID: {self.process.pid}")
        except Exception as e:
            self.log(f"ERROR: Failed to start debug server: {e}")
            traceback.print_exc()
            self.state = DebuggerState.DISCONNECTED
            return False
        
        # 2. Connect to debug server
        self.log(f"Connecting to debug server on port {self.port}...")
        if not self._connect_to_server(timeout):
            self.log("ERROR: Failed to connect to debug server")
            self.state = DebuggerState.DISCONNECTED
            if self.process:
                self.process.kill()
            return False
        self.log("Connected successfully!")
        
        # 3. Start message listener greenlet
        self.log("Starting message listener...")
        self.listener_greenlet = gevent.spawn(self._message_listener)
        
        # 4. Perform DAP initialization
        self.log("Initializing DAP protocol...")
        if not self._initialize_dap():
            self.log("ERROR: Failed to initialize DAP")
            self.stop()
            return False
        
        self.state = DebuggerState.RUNNING
        self.log("=== Debug Session Started Successfully ===")
        return True
        
    def set_breakpoints(self, lines: List[int]) -> bool:
            """Set breakpoints at specified line numbers"""
            
            # Ensure we are using real path
            abs_path = os.path.realpath(self.file_path)
            lines = [int(i) for i in lines]
            self.log(f"Setting breakpoints at lines: {lines} in {abs_path}")
            
            response = self._send_request("setBreakpoints", {
                "source": {
                    "path": abs_path, 
                    "name": os.path.basename(abs_path)
                },
                "breakpoints": [{"line": line} for line in lines],
                "lines": lines
            }, timeout=3.0)
            
            if response:
                body = response.body
                bps = body.get('breakpoints', [])
                self.log(f"Breakpoints response: {bps}") # Log the full response to debug
                
                verified_count = sum(1 for bp in bps if bp.get('verified', False))
                self.log(f"Verified: {verified_count}/{len(bps)}")
                
                # CRITICAL FIX: Even if verify fails, we return True so execution starts. 
                # But we should warn.
                return True 
            else:
                self.log("ERROR: Failed to set breakpoints (No response)")
                return False
    
    def continue_execution(self) -> bool:
        """Continue execution until next breakpoint"""
        self.log("Continue execution requested")
        
        # Get thread ID if not available
        if not self.thread_id:
            self.log("No thread ID, fetching threads...")
            threads_resp = self._send_request("threads", {})
            if threads_resp and threads_resp.body.get('threads'):
                threads = threads_resp.body['threads']
                self.thread_id = threads[0]['id']
                self.log(f"Got thread ID: {self.thread_id}")
            else:
                self.log("WARNING: Could not get thread ID")
                return False
        
        response = self._send_request("continue", {
            "threadId": self.thread_id
        })
        
        if response:
            self.state = DebuggerState.RUNNING
            self.log("Execution continued")
            return True
        else:
            self.log("ERROR: Continue failed")
            return False
    
    def step_over(self) -> bool:
        """Step over (next line)"""
        self.log(f"Step over - thread: {self.thread_id}")
        if not self.thread_id:
            self.log("ERROR: No thread ID for step over")
            return False
        
        response = self._send_request("next", {
            "threadId": self.thread_id
        })
        
        if response:
            self.log("Step over successful")
            return True
        else:
            self.log("ERROR: Step over failed")
            return False
    
    def step_into(self) -> bool:
        """Step into"""
        self.log(f"Step into - thread: {self.thread_id}")
        if not self.thread_id:
            return False
        
        response = self._send_request("stepIn", {
            "threadId": self.thread_id
        })
        return response is not None
    
    def step_out(self) -> bool:
        """Step out"""
        self.log(f"Step out - thread: {self.thread_id}")
        if not self.thread_id:
            return False
        
        response = self._send_request("stepOut", {
            "threadId": self.thread_id
        })
        return response is not None
    
    def get_stack_trace(self) -> List[Dict[str, Any]]:
        """Get current call stack"""
        if not self.thread_id:
            self.log("WARNING: No thread ID for stack trace")
            return []
        
        self.log(f"Getting stack trace for thread {self.thread_id}")
        response = self._send_request("stackTrace", {
            "threadId": self.thread_id,
            "startFrame": 0,
            "levels": 20
        })
        
        if response:
            frames = response.body.get('stackFrames', [])
            self.log(f"Got {len(frames)} stack frames")
            return frames
        else:
            self.log("ERROR: Failed to get stack trace")
            return []
    
    def get_variables(self, frame_id: Optional[int] = None) -> List[Dict[str, Any]]:
        """Primary entry point for variable fetching with language dispatching"""
        if frame_id is None:
            stack = self.get_stack_trace()
            if not stack: return []
            frame_id = stack[0]['id']
        
        scopes_response = self._send_request("scopes", {"frameId": frame_id})
        if not scopes_response: return []
        
        scopes = scopes_response.body.get('scopes', [])
        all_variables = []
        lang = self.get_language().lower()

        for scope in scopes:
            if scope.get('name') in ["Globals", "Registers", "Static"]: continue
            
            var_ref = scope.get('variablesReference', 0)
            if var_ref == 0: continue
            
            vars_response = self._send_request("variables", {"variablesReference": var_ref})
            if not vars_response: continue
            
            variables = vars_response.body.get('variables', [])
            
            # Dispatch to specific language resolver
            if lang == 'python':
                all_variables.extend(self._resolve_python_variables(variables))
            elif lang in ['cpp', 'c++']:
                all_variables.extend(self._resolve_cpp_variables(variables))
            else:
                all_variables.extend(variables) # Default fallback
                
        return all_variables

    def _resolve_python_variables(self, variables: List[Dict]) -> List[Dict]:
        """Pure Python logic based on your working reference code"""
        processed = []
        for var in variables:
            name = var.get('name', '')
            ref = var.get('variablesReference', 0)
            
            if name.startswith('__') or name in ['special variables', 'function variables', 'len()']:
                continue

            if ref > 0:
                child_resp = self._send_request("variables", {"variablesReference": ref}, timeout=2.0)
                if child_resp:
                    children = child_resp.body.get('variables', [])
                    clean_children = [
                        c for c in children 
                        if not c.get('name', '').startswith('__') 
                        and c.get('name') not in ['len()', 'special variables', 'function variables']
                    ]

                    var_type = var.get('type', '').lower()
                    is_map = 'dict' in var_type or 'map' in var_type or 'hash' in var_type
                    is_list = 'list' in var_type or 'vector' in var_type or 'array' in var_type

                    if is_list:
                        vals = [c.get('value', '') for c in clean_children]
                        var['value'] = f"[{', '.join(vals)}]"
                    elif is_map:
                        pairs = [f"{c.get('name')}: {c.get('value')}" for c in clean_children]
                        var['value'] = f"{{{', '.join(pairs)}}}"
                    else:
                        is_numeric_keys = all(c.get('name', '').strip('[]').isdigit() for c in clean_children)
                        if is_numeric_keys and clean_children:
                            vals = [c.get('value', '') for c in clean_children]
                            var['value'] = f"[{', '.join(vals)}]"
                        else:
                            pairs = [f"{c.get('name')}: {c.get('value')}" for c in clean_children]
                            var['value'] = f"{{{', '.join(pairs)}}}"
                
                var['variablesReference'] = 0
            processed.append(var)
        return processed

    def _resolve_cpp_variables(self, variables: List[Dict]) -> List[Dict]:
        """Dedicated C++ logic for handling pointers and std::pair"""
        processed = []
        for var in variables:
            if var.get('name', '').startswith('_'): continue
            
            ref = var.get('variablesReference', 0)
            if ref > 0:
                var['value'] = self._deep_resolve_cpp(ref)
                var['variablesReference'] = 0
            processed.append(var)
        return processed

    def _deep_resolve_cpp(self, ref: int) -> str:
        """Recursive helper specifically for C++ memory structures"""
        resp = self._send_request("variables", {"variablesReference": ref}, timeout=2.0)
        if not resp: return "..."
        
        children = [c for c in resp.body.get('variables', []) if not c.get('name', '').startswith('_')]
        if not children: return "[]"

        # Detect if child is std::pair (Map entry)
        if any('pair' in str(c.get('type', '')).lower() for c in children):
            pairs = []
            for c in children:
                p_ref = c.get('variablesReference', 0)
                if p_ref > 0:
                    p_resp = self._send_request("variables", {"variablesReference": p_ref})
                    if p_resp:
                        pc = p_resp.body.get('variables', [])
                        k = next((x.get('value') for x in pc if x.get('name') in ['first', '[0]']), "?")
                        v = next((x.get('value') for x in pc if x.get('name') in ['second', '[1]']), "?")
                        pairs.append(f"{k}: {v}")
            return f"{{{', '.join(pairs)}}}"

        # Handle Arrays/Vectors/Matrix
        is_numeric = all(c.get('name', '').strip('[]').isdigit() for c in children)
        if is_numeric:
            vals = []
            for c in children:
                c_ref = c.get('variablesReference', 0)
                vals.append(self._deep_resolve_cpp(c_ref) if c_ref > 0 else c.get('value'))
            return f"[{', '.join(vals)}]"
        hashmaps = ", ".join([f'{c.get("name")}: {c.get("value")}' for c in children] )
        return '{'+hashmaps+'}'
        
    
    def get_current_state(self) -> Optional[Dict[str, Any]]:
        """Get complete current debugger state"""
        self.log("Getting current state...")
        
        if self.state != DebuggerState.PAUSED:
            self.log(f"Not paused (state: {self.state})")
            return None
        
        stack = self.get_stack_trace()
        if not stack:
            self.log("No stack frames available")
            return None
        
        top_frame = stack[0]
        self.log(f"Top frame: {top_frame.get('name')} at line {top_frame.get('line')}")
        
        variables = self.get_variables(top_frame['id'])
        self.log(f"Got {len(variables)} total variables")
        
        state = {
            'line': top_frame.get('line'),
            'column': top_frame.get('column'),
            'function': top_frame.get('name'),
            'variables': variables,
            'stack': stack,
            'state': self.state.value
        }
        
        return state
    
    def evaluate(self, expression: str, frame_id: Optional[int] = None) -> Optional[str]:
        """Evaluate an expression"""
        if frame_id is None:
            stack = self.get_stack_trace()
            if not stack:
                return None
            frame_id = stack[0]['id']
        
        self.log(f"Evaluating: {expression}")
        response = self._send_request("evaluate", {
            "expression": expression,
            "frameId": frame_id,
            "context": "repl"
        })
        
        if response:
            result = response.body.get('result')
            self.log(f"Evaluation result: {result}")
            return result
        return None
    
    def stop(self):
            """
            Master Cleanup Method: Stops process, closes sockets, deletes files.
            Safe to call multiple times.
            """
            # 1. NEW Idempotency Check (Checks cleanup status, NOT logical state)
            if self._resources_cleaned_up:
                return
            
            self._resources_cleaned_up = True
                
            self.log("=== Stopping Debug Session (Master Cleanup) ===")
            self.state = DebuggerState.TERMINATED
            
            # 2. Unblock any waiting threads
            if not self.stop_event.ready():
                self.stop_event.set() # Unblock listener
            if not self.dap_initialized_event.ready():
                self.dap_initialized_event.set() # Fail any pending inits

            # 3. Graceful DAP Disconnect (Try-Catch everything)
            if self.sock:
                try:
                    with gevent.Timeout(0.2):
                        self._send_request("disconnect", {"restart": False, "terminateDebuggee": True})
                except: pass
                
                try: self.sock.close()
                except: pass
                self.sock = None

            # 4. Kill the Process (Hard Kill)
            if self.process:
                try:
                    self.process.terminate()
                    gevent.sleep(0.1)
                    if self.process.poll() is None:
                        self.process.kill()
                except: pass
                self.process = None

            # 5. Kill Listener Greenlet
            if self.listener_greenlet:
                try: gevent.kill(self.listener_greenlet)
                except: pass
                self.listener_greenlet = None

            # 6. Delete Temp Files
            if self.work_dir and os.path.exists(self.work_dir):
                try:
                    self.log(f"Deleting temp session: {self.work_dir}")
                    shutil.rmtree(self.work_dir, ignore_errors=True)
                except Exception as e:
                    self.log(f"Warning: Failed to delete temp dir: {e}")
            
            self.log("=== Debug Session Destroyed ===")
    
    # ==================== Internal DAP Protocol ====================
    
    def _connect_to_server(self, timeout: float) -> bool:
        """Connect to debug server with retry"""
        start_time = time.time()
        retry_count = 0
        
        while time.time() - start_time < timeout:
            try:
                self.sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                self.sock.connect(("127.0.0.1", self.port))
                self.log(f"Connected after {retry_count} retries")
                return True
            except (ConnectionRefusedError, socket.timeout, OSError) as e:
                if self.sock:
                    try:
                        self.sock.close()
                    except:
                        pass
                retry_count += 1
                gevent.sleep(0.2)
        
        self.log(f"Connection failed after {retry_count} retries")
        return False
    
    def _initialize_dap(self) -> bool:
        """Perform DAP initialization handshake"""
        # Send initialize request
        self.log("Sending initialize request...")
        init_response = self._send_request("initialize", {
            "adapterID": self.get_language(),
            "pathFormat": "path",
            "linesStartAt1": True,
            "columnsStartAt1": True,
            "supportsVariableType": True,
            "supportsVariablePaging": False,
            "supportsRunInTerminalRequest": False
        }, timeout=5.0)
        
        if not init_response:
            self.log(f"ERROR: Initialize request failed. Msg: {init_response.message if init_response else 'No response'}")
            return False
        
        # --- FIX STARTS HERE ---
        # Instead of blocking on the Attach response, we send it manually and wait for the 'initialized' Event.
        self.log("Sending attach request (Non-blocking)...")
        
        attach_payload = {
            "seq": self.seq,
            "type": "request",
            "command": "attach",
            "arguments": {
                "name": "Attach",
                "type": self.get_language(),
                "request": "attach",
                "connect": {
                    "host": "127.0.0.1",
                    "port": self.port
                }
            }
        }
        
        try:
            body = json.dumps(attach_payload)
            msg = f"Content-Length: {len(body)}\r\n\r\n{body}"
            self.sock.sendall(msg.encode('utf-8'))
            self.seq += 1
        except Exception as e:
            self.log(f"ERROR sending attach: {e}")
            return False

        self.log("Attach sent. Waiting for 'initialized' event signal...")
        
        # Rely purely on the event. If this fires, we are good.
        try:
            with gevent.Timeout(5.0):
                self.dap_initialized_event.wait()
                self.log("Received 'initialized' signal")
        except gevent.Timeout:
            self.log("CRITICAL ERROR: Timeout waiting for 'initialized' event.")
            return False
        self.log("DAP initialization complete (configurationDone will be sent later)")
        
        return True
        # --- FIX ENDS HERE ---
    
    def launch_with_breakpoints(self, breakpoints: List[int]) -> bool:
        """
        Set breakpoints and then send configurationDone to start execution.
        This is the correct DAP flow!
        """
        self.log("=== Launch with Breakpoints ===")
        
        # 1. Set breakpoints FIRST
        if breakpoints:
            if not self.set_breakpoints(breakpoints):
                self.log("WARNING: Breakpoint setting failed")
        
        # 2. Now send configurationDone to start execution
        self.log("Sending configurationDone...")
        config_response = self._send_request("configurationDone", {}, timeout=3.0)
        
        if not config_response:
            self.log("ERROR: configurationDone failed")
            return False
        
        self.log("configurationDone successful - execution will start")
        return True
    
    def _send_request(self, command: str, args: Optional[dict] = None, timeout: float = 5.0) -> Optional[DAPMessage]:
        """Send a DAP request and wait for response"""
        if not self.sock:
            return None
        
        request_seq = self.seq
        payload = {
            "seq": request_seq,
            "type": "request",
            "command": command,
            "arguments": args or {}
        }
        
        # Create response queue for this request
        response_queue = Queue()
        with self.response_lock:
            self.pending_responses[request_seq] = response_queue
        
        # Send request
        try:
            body = json.dumps(payload)
            message = f"Content-Length: {len(body)}\r\n\r\n{body}"
            self.sock.sendall(message.encode('utf-8'))
            self.seq += 1
            # self.log(f"Sent: {command}")
        except Exception as e:
            self.log(f"ERROR sending {command}: {e}")
            with self.response_lock:
                if request_seq in self.pending_responses:
                    del self.pending_responses[request_seq]
            return None
        
        # Wait for response
        try:
            with gevent.Timeout(timeout):
                response = response_queue.get()
                with self.response_lock:
                    if request_seq in self.pending_responses:
                        del self.pending_responses[request_seq]
                # self.log(f"Received: {command} response")
                return response
        except gevent.Timeout:
            self.log(f"TIMEOUT waiting for {command} response")
            with self.response_lock:
                if request_seq in self.pending_responses:
                    del self.pending_responses[request_seq]
            return None
    
    def _wait_for_event(self, event_name: str, timeout: float = 5.0) -> Optional[DAPMessage]:
        """Wait for a specific event"""
        try:
            with gevent.Timeout(timeout):
                while True:
                    msg = self.message_queue.get()
                    if msg.type == "event" and msg.event == event_name:
                        return msg
                    self.message_queue.put(msg)
        except gevent.Timeout:
            return None
    
    def _message_listener(self):
        """Background greenlet that reads DAP messages"""
        buffer = b""
        self.log("Message listener started")
        
        while not self.stop_event.ready():
            try:
                self.sock.settimeout(0.5)
                try:
                    chunk = self.sock.recv(4096)
                except socket.timeout:
                    gevent.sleep(0)
                    continue
                except (ConnectionResetError, BrokenPipeError):
                    self.log("Connection reset by peer (Process exited?)")
                    break
                if not chunk:
                    self.log("Connection closed by server")
                    break
                
                buffer += chunk
                
                # Parse all complete messages
                while b"\r\n\r\n" in buffer:
                    header_part, rest = buffer.split(b"\r\n\r\n", 1)
                    
                    try:
                        content_length = int(header_part.split(b"Content-Length: ")[1])
                    except (IndexError, ValueError):
                        self.log(f"ERROR: Invalid header: {header_part}")
                        buffer = rest
                        continue
                    
                    if len(rest) < content_length:
                        break
                    
                    body_raw = rest[:content_length]
                    buffer = rest[content_length:]
                    
                    try:
                        message_data = json.loads(body_raw.decode('utf-8'))
                        self._handle_message(message_data)
                    except json.JSONDecodeError as e:
                        self.log(f"ERROR parsing message: {e}")
                        continue
            
            except socket.timeout:
                gevent.sleep(0)
                continue
            except Exception as e:
                if not self.stop_event.ready():
                    self.log(f"ERROR in message listener: {e}")
                break
        # FIX: If we exit the loop and we weren't stopped manually, 
        # it means the process finished. We should signal termination.
        if not self.stop_event.ready():
            self.log("Socket disconnected unexpectedly. Assuming process finished.")
            self.state = DebuggerState.TERMINATED
            if self.on_event:
                self.on_event('terminated', {})
        self.log("Message listener stopped")
    
    def _handle_message(self, data: dict):
        """Route incoming DAP message"""
        msg_type = data.get('type')
        msg = DAPMessage(msg_type, data)
        
        if msg_type == "response":
            request_seq = data.get('request_seq')
            with self.response_lock:
                if request_seq in self.pending_responses:
                    self.pending_responses[request_seq].put(msg)
                else:
                    self.message_queue.put(msg)
        
        elif msg_type == "event":
            self._handle_event(msg)
        
        else:
            self.message_queue.put(msg)
    
    def _handle_event(self, msg: DAPMessage):
        """Handle DAP events"""
        event_name = msg.event
        
        if event_name == "output":
            output = msg.body.get('output', '')
            category = msg.body.get('category', 'stdout')
            
            # Filter out telemetry spam
            if category == 'telemetry':
                return
            
            self.log(f"OUTPUT ({category}): {output.strip()}")
            
            if self.on_event:
                self.on_event('output', {
                    'output': output,
                    'category': category
                })
        
        elif event_name == "stopped":
            self.state = DebuggerState.PAUSED
            self.thread_id = msg.body.get('threadId')
            reason = msg.body.get('reason', 'unknown')
            self.log(f"*** STOPPED: reason={reason}, thread={self.thread_id} ***")
            
            # CRITICAL FIX: Spawn a greenlet to fetch state.
            # This releases the listener thread so it can read the 'stackTrace' response.
            if self.on_event:
                def fetch_and_emit():
                    # Small sleep to ensure debugpy is ready
                    gevent.sleep(0.01)
                    state = self.get_current_state()
                    self.on_event('stopped', {'reason': reason, 'state': state})
                
                gevent.spawn(fetch_and_emit)
        
        elif event_name == "continued":
            self.state = DebuggerState.RUNNING
            self.log("*** CONTINUED ***")
            
            if self.on_event:
                self.on_event('continued', {})
        
        elif event_name == "terminated":
            # self.state = DebuggerState.TERMINATED
            self.log("*** TERMINATED ***")
            
            if self.on_event:
                self.on_event('terminated', {})
        
        elif event_name == "thread":
            reason = msg.body.get('reason')
            thread_id = msg.body.get('threadId')
            self.log(f"THREAD event: {reason}, id={thread_id}")
            
            if reason == 'started':
                self.thread_id = thread_id
        
        elif event_name == "initialized":
            self.log("INITIALIZED event received - signaling ready")
            # FIX: Signal the waiting thread directly
            if not self.dap_initialized_event.ready():
                self.dap_initialized_event.set()

        elif event_name == "debugpySockets":
            # FIX: Explicitly ignore this to prevent log spam
            pass
        elif event_name == "debugpyWaitingForServer":
            # FIX: Explicitly ignore this to prevent log spam
            pass
        elif event_name == "module":
            # FIX: Explicitly ignore this to prevent log spam
            pass

        elif event_name == "process":
            # This is normal; it just tells us the start method/PID
            # We can log it and ignore it so it doesn't show as 'Unhandled'
            self.log(f"Process event: {msg.body.get('name', 'unknown')}")

        elif event_name == "breakpoint":
            self.log(f"Breakpoint verified asynchronously: {msg.body.get('reason')}")
            # Optionally forward to frontend if needed
            pass

        
        else:
            self.log(f"Unhandled event: {event_name}")
            self.message_queue.put(msg)