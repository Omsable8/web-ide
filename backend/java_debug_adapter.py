"""
Java Debug Adapter using JDWP
Extends BaseDebugAdapter with Java-specific behavior
"""
import subprocess
import os
from typing import Optional, List
from base_debug_adapter import BaseDebugAdapter


class JavaDebugAdapter(BaseDebugAdapter):
    """
    Java-specific debug adapter using JDWP (Java Debug Wire Protocol).
    
    Note: Requires compiled .class files.
    
    Usage:
        adapter = JavaDebugAdapter(
            class_name='Solution',
            classpath='.',
            port=5005
        )
        adapter.start()
        adapter.set_breakpoints([15, 20])
        adapter.continue_execution()
    """
    
    def __init__(self, class_name: str, classpath: str, port: int,
                 java_path: str = 'java',
                 on_event=None):
        # For Java, we use the class name as the "file_path"
        super().__init__(class_name, port, on_event)
        self.class_name = class_name
        self.classpath = classpath
        self.java_path = java_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        """
        Start Java with JDWP agent for debugging.
        
        The JDWP agent listens on the specified port and waits for
        a debugger to attach before starting the main method.
        """
        cmd = [
            self.java_path,
            f'-agentlib:jdwp=transport=dt_socket,server=y,suspend=y,address={self.port}',
            '-cp', self.classpath,
            self.class_name
        ]
        
        return subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
    
    def get_language(self) -> str:
        return "java"
    
    def compile_java_file(self, java_file: str) -> bool:
        """
        Compile Java source file before debugging.
        
        Args:
            java_file: Path to .java source file
            
        Returns:
            True if compilation succeeded, False otherwise
        """
        try:
            result = subprocess.run(
                ['javac', '-g', java_file],  # -g includes debug info
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode != 0:
                print(f"[ERROR] Java compilation failed:")
                print(result.stderr)
                return False
            
            return True
        
        except subprocess.TimeoutExpired:
            print("[ERROR] Java compilation timed out")
            return False
        except Exception as e:
            print(f"[ERROR] Java compilation error: {e}")
            return False


class JavaDebugAdapterHelper:
    """
    Helper class for Java debugging that handles compilation and setup.
    """
    
    @staticmethod
    def create_from_source(java_source_file: str, port: int, 
                          work_dir: Optional[str] = None,
                          on_event=None) -> Optional[JavaDebugAdapter]:
        """
        Create a JavaDebugAdapter from a source file.
        Automatically compiles the file and sets up classpath.
        
        Args:
            java_source_file: Path to .java file
            port: Debug port
            work_dir: Working directory (defaults to file's directory)
            on_event: Event callback
            
        Returns:
            JavaDebugAdapter instance or None if compilation fails
        """
        # Get class name from file
        base_name = os.path.basename(java_source_file)
        class_name = os.path.splitext(base_name)[0]
        
        # Set working directory
        if work_dir is None:
            work_dir = os.path.dirname(java_source_file) or '.'
        
        # Create adapter
        adapter = JavaDebugAdapter(
            class_name=class_name,
            classpath=work_dir,
            port=port,
            on_event=on_event
        )
        
        # Compile
        if not adapter.compile_java_file(java_source_file):
            return None
        
        return adapter
    
    @staticmethod
    def wrap_with_main(solution_code: str, class_name: str = "Solution") -> str:
        """
        Wrap solution code with a main method for testing.
        
        Args:
            solution_code: User's solution code
            class_name: Name of the class
            
        Returns:
            Complete Java code with main method
        """
        return f"""
public class {class_name} {{
{solution_code}

    public static void main(String[] args) {{
        {class_name} solution = new {class_name}();
        // Add test code here
        java.util.Scanner scanner = new java.util.Scanner(System.in);
        
        // Example: Read inputs and call solution methods
        // int n = scanner.nextInt();
        // int[] arr = new int[n];
        // for (int i = 0; i < n; i++) {{
        //     arr[i] = scanner.nextInt();
        // }}
        // System.out.println(solution.solve(arr));
    }}
}}
"""
