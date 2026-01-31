import subprocess
import tempfile
import os
import sys
from pathlib import Path

class CodeExecutor:
    """Execute code in different programming languages"""
    
    # Timeout in seconds
    TIMEOUT = 10
    
    # Max output length in characters
    MAX_OUTPUT = 10000
    
    @staticmethod
    def execute(code, language, input_data=None):
        """
        Execute code and return output
        
        Args:
            code: Source code string
            language: Programming language ('python', 'cpp', 'java', 'c')
            input_data: Optional input data
            
        Returns:
            dict: {"success": bool, "output": str, "error": str}
        """
        language = language.lower().strip()
        
        try:
            if language == 'python':
                return CodeExecutor._execute_python(code, input_data)
            elif language == 'cpp':
                return CodeExecutor._execute_cpp(code, input_data)
            elif language == 'java':
                return CodeExecutor._execute_java(code, input_data)
            elif language == 'c':
                return CodeExecutor._execute_c(code, input_data)
            else:
                return {"success": False, "error": f"Unsupported language: {language}"}
                
        except subprocess.TimeoutExpired:
            return {"success": False, "error": "Execution timeout - code took too long to run"}
        except Exception as e:
            return {"success": False, "error": f"Execution failed: {str(e)}"}
    
    @staticmethod
    def _execute_python(code, input_data=None):
        """Execute Python code"""
        try:
            # Create temporary Python file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
                f.write(code)
                temp_file = f.name
            
            try:
                # Run Python code
                result = subprocess.run(
                    [sys.executable, temp_file],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data  # Pass input data to stdin
                )
                
                output = result.stdout[:CodeExecutor.MAX_OUTPUT]
                error = result.stderr[:CodeExecutor.MAX_OUTPUT]
                
                return {
                    "success": result.returncode == 0,
                    "output": output,
                    "error": error if error else None
                }
            finally:
                # Clean up temp file
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                    
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _execute_cpp(code, input_data=None):
        """Execute C++ code"""
        try:
            # Create temporary C++ file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False) as f:
                f.write(code)
                temp_cpp = f.name
            
            # Output file without extension
            temp_out = temp_cpp.replace('.cpp', '')
            # print(f"[DEBUG] code:\n{code}\n", file=sys.stderr)
            
            try:
                # Compile C++ code
                compile_result = subprocess.run(
                    ['g++', temp_cpp, '-o', temp_out],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT
                )
                
                if compile_result.returncode != 0:
                    error = compile_result.stderr[:CodeExecutor.MAX_OUTPUT]
                    return {"success": False, "error": f"Compilation error:\n{error}"}
                
                # Run compiled code
                run_result = subprocess.run(
                    [temp_out],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data
                )
                
                output = run_result.stdout[:CodeExecutor.MAX_OUTPUT]
                error = run_result.stderr[:CodeExecutor.MAX_OUTPUT]
                
                return {
                    "success": run_result.returncode == 0,
                    "output": output,
                    "error": error if error else None
                }
            finally:
                # Clean up temp files
                for f in [temp_cpp, temp_out]:
                    if os.path.exists(f):
                        try:
                            os.remove(f)
                        except:
                            pass
                            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _execute_java(code, input_data=None):
        """Execute Java code"""
        try:
            # Create temporary directory for Java files
            temp_dir = tempfile.mkdtemp()
            
            # Java requires specific class naming
            # Extract class name from code or use default
            # class_name = CodeExecutor._extract_java_class_name(code)
            class_name = "Main"

            # print(f"[DEBUG] code:\n{code}\n", file=sys.stderr)
            
            # if not class_name:
            #     class_name = 'Solution'
            
            # # If code doesn't have proper class name, wrap it
            # if f'public class {class_name}' not in code:
            #     code = f'public class {class_name} {{\n{code}\n}}'
            
            temp_java = os.path.join(temp_dir, f'{class_name}.java')
            
            try:
                # Write Java file
                with open(temp_java, 'w') as f:
                    f.write(code)
                
                # Compile Java code
                compile_result = subprocess.run(
                    ['javac', temp_java],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    cwd=temp_dir
                )
                
                if compile_result.returncode != 0:
                    error = compile_result.stderr[:CodeExecutor.MAX_OUTPUT]
                    return {"success": False, "error": f"Compilation error:\n{error}"}
                
                # Run compiled Java code
                run_result = subprocess.run(
                    ['java', '-cp', temp_dir, class_name],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data
                )
                
                output = run_result.stdout[:CodeExecutor.MAX_OUTPUT]
                error = run_result.stderr[:CodeExecutor.MAX_OUTPUT]
                
                return {
                    "success": run_result.returncode == 0,
                    "output": output,
                    "error": error if error else None
                }
            finally:
                # Clean up temp directory
                import shutil
                if os.path.exists(temp_dir):
                    shutil.rmtree(temp_dir)
                    
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _execute_c(code, input_data=None):
        """Execute C code"""
        try:
            # Create temporary C file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.c', delete=False) as f:
                f.write(code)
                temp_c = f.name
            
            # Output file without extension
            temp_out = temp_c.replace('.c', '')
            
            try:
                # Compile C code
                compile_result = subprocess.run(
                    ['gcc', temp_c, '-o', temp_out],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT
                )
                
                if compile_result.returncode != 0:
                    error = compile_result.stderr[:CodeExecutor.MAX_OUTPUT]
                    return {"success": False, "error": f"Compilation error:\n{error}"}
                
                # Run compiled code
                run_result = subprocess.run(
                    [temp_out],
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data
                )
                
                output = run_result.stdout[:CodeExecutor.MAX_OUTPUT]
                error = run_result.stderr[:CodeExecutor.MAX_OUTPUT]
                
                return {
                    "success": run_result.returncode == 0,
                    "output": output,
                    "error": error if error else None
                }
            finally:
                # Clean up temp files
                for f in [temp_c, temp_out]:
                    if os.path.exists(f):
                        try:
                            os.remove(f)
                        except:
                            pass
                            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    @staticmethod
    def _extract_java_class_name(code):
        """Extract public class name from Java code"""
        import re
        match = re.search(r'public\s+class\s+(\w+)', code)
        if match:
            return match.group(1)
        return None