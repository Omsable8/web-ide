import eventlet
eventlet.monkey_patch()

from flask_socketio import SocketIO, emit, disconnect
import tempfile
import os
import sys
import json
import socketio
import traceback
from flask import Flask, app, request, jsonify
from flask_cors import CORS

from config import Config
from code_executor import CodeExecutor
from debugger import PdbSession 

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

# Initialize SocketIO with your existing app
socketio = SocketIO(app, cors_allowed_origins="*")
# Store active sessions: { socket_id: PdbSession }
debug_sessions = {}

# ============================================================================
# Code Execution Endpoints
# ============================================================================

@app.route('/api/code/run', methods=['POST'])
def run_code():
    """Execute code locally and return output"""
    
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        input_data = data.get('input', None)

        # from supabase import create_client
        # import os
        # import json
        # supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        # supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        # supabase = create_client(supabase_url, supabase_key)
        
        # # Get template with driver_code and solution_code
        # template_response = supabase.table('code_templates').select('*').eq('problem_id', problem_id).eq('language', language).single().execute()
        
        # if not template_response.data:
        #     return jsonify({"success": False, "error": f"No template found for {language}"}), 404
        
        # template = template_response.data
        # driver_code = template.get('driver_code', '')
        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        result = CodeExecutor.execute(code, language, input_data)
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] Code execution failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/run-tests', methods=['POST'])
def run_tests(problem_id):
    """Run user code against public test cases only using stdin/stdout"""
    
    try:
        from supabase import create_client
        import os
        import json
        
        data = request.get_json()
        user_code = data.get('code', '')
        language = data.get('language', 'python')
        custom_tests = data.get('custom_tests', [])
        if not user_code.strip():
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        # Get template with driver_code and solution_code
        template_response = supabase.table('code_templates').select('*').eq('problem_id', problem_id).eq('language', language).single().execute()
        
        if not template_response.data:
            return jsonify({"success": False, "error": f"No template found for {language}"}), 404
        
        template = template_response.data
        driver_code = template.get('driver_code', '')
        solution_code = template.get('solution_code', '')
        
        # Get only public test cases
        test_cases_response = supabase.table('test_cases').select('*').eq('problem_id', problem_id).eq('is_hidden', False).execute()
        test_cases = test_cases_response.data
        
        # Flatten all test cases
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
        from code_executor import CodeExecutor
        user_result = CodeExecutor.execute(user_code + '\n' + driver_code , language, stdin_string)
        user_outputs = user_result.get('output', '').strip().split('\n') if user_result.get('output') else []
        
        # Execute solution code
        solution_result = CodeExecutor.execute(solution_code + '\n' + driver_code, language, stdin_string)
        expected_outputs = solution_result.get('output', '').strip().split('\n') if solution_result.get('output') else []
        
        # Match outputs with test cases
        results = []
        for i, metadata in enumerate(test_metadata):
            actual = user_outputs[i].strip() if i < len(user_outputs) else ''
            expected = expected_outputs[i].strip() if i < len(expected_outputs) else ''
            
            results.append({
                'test_id': metadata['test_id'],
                'input_params': all_test_inputs[i],
                'expected': expected,
                'actual': actual,
                'passed': actual == expected,
                'is_hidden': metadata['is_hidden'],
                'type': metadata['type']
            })
        
        passed_count = sum(1 for r in results if r['passed'])
        
        return jsonify({
            "success": True,
            "total_tests": total_tests,
            "passed_tests": passed_count,
            "results": results
        })
        
    except Exception as e:
        print(f"[ERROR] Run tests failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/problems/<problem_id>/submit', methods=['POST'])
def submit_code(problem_id):
    """Submit user code against public + private test cases using stdin/stdout"""
    
    try:
        from supabase import create_client
        import os
        import json
        
        data = request.get_json()
        user_code = data.get('code', '')
        language = data.get('language', 'python')
        custom_tests = data.get('custom_tests', [])
        
        if not user_code.strip():
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        # Get template with driver_code and solution_code
        template_response = supabase.table('code_templates').select('*').eq('problem_id', problem_id).eq('language', language).single().execute()
        
        if not template_response.data:
            return jsonify({"success": False, "error": f"No template found for {language}"}), 404
        
        template = template_response.data
        driver_code = template.get('driver_code', '')
        solution_code = template.get('solution_code', '')
        
        # Get both public and private test cases
        test_cases_response = supabase.table('test_cases').select('*').eq('problem_id', problem_id).execute()
        test_cases = test_cases_response.data
        
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
        from code_executor import CodeExecutor
        user_result = CodeExecutor.execute(user_code + '\n' + driver_code, language, stdin_string)
        user_outputs = user_result.get('output', '').strip().split('\n') if user_result.get('output') else []
        
        # Execute solution code once with all tests
        solution_result = CodeExecutor.execute(solution_code + '\n' + driver_code, language, stdin_string)
        expected_outputs = solution_result.get('output', '').strip().split('\n') if solution_result.get('output') else []
        
        # Match outputs with test cases
        results = []
        for i, metadata in enumerate(test_metadata):
            actual = user_outputs[i].strip() if i < len(user_outputs) else ''
            expected = expected_outputs[i].strip() if i < len(expected_outputs) else ''
            
            results.append({
                'test_id': metadata['test_id'],
                'input_params': all_test_inputs[i],
                'expected': expected,
                'actual': actual,
                'passed': actual == expected,
                'is_hidden': metadata['is_hidden'],
                'type': metadata['type']
            })
        
        passed_count = sum(1 for r in results if r['passed'])
        all_passed = passed_count == len(results)
        
        return jsonify({
            "success": True,
            "total_tests": total_tests,
            "passed_tests": passed_count,
            "results": results,
            "accepted": all_passed
        })
        
    except Exception as e:
        print(f"[ERROR] Submit code failed: {str(e)}")
        import traceback
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



# --- New WebSocket Events for Debugging ---
@socketio.on('start_debug')
def handle_start_debug(data):
    code = data.get('code') # User code
    input_data = data.get('input', '') # Custom input or test case string
    breakpoints = data.get('breakpoints', []) # List of line numbers to set breakpoints at

    # print(f"[DEBUG] Input data: {input_data}")

    # 1. Create a temp file for INPUTS (Critical for separation)
    input_file = tempfile.NamedTemporaryFile(mode='w', delete=False)
    input_file.write(input_data)
    input_file.close()
    
    # 2. Prepare the Code
    # We inject a header to force the user code to read from our temp file
    # instead of real stdin (which PDB needs).
    # io_redirect = f"import sys; sys.stdin = open('{input_file.name}', 'r')\n"
    io_redirect = ""
    
    # Combined: Redirect + User Code + (Optional) Driver
    # Note: If you have a hidden driver, append it here too.
    full_code = io_redirect + code 
    print(f"[DEBUG] Starting debug session with code: {full_code}")
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(full_code)
        script_path = f.name

    # 3. Start Session
    session = PdbSession(script_path)
    session.start()
    debug_sessions[request.sid] = session
    
    # 4. Set Breakpoints & Start
    # The 'io_redirect' adds 1 line, so user breakpoints might need +1 offset 
    # if you prepend it. If line offset is irrelevant, just send raw lines.
    for bp in breakpoints:
        session.send_command(f'b {bp + 1}') # +1 because of the import sys line
        session.get_state() # Consume output

    session.send_command('c') # Continue to first breakpoint
    
    # Send initial state
    state = session.get_state()
    vars_ = session.get_variables()
    
    emit('debug_update', {
        'line': state['line_number'], # Frontend handles highlighting
        'variables': vars_,
        'output': state['raw_output']
    })

@socketio.on('step_over')
def handle_step_over():
    session = debug_sessions.get(request.sid)
    if session:
        session.send_command('n')
        state = session.get_state()
        emit('debug_update', {
            'line': state['line_number'],
            'variables': session.get_variables()
        })

@socketio.on('disconnect')
def cleanup_session():
    if request.sid in debug_sessions:
        debug_sessions[request.sid].stop()
        del debug_sessions[request.sid]


if __name__ == '__main__':
    print(f"[INFO] Starting CodeIDE Execution Server")
    print(f"[INFO] Execution Model: Local (Direct subprocess execution)")
    print(f"[INFO] Server running on {Config.HOST}:{Config.EXEPORT}")
    
    socketio.run(app, host=Config.HOST, port=Config.EXEPORT, debug=Config.DEBUG, allow_unsafe_werkzeug=True)