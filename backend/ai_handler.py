import traceback
from flask import Flask, app, jsonify, request
from flask_cors import CORS
from supabase import create_client
import os

from ai_chatbot import AIChatbot
from config import Config
from data_logger import DataLogger

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})
ai_chatbot = AIChatbot(model=Config.AI_MODEL, api_key=Config.OPENAI_API_KEY)
# Validate configuration
Config.validate()

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(SUPABASE_URL,SUPABASE_KEY)

@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """Send message to AI chatbot with optional code and error context"""
    try:
        data = request.get_json()
        message = data.get('message', '')
        code_context = data.get('code', None)
        error_context = data.get('error', None)
        uid = data.get('uid', 'unknown_user')
        pid = data.get('pid', 'unknown_problem')
        if not message:
            return jsonify({"success": False, "error": "No message provided"}), 400
        
        response = ai_chatbot.get_response(message, code_context, error_context)
        datalogger = DataLogger(supabase_client=supabase)
        datalogger.add_message(uid=uid, pid=pid,role= 'user',content= message,code_context= code_context,error_context= error_context)
        datalogger.add_message(uid=uid,pid= pid, role='assistant', content=response)
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

if __name__ == '__main__':
    print(f"[INFO] Starting CodeIDE AI Server")
    print(f"[INFO] AI Model: {Config.AI_MODEL}")
    print(f"[INFO] Server running on {Config.HOST}:{Config.AIPORT}")
    
    app.run(host=Config.HOST, port=Config.AIPORT, debug=Config.DEBUG)