import csv, re, json
from functools import lru_cache
from flask import Flask, request, jsonify,Response
from flask_cors import CORS
from psycopg2.extras import Json
from io import StringIO
from flask_jwt_extended import *

from config import Config
from auth_handler import AuthHandler
from data_logger import DataLogger
from database import execute_read, execute_write
from print_log import Logger
logger = Logger()

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, supports_credentials=True,origins=["http://localhost:3000"])
JWT_MANAGER = JWTManager(app)
auth = AuthHandler() # No client needed anymore
ADMIN_WHITELIST = ["b7fa8d3e-10f5-4b2c-9624-7ef547ac86c5"]

# ============================================================================
# Cached Helper Functions
# ============================================================================

LRU_CACHE_SIZE = 40  # Adjust based on expected load and memory constraints
@lru_cache(maxsize=LRU_CACHE_SIZE) # Increased size to handle (10 problems * 3 languages)
def _fetch_template_from_db(problem_id, language):
    """Helper to cache template based on BOTH ID and Language"""
    logger.log("CACHE MISS", f"Fetching template for {problem_id} - {language}")
    rows = execute_read(
        "SELECT id, problem_id, language, template_code, function_name, input_params, return_type, driver_code, solution_code FROM code_templates WHERE problem_id = :pid AND language = :lang",
        {"pid": problem_id, "lang": language}
    )
    return {"data": rows[0] if rows else None}

@lru_cache(maxsize=LRU_CACHE_SIZE)
def _fetch_hints_from_db(problem_id):
    """Helper to cache hints based on ID"""
    logger.log("CACHE MISS", f"Fetching hints for {problem_id}")
    
    query = "SELECT id, problem_id, hints_data FROM hints WHERE problem_id = :pid"
    rows = execute_read(query, {"pid": problem_id})
    
    # Supabase .single() returns one dict. We replicate that structure.
    return {"data": rows[0] if rows else None}

@lru_cache(maxsize=LRU_CACHE_SIZE)
def _fetch_testcases_from_db(problem_id):
    logger.log("CACHE MISS", f"Fetching testcases {problem_id}")
    
    query = "SELECT id, problem_id, is_hidden, input_params FROM test_cases WHERE problem_id = :pid"
    rows = execute_read(query, {"pid": problem_id})
    
    # Supabase returns a list of rows
    return {"data": rows}

@lru_cache(maxsize=LRU_CACHE_SIZE)
def _fetch_problems_from_db(difficulty=None, category=None,mode=None):
    logger.log("CACHE MISS", f"Fetching problems with difficulty={difficulty}, category={category}")
    
    # Start with a base query
    params = {'mode': mode} if mode else {}
    if mode == 'learn': 
        query = "SELECT id, title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode FROM problems WHERE mode=:mode"
    else: # WHEN MODE IS NOT LEARN IT IS A COMPETE WHICH IS A CUSTOM PROBLEMS TABLE VIEW.
        query = f"SELECT id, title, description, difficulty, category, topic, examples, constraints, time_complexity, space_complexity, mode FROM {mode} WHERE 1=1"
        
    # Dynamically append filters
    if difficulty:
        query += " AND difficulty = :diff"
        params['diff'] = difficulty
    if category:
        query += " AND category = :cat"
        params['cat'] = category
        
    rows = execute_read(query, params)
    
    return {"data": rows}

@lru_cache(maxsize=LRU_CACHE_SIZE)
def _fetch_problem_from_db(problem_id):
    logger.log("CACHE MISS", f"Fetching problem {problem_id}")
    rows = execute_read("SELECT * FROM problems WHERE id = :pid", {"pid": problem_id})
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
        return jsonify({'success': False, 'error': 'Name, email, and password are required'}), 400
    
    # Validate password strength
    if len(password) < 6:
        return jsonify({'success': False, 'error': 'Password must be at least 6 characters'}), 400
    
    result = auth.signup(name, email, password, cohort)
    if not result['success']:
        return jsonify(result), 400
    
    user = result.get('user')
    username = user.get('name')
    uid = user.get('uid')
    
    resp = jsonify({'success':True,'user':{'name': username} })
    set_access_cookies(response=resp,encoded_access_token= create_access_token(identity=uid) )
    set_refresh_cookies(response=resp,encoded_refresh_token= create_refresh_token(identity=uid) )

    return resp, 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    '''Handle user login'''
    data = request.get_json()
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400
    
    result = auth.login(email, password)
    
    if not result['success']:
        return jsonify(result), 401
    
    # print(f"[DEBUG] User {result['user']['email']} logged in with UID {result['user']['uid']}")
    user = result.get('user')
    username = user.get('name')
    uid = user.get('uid')
    resp = jsonify({'success':True,'user':{'name': username} })
    set_access_cookies(response=resp,encoded_access_token= create_access_token(identity=uid))
    set_refresh_cookies(response=resp,encoded_refresh_token= create_refresh_token(identity=uid))

    return resp,201

