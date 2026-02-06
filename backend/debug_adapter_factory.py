"""
Debug Adapter Factory
Provides a unified interface for creating debug adapters for different languages
"""
import os
import tempfile
from typing import Optional, Callable
from enum import Enum

from base_debug_adapter import BaseDebugAdapter
from python_debug_adapter import PythonDebugAdapter, PythonDebugAdapterWithInput
from java_debug_adapter import JavaDebugAdapter, JavaDebugAdapterHelper
from cpp_debug_adapter import CppDebugAdapter, CppDebugAdapterHelper


class Language(Enum):
    PYTHON = "python"
    JAVA = "java"
    CPP = "cpp"
    JAVASCRIPT = "javascript"


class DebugAdapterFactory:
    """
    Factory for creating language-specific debug adapters.
    
    Usage:
        factory = DebugAdapterFactory()
        
        # From file
        adapter = factory.create_from_file('solution.py', 5678)
        
        # From code string
        adapter = factory.create_from_code(
            code="def solve(n): return n*2",
            language=Language.PYTHON,
            port=5678
        )
    """
    
    @staticmethod
    def create_from_file(file_path: str, port: int,
                        input_file: Optional[str] = None,
                        on_event: Optional[Callable] = None) -> Optional[BaseDebugAdapter]:
        """
        Create debug adapter based on file extension.
        
        Args:
            file_path: Path to source file
            port: Debug server port
            input_file: Optional input file for stdin redirection
            on_event: Callback for debug events
            
        Returns:
            Language-specific debug adapter or None if unsupported
        """
        _, ext = os.path.splitext(file_path)
        ext = ext.lower()
        
        if ext == '.py':
            if input_file:
                return PythonDebugAdapterWithInput(
                    file_path, port, input_file, on_event=on_event
                )
            return PythonDebugAdapter(file_path, port, on_event=on_event)
        
        elif ext == '.java':
            return JavaDebugAdapterHelper.create_from_source(
                file_path, port, on_event=on_event
            )
        
        elif ext in ['.cpp', '.cc', '.cxx']:
            # Detect platform for GDB vs LLDB
            import platform
            use_lldb = platform.system() == 'Darwin'  # macOS
            return CppDebugAdapterHelper.create_from_source(
                file_path, port, use_lldb=use_lldb, on_event=on_event
            )
        
        else:
            print(f"[ERROR] Unsupported file extension: {ext}")
            return None
    
    @staticmethod
    def create_from_code(code: str, language: Language, port: int,
                        input_data: Optional[str] = None,
                        work_dir: Optional[str] = None,
                        on_event: Optional[Callable] = None) -> Optional[BaseDebugAdapter]:
        """
        Create debug adapter from code string.
        Automatically creates temporary files and compiles if needed.
        
        Args:
            code: Source code string
            language: Programming language
            port: Debug server port
            input_data: Optional input data for stdin
            work_dir: Working directory (defaults to temp dir)
            on_event: Callback for debug events
            
        Returns:
            Language-specific debug adapter or None if error
        """
        if work_dir is None:
            # CHANGE: Create a 'temp_sessions' folder in your current project root
            base_temp_dir = os.path.join(os.getcwd(), 'temp_sessions')
            os.makedirs(base_temp_dir, exist_ok=True)
            
            # Create a unique subfolder for this session
            work_dir = tempfile.mkdtemp(dir=base_temp_dir, prefix='session_')
            
            # Ensure absolute path
            work_dir = os.path.abspath(work_dir)
        try:
            if language == Language.PYTHON:
                return DebugAdapterFactory._create_python_adapter(
                    code, port, input_data, work_dir, on_event
                )
            
            elif language == Language.JAVA:
                return DebugAdapterFactory._create_java_adapter(
                    code, port, input_data, work_dir, on_event
                )
            
            elif language == Language.CPP:
                return DebugAdapterFactory._create_cpp_adapter(
                    code, port, input_data, work_dir, on_event
                )
            
            else:
                print(f"[ERROR] Unsupported language: {language}")
                return None
        
        except Exception as e:
            print(f"[ERROR] Failed to create adapter: {e}")
            return None
    
    @staticmethod
    def _create_python_adapter(code: str, port: int, input_data: Optional[str],
                              work_dir: str, on_event) -> Optional[BaseDebugAdapter]:
        """Create Python adapter from code string"""
        # Create source file
        source_file = os.path.join(work_dir, 'solution.py')
        with open(source_file, 'w') as f:
            f.write(code)
        
        # Create input file if provided
        input_file = None
        if input_data:
            input_file = os.path.join(work_dir, 'input.txt')
            with open(input_file, 'w') as f:
                f.write(input_data)
            
            return PythonDebugAdapterWithInput(
                source_file, port, input_file, on_event=on_event,work_dir=work_dir
            )
        
        return PythonDebugAdapter(source_file, port, on_event=on_event,work_dir=work_dir)
    
    @staticmethod
    def _create_java_adapter(code: str, port: int, input_data: Optional[str],
                            work_dir: str, on_event) -> Optional[BaseDebugAdapter]:
        """Create Java adapter from code string"""
        # Wrap code with main if needed
        if 'public static void main' not in code:
            code = JavaDebugAdapterHelper.wrap_with_main(code)
        
        # Create source file
        source_file = os.path.join(work_dir, 'Solution.java')
        with open(source_file, 'w') as f:
            f.write(code)
        
        # Create adapter and compile
        adapter = JavaDebugAdapterHelper.create_from_source(
            source_file, port, work_dir, on_event
        )
        
        return adapter
    
    @staticmethod
    def _create_cpp_adapter(code: str, port: int, input_data: Optional[str],
                           work_dir: str, on_event) -> Optional[BaseDebugAdapter]:
        """Create C++ adapter from code string"""
        # Wrap code with main if needed
        if 'int main' not in code:
            code = CppDebugAdapterHelper.wrap_with_main(code)
        
        # Create source file
        source_file = os.path.join(work_dir, 'solution.cpp')
        with open(source_file, 'w') as f:
            f.write(code)
        
        # Create adapter and compile
        import platform
        use_lldb = platform.system() == 'Darwin'
        adapter = CppDebugAdapterHelper.create_from_source(
            source_file, port, use_lldb, on_event
        )
        
        return adapter


