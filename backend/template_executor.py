import subprocess
import tempfile
import os
import json
from typing import Dict, Any, List

class TemplateExecutor:
    """Executes user code against predefined function templates with structured inputs"""
    
    # Execution limits (same as CodeExecutor)
    TIMEOUT_SECONDS = 10
    MAX_OUTPUT_BYTES = 1024 * 1024  # 1MB
    
    # File extensions
    FILE_EXTENSIONS = {
        "python": "py",
        "cpp": "cpp",
        "java": "java",
        "c": "c"
    }
    
    COMPILE_COMMANDS = {
        "cpp": ["g++", "{filename}", "-o", "{output}"],
        "c": ["gcc", "{filename}", "-o", "{output}"],
        "java": ["javac", "{filename}"]
    }
    
    RUN_COMMANDS = {
        "python": ["python3", "{filename}"],
        "cpp": ["{output}"],
        "c": ["{output}"],
        "java": ["java", "-cp", "{directory}", "Solution"]
    }
    
    @staticmethod
    def validate_function_signature(code: str, language: str, expected_params: List[str]) -> tuple[bool, str]:
        """
        Validate that user code has the correct function signature.
        
        Args:
            code: User's code
            language: Programming language
            expected_params: Expected parameter names (e.g., ['s', 't'])
        
        Returns:
            (is_valid, error_message)
        """
        language = language.lower()
        
        if language == "python":
            # Check for 'def solve(' in code
            if "def solve(" not in code:
                return False, "Function name must be 'solve'"
            
            # Extract parameter list
            try:
                import re
                match = re.search(r'def solve\((.*?)\):', code)
                if not match:
                    return False, "Function signature malformed. Use: def solve(param1, param2, ...)"
                
                params_str = match.group(1)
                params = [p.strip() for p in params_str.split(',') if p.strip()]
                
                if params != expected_params:
                    return False, f"Function parameters must be: {', '.join(expected_params)}. Got: {', '.join(params)}"
                
                return True, ""
            except Exception as e:
                return False, f"Error parsing function signature: {str(e)}"
        
        elif language == "cpp":
            # Check for 'string solve(' or similar return types
            if "solve(" not in code:
                return False, "Function name must be 'solve'"
            
            try:
                import re
                # Match function definition: return_type solve(params)
                pattern = r'\w+\s+solve\s*\((.*?)\)'
                match = re.search(pattern, code)
                if not match:
                    return False, "Function signature malformed"
                
                params_str = match.group(1)
                params = [p.strip().split()[-1] for p in params_str.split(',') if p.strip()]
                
                if params != expected_params:
                    return False, f"Function parameters must be: {', '.join(expected_params)}. Got: {', '.join(params)}"
                
                return True, ""
            except Exception as e:
                return False, f"Error parsing function signature: {str(e)}"
        
        elif language == "java":
            # Check for 'public static ... solve('
            if "solve(" not in code:
                return False, "Function name must be 'solve'"
            
            try:
                import re
                pattern = r'public\s+static\s+\w+\s+solve\s*\((.*?)\)'
                match = re.search(pattern, code)
                if not match:
                    return False, "Function must be: public static <ReturnType> solve(<params>)"
                
                params_str = match.group(1)
                params = [p.strip().split()[-1] for p in params_str.split(',') if p.strip()]
                
                if params != expected_params:
                    return False, f"Function parameters must be: {', '.join(expected_params)}. Got: {', '.join(params)}"
                
                return True, ""
            except Exception as e:
                return False, f"Error parsing function signature: {str(e)}"
        
        return False, f"Language validation not implemented: {language}"
    
    @staticmethod
    def build_execution_code(user_code: str, language: str, test_input: Dict[str, Any], template: str) -> str:
        """
        Build final code by combining template, user code, and test case input.
        
        Args:
            user_code: User's solution code
            language: Programming language
            test_input: Structured test input with parameter values
            template: Template code (contains imports, helper functions)
        
        Returns:
            Final code ready to execute
        """
        language = language.lower()
        
        if language == "python":
            # Extract input values in correct order
            input_values = []
            for param in test_input.get('input_params', []):
                input_values.append(TemplateExecutor._format_python_value(param['value'], param['type']))
            
            # Build test call
            test_call = "result = solve(" + ", ".join(input_values) + ")\n"
            test_call += "print(result)"
            
            # Combine template, user code, and test call
            final_code = f"{template}\n\n{user_code}\n\n{test_call}"
            return final_code
        
        elif language == "cpp":
            # Format C++ test values
            input_values = []
            for param in test_input.get('input_params', []):
                input_values.append(TemplateExecutor._format_cpp_value(param['value'], param['type']))
            
            test_call = "auto result = solve(" + ", ".join(input_values) + ");\n"
            test_call += 'cout << result << endl;'
            
            final_code = f"{template}\n\n{user_code}\n\nint main() {{\n    {test_call}\n    return 0;\n}}"
            return final_code
        
        elif language == "java":
            input_values = []
            for param in test_input.get('input_params', []):
                input_values.append(TemplateExecutor._format_java_value(param['value'], param['type']))
            
            test_call = "Object result = solve(" + ", ".join(input_values) + ");\n"
            test_call += "System.out.println(result);"
            
            final_code = f"{template}\n\n{user_code}\n\npublic static void main(String[] args) {{\n    {test_call}\n}}"
            return final_code
        
        return user_code
    
    @staticmethod
    def _format_python_value(value: Any, data_type: str) -> str:
        """Format a value for Python code"""
        data_type = data_type.lower()
        
        if data_type == "string":
            return f'"{value}"'
        elif data_type == "integer":
            return str(value)
        elif data_type == "array":
            # Handle comma-separated values: "1,2,3" -> [1,2,3]
            if isinstance(value, str):
                items = [item.strip() for item in value.split(',')]
                return "[" + ", ".join(items) + "]"
            return str(value)
        elif data_type == "array_of_arrays":
            # Handle semicolon-separated arrays: "1,2;3,4" -> [[1,2],[3,4]]
            if isinstance(value, str):
                rows = value.split(';')
                arrays = []
                for row in rows:
                    items = [item.strip() for item in row.split(',')]
                    arrays.append("[" + ", ".join(items) + "]")
                return "[" + ", ".join(arrays) + "]"
            return str(value)
        elif data_type == "boolean":
            return "True" if str(value).lower() in ["true", "1", "yes"] else "False"
        
        return str(value)
    
    @staticmethod
    def _format_cpp_value(value: Any, data_type: str) -> str:
        """Format a value for C++ code"""
        data_type = data_type.lower()
        
        if data_type == "string":
            return f'"{value}"'
        elif data_type == "integer":
            return str(value)
        elif data_type == "array":
            if isinstance(value, str):
                items = [item.strip() for item in value.split(',')]
                return "{" + ", ".join(items) + "}"
            return str(value)
        elif data_type == "array_of_arrays":
            if isinstance(value, str):
                rows = value.split(';')
                arrays = []
                for row in rows:
                    items = [item.strip() for item in row.split(',')]
                    arrays.append("{" + ", ".join(items) + "}")
                return "{" + ", ".join(arrays) + "}"
            return str(value)
        elif data_type == "boolean":
            return "true" if str(value).lower() in ["true", "1", "yes"] else "false"
        
        return str(value)
    
    @staticmethod
    def _format_java_value(value: Any, data_type: str) -> str:
        """Format a value for Java code"""
        data_type = data_type.lower()
        
        if data_type == "string":
            return f'"{value}"'
        elif data_type == "integer":
            return str(value)
        elif data_type == "array":
            if isinstance(value, str):
                items = [item.strip() for item in value.split(',')]
                return "new int[]{" + ", ".join(items) + "}"
            return str(value)
        elif data_type == "array_of_arrays":
            if isinstance(value, str):
                rows = value.split(';')
                arrays = []
                for row in rows:
                    items = [item.strip() for item in row.split(',')]
                    arrays.append("new int[]{" + ", ".join(items) + "}")
                return "new int[][]{ " + ", ".join(arrays) + " }"
            return str(value)
        elif data_type == "boolean":
            return "true" if str(value).lower() in ["true", "1", "yes"] else "false"
        
        return str(value)
    
    @staticmethod
    def run_test(user_code: str, language: str, test_case: Dict[str, Any], template: str) -> Dict[str, Any]:
        """
        Execute a single test case.
        
        Args:
            user_code: User's solution code
            language: Programming language
            test_case: Test case with input_params and expected_output
            template: Template code
        
        Returns:
            Dict with success, output, error, passed
        """
        language = language.lower()
        
        # Validate function signature
        expected_params = [param['name'] for param in test_case.get('input_params', [])]
        is_valid, error_msg = TemplateExecutor.validate_function_signature(user_code, language, expected_params)
        
        if not is_valid:
            return {
                "success": False,
                "error": error_msg,
                "output": None,
                "passed": False
            }
        
        # Build execution code
        final_code = TemplateExecutor.build_execution_code(user_code, language, test_case, template)
        
        # Create temporary file
        ext = TemplateExecutor.FILE_EXTENSIONS[language]
        try:
            with tempfile.NamedTemporaryFile(
                mode='w',
                suffix=f'.{ext}',
                delete=False,
                dir='/tmp'
            ) as f:
                f.write(final_code)
                temp_filename = f.name
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to create temp file: {str(e)}",
                "output": None,
                "passed": False
            }
        
        temp_directory = os.path.dirname(temp_filename)
        temp_basename = os.path.basename(temp_filename)
        output_file = temp_filename + ".out"
        
        try:
            # Compile if necessary
            if language in TemplateExecutor.COMPILE_COMMANDS:
                compile_cmd = TemplateExecutor.COMPILE_COMMANDS[language]
                compile_cmd = [
                    cmd.format(filename=temp_basename, output=temp_basename + ".out", directory=temp_directory)
                    for cmd in compile_cmd
                ]
                
                try:
                    result = subprocess.run(
                        compile_cmd,
                        cwd=temp_directory,
                        capture_output=True,
                        timeout=TemplateExecutor.TIMEOUT_SECONDS,
                        text=True
                    )
                    
                    if result.returncode != 0:
                        return {
                            "success": False,
                            "error": result.stderr or "Compilation failed",
                            "output": None,
                            "passed": False
                        }
                except subprocess.TimeoutExpired:
                    return {
                        "success": False,
                        "error": f"Compilation timeout (>{TemplateExecutor.TIMEOUT_SECONDS}s)",
                        "output": None,
                        "passed": False
                    }
                except FileNotFoundError as e:
                    compiler = compile_cmd[0]
                    return {
                        "success": False,
                        "error": f"Compiler not found: {compiler}",
                        "output": None,
                        "passed": False
                    }
            
            # Prepare run command
            run_cmd = TemplateExecutor.RUN_COMMANDS[language]
            run_cmd = [
                cmd.format(
                    filename=temp_basename,
                    output=temp_basename + ".out",
                    directory=temp_directory
                )
                for cmd in run_cmd
            ]
            
            # Run the code
            try:
                result = subprocess.run(
                    run_cmd,
                    cwd=temp_directory,
                    capture_output=True,
                    timeout=TemplateExecutor.TIMEOUT_SECONDS,
                    text=True
                )
                
                output = result.stdout.strip()
                error = result.stderr
                
                if result.returncode != 0:
                    return {
                        "success": False,
                        "error": error or "Runtime error",
                        "output": output,
                        "passed": False
                    }
                
                # Compare output with expected
                expected = str(test_case.get('expected_output', '')).strip()
                passed = output == expected
                
                return {
                    "success": True,
                    "output": output,
                    "error": None,
                    "passed": passed,
                    "expected": expected
                }
                
            except subprocess.TimeoutExpired:
                return {
                    "success": False,
                    "error": f"Execution timeout (>{TemplateExecutor.TIMEOUT_SECONDS}s)",
                    "output": None,
                    "passed": False
                }
            except Exception as e:
                return {
                    "success": False,
                    "error": f"Execution failed: {str(e)}",
                    "output": None,
                    "passed": False
                }
        
        finally:
            # Cleanup
            try:
                if os.path.exists(temp_filename):
                    os.remove(temp_filename)
                if os.path.exists(output_file):
                    os.remove(output_file)
                class_file = temp_basename.replace('.java', '.class')
                class_path = os.path.join(temp_directory, class_file)
                if os.path.exists(class_path):
                    os.remove(class_path)
            except Exception as e:
                print(f"[WARNING] Failed to cleanup temp files: {str(e)}")