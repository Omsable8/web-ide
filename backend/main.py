from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import traceback

from config import Config
from ssh_manager import SSHManager
from ai_chatbot import AIChatbot

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, resources={r"/*": {"origins": Config.CORS_ORIGINS}})

# Global instances
ssh_manager: SSHManager = None
ai_chatbot = AIChatbot(model=Config.AI_MODEL, api_key=Config.OPENAI_API_KEY)

# Validate configuration
Config.validate()

# ============================================================================
# SSH Connection Management
# ============================================================================

@app.route('/api/ssh/connect', methods=['POST'])
def connect_ssh():
    """Connect to SSH server"""
    global ssh_manager
    
    try:
        if ssh_manager and ssh_manager.is_connected:
            return jsonify({"success": True, "message": "Already connected"})
        
        ssh_manager = SSHManager(
            hostname=Config.SSH_HOSTNAME,
            username=Config.SSH_USERNAME,
            password=Config.SSH_PASSWORD,
            port=Config.SSH_PORT
        )
        
        success = ssh_manager.connect()
        
        if success:
            return jsonify({"success": True, "message": "Connected to server"})
        else:
            return jsonify({"success": False, "error": "Failed to connect"}), 500
            
    except Exception as e:
        print(f"[ERROR] SSH connection failed: {str(e)}")
        traceback.print_exc()
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ssh/disconnect', methods=['POST'])
def disconnect_ssh():
    """Disconnect from SSH server"""
    global ssh_manager
    
    try:
        if ssh_manager:
            ssh_manager.disconnect()
            ssh_manager = None
        
        return jsonify({"success": True, "message": "Disconnected"})
        
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/api/ssh/status', methods=['GET'])
def ssh_status():
    """Check SSH connection status"""
    global ssh_manager
    
    is_connected = ssh_manager.is_connected if ssh_manager else False
    return jsonify({
        "connected": is_connected,
        "hostname": Config.SSH_HOSTNAME if is_connected else None,
        "username": Config.SSH_USERNAME if is_connected else None
    })

# ============================================================================
# Code Execution Endpoints
# ============================================================================

@app.route('/api/code/run', methods=['POST'])
def run_code():
    """Execute code on the remote server and return output"""
    global ssh_manager
    
    try:
        if not ssh_manager or not ssh_manager.is_connected:
            return jsonify({"success": False, "error": "Not connected to server"}), 400
        
        data = request.get_json()
        code = data.get('code', '')
        language = data.get('language', 'python')
        
        if not code:
            return jsonify({"success": False, "error": "No code provided"}), 400
        
        result = ssh_manager.run_code(code, language)
        return jsonify(result)
        
    except Exception as e:
        print(f"[ERROR] Code execution failed: {str(e)}")
        traceback.print_exc()
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
    ssh_connected = ssh_manager.is_connected if ssh_manager else False
    return jsonify({
        "status": "healthy",
        "ssh_connected": ssh_connected,
        "ai_ready": True
    })

@app.route('/', methods=['GET'])
def index():
    """Root endpoint with available endpoints"""
    return jsonify({
        "message": "CodeIDE Backend API",
        "version": "1.0.0",
        "endpoints": {
            "ssh": ["/api/ssh/connect", "/api/ssh/disconnect", "/api/ssh/status"],
            "code": ["/api/code/run"],
            "ai": ["/api/ai/chat", "/api/ai/analyze", "/api/ai/explain-failure", "/api/ai/clear"],
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
    print(f"[INFO] SSH Target: {Config.SSH_USERNAME}@{Config.SSH_HOSTNAME}:{Config.SSH_PORT}")
    print(f"[INFO] AI Model: {Config.AI_MODEL}")
    print(f"[INFO] Server running on {Config.HOST}:{Config.PORT}")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
