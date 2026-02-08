# backend/java_debug_adapter.py
import subprocess
import os
import sys
from typing import Optional
from base_debug_adapter import BaseDebugAdapter

class JavaDebugAdapter(BaseDebugAdapter):
    def __init__(self, class_name: str, classpath: str, port: int,
                 java_path: str = 'java', on_event=None):
        super().__init__(class_name, port, on_event)
        self.class_name = class_name
        self.classpath = classpath
    
    def _start_debug_server(self) -> subprocess.Popen:
        """
        Launch the Python Bridge script.
        The bridge will act as the DAP server and control JDB.
        """
        bridge_script = os.path.join(os.path.dirname(__file__), 'java_jdb_bridge.py')
        
        cmd = [
            sys.executable,  # Use the same python interpreter
            '-u',  # Unbuffered output
            bridge_script,
            '--port', str(self.port),
            '--classpath', self.classpath,
            '--main', self.class_name
        ]
        
        return subprocess.Popen(
            cmd,
            stdout=sys.stdout,
            stderr=sys.stderr,
            stdin=subprocess.PIPE,
            text=True,
        )

    def get_language(self) -> str:
        return "java"

    def compile_java_file(self, java_file: str) -> bool:
        try:
            # -g is crucial for debugging (line numbers)
            result = subprocess.run(
                ['javac', '-g', java_file],
                capture_output=True, text=True, timeout=10
            )
            if result.returncode != 0:
                print(f"[ERROR] Compilation: {result.stderr}")
                return False
            return True
        except Exception as e:
            print(f"[ERROR] Compile error: {e}")
            return False

class JavaDebugAdapterHelper:
    @staticmethod
    def create_from_source(java_source_file: str, port: int, 
                          work_dir: Optional[str] = None,
                          on_event=None):
        
        base_name = os.path.basename(java_source_file)
        class_name = os.path.splitext(base_name)[0]
        
        if work_dir is None:
            work_dir = os.path.dirname(java_source_file) or '.'
            
        adapter = JavaDebugAdapter(class_name=class_name,classpath= work_dir,port= port, on_event=on_event)
        adapter.work_dir= work_dir
        # Compile before creating adapter
        if not adapter.compile_java_file(java_source_file):
            return None
            
        return adapter
    
    @staticmethod
    def wrap_with_main(solution_code: str, class_name: str = "Solution") -> str:
        return f"""
import java.util.*;
public class {class_name} {{
{solution_code}
    public static void main(String[] args) {{
        {class_name} solution = new {class_name}();
        Scanner scanner = new Scanner(System.in);
        // Test logic would go here
    }}
}}
"""