@app.route('/api/auth/logout')
def logout():
    resp = jsonify({'success':True, 'message':'logout successful!'})
    unset_jwt_cookies(response=resp)
    return resp

@app.route('/token/refresh')
@jwt_required(refresh=True)
def refresh_token():
    uid = get_jwt_identity()
    resp = jsonify({'success':True}) 
    set_access_cookies(response=resp, encoded_access_token=create_access_token(identity=uid))
    return resp   

@JWT_MANAGER.invalid_token_loader
def invalid_token_callback(error_string):
    """Custom response for tampered or invalid tokens."""
    return jsonify({"error": "invalid_token", "message": error_string}), 401

@JWT_MANAGER.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    """Custom response when a token expires."""
    return jsonify({"error": "token_expired", "message": "Please log in again."}), 401

@app.route('/api/auth/check-admin')
@jwt_required()
def check_admin():
    uid = get_jwt_identity()
    return jsonify({ 'success': True, 'is_admin': uid in ADMIN_WHITELIST })

@app.route('/api/features/update', methods=['POST'])
@jwt_required()    
def store_features_usage():
    """Helper to store feature usage in DB"""
    try:

        datalogger = DataLogger()
        
        data = request.get_json()
        uid = get_jwt_identity()
        pid = data.get('pid')
        features = data.get('features', {})
        
        data = {'uid': uid,'pid': pid,"debug_btn":None, "ai_used":None, "hints":None, "performance_analyzer":None, "custom_tc":None, "dev_preferences":None}
        for key in features.keys():
            data[key] = features.get(key)
        datalogger.log_feature(**data)
        return jsonify({'success': True}), 200
    except Exception as e:
        logger.log("ERROR", f"Store feature usage failed: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500
# ============================================================================
# DSA Problems Endpoints
# ============================================================================

@app.route('/api/problems', methods=['GET'])
@jwt_required()
def get_problems():
    """Fetch all DSA problems with optional filters"""
    try:
        # Get query parameters for filtering
        difficulty = request.args.get('difficulty')
        category = request.args.get('category')
        mode = request.args.get('mode')  # Optional: "compete" or "learn"
        problems = _fetch_problems_from_db(difficulty, category,mode)

        if not problems['data']:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        return jsonify({"success": True, "problems": problems['data']})
        
    except Exception as e:
        logger.log("ERROR", f"Get problems failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/problems/<problem_id>', methods=['GET'])
@jwt_required()
def get_problem(problem_id):
    """Fetch a specific DSA problem with all details"""
    try:
        
        problem = _fetch_problem_from_db(problem_id)
        
        if not problem["data"]:
            return jsonify({"success": False, "error": "Problem not found"}), 404
        
        return jsonify({"success": True, "problem": problem["data"]})
        
    except Exception as e:
        logger.log("ERROR", f"Get problem failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/hints', methods=['GET'])
@jwt_required()
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
        logger.log("ERROR", f"Get hints failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/test-cases', methods=['GET'])
@jwt_required(optional=True)
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
        logger.log("ERROR", f"Get test cases failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/problems/<problem_id>/template', methods=['GET'])
@jwt_required(optional=True)
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
        logger.log("ERROR", f"Get template failed: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# Admin Endpoints
# ============================================================================
@app.route('/api/admin/problems', methods=['POST'])
@jwt_required()
def admin_create_problem():
    """Create a new problem along with its hints and templates"""
    try:
        data = request.get_json()
        problem = data.get('problem')
        # 1. Insert Problem Metadata
        problem_id = execute_write(
            """INSERT INTO problems (title, description, difficulty, category, mode, topic, examples, constraints, time_complexity, space_complexity) 
               VALUES (:title, :desc, :diff, :cat, :mode, :topic, :ex, :constraints, :tc, :sc) RETURNING id""",
            {
                "title": problem.get('title'),
                "desc": problem.get('description'),
                "diff": problem.get('difficulty'),
                "cat": problem.get('category'),
                "mode": problem.get('mode', 'learn'),
                "topic": problem.get('topic'),
                "ex": problem.get('examples'),
                "constraints": problem.get('constraints'),
                "tc": problem.get('time_complexity'),
                "sc": problem.get('space_complexity')
            }
        )

        # 2. Insert Hints if provided
        execute_write(
            "INSERT INTO hints (problem_id, hints_data) VALUES (:pid, :hints_data)",
            {"pid": problem_id, "hints_data":data.get('hints')}
        )

        # 3. Insert test_cases
        if data.get('public_test_cases'):
            execute_write(
                """INSERT INTO test_cases (problem_id, input_params, is_hidden) 
                    VALUES (:pid, :input_params, :is_hidden)""",
                {"pid": problem_id, "input_params": data.get('public_test_cases'), "is_hidden": False}
            )
        if data.get('private_test_cases'):
            execute_write(
                """INSERT INTO test_cases (problem_id, input_params, is_hidden) 
                    VALUES (:pid, :input_params, :is_hidden)""",
                {"pid": problem_id, "input_params": data.get('private_test_cases'), "is_hidden": True}
            )

        # 4. Insert Code Templates
        if 'code_templates' in data:
            for temp in data['code_templates']:
                execute_write(
                    """INSERT INTO code_templates (problem_id, language, template_code, driver_code, solution_code, function_name, input_params, return_type) 
                       VALUES (:pid, :lang, :t_code, :d_code, :s_code, :f_name, :inp_params, :rtype)""",
                    {"pid": problem_id, "lang": temp['language'], "t_code": temp['template_code'], "d_code": temp['driver_code'],
                        "s_code": temp['solution_code'],"f_name": temp['function_name'],"inp_params": temp['input_params'], 
                        "rtype":temp['return_type']}
                )

        _fetch_problems_from_db.cache_clear()
        return jsonify({"success": True, "problem_id": problem_id}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/admin/problems/<problem_id>', methods=['PUT'])
@jwt_required()
def admin_update_problem(problem_id):
    """Update existing problem metadata and clear relevant caches"""
    try:
        data = request.get_json()
        
        # Update metadata
        execute_write(
            """UPDATE problems SET title = :title, description = :desc, difficulty = :diff, category = :cat, examples = :ex, constraints = :con,
               topic = :topic, time_complexity = :tc, space_complexity = :sc, updated_at = CURRENT_TIMESTAMP WHERE id = :pid""",
            {
                "pid": problem_id,
                "title": data.get('title'),
                "desc": data.get('description'),
                "diff": data.get('difficulty'),
                "cat": data.get('category'),
                "ex": data.get('examples'),
                "con": data.get('constraints'),
                "topic": data.get('topic'),
                "tc": data.get('time_complexity'),
                "sc": data.get('space_complexity')
            }
        )

        # Clear the specific problem metdata from LRU cache
        _fetch_problem_from_db.cache_clear()
        
        return jsonify({"success": True, "message": "Problem updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/admin/problems/<problem_id>/hints', methods=['PUT'])
@jwt_required()
def admin_update_hints(problem_id):
    """Replace all hints for a specific problem"""
    try:
        data = request.get_json() # Expects a list of hint objects
        hints = data.get('hints', [])
        # Replace old one
        execute_write("DELETE FROM hints WHERE problem_id = :pid", {"pid": problem_id})
        
        execute_write("INSERT INTO hints (problem_id, hints_data) VALUES (:pid, :hints)",
                      {"pid": problem_id, "hints":Json(hints)})
    
        return jsonify({"success": True, "message": "Hints updated successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/problems/<problem_id>/test-cases', methods=['PUT'])
@jwt_required()
def admin_update_test_cases(problem_id):
    """Update public and private test cases"""
    try:
        data = request.get_json()
        if data.get('public_test_cases'):

            execute_write(
                """UPDATE test_cases SET input_params = :public_test_cases WHERE problem_id = :pid and is_hidden= :hidden""",
                {"pid": problem_id,
                    "public_test_cases": json.dumps(data.get('public_test_cases', [])),
                    "hidden": False,}
            )
        if data.get('private_test_cases'):

            execute_write(
                """UPDATE test_cases SET input_params = :private_test_cases WHERE problem_id = :pid and is_hidden= :hidden""",
                {"pid": problem_id,
                    "private_test_cases": json.dumps(data.get('private_test_cases')),
                    "hidden": True,}
            )
        _fetch_testcases_from_db.cache_clear()
        return jsonify({"success": True, "message": "Test cases updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/admin/problems/<problem_id>/templates/<language>', methods=['PUT'])
@jwt_required()
def admin_update_template(problem_id, language):
    """Update template, driver, and solution code for a specific language"""
    try:
        data = request.get_json()
        
        execute_write(
            """UPDATE code_templates SET 
               template_code = :t_code, 
               driver_code = :d_code, 
               solution_code = :s_code, 
               function_name = :f_name,
               return_type = :rtype,
               input_params = :inp_params,
               updated_at = CURRENT_TIMESTAMP
               WHERE problem_id = :pid AND language = :lang""",
            {
                "pid": problem_id, "lang": language, "t_code": data.get('template_code'), "d_code": data.get('driver_code'),
                "s_code": data.get('solution_code'), "f_name": data.get('function_name'), 
                'rtype':data.get('return_type'), 'inp_params': data.get('input_params')}
        )
        
        _fetch_template_from_db.cache_clear()
        return jsonify({"success": True, "message": f"{language.capitalize()} template updated"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route('/api/admin/problems/<problem_id>', methods=['DELETE'])
@jwt_required()
def admin_delete_problem(problem_id):
    """Delete a problem and its associated data"""
    try:
        execute_write("DELETE FROM problems WHERE id = :pid", {"pid": problem_id})
        
        # Ensure cache is cleared so deleted templates aren't served
        _fetch_problems_from_db.cache_clear()
        
        return jsonify({"success": True, "message": "Problem deleted"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/views', methods=['POST'])
@jwt_required()
def admin_create_view():
    """Create or update a view from problems table for compete mode"""
    try:
        data = request.get_json() or {}
        raw_name = data.get('name', '')            
        view_name = 'compete_' + raw_name
        safe_view_name = re.sub(r'[^a-zA-Z0-9_]', '_', view_name)
        # Ensure problem_ids is handled as a list/iterable
        problem_ids = data.get('problem_ids', [])
        # Drop the old view if it exists to allow full updates
        execute_write(f"DROP VIEW IF EXISTS {safe_view_name}")        
        
        # Create the new view fresh
        postgres_array_string = "{" + ",".join(problem_ids) + "}"
        
        query = f"CREATE VIEW {safe_view_name} AS SELECT * FROM problems WHERE id = ANY(:pids)"
        
        execute_write(query,{"pids": postgres_array_string})
        
        return jsonify({"success": True, "message": "View created/updated successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/views', methods=['DELETE'])
@jwt_required()
def admin_delete_view():
    """Delete the given view"""
    try:
        data = request.get_json() or {}
        view_name = data.get('name', '')            
        
        # Drop the old view if it exists to allow full updates
        execute_write(f"DROP VIEW IF EXISTS {view_name}")        
        
        return jsonify({"success": True, "message": "View Deleted successfully"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/admin/views', methods=['GET'])
@jwt_required()
def get_all_views_data():
    """Fetch all compete views and their underlying tabular data"""
    try:
        # 1. Fetch all view names matching your prefix
        view_names_query = """
            SELECT table_name 
            FROM information_schema.views 
            WHERE table_schema = 'public' 
              AND table_name LIKE 'compete_%';
        """
        views_list = execute_read(view_names_query)
        
        # 2. Extract raw strings from the list of dicts: e.g., ['compete_contest1', ...]
        view_names = [row['table_name'] for row in views_list]
        
        # 3. Loop through views and populate the payload using execute_read
        views_payload = {}
        for v_name in view_names:
            views_payload[v_name] = execute_read(f"SELECT * FROM {v_name}")
                
        return jsonify({"success": True, "data": views_payload})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# ============================================================================
# Analytics Endpoints
# ============================================================================

@app.route('/api/analytics/stats', methods=['GET'])
@jwt_required()
def get_platform_stats():
    """Returns global KPI statistics for the dashboard."""
    try:
        query = """
            SELECT 
                (SELECT COUNT(uid) FROM user_profiles) AS total_students,
                (SELECT COUNT(id) FROM user_code_submissions) AS total_submissions,
                (SELECT COUNT(id) FROM ai_chat_messages) AS total_ai_messages,
                (SELECT COALESCE(SUM(CASE WHEN num_fail_tc = 0 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(id), 0), 0) FROM user_code_submissions) AS global_success_rate
        """
        rows = execute_read(query)
        return jsonify({"success": True, "stats": rows[0] if rows else {}})
    except Exception as e:
        logger.log("ERROR", f"Failed to fetch platform stats: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/users', methods=['GET'])
@jwt_required()
def get_all_users_analytics():
    """Returns paginated user analytics summaries."""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        offset = (page - 1) * limit
        search = request.args.get('search', '')
        filter = request.args.get('filter','')

        base_query = """
            FROM user_profiles u
            LEFT JOIN user_code_submissions s ON u.uid = s.uid
            WHERE (u.name ILIKE :search OR u.email ILIKE :search) AND (s.pid in (SELECT id FROM problems where mode ILIKE :filter))
            GROUP BY u.uid, u.name, u.email, u.created_at
        """

        count_query = f"SELECT COUNT(u.uid) as total {base_query}"
        total_rows = execute_read(count_query, {"search": f"%{search}%", "filter":f"%{filter}%"})
        total_users = total_rows[0]['total'] if total_rows else 0

        data_query = f"""
            SELECT 
                u.uid, u.name, u.email, u.created_at,
                COUNT(DISTINCT s.pid) AS problems_attempted,
                COUNT(DISTINCT CASE WHEN s.num_fail_tc = 0 THEN s.pid END) AS problems_solved,
                COUNT(s.id) AS total_submissions,
                (SELECT COUNT(id) FROM ai_chat_messages a WHERE a.uid = u.uid) AS total_ai_messages,
                COALESCE(SUM(CASE WHEN s.num_fail_tc = 0 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(s.id), 0), 0) AS success_rate
            {base_query}
            ORDER BY u.created_at DESC
            LIMIT :limit OFFSET :offset
        """
        users = execute_read(data_query, {"search": f"%{search}%", "filter":f"%{filter}%", "limit": limit, "offset": offset})

        return jsonify({
            "success": True, 
            "users": users, 
            "total": total_users, 
            "page": page, 
            "total_pages": (total_users + limit - 1) // limit
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/users/<uid>', methods=['GET'])
@jwt_required()
def get_student_details(uid):
    """Returns detailed profile, difficulty breakdown, and history for a specific student."""
    try:
        # 1. User Summary
        user_query = """
            SELECT 
                u.uid, u.name, u.email,
                COUNT(DISTINCT s.pid) AS problems_attempted,
                COUNT(DISTINCT CASE WHEN s.num_fail_tc = 0 THEN s.pid END) AS problems_solved,
                COUNT(s.id) AS total_submissions,
                (SELECT COUNT(id) FROM ai_chat_messages a WHERE a.uid = :uid) AS total_ai_messages,
                COALESCE(SUM(CASE WHEN s.num_fail_tc = 0 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(s.id), 0), 0) AS success_rate
            FROM user_profiles u
            LEFT JOIN user_code_submissions s ON u.uid = s.uid
            WHERE u.uid = :uid
            GROUP BY u.uid, u.name, u.email
        """
        user_summary = execute_read(user_query, {"uid": uid})
        if not user_summary:
            return jsonify({"success": False, "error": "User not found"}), 404

        # 2. Difficulty Breakdown
        diff_query = """
            SELECT p.difficulty, 
                   COUNT(DISTINCT s.pid) as attempted, 
                   COUNT(DISTINCT CASE WHEN s.num_fail_tc = 0 THEN s.pid END) as solved
            FROM problems p
            JOIN user_code_submissions s ON p.id = s.pid
            WHERE s.uid = :uid
            GROUP BY p.difficulty
        """
        diff_data = execute_read(diff_query, {"uid": uid})
        difficulty_breakdown = {"easy": {"attempted": 0, "solved": 0}, "medium": {"attempted": 0, "solved": 0}, "hard": {"attempted": 0, "solved": 0}}
        for row in diff_data:
            diff_level = row['difficulty'].lower()
            if diff_level in difficulty_breakdown:
                difficulty_breakdown[diff_level] = {"attempted": row['attempted'], "solved": row['solved']}

        # 3. Feature Usage
        feature_query = """
            SELECT 
                COALESCE(SUM(debug_btn), 0) AS debugger_activations,
                COALESCE(SUM(hints), 0) AS hints_used,
                COALESCE(SUM(performance_analyzer), 0) AS complexity_analysis,
                (SELECT COUNT(id) FROM user_code_submissions WHERE uid = :uid AND btn = 'test') AS code_runs,
                (SELECT COUNT(id) FROM user_code_submissions WHERE uid = :uid AND btn = 'submit') AS code_submissions
            FROM feature_usage
            WHERE uid = :uid
        """
        feature_usage = execute_read(feature_query, {"uid": uid})

        # 4. Submission History
        sub_query = """
            SELECT s.id, s.pid AS problem_id, p.title AS problem_title, s.language, s.code, 
                   CASE WHEN s.error IS NOT NULL THEN 'error' WHEN s.num_fail_tc > 0 THEN 'fail' ELSE 'pass' END as status,
                   s.num_pass_tc AS passed_tests, (s.num_pass_tc + s.num_fail_tc) AS total_tests, s.submitted_at AS timestamp
            FROM user_code_submissions s
            JOIN problems p ON s.pid = p.id
            WHERE s.uid = :uid
            ORDER BY s.submitted_at DESC
        """
        submission_history = execute_read(sub_query, {"uid": uid})

        # 5. AI Chat Logs (Grouped by Problem)
        chat_query = """
            SELECT a.id, a.pid AS problem_id, p.title AS problem_title, 
                   a.role, a.content, a.created_at AS timestamp
            FROM ai_chat_messages a
            JOIN problems p ON a.pid = p.id
            WHERE a.uid = :uid
            ORDER BY a.pid, a.created_at ASC
        """
        chat_rows = execute_read(chat_query, {"uid": uid})
        
        # Group chats logically
        chat_logs_dict = {}
        for row in chat_rows:
            pid = row['problem_id']
            if pid not in chat_logs_dict:
                chat_logs_dict[pid] = {
                    "id": f"session_{pid}",
                    "problem_id": pid,
                    "problem_title": row['problem_title'],
                    "session_start": row['timestamp'],
                    "messages": []
                }
            chat_logs_dict[pid]['messages'].append({
                "role": row['role'],
                "content": row['content'],
                "timestamp": row['timestamp']
            })
        ai_chat_logs = list(chat_logs_dict.values())

        profile = {
            "user": user_summary[0],
            "difficulty_breakdown": difficulty_breakdown,
            "feature_usage": feature_usage[0] if feature_usage else {},
            "ai_chat_logs": ai_chat_logs,
            "submission_history": submission_history
        }
        return jsonify({"success": True, "profile": profile})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/charts/velocity', methods=['GET'])
@jwt_required()
def get_difficulty_velocity():
    """
    Returns problem attempt and solve velocity grouped by difficulty.
    """
    try:
        # Cast UUIDs to text explicitly to allow string concatenation in PostgreSQL
        query = """
            SELECT p.difficulty, 
                   COUNT(DISTINCT s.pid::text || s.uid::text) AS attempted, 
                   COUNT(DISTINCT CASE WHEN s.num_fail_tc = 0 THEN s.pid::text || s.uid::text END) AS solved
            FROM problems p
            LEFT JOIN user_code_submissions s ON p.id = s.pid
            GROUP BY p.difficulty
        """
        data = execute_read(query)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/charts/ai-assistance', methods=['GET'])
@jwt_required()
def get_ai_assistance_data():
    """Returns average AI message volume per problem."""
    try:
        query = """
            SELECT p.title AS problem_title, 
                   COALESCE(AVG(user_msg_counts.msg_count), 0) AS avg_ai_messages
            FROM problems p
            LEFT JOIN (
                SELECT pid, uid, COUNT(id) AS msg_count
                FROM ai_chat_messages
                GROUP BY pid, uid
            ) user_msg_counts ON p.id = user_msg_counts.pid WHERE p.mode='learn'
            GROUP BY p.id, p.title
            ORDER BY avg_ai_messages DESC
        """
        data = execute_read(query)
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/export/system', methods=['GET'])
@jwt_required()
def export_system_csv():
    """Generates and streams a CSV of global system metrics."""
    try:
        query = """
            SELECT u.uid, u.name, u.email,
                   COUNT(DISTINCT s.pid) AS problems_attempted,
                   COUNT(DISTINCT CASE WHEN s.num_fail_tc = 0 THEN s.pid END) AS problems_solved,
                   COUNT(s.id) AS total_submissions,
                   (SELECT COUNT(id) FROM ai_chat_messages a WHERE a.uid = u.uid) AS total_ai_messages,
                   COALESCE(SUM(CASE WHEN s.num_fail_tc = 0 THEN 1 ELSE 0 END)::float / NULLIF(COUNT(s.id), 0), 0) AS success_rate,
                   COALESCE((SELECT SUM(hints) FROM feature_usage f WHERE f.uid = u.uid), 0) AS hints_used,
                   COALESCE((SELECT SUM(debug_btn) FROM feature_usage f WHERE f.uid = u.uid), 0) AS debug_activations,
                   COALESCE((SELECT SUM(performance_analyzer) FROM feature_usage f WHERE f.uid = u.uid), 0) AS complexity_checks
            FROM user_profiles u
            LEFT JOIN user_code_submissions s ON u.uid = s.uid
            GROUP BY u.uid, u.name, u.email
        """
        rows = execute_read(query)
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=["uid", "name", "email", "problems_attempted", "problems_solved", "total_submissions", "total_ai_messages", "success_rate", "hints_used", "debug_activations", "complexity_checks"])
        writer.writeheader()
        writer.writerows(rows)
        
        return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": "attachment;filename=system_export.csv"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/analytics/export/user/<uid>', methods=['GET'])
@jwt_required()
def export_user_csv(uid):
    """Generates and streams a raw CSV ledger for a specific student."""
    try:
        query = """
            SELECT s.submitted_at as timestamp, 'submission' as event_type, p.title as problem, s.language, 
                   CASE WHEN s.num_fail_tc = 0 THEN 'pass' ELSE 'fail' END as outcome
            FROM user_code_submissions s JOIN problems p ON s.pid = p.id WHERE s.uid = :uid
            UNION ALL
            SELECT a.created_at as timestamp, 'ai_chat' as event_type, p.title as problem, a.role as language, 
                   'message_sent' as outcome
            FROM ai_chat_messages a JOIN problems p ON a.pid = p.id WHERE a.uid = :uid
            ORDER BY timestamp DESC
        """
        rows = execute_read(query, {"uid": uid})
        
        output = StringIO()
        writer = csv.DictWriter(output, fieldnames=["timestamp", "event_type", "problem", "language", "outcome"])
        writer.writeheader()
        writer.writerows(rows)
        
        return Response(output.getvalue(), mimetype="text/csv", headers={"Content-Disposition": f"attachment;filename=student_{uid}_export.csv"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
# ============================================================================
# Error Handlers
# ============================================================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({"error": "Internal server error"}), 500

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with available endpoints"""
    return jsonify({
        "message": "MAPLE Backend API",
        "version": "2.0.0",
        "execution_model": "Local (Direct execution via subprocess)",
        "endpoints": {
            "execute": ["/service/execute/code/run", "/service/execute/problems/<id>/run-tests", "/service/execute/problems/<id>/submit"],
            "problems": ["/api/problems", "/api/problems/<id>", "/api/problems/<id>/test-cases", "/api/problems/<id>/hints"],
            "ai": ["/service/ai/chat", "/service/ai/set-model", "/service/ai/analyze", "/service/ai/explain-failure", "/service/ai/clear","/service/ai/code/complexity"],
            "health": ["/api/health"]
        }
    })

# ============================================================================
# Main
# ============================================================================

if __name__ == '__main__':
    logger.log("INFO",f"Starting CodeIDE DB Server")
    logger.log("INFO",f"Server running on {Config.HOST}:{Config.DBPORT}")
    
    app.run(host=Config.HOST, port=Config.DBPORT, debug=Config.DEBUG, use_reloader=False)