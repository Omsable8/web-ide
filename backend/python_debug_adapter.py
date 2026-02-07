"""
Python Debug Adapter using debugpy
Extends BaseDebugAdapter with Python-specific behavior
"""
import subprocess
import sys
from typing import Optional
from base_debug_adapter import BaseDebugAdapter


class PythonDebugAdapter(BaseDebugAdapter):
    """
    Python-specific debug adapter using debugpy.
    
    Usage:
        adapter = PythonDebugAdapter('script.py', 5678)
        adapter.start()
        adapter.set_breakpoints([10, 20])
        adapter.continue_execution()
    """
    
    def __init__(self, file_path: str, port: int, 
                 python_path: str = 'python3',
                 on_event=None,work_dir: Optional[str] = None):
        super().__init__(file_path, port, on_event,work_dir)
        self.python_path = python_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        """Start debugpy server for Python debugging"""
        cmd = [
            self.python_path,
            '-m', 'debugpy',
            '--listen', f'127.0.0.1:{self.port}',
            '--wait-for-client',
            self.file_path
        ]
        
        return subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
    
    def get_language(self) -> str:
        return "python"
    
    def send_input(self, input_data: str):
        """
        Send input to the running Python process.
        Note: This requires the process to be reading from stdin.
        """
        if self.process and self.process.stdin:
            try:
                self.process.stdin.write(input_data.encode())
                self.process.stdin.flush()
            except Exception as e:
                print(f"[ERROR] Failed to send input: {e}")


class PythonDebugAdapterWithInput(PythonDebugAdapter):
    """
    Python adapter that redirects stdin from a file for test cases.
    Useful for competitive programming problems where input is predefined.
    """
    
    def __init__(self, file_path: str, port: int, 
                 input_file_path: Optional[str] = None,
                 python_path: str = 'python3',
                 on_event=None, work_dir: Optional[str] = None):
        super().__init__(
            file_path, 
            port, 
            python_path=python_path, 
            on_event=on_event, 
            work_dir=work_dir
        )
        self.input_file_path = input_file_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        """Start debugpy with stdin redirected from input file"""
        cmd = [
            self.python_path,
            '-m', 'debugpy',
            '--listen', f'127.0.0.1:{self.port}',
            '--wait-for-client',
            self.file_path
        ]
        
        stdin_file = None
        if self.input_file_path:
            try:
                stdin_file = open(self.input_file_path, 'r')
            except Exception as e:
                print(f"[WARNING] Could not open input file: {e}")
        
        return subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=stdin_file if stdin_file else subprocess.PIPE
        )
