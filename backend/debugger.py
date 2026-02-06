import subprocess
import socket
import json
import time
import threading
from flask_socketio import SocketIO, emit, disconnect
socketio = SocketIO(app, cors_allowed_origins="*",async_mode='eventlet')
class DAPSession:
    def __init__(self, file_path, port):
        self.file_path = file_path
        self.port = port
        self.process = None
        self.sock = None
        self.seq = 1
        self.active = False
        self.stopped_event = threading.Event()

    def start(self):
        # Start debugpy adapter on a specific port
        self.process = subprocess.Popen([
            'python3', '-m', 'debugpy', '--listen', str(self.port), 
            '--wait-for-client', self.file_path
        ], stderr=subprocess.PIPE, stdout=subprocess.PIPE)
        
    # Retry connection for up to 5 seconds
        retries = 50
        while retries > 0:
            try:
                self.sock = socket.create_connection(("127.0.0.1", self.port), timeout=1)
                self.active = True
                break
            except (ConnectionRefusedError, socket.timeout):
                retries -= 1
                time.sleep(0.1)  # Small yield for eventlet
                
        if not self.active:
            raise Exception(f"Failed to connect to debugpy on port {self.port}")

        # DAP Handshake
        self._send("initialize", {"adapterID": "python", "pathFormat": "path"})
        self._send("attach", {"connect": {"port": self.port, "host": "127.0.0.1"}})
        self._send("configurationDone")

    def _send(self, command, args=None):
        payload = {"seq": self.seq, "type": "request", "command": command, "arguments": args or {}}
        body = json.dumps(payload)
        message = f"Content-Length: {len(body)}\r\n\r\n{body}"
        self.sock.sendall(message.encode('utf-8'))
        self.seq += 1

    def _listen_for_response(self, command_name, timeout=2.0):
        """
        Reads the socket stream, parses headers, and looks for a specific response.
        """
        self.sock.settimeout(timeout)
        buffer = b""
        
        while self.active:
            try:
                chunk = self.sock.recv(4096)
                if not chunk: break
                buffer += chunk
                
                while b"\r\n\r\n" in buffer:
                    # 1. Parse Header
                    header_part, rest = buffer.split(b"\r\n\r\n", 1)
                    content_length = int(header_part.split(b"Content-Length: ")[1])
                    
                    # 2. Check if we have the full body
                    if len(rest) >= content_length:
                        body_raw = rest[:content_length]
                        buffer = rest[content_length:]
                        message = json.loads(body_raw.decode('utf-8'))
                        
                        # 3. Handle the message type
                        if message.get("type") == "response" and message.get("command") == command_name:
                            return message

                        # Inside your _listen_for_response loop
                        if message.get("type") == "event":
                            if message.get("event") == "output":
                                # Stream print() statements directly to the student's terminal
                                socketio.emit('debug_output', {'data': message['body']['output']}, room=self.sid)
                            elif message.get("event") == "stopped":
                                self.stopped_event.set()
                    else:
                        break
            except socket.timeout:
                return None
        return None
    
    def get_current_state(self):
        # 1. Fetch the Stack Trace to find where we are
        self._send("stackTrace", {"threadId": 1})
        stack_resp = self._listen_for_response("stackTrace")
        
        if stack_resp and stack_resp['body']['stackFrames']:
            top_frame = stack_resp['body']['stackFrames'][0]
            line_number = top_frame.get('line')
            # DAP frame IDs are used to get variables for THIS specific line
            vars_ = self.get_variables_for_frame(top_frame['id'])
            
            return {
                'line': line_number,
                'variables': vars_,
                'status': 'paused'
            }
        return None


    def set_breakpoint(self, line):
        self._send("setBreakpoints", {
            "source": {"path": self.file_path},
            "breakpoints": [{"line": line}]
        })

    def resume(self):
        self._send("continue")

    def step_over(self):
        self._send("next")

    def get_variables(self):
        # Step 1: StackTrace
        self._send("stackTrace", {"threadId": 1})
        stack = self._listen_for_response("stackTrace")
        if not stack: return []
        frame_id = stack['body']['stackFrames'][0]['id']

        # Step 2: Scopes
        self._send("scopes", {"frameId": frame_id})
        scopes = self._listen_for_response("scopes")
        # Usually 'Locals' is the first scope
        local_ref = scopes['body']['scopes'][0]['variablesReference']

        # Step 3: Variables
        self._send("variables", {"variablesReference": local_ref})
        vars_resp = self._listen_for_response("variables")
        
        # Return a clean list for your React UI
        return vars_resp['body']['variables'] if vars_resp else []

    def stop(self):
        self.active = False
        if self.sock: self.sock.close()
        if self.process: self.process.kill()