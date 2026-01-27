from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import traceback

from config import Config
from code_executor import CodeExecutor
from ai_chatbot import AIChatbot
from template_executor import TemplateExecutor

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

# Global instances
ai_chatbot = AIChatbot(model=Config.AI_MODEL, api_key=Config.OPENAI_API_KEY)

# Validate configuration
Config.validate()

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
        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        result = CodeExecutor.execute(code, language, input_data)
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] Code execution failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# Code Templates Endpoints
# ============================================================================

@app.route('/api/problems/<problem_id>/template', methods=['GET'])
def get_template(problem_id):
    """Fetch code template for a specific language"""
    try:
        from supabase import create_client
        import os
        
        language = request.args.get('language', 'python')
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        template = supabase.table('code_templates').select('*').eq('problem_id', problem_id).eq('language', language).single().execute()
        
        if not template.data:
            return jsonify({"success": False, "error": "Template not found for this language"}), 404
        
        return jsonify({
            "success": True,
            "template": template.data
        })
        
    except Exception as e:
        print(f"[ERROR] Get template failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# AI Chatbot Endpoints
# ============================================================================

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Send message to AI chatbot with optional code and error context"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        code_context = data.get('code', None)
        error_context = data.get('error', None)
        
        if not message:
            return jsonify({"success": False, "error": "No message provided"}), 400
        
        response = ai_chatbot.get_response(message, code_context, error_context)
        
        return jsonify({
            "success": True,
            "response": response,
            "history": ai_chatbot.get_conversation_history()
        })
        
    except Exception as e:
        print(f"[ERROR] AI chat failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/set-model', methods=['POST'])
def set_model():
    """Set the AI model to use"""
    try:
        data = request.get_json()
        model = data.get('model', '')
        
        if not model:
            return jsonify({"success": False, "error": "No model provided"}), 400
        
        ai_chatbot.set_model(model)
        
        return jsonify({"success": True, "message": f"Model set to {model}"})
        
    except Exception as e:
        print(f"[ERROR] Set model failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/analyze', methods=['POST'])
def analyze_code():
    """Analyze code for potential issues"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        analysis = ai_chatbot.analyze_code(code, language)
        
        return jsonify({"success": True, "analysis": analysis})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/explain-failure', methods=['POST'])
def explain_failure():
    """Explain test case failure"""
    try:
        data = request.get_json()
        expected = data.get('expected', '')
        actual = data.get('actual', '')
        test_input = data.get('input', '')
        
        explanation = ai_chatbot.explain_test_case_failure(expected, actual, test_input)
        
        return jsonify({"success": True, "explanation": explanation})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ai/clear', methods=['POST'])
def clear_chat():
    """Clear chat history"""
    try:
        ai_chatbot.clear_history()
        return jsonify({"success": True, "message": "Chat history cleared"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# Health Check
# ============================================================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "ai_ready": True,
        "code_execution": "local"
    })

# ============================================================================
# DSA Problems Endpoints
# ============================================================================

@app.route('/api/problems', methods=['GET'])
def get_problems():
    """Fetch all DSA problems with optional filters"""
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        
        if not supabase_url or not supabase_key:
            return jsonify({"success": False, "error": "Supabase not configured"}), 500
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Get query parameters for filtering
        difficulty = request.args.get('difficulty')
        category = request.args.get('category')
        
        query = supabase.table('problems').select('*')
        
        if difficulty:
            query = query.eq('difficulty', difficulty)
        if category:
            query = query.eq('category', category)
        
        problems = query.execute()
        return jsonify({"success": True, "problems": problems.data})
        
    except Exception as e:
        print(f"[ERROR] Get problems failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>', methods=['GET'])
def get_problem(problem_id):
    """Fetch a specific DSA problem with all details"""
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        problem = supabase.table('problems').select('*').eq('id', problem_id).single().execute()
        
        if not problem.data:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        
        return jsonify({"success": True, "problem": problem.data})
        
    except Exception as e:
        print(f"[ERROR] Get problem failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/problems/<problem_id>/hints/<level>', methods=['GET'])
def get_hints(problem_id, level):
    """Fetch hints for a problem at a specific level (1, 2, or 3)"""
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        hints = supabase.table('hints').select('*').eq('problem_id', problem_id).eq('level', int(level)).execute()
        return jsonify({"success": True, "hints": hints.data})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/test-cases', methods=['GET'])
def get_test_cases(problem_id):
    """Fetch all test cases for a problem"""
    try:
        from supabase import create_client
        import os
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        test_cases = supabase.table('test_cases').select('*').eq('problem_id', problem_id).execute()
        
        # Parse input_params from JSON string if needed
        for test_case in test_cases.data:
            if isinstance(test_case.get('input_params'), str):
                import json
                test_case['input_params'] = json.loads(test_case['input_params'])
        
        return jsonify({"success": True, "test_cases": test_cases.data})
        
    except Exception as e:
        print(f"[ERROR] Get test cases failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/problems/<problem_id>/run-tests', methods=['POST'])
def run_tests(problem_id):
    """Run user code against test cases"""
    
    try:
        from supabase import create_client
        import os
        import json
        
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        custom_tests = data.get('custom_tests', [])
        
        if not code.strip():
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
        supabase = create_client(supabase_url, supabase_key)
        
        # Get template
        template_response = supabase.table('code_templates').select('*').eq('problem_id', problem_id).eq('language', language).single().execute()
        
        if not template_response.data:
            return jsonify({"success": False, "error": f"No template found for {language}"}), 404
        
        template = template_response.data
        
        # Get test cases
        test_cases_response = supabase.table('test_cases').select('*').eq('problem_id', problem_id).execute()
        test_cases = test_cases_response.data
        
        results = []
        
        # Run each test case
        for test_case in test_cases:
            input_params = test_case.get('input_params', [])
            
            # Build execution code with input parameters
            final_code = build_execution_code(code, language, template, input_params)
            
            # Execute code
            from code_executor import CodeExecutor
            result = CodeExecutor.execute(final_code, language)
            
            results.append({
                'test_id': test_case['id'],
                'input_params': input_params,
                'expected': test_case.get('expected_output', ''),
                'actual': result.get('output', '').strip(),
                'passed': result.get('output', '').strip() == test_case.get('expected_output', '').strip(),
                'error': result.get('error'),
                'is_hidden': test_case.get('is_hidden', False)
            })
        
        # Run custom tests
        for custom_test in custom_tests:
            input_params = custom_test.get('input_params', [])
            final_code = build_execution_code(code, language, template, input_params)
            
            result = CodeExecutor.execute(final_code, language)
            
            results.append({
                'test_id': 'custom_' + str(len(results)),
                'input_params': input_params,
                'expected': custom_test.get('expected_output', ''),
                'actual': result.get('output', '').strip(),
                'passed': result.get('output', '').strip() == custom_test.get('expected_output', '').strip(),
                'error': result.get('error'),
                'is_hidden': False
            })
        
        passed_count = sum(1 for r in results if r['passed'])
        
        return jsonify({
            "success": True,
            "total_tests": len(results),
            "passed_tests": passed_count,
            "results": results
        })
        
    except Exception as e:
        print(f"[ERROR] Run tests failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500


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

@app.route('/api/code/complexity', methods=['POST'])
def analyze_complexity():
    """Analyze time and space complexity of code using AI"""
    try:
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        # Use AI to analyze complexity
        prompt = f"""Analyze the following {language} code and provide:
1. Time Complexity (Big O notation)
2. Space Complexity (Big O notation)
3. Brief explanation of your analysis

Code:
{code}

Provide response in JSON format with keys: time_complexity, space_complexity, explanation. 
NOTE: DO NOT ADD ANY TEXT IN YOUR RESPONSE ONLY GIVE A VALID JSON. GIVE EMPTY JSON IN EVENT OF AN ERROR"""
        
        complexity_analysis = ai_chatbot.get_response(prompt)
        
        return jsonify({
            "success": True,
            "analysis": complexity_analysis
        })
        
    except Exception as e:
        print(f"[ERROR] Complexity analysis failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with available endpoints"""
    return jsonify({
        "message": "CodeIDE Backend API",
        "version": "1.0.0",
        "execution_model": "Local (Direct execution via subprocess)",
        "endpoints": {
            "code": ["/api/code/run", "/api/code/complexity"],
            "problems": ["/api/problems", "/api/problems/<id>", "/api/problems/<id>/test-cases", "/api/problems/<id>/hints/<level>", "/api/problems/<id>/run-tests"],
            "ai": ["/api/ai/chat", "/api/ai/set-model", "/api/ai/analyze", "/api/ai/explain-failure", "/api/ai/clear"],
            "health": ["/api/health"]
        }
    })

# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    print(f"[INFO] Starting CodeIDE Backend Server")
    print(f"[INFO] Execution Model: Local (Direct subprocess execution)")
    print(f"[INFO] AI Model: {Config.AI_MODEL}")
    print(f"[INFO] Server running on {Config.HOST}:{Config.PORT}")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
