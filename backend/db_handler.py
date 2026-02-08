from functools import lru_cache
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from config import Config
import os
from supabase import create_client
# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})
supabase = create_client(os.getenv('NEXT_PUBLIC_SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY'))

# --- Cached Helper Functions ---

@lru_cache(maxsize=30) # Increased size to handle (10 problems * 3 languages)
def _fetch_template_from_db(problem_id, language):
    """Helper to cache template based on BOTH ID and Language"""
    print(f"[CACHE MISS] Fetching template for {problem_id} - {language}")
    return supabase.table('code_templates').select('*')\
        .eq('problem_id', problem_id).eq('language', language).single().execute()

@lru_cache(maxsize=10) # Increased size to handle (10 problems * 3 languages)
def _fetch_hints_from_db(problem_id):
    """Helper to cache hints based on ID"""
    print(f"[CACHE MISS] Fetching hints for {problem_id}")
    return supabase.table('hints').select('*').eq('problem_id', problem_id).single().execute()

@lru_cache(maxsize=20)
def _fetch_testcases_from_db(problem_id):
    print(f"[CACHE MISS] Fetching testcases {problem_id}")
    return supabase.table('test_cases').select('*').eq('problem_id', problem_id).execute()

@lru_cache(maxsize=10)
def _fetch_problem_from_db(problem_id):
    print(f"[CACHE MISS] Fetching problem {problem_id}")
    return supabase.table('problems').select('*').eq('id', problem_id).single().execute()

@lru_cache(maxsize=10)
def _fetch_problems_from_db(difficulty=None, category=None):
    print(f"[CACHE MISS] Fetching problems with difficulty={difficulty}, category={category}")
    query = supabase.table('problems').select('*')
    if difficulty:
        query = query.eq('difficulty', difficulty)
    if category:
        query = query.eq('category', category)
    return query.execute()

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
        
        
        # Get query parameters for filtering
        difficulty = request.args.get('difficulty')
        category = request.args.get('category')
        
        problems = _fetch_problems_from_db(difficulty, category)

        if not problems.data:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        return jsonify({"success": True, "problems": problems.data})
        
    except Exception as e:
        print(f"[ERROR] Get problems failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/problems/<problem_id>', methods=['GET'])
def get_problem(problem_id):
    """Fetch a specific DSA problem with all details"""
    try:
        
        problem = _fetch_problem_from_db(problem_id)
        
        if not problem.data:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        
        return jsonify({"success": True, "problem": problem.data})
        
    except Exception as e:
        print(f"[ERROR] Get problem failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/hints', methods=['GET'])
def get_hints(problem_id):
    """Fetch all hints for a problem (nested JSON array)"""
    try:
        
        hints_response = _fetch_hints_from_db(problem_id)
        
        if not hints_response.data:
            return jsonify({"success": False, "error": "No hints found"}), 404
        
        hints_data = hints_response.data.get('hints_data', [])
        
        # Ensure hints_data is parsed if it's a string
        if isinstance(hints_data, str):
            hints_data = json.loads(hints_data)
        
        return jsonify({"success": True, "hints_data": hints_data})
        
    except Exception as e:
        print(f"[ERROR] Get hints failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/test-cases', methods=['GET'])
def get_test_cases(problem_id):
    """Fetch all test cases for a problem (public and private)"""
    try:

        test_cases_response = _fetch_testcases_from_db(problem_id)
        test_cases = test_cases_response.data
        
        # Separate public and private test cases
        public_tests = []
        private_tests = []
        
        for test_case in test_cases:
            input_params = test_case.get('input_params', [])
            # Ensure input_params is a list of test cases (nested array)
            if isinstance(input_params, str):
                input_params = json.loads(input_params)
            
            test_obj = {
                'id': test_case['id'],
                'input_params': input_params,
                'is_hidden': test_case.get('is_hidden', False)
            }
            
            if test_case.get('is_hidden', False):
                private_tests.append(test_obj)
            else:
                public_tests.append(test_obj)
        
        return jsonify({
            "success": True,
            "public_test_cases": public_tests,
            "private_test_cases": private_tests
        })
        
    except Exception as e:
        print(f"[ERROR] Get test cases failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500



# ============================================================================
# Code Templates Endpoints
# ============================================================================

@app.route('/api/problems/<problem_id>/template', methods=['GET'])
def get_template(problem_id):
    """Fetch code template for a specific language"""
    try:
        
        language = request.args.get('language', 'python')
        
        
        template = _fetch_template_from_db(problem_id, language)
        
        if not template.data:
            return jsonify({"success": False, "error": "Template not found for this language"}), 404
        
        return jsonify({
            "success": True,
            "template": template.data
        })
        
    except Exception as e:
        print(f"[ERROR] Get template failed: {str(e)}")
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
            "problems": ["/api/problems", "/api/problems/<id>", "/api/problems/<id>/test-cases", "/api/problems/<id>/hints", "/api/problems/<id>/run-tests", "/api/problems/<id>/submit"],
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
    print(f"[INFO] Starting CodeIDE DB Server")
    print(f"[INFO] Server running on {Config.HOST}:{Config.DBPORT}")
    
    app.run(host=Config.HOST, port=Config.DBPORT, debug=Config.DEBUG, use_reloader=False)