class DebugSessionManager:
    """
    Manages multiple concurrent debug sessions.
    Useful for handling multiple users in a web application.
    """
    
    def __init__(self, port_range_start: int = 5678, port_range_end: int = 6678):
        self.sessions = {}  # session_id -> adapter
        self.port_range_start = port_range_start
        self.port_range_end = port_range_end
        self.used_ports = set()
    
    def create_session(self, session_id: str, code: str, language: Language,
                      input_data: Optional[str] = None,
                      on_event: Optional[Callable] = None) -> Optional[BaseDebugAdapter]:
        """
        Create a new debug session.
        
        Args:
            session_id: Unique session identifier (e.g., user_id or socket_id)
            code: Source code
            language: Programming language
            input_data: Optional input data
            on_event: Event callback
            
        Returns:
            Debug adapter or None if failed
        """
        # Clean up old session if exists
        if session_id in self.sessions:
            self.stop_session(session_id)
        
        # Find available port
        port = self._find_available_port()
        if port is None:
            print("[ERROR] No available ports")
            return None
        
        # Create adapter
        adapter = DebugAdapterFactory.create_from_code(
            code, language, port, input_data, on_event=on_event
        )
        
        if adapter:
            self.sessions[session_id] = adapter
            self.used_ports.add(port)
        
        return adapter
    
    def get_session(self, session_id: str) -> Optional[BaseDebugAdapter]:
        """Get existing debug session"""
        return self.sessions.get(session_id)
    
    def stop_session(self, session_id: str):
        """Stop and clean up a debug session"""
        if session_id in self.sessions:
            adapter = self.sessions[session_id]
            self.used_ports.discard(adapter.port)
            adapter.stop()
            del self.sessions[session_id]
    
    def stop_all_sessions(self):
        """Stop all debug sessions"""
        for session_id in list(self.sessions.keys()):
            self.stop_session(session_id)
    
    def _find_available_port(self) -> Optional[int]:
        """Find an available port in the configured range"""
        for port in range(self.port_range_start, self.port_range_end):
            if port not in self.used_ports:
                return port
        return None
