"""
Updated Data Logger - Separate AI messages (industry standard)
"""
from supabase import Client
from datetime import datetime


class DataLogger:
    def __init__(self, supabase_client: Client = None):
        self.supabase: Client = supabase_client
    
    # ========== CODE SUBMISSIONS ==========
    
    def log_submission(self, uid: str, pid: str, code: str, language: str,
                      error: str, num_pass: int, num_fail: int, btn: str,
                      passed_tc: list = None, failed_tc: list = None,
                      runtime_ms: int = None, memory_mb: float = None):
        """Log code submission."""
        data = {
            'uid': uid, 'pid': pid, 'code': code, 'language': language,
            'error': error, 'num_pass_tc': num_pass, 'num_fail_tc': num_fail,
            'btn': btn, 'passed_tc': passed_tc or [], 'failed_tc': failed_tc or []
        }
        return self.supabase.table('user_code_submissions').insert(data).execute()
    
    # ========== AI CHAT (UPDATED) ==========
    
    def start_chat(self, uid: str, pid: str, code_context: str = None, error_context: str = None):
        """
        Start new AI chat session.
        Returns session_id.
        """
        data = {
            'uid': uid,
            'pid': pid,
            'code_context': code_context,
            'error_context': error_context
        }
        result = self.supabase.table('ai_chat_sessions').insert(data).execute()
        return result.data[0]['id'] if result.data else None
    
    def add_message(self, session_id: str, role: str, content: str, code_snapshot: str = None):
        """
        Add a single message to chat session.
        
        Usage:
            # User message
            logger.add_message(session_id, 'user', 'Why is my code slow?', current_code)
            
            # AI response
            logger.add_message(session_id, 'assistant', 'Your code is O(n^2)...')
        """
        data = {
            'session_id': session_id,
            'role': role,  # 'user' or 'assistant'
            'content': content,
            'code_snapshot': code_snapshot
        }
        return self.supabase.table('ai_chat_messages').insert(data).execute()
    
    def get_chat_history(self, session_id: str):
        """Get all messages in a chat session."""
        result = self.supabase.table('ai_chat_messages')\
            .select('role, content, code_snapshot, created_at')\
            .eq('session_id', session_id)\
            .order('created_at')\
            .execute()
        return result.data
    
    # ========== FEATURE USAGE ==========
    
    def log_feature(self, uid: str, pid: str, hints: int = 0, debug_btn: int = 0,
                   performance_analyzer: int = 0, ai_used: int = 0,
                   custom_tc: int = 0, dev_preferences: dict = None):
        """Log or update feature usage."""
        data = {
            'uid': uid, 'pid': pid, 'hints': hints, 'debug_btn': debug_btn,
            'performance_analyzer': performance_analyzer, 'ai_used': ai_used,
            'custom_tc': custom_tc, 'dev_preferences': dev_preferences
        }
        self.supabase.table('feature_usage').upsert(data, on_conflict='uid,pid').execute()


# ========== USAGE EXAMPLES ==========

"""
logger = DataLogger(SUPABASE_URL, SUPABASE_KEY)

# Code submission
logger.log_submission(uid, pid, code, 'python', 'none', 5, 0, 'test')

# AI Chat - UPDATED
@socketio.on('ai_chat_start')
def chat_start(data):
    session_id = logger.start_chat(
        uid=user_id,
        pid=data['problem_id'],
        code_context=data.get('code'),
        error_context=data.get('error')
    )
    emit('chat_ready', {'session_id': session_id})

@socketio.on('ai_message')
def handle_message(data):
    session_id = data['session_id']
    user_msg = data['message']
    current_code = data.get('code')
    
    # Log user message
    logger.add_message(session_id, 'user', user_msg, current_code)
    
    # Get AI response
    ai_resp = get_ai_response(user_msg, current_code)
    
    # Log AI response
    logger.add_message(session_id, 'assistant', ai_resp)
    
    emit('ai_response', {'message': ai_resp})

# Feature usage
logger.log_feature(uid, pid, hints=1, debug_btn=1)
"""
