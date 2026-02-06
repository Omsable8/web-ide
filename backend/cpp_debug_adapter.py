"""
C++ Debug Adapter using GDB with DAP support
Extends BaseDebugAdapter with C++-specific behavior
"""
import subprocess
import os
from typing import Optional
from base_debug_adapter import BaseDebugAdapter


class CppDebugAdapter(BaseDebugAdapter):
    """
    C++ debug adapter using GDB's DAP mode (requires GDB 14+).
    
    Note: Requires compiled executable with debug symbols (-g flag).
    
    Usage:
        adapter = CppDebugAdapter(
            executable_path='./solution',
            port=5678
        )
        adapter.start()
        adapter.set_breakpoints([10, 15])
        adapter.continue_execution()
    """
    
    def __init__(self, executable_path: str, port: int,
                 gdb_path: str = 'gdb',
                 on_event=None):
        super().__init__(executable_path, port, on_event)
        self.executable_path = executable_path
        self.gdb_path = gdb_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        """
        Start GDB in DAP mode.
        
        GDB 14+ has built-in DAP support via --interpreter=dap
        """
        cmd = [
            self.gdb_path,
            '--interpreter=dap',
            f'--args', self.executable_path
        ]
        
        return subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
    
    def get_language(self) -> str:
        return "cpp"
    
    def compile_cpp_file(self, source_file: str, output_path: Optional[str] = None) -> bool:
        """
        Compile C++ source file with debug symbols.
        
        Args:
            source_file: Path to .cpp file
            output_path: Output executable path (default: source file without extension)
            
        Returns:
            True if compilation succeeded, False otherwise
        """
        if output_path is None:
            output_path = os.path.splitext(source_file)[0]
        
        try:
            result = subprocess.run(
                [
                    'g++',
                    '-g',           # Include debug symbols
                    '-O0',          # No optimization for better debugging
                    '-std=c++17',   # C++17 standard
                    source_file,
                    '-o', output_path
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                print(f"[ERROR] C++ compilation failed:")
                print(result.stderr)
                return False
            
            self.executable_path = output_path
            self.file_path = output_path
            return True
        
        except subprocess.TimeoutExpired:
            print("[ERROR] C++ compilation timed out")
            return False
        except Exception as e:
            print(f"[ERROR] C++ compilation error: {e}")
            return False


class LLDBDebugAdapter(BaseDebugAdapter):
    """
    Alternative C++ debug adapter using LLDB's DAP mode.
    Useful on macOS where LLDB is preferred over GDB.
    
    Usage:
        adapter = LLDBDebugAdapter(
            executable_path='./solution',
            port=5678
        )
        adapter.start()
    """
    
    def __init__(self, executable_path: str, port: int,
                 lldb_path: str = 'lldb-dap',
                 on_event=None):
        super().__init__(executable_path, port, on_event)
        self.executable_path = executable_path
        self.lldb_path = lldb_path
    
    def _start_debug_server(self) -> subprocess.Popen:
        """
        Start LLDB in DAP mode.
        
        lldb-dap is LLDB's DAP server (previously lldb-vscode).
        """
        cmd = [
            self.lldb_path,
            '--port', str(self.port)
        ]
        
        return subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            stdin=subprocess.PIPE
        )
    
    def get_language(self) -> str:
        return "cpp"
    
    def compile_cpp_file(self, source_file: str, output_path: Optional[str] = None) -> bool:
        """Compile using clang (LLVM's C++ compiler)"""
        if output_path is None:
            output_path = os.path.splitext(source_file)[0]
        
        try:
            result = subprocess.run(
                [
                    'clang++',
                    '-g',
                    '-O0',
                    '-std=c++17',
                    source_file,
                    '-o', output_path
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.returncode != 0:
                print(f"[ERROR] C++ compilation failed:")
                print(result.stderr)
                return False
            
            self.executable_path = output_path
            self.file_path = output_path
            return True
        
        except subprocess.TimeoutExpired:
            print("[ERROR] C++ compilation timed out")
            return False
        except Exception as e:
            print(f"[ERROR] C++ compilation error: {e}")
            return False


class CppDebugAdapterHelper:
    """Helper for C++ debugging that handles compilation and setup"""
    
    @staticmethod
    def create_from_source(cpp_source_file: str, port: int,
                          use_lldb: bool = False,
                          on_event=None) -> Optional[BaseDebugAdapter]:
        """
        Create a C++ debug adapter from source file.
        Automatically compiles and sets up the debugger.
        
        Args:
            cpp_source_file: Path to .cpp file
            port: Debug port
            use_lldb: Use LLDB instead of GDB (recommended for macOS)
            on_event: Event callback
            
        Returns:
            Debug adapter instance or None if compilation fails
        """
        # Determine output executable path
        output_path = os.path.splitext(cpp_source_file)[0]
        
        # Create appropriate adapter
        if use_lldb:
            adapter = LLDBDebugAdapter(output_path, port, on_event=on_event)
        else:
            adapter = CppDebugAdapter(output_path, port, on_event=on_event)
        
        # Compile
        if not adapter.compile_cpp_file(cpp_source_file, output_path):
            return None
        
        return adapter
    
    @staticmethod
    def wrap_with_main(solution_code: str) -> str:
        """
        Wrap solution code with a main function for testing.
        
        Args:
            solution_code: User's solution code
            
        Returns:
            Complete C++ code with main function
        """
        return f"""
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
using namespace std;

{solution_code}

int main() {{
    // Add test code here
    // Example: Read inputs and call solution
    /*
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {{
        cin >> arr[i];
    }}
    cout << solve(arr) << endl;
    */
    return 0;
}}
"""
