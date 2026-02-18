from functools import lru_cache
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, disconnect
from config import Config
import os

from auth_handler import AuthHandler
from data_logger import DataLogger
from database import execute_read, execute_write
# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})


auth = AuthHandler() # No client needed anymore

# --- Cached Helper Functions ---

@lru_cache(maxsize=30) # Increased size to handle (10 problems * 3 languages)
def _fetch_template_from_db(problem_id, language):
    """Helper to cache template based on BOTH ID and Language"""
    print(f"[CACHE MISS] Fetching template for {problem_id} - {language}")
    rows = execute_read(
        "SELECT * FROM code_templates WHERE problem_id = :pid AND language = :lang",
        {"pid": problem_id, "lang": language}
    )
    return {"data": rows[0] if rows else None}

@lru_cache(maxsize=10)
def _fetch_hints_from_db(problem_id):
    """Helper to cache hints based on ID"""
    print(f"[CACHE MISS] Fetching hints for {problem_id}")
    
    query = "SELECT * FROM hints WHERE problem_id = :pid"
    rows = execute_read(query, {"pid": problem_id})
    
    # Supabase .single() returns one dict. We replicate that structure.
    return {"data": rows[0] if rows else None}

@lru_cache(maxsize=20)
def _fetch_testcases_from_db(problem_id):
    print(f"[CACHE MISS] Fetching testcases {problem_id}")
    
    query = "SELECT * FROM test_cases WHERE problem_id = :pid"
    rows = execute_read(query, {"pid": problem_id})
    
    # Supabase returns a list of rows
    return {"data": rows}

@lru_cache(maxsize=10)
def _fetch_problems_from_db(difficulty=None, category=None):
    print(f"[CACHE MISS] Fetching problems with difficulty={difficulty}, category={category}")
    
    # Start with a base query
    query = "SELECT * FROM problems WHERE 1=1"
    params = {}
    
    # Dynamically append filters
    if difficulty:
        query += " AND difficulty = :diff"
        params['diff'] = difficulty
    if category:
        query += " AND category = :cat"
        params['cat'] = category
        
    rows = execute_read(query, params)
    
    return {"data": rows}

@lru_cache(maxsize=10)
def _fetch_problem_from_db(problem_id):
    print(f"[CACHE MISS] Fetching problem {problem_id}")
    rows = execute_read("SELECT * FROM problems WHERE id = :pid", {"pid": problem_id})
    # Supabase returns {data: ...}, so we mock that structure to keep API consistent
    return {"data": rows[0] if rows else None}


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
# Authentication Endpoints
# ============================================================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    '''Handle user signup'''
    data = request.get_json()
    
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    cohort = data.get('cohort')  # Optional
    
    if not name or not email or not password:
        return jsonify({
            'success': False,
            'error': 'Name, email, and password are required'
        }), 400
    
    # Validate password strength
    if len(password) < 6:
        return jsonify({
            'success': False,
            'error': 'Password must be at least 6 characters'
        }), 400
    
    result = auth.signup(name, email, password, cohort)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400


@app.route('/api/auth/login', methods=['POST'])
def login():
    '''Handle user login'''
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({
            'success': False,
            'error': 'Email and password are required'
        }), 400
    
    result = auth.login(email, password)
    
    # print(f"[DEBUG] User {result['user']['email']} logged in with UID {result['user']['uid']}")
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401


@app.route('/api/auth/verify', methods=['POST'])
def verify():
    '''Verify user token'''
    data = request.get_json()
    token = data.get('token')
    
    if not token:
        return jsonify({
            'valid': False,
            'error': 'Token is required'
        }), 400
    
    result = auth.verify_token(token)
    
    if result['valid']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401


# Middleware to protect routes
def require_auth(f):
    '''Decorator to require authentication'''
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get token from Authorization header
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Unauthorized'
            }), 401
        
        token = auth_header.split(' ')[1]
        result = auth.verify_token(token)
        
        if not result['valid']:
            return jsonify({
                'success': False,
                'error': 'Invalid token'
            }), 401
        
        # Add user_id to request for use in route
        request.user_id = result['uid']
        
        return f(*args, **kwargs)
    
    return decorated_function



    
@app.route('/api/features/update', methods=['POST'])
def store_features_usage():
    """Helper to store feature usage in DB"""
    try:

        datalogger = DataLogger()
        
        data = request.get_json()
        uid = data.get('uid')
        pid = data.get('pid')
        features = data.get('features', {})
        
        data = {'uid': uid,'pid': pid,"debug_btn":None, "ai_used":None, "hints":None, "performance_analyzer":None, "custom_tc":None, "dev_preferences":None}
        for key in features.keys():
            data[key] = features.get(key)
        datalogger.log_feature(**data)
        return jsonify({'success': True}), 200
    except Exception as e:
        print(f"[ERROR] Store feature usage failed: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
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

        if not problems['data']:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        return jsonify({"success": True, "problems": problems['data']})
        
    except Exception as e:
        print(f"[ERROR] Get problems failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/problems/<problem_id>', methods=['GET'])
def get_problem(problem_id):
    """Fetch a specific DSA problem with all details"""
    try:
        
        problem = _fetch_problem_from_db(problem_id)
        
        if not problem["data"]:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        
        return jsonify({"success": True, "problem": problem["data"]})
        
    except Exception as e:
        print(f"[ERROR] Get problem failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/hints', methods=['GET'])
def get_hints(problem_id):
    """Fetch all hints for a problem (nested JSON array)"""
    try:
        
        hints_response = _fetch_hints_from_db(problem_id)
        
        if not hints_response['data']:
            return jsonify({"success": False, "error": "No hints found"}), 404
        
        hints_data = hints_response['data'].get('hints_data', [])
        
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
        test_cases = test_cases_response['data']
        
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
        
        if not template['data']:
            return jsonify({"success": False, "error": "Template not found for this language"}), 404
        
        return jsonify({
            "success": True,
            "template": template['data']
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
            "execute": ["/service/execute/code/run", "/service/execute/problems/<id>/run-tests", "/service/execute/problems/<id>/submit"],
            "problems": ["/api/problems", "/api/problems/<id>", "/api/problems/<id>/test-cases", "/api/problems/<id>/hints"],
            "ai": ["/service/ai/chat", "/service/ai/set-model", "/service/ai/analyze", "/service/ai/explain-failure", "/service/ai/clear","/service/ai/code/complexity"],
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