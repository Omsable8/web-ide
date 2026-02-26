"""
Fixed C++ Debug Adapter using GDB/LLDB with DAP support
Overrides BaseDebugAdapter to handle stdio pipes and correct launch flow
"""
import subprocess
import os
import json
import gevent
from typing import Optional
from base_debug_adapter import BaseDebugAdapter

class StdioSocketMock:
    """Mocks a socket interface over stdin/stdout for GDB's native DAP"""
    def __init__(self, process):
        self.process = process
        
    def sendall(self, data):
        self.process.stdin.write(data)
        self.process.stdin.flush()
        
    def recv(self, bufsize):
        try:
            # os.read returns whatever is available (like socket.recv) without blocking forever
            return os.read(self.process.stdout.fileno(), bufsize)
        except Exception:
            return b""
            
    def settimeout(self, timeout):
        pass
        
    def close(self):
        pass

def _cpp_initialize_dap(adapter: BaseDebugAdapter) -> bool:
    """Common C++ DAP initialization using 'launch' instead of 'attach'"""
    adapter.log("Sending initialize request...")
    init_response = adapter._send_request("initialize", {
        "adapterID": "cpp",
        "pathFormat": "path",
        "linesStartAt1": True,
        "columnsStartAt1": True
    }, timeout=5.0)
    
    if not init_response:
        adapter.log("ERROR: Initialize request failed.")
        return False
    
    adapter.log("Sending launch request (Non-blocking)...")
    launch_payload = {
        "seq": adapter.seq,
        "type": "request",
        "command": "launch",
        "arguments": {
            "name": "Launch C++ Program",
            "type": "cppdbg",
            "request": "launch",
            "program": adapter.executable_path,
            "cwd": os.path.dirname(adapter.executable_path),
            "stopAtEntry": False
        }
    }
    
    try:
        body = json.dumps(launch_payload)
        msg = f"Content-Length: {len(body)}\r\n\r\n{body}"
        adapter.sock.sendall(msg.encode('utf-8'))
        adapter.seq += 1
    except Exception as e:
        adapter.log(f"ERROR sending launch: {e}")
        return False

    adapter.log("Launch sent. Waiting for 'initialized' event signal...")
    try:
        with gevent.Timeout(5.0):
            adapter.dap_initialized_event.wait()
            adapter.log("Received 'initialized' signal")
    except gevent.Timeout:
        adapter.log("CRITICAL ERROR: Timeout waiting for 'initialized' event.")
        return False
    
    return True

class CppDebugAdapter(BaseDebugAdapter):
    def __init__(self, executable_path: str, port: int, gdb_path: str = 'gdb', on_event=None):
        super().__init__(executable_path, port, on_event)
        self.executable_path = executable_path
        self.gdb_path = gdb_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        # Start GDB without --args; the program is provided in the launch request
        cmd = [self.gdb_path, '--interpreter=dap']
        return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
    
    def _connect_to_server(self, timeout: float) -> bool:
        # GDB DAP operates over stdio, not TCP. We inject our mock socket here.
        if not self.process:
            return False
        self.sock = StdioSocketMock(self.process)
        self.log("Connected to GDB DAP via stdio pipes")
        return True

    def _initialize_dap(self) -> bool:
        return _cpp_initialize_dap(self)
    
    def get_language(self) -> str: return "cpp"
    
    def compile_cpp_file(self, source_file: str, output_path: Optional[str] = None) -> bool:
        if output_path is None: output_path = os.path.splitext(source_file)[0]
        try:
            result = subprocess.run(
                ['g++', '-g', '-O0', '-std=c++17', source_file, '-o', output_path],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode != 0:
                print(f"[ERROR] C++ compilation failed:\n{result.stderr}")
                return False
            self.executable_path = output_path
            self.file_path = source_file
            return True
        except Exception as e:
            print(f"[ERROR] C++ compilation error: {e}")
            return False

class LLDBDebugAdapter(BaseDebugAdapter):
    def __init__(self, executable_path: str, port: int, lldb_path: str = 'lldb-vscode-14', on_event=None):
        super().__init__(executable_path, port, on_event)
        self.executable_path = executable_path
        self.lldb_path = lldb_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        cmd = [self.lldb_path, '--port', str(self.port)]
        return subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, stdin=subprocess.PIPE)
    
    def _initialize_dap(self) -> bool:
        return _cpp_initialize_dap(self)
    
    def get_language(self) -> str: return "cpp"
    
    def compile_cpp_file(self, source_file: str, output_path: Optional[str] = None) -> bool:
        if output_path is None: output_path = os.path.splitext(source_file)[0]
        try:
            result = subprocess.run(
                ['clang++','-stdlib=libc++', '-g', '-O0', '-std=c++17', source_file, '-o', output_path],
                capture_output=True, text=True, timeout=30
            )
            if result.returncode != 0:
                print(f"[ERROR] C++ compilation failed:\n{result.stderr}")
                return False
            self.executable_path = output_path
            self.file_path = source_file
            return True
        except Exception as e:
            print(f"[ERROR] C++ compilation error: {e}")
            return False

class CppDebugAdapterHelper:
    @staticmethod
    def create_from_source(cpp_source_file: str, port: int, use_lldb: bool = False, on_event=None) -> Optional[BaseDebugAdapter]:
        output_path = os.path.splitext(cpp_source_file)[0]
        if use_lldb: adapter = LLDBDebugAdapter(output_path, port, on_event=on_event)
        else: adapter = CppDebugAdapter(output_path, port, on_event=on_event)
        
        if not adapter.compile_cpp_file(cpp_source_file, output_path): return None
        return adapter