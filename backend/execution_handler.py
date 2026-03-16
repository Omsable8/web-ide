import json
import traceback
from flask import Flask, app, request, jsonify
from flask_cors import CORS
import requests

from config import Config
from code_executor import CodeExecutor
from data_logger import DataLogger
# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

# ============================================================================
# Code Execution Endpoints
# ============================================================================

@app.route('/service/execute/code/run', methods=['POST'])
def run_code():
    """Execute code locally and return output"""
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        input_data = data.get('input', None)

        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        result = CodeExecutor.execute(code, language, input_data)
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] Code execution failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/service/execute/problems/<problem_id>/run-tests', methods=['POST'])
def run_tests(problem_id):
    """Run user code against public test cases only using stdin/stdout"""
    
    try:
        
        data = request.get_json()
        user_code = data.get('code', '')
        language = data.get('language', 'python')
        custom_tests = data.get('custom_tests', [])
        user_id = data.get('userId','')
        if not user_code.strip():
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        
        # Get template with driver_code and solution_code
        template_response = requests.get(f"http://localhost:{Config.DBPORT}/api/problems/{problem_id}/template?language={language}")
        if not template_response.status_code == 200:
            return jsonify({"success": False, "error": f"No template found for {language}"}), 401
        
        template = template_response.json().get('template')
        driver_code = template.get('driver_code', '')
        solution_code = template.get('solution_code', '')
        
        # Get only public test cases
        test_cases_response = requests.get(f"http://localhost:{Config.DBPORT}/api/problems/{problem_id}/test-cases")
        if not test_cases_response.status_code == 200:
            return jsonify({"success": False, "error": f"No Testcases found for {problem_id}"}), 401
        
        public_test_cases = test_cases_response.json().get('public_test_cases') #PUBLIC
        private_test_cases = test_cases_response.json().get('private_test_cases') #PRIVATE
        test_cases = public_test_cases # Only run against public test cases for "Run Tests" endpoint
        # Flatten all test cases
        all_test_inputs = [] # list of list of jsons
        test_metadata = []
        
        for test_case in test_cases:
            test_params_list = test_case.get('input_params', [])
            if isinstance(test_params_list, str):
                test_params_list = json.loads(test_params_list)
            
            for idx, test_params in enumerate(test_params_list):
                all_test_inputs.append(test_params)
                test_metadata.append({
                    'test_id': f"{test_case['id']}_{idx}",
                    'is_hidden': False,
                    'type': 'public'
                })
        
        # Add custom tests
        for cidx, custom_test in enumerate(custom_tests):
            test_params = custom_test.get('input_params', [])
            all_test_inputs.append(test_params)
            test_metadata.append({
                'test_id': f"custom_{cidx}",
                'is_hidden': False,
                'type': 'custom'
            })
        
        total_tests = len(all_test_inputs)
        # print(f"all tests inputs: {all_test_inputs}")
        # Build stdin string
        stdin_string = build_stdin(all_test_inputs, language)
        # print(f"Built stdin string for {total_tests} tests: {stdin_string}")
        # Execute user code
        user_result = CodeExecutor.execute(user_code + '\n' + driver_code , language, stdin_string)
        if not user_result.get('success'):
            return jsonify({"success": False, "error": user_result.get('error', '')})
        user_outputs = user_result.get('output', '').strip().split('---SEP---') if user_result.get('output') else []
        
        # Execute solution code
        solution_result = CodeExecutor.execute(solution_code + '\n' + driver_code, language, stdin_string)
        expected_outputs = solution_result.get('output', '').strip().split('---SEP---') if solution_result.get('output') else []
        
        # Match outputs with test cases
        results = []
        num_user_outputs = len(user_outputs)
        num_expected_outputs = len(expected_outputs)
        for i, metadata in enumerate(test_metadata):
            actual = user_outputs[i].strip() if i < num_user_outputs else ''
            expected = expected_outputs[i].strip() if i < num_expected_outputs else ''
            error = user_result.get('error', '')
            results.append({
                'test_id': metadata['test_id'],
                'input_params': all_test_inputs[i],
                'expected': expected,
                'actual': actual,
                'error': error if error else None,
                'passed': actual == expected,
                'is_hidden': metadata['is_hidden'],
                'type': metadata['type']
            })
        
        passed_count = sum(1 for r in results if r['passed'])
        pass_tc = []
        fail_tc = []
        for r in results:
            if r['passed'] and r['type'] != 'custom':
                pass_tc.append(r['test_id'])
            elif r['passed'] and r['type'] == 'custom':
                pass_tc.append(r['input_params'])
            elif not r['passed'] and r['type'] != 'custom':
                fail_tc.append(r['test_id'])
            elif not r['passed'] and r['type'] == 'custom':
                fail_tc.append(r['input_params'])
        logger = DataLogger()
        logger.log_submission(
            uid=user_id,
            pid=problem_id,
            code=user_code,
            language=language,
            error=user_result.get('error', ''),
            num_pass=passed_count,
            num_fail=total_tests - passed_count,
            btn='test',
            passed_tc=pass_tc,
            failed_tc=fail_tc
        )
        return jsonify({
            "success": True,
            "total_tests": total_tests,
            "passed_tests": passed_count,
            "results": results
        })
        
    except Exception as e:
        print(f"[ERROR] Run tests failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/service/execute/problems/<problem_id>/submit', methods=['POST'])
def submit_code(problem_id):
    """Submit user code against public + private test cases using stdin/stdout"""
    
    try:
        
        data = request.get_json()
        user_code = data.get('code', '')
        language = data.get('language', 'python')
        custom_tests = data.get('custom_tests', [])
        user_id = data.get('userId','')
        
        if not user_code.strip():
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        # Get template with driver_code and solution_code
        template_response = requests.get(f"http://localhost:{Config.DBPORT}/api/problems/{problem_id}/template?language={language}")
        if not template_response.status_code == 200:
            return jsonify({"success": False, "error": f"No template found for {language}"}), 401
        
        template = template_response.json().get('template')
        driver_code = template.get('driver_code', '')
        solution_code = template.get('solution_code', '')
        
        # Get both public and private test cases
        test_cases_response = requests.get(f"http://localhost:{Config.DBPORT}/api/problems/{problem_id}/test-cases")
        if not test_cases_response.status_code == 200:
            return jsonify({"success": False, "error": f"No Testcases found for {problem_id}"}), 401
        
        public_test_cases = test_cases_response.json().get('public_test_cases', [])
        private_test_cases = test_cases_response.json().get('private_test_cases', [])
        test_cases = public_test_cases + private_test_cases
        # Flatten all test cases (public + private)
        all_test_inputs = []
        test_metadata = []
        
        for test_case in test_cases:
            test_params_list = test_case.get('input_params', [])
            if isinstance(test_params_list, str):
                test_params_list = json.loads(test_params_list)
            
            for idx, test_params in enumerate(test_params_list):
                all_test_inputs.append(test_params)
                test_metadata.append({
                    'test_id': f"{test_case['id']}_{idx}",
                    'is_hidden': test_case.get('is_hidden', False),
                    'type': 'private' if test_case.get('is_hidden') else 'public'
                })
        
        
        total_tests = len(all_test_inputs)
        
        # Build stdin string - single execution for all tests
        stdin_string = build_stdin(all_test_inputs, language)
        # print(f"Built stdin string for {total_tests} tests:\n{stdin_string}")
        # Execute user code once with all tests
        user_result = CodeExecutor.execute(user_code + '\n' + driver_code, language, stdin_string)
        if not user_result.get('success'):
            return jsonify({"success": False, "error": user_result.get('error', '')})
        user_outputs = user_result.get('output', '').strip().split('---SEP---') if user_result.get('output') else []
        
        # Execute solution code once with all tests
        solution_result = CodeExecutor.execute(solution_code + '\n' + driver_code, language, stdin_string)
        expected_outputs = solution_result.get('output', '').strip().split('---SEP---') if solution_result.get('output') else []
        
        # Match outputs with test cases
        results = []
        num_user_outputs = len(user_outputs)
        num_expected_outputs = len(expected_outputs)
        for i, metadata in enumerate(test_metadata):
            actual = user_outputs[i].strip() if i < num_user_outputs else ''
            expected = expected_outputs[i].strip() if i < num_expected_outputs else ''
            error = user_result.get('error', '')
            results.append({
                'test_id': metadata['test_id'],
                'input_params': all_test_inputs[i],
                'expected': expected,
                'actual': actual,
                'error': error if error else None,
                'passed': actual == expected,
                'is_hidden': metadata['is_hidden'],
                'type': metadata['type']
            })
        
        passed_count = sum(1 for r in results if r['passed'])
        all_passed = passed_count == len(results)
        pass_tc = []
        fail_tc = []
        for r in results:
            if r['passed'] and r['type'] != 'custom':
                pass_tc.append(r['test_id'])
            elif r['passed'] and r['type'] == 'custom':
                pass_tc.append(r['input_params'])
            elif not r['passed'] and r['type'] != 'custom':
                fail_tc.append(r['test_id'])
            elif not r['passed'] and r['type'] == 'custom':
                fail_tc.append(r['input_params'])
        logger = DataLogger()
        logger.log_submission(
            uid=user_id,
            pid=problem_id,
            code=user_code,
            language=language,
            error=user_result.get('error', ''),
            num_pass=passed_count,
            num_fail=total_tests - passed_count,
            btn='submit',
            passed_tc=pass_tc,
            failed_tc=fail_tc
        )
        
        return jsonify({
            "success": True,
            "total_tests": total_tests,
            "passed_tests": passed_count,
            "results": results,
            "accepted": all_passed
        })
        
    except Exception as e:
        print(f"[ERROR] Submit code failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


def build_stdin(test_inputs, language):
    """
    Build stdin string from test inputs for competitive programming style.
    
    Args:
        test_inputs: List of input_params objects
        language: Programming language
        
    Returns:
        String to be passed as stdin (format like Codeforces/CodeChef)
    """
    lines = []
    lines.append(str(len(test_inputs)))  # Number of test cases
    
    for test_input in test_inputs:
        # Each test_input is a list of dict like: [{'name': 'nums', 'type': 'array', 'value': [2, 7, 11, 15]}, {'name': 'target', 'type': 'integer', 'value': 9}]
        # print(f"Processing test input: {test_input}")
        
        for param in test_input:
            value = param.get('value', '')
            param_type = param.get('type', 'string')
            
            if (param_type == "array" or param_type=="linked_list") and isinstance(value,list):
                # length of array
                lines.append(str(len(value)))
                # Convert list to space-separated values
                lines.append(' '.join(map(str, value)))
            elif (param_type == "array" or param_type=="linked_list") and isinstance(value,str):
                # Convert list to space-separated values
                value_list = json.loads(value)
                # length of array
                lines.append(str(len(value_list)))
                lines.append(' '.join(map(str, value_list)))
            elif param_type == "2d_array" and isinstance(value,list):
                # Each sub-array on a new line
                lines.append(f"{len(value)} {len(value[0]) if value else 0}")  # Number of rows, columns
                for sub_array in value:
                    lines.append(' '.join(map(str, sub_array)))
            elif param_type == "2d_array" and isinstance(value,str):
                value_2d = json.loads(value)
                lines.append(f"{len(value_2d)} {len(value_2d[0]) if value_2d else 0}")  # Number of rows, columns
                for sub_array in value_2d:
                    lines.append(' '.join(map(str, sub_array)))
            else:
                # Convert single value to string
                lines.append(str(value))
    
    return '\n'.join(lines)


def build_execution_code(user_code, language, template, input_params):
    """Build final executable code by injecting test inputs"""
    language = language.lower()
    
    if language == "python":
        # Format input values
        input_values = []
        for param in input_params:
            value = param.get('value', '')
            param_type = param.get('type', 'string')
            
            if param_type == 'array':
                items = [str(item) for item in value]
                input_values.append('[' + ', '.join(items) + ']')
            elif param_type == 'integer':
                input_values.append(str(value))
            elif param_type == 'string':
                input_values.append(f'"{value}"')
            else:
                input_values.append(str(value))
        
        param_names = [p['name'] for p in input_params]
        call = f"result = solve({', '.join(input_values)})\nprint(result)"
        
        return f"{user_code}\n\n{call}"
    
    elif language == "cpp":
        # Similar logic for C++
        return f"{user_code}\n\nint main() {{\n    // Test code\n    return 0;\n}}"
    
    elif language == "java":
        # Similar logic for Java
        return f"{user_code}\n\npublic static void main(String[] args) {{\n    // Test code\n}}"
    
    return user_code
# ============================================================================


if __name__ == '__main__':
    print(f"[INFO] Starting CodeIDE Execution Server")
    print(f"[INFO] Execution Model: Local (Direct subprocess execution)")
    print(f"[INFO] Server running on {Config.HOST}:{Config.EXEPORT}")
    
    app.run(host=Config.HOST, port=Config.EXEPORT, debug=Config.DEBUG, use_reloader=False)