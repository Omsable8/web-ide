import subprocess
import tempfile
import os
import sys
from pathlib import Path
import traceback
import judge0
import json

RAPID_API_KEY = os.environ.get("RAPID_API_KEY")
class CodeExecutor:
    """Execute code in different programming languages"""
    
    # Timeout in seconds
    TIMEOUT = 10
    
    # Max output length in characters
    MAX_OUTPUT = 10000
    # User to run untrusted code as
    RUN_USER = "code_runner" 

    @staticmethod
    def _get_secure_cmd(cmd_list):
        """
        Wraps the command to run as the restricted user using sudo.
        """
        return ['sudo', '-u', CodeExecutor.RUN_USER] + cmd_list

    def execute_with_judge0(code, language, input_data=None):
        """
        Executes code using the Judge0 API.
        
        Args:
            code (str): The source code to execute.
            language (str): The language name ('python', 'cpp', 'java', 'c').
            input_data (str): The raw stdin string (CP style).
            
        Returns:
            dict: The result from Judge0 execution.
        """

        # 1. Map string names to Judge0 Language IDs
        # (IDs based on public Judge0 CE configuration)
        LANGUAGE_MAP = {
            'python': 71,  # Python 3.8.1
            'cpp': 54,     # C++ (GCC 9.2.0)
            'java': 62,    # Java (OpenJDK 13.0.1)
            'c': 50        # C (GCC 9.2.0)
        }
        
        # Normalize language string
        lang_key = language.lower().strip()
        
        if lang_key not in LANGUAGE_MAP:
            return {
                "success": False, 
                "error": f"Unsupported language for Judge0: {language}"
            }

        language_id = LANGUAGE_MAP[lang_key]

        try:
            # 2. Call the Judge0 SDK
            # Passing 'stdin' is crucial for your CP-style input logic
            
            # client = judge0.RapidJudge0CE(api_key=RAPID_API_KEY)
            subm = judge0.run(
                # client=client,
                source_code=code,
                language_id=language_id,
                stdin=input_data
            )
            response = json.loads(subm.model_dump_json())
            
            # 3. Parse Response (Standardizing output for your backend)
            # Judge0 returns a dict with keys like 'stdout', 'stderr', 'compile_output'
            
            output = response.get('stdout', '')
            error = response.get('stderr', '') or response.get('compile_output', '')
            
            # Determine success based on having output or explicitly check status inside response if available
            success = bool(output) and not error
            
            return {
                "success": success,
                "output": output,
                "error": error
            }

        except Exception as e:
            return {
                "success": False, 
                "error": f"Judge0 API Error: {str(e)}"
            }
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
            
            # CRITICAL: Allow code_runner to read this file
            os.chmod(temp_file, 0o644)
            # print(f"[DEBUG] code:\n{code}\n", file=sys.stderr)
            try:
                # Wrap command with sudo
                # Note: Using 'python3' instead of sys.executable to ensure we use system python
                # if the virtualenv is not accessible by code_runner.
                cmd = CodeExecutor._get_secure_cmd(['python3', temp_file])
                # Run Python code
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data,  # Pass input data to stdin
                    cwd='/tmp'
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
                
                # prepare for Execution
                # Grant execution permissions to everyone (so code_runner can run it)
                os.chmod(temp_out, 0o755)
                
                # 3. Run (As code_runner - Restricted)
                cmd = CodeExecutor._get_secure_cmd([temp_out])
                # Run compiled code
                run_result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data,
                    cwd='/tmp'
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
            os.chmod(temp_dir, 0o755)
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
            # CRITICAL: Allow code_runner to read the source file
            try:
                # Write Java file
                with open(temp_java, 'w') as f:
                    f.write(code)
                
                os.chmod(temp_java, 0o644)
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
                
                # 2. Run (As code_runner)
                # Ensure generated .class files are readable
                for root, dirs, files in os.walk(temp_dir):
                    for f in files: os.chmod(os.path.join(root, f), 0o644)

                cmd = CodeExecutor._get_secure_cmd(['java', '-cp', temp_dir, class_name])

                # Run compiled Java code
                run_result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=CodeExecutor.TIMEOUT,
                    input=input_data,
                    cwd=temp_dir
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
            traceback.print_exc()
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