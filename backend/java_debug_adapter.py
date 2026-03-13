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
        self.work_dir = classpath # For Java, classpath is also the working directory
        self.entry_class = class_name # Default to class_name
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
            '--main', self.class_name,
            # NEW ARGUMENT: Tell bridge which class to actually Run
            '--entry-class', self.entry_class
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

        # -g is crucial for debugging (line numbers)
        result = subprocess.run(
            ['javac', '-g','-cp', self.classpath, java_file],
            capture_output=True, text=True, timeout=10
        )
        if result.returncode != 0:
            # print(f"[ERROR] Compilation: {result.stderr}")
            raise RuntimeError(f"Compilation Error:\n{result.stderr}")
            # return False
        return True


class JavaDebugAdapterHelper:
    @staticmethod
    def create_from_source(java_source_file: str, port: int, 
                          work_dir: Optional[str] = None,
                          on_event=None):
        
        base_name = os.path.basename(java_source_file)
        class_name = os.path.splitext(base_name)[0]
        
        if work_dir is None:
            work_dir = os.path.dirname(java_source_file) or '.'
            
        # 1. Compile User's Code FIRST
        adapter = JavaDebugAdapter(class_name, work_dir, port, on_event=on_event)
        if not adapter.compile_java_file(java_source_file):
            return None

        # 2. Check for Input File & Generate Redirector if needed
        input_file = os.path.join(work_dir, "input.txt")
        entry_class = class_name # Default: Run user's class directly

        if os.path.exists(input_file):
            print(f"[JavaHelper] Found input.txt, generating InputRedirector...")
            redirector_code = f"""
import java.io.*;
public class InputRedirector {{
    public static void main(String[] args) throws Exception {{
        // Redirect System.in to input.txt
        try {{
            System.setIn(new FileInputStream("input.txt"));
        }} catch (Exception e) {{
            System.out.println("Input redirection failed: " + e);
        }}
        // Run User's Main
        {class_name}.main(args); 
    }}
}}
"""
            redirector_path = os.path.join(work_dir, "InputRedirector.java")
            try:
                with open(redirector_path, "w") as f:
                    f.write(redirector_code)
                
                # Compile the Redirector
                if adapter.compile_java_file(redirector_path):
                    entry_class = "InputRedirector" # Success! Run this instead.
            except Exception as e:
                print(f"[JavaHelper] Failed to create redirector: {e}")

        # 3. Store the Entry Class in the adapter for the bridge to use
        adapter.entry_class = entry_class
            
        return adapter
    
    # ... (wrap_with_main stays the same) ...
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