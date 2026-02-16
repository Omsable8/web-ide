# backend/data_logger.py
from database import execute_write
import json

class DataLogger:
    def __init__(self, db_client=None):
        pass 

    def log_feature(self, uid, pid, **kwargs):

        """Log or update feature usage using PostgreSQL UPSERT."""
        valid_fields = {k: v for k, v in kwargs.items() if v is not None}
        if not valid_fields: return
        
        # Build SQL dynamically based on what fields were sent
        columns = ", ".join(valid_fields.keys())
        values_placeholders = ", ".join([f":{k}" for k in valid_fields.keys()])
        update_logic = ", ".join([f"{k} = EXCLUDED.{k}" for k in valid_fields.keys()])
        
        sql = f"""
        INSERT INTO feature_usage (uid, pid, {columns})
        VALUES (:uid, :pid, {values_placeholders})
        ON CONFLICT (uid, pid) 
        DO UPDATE SET {update_logic};
        """
        
        params = valid_fields
        params['uid'] = uid
        params['pid'] = pid
        
        # Serialize dicts if necessary (like dev_preferences)
        if 'dev_preferences' in params and isinstance(params['dev_preferences'], dict):
             params['dev_preferences'] = json.dumps(params['dev_preferences'])

        execute_write(sql, params)

    def log_submission(self, uid, pid, code, language, error, num_pass, num_fail, btn, passed_tc=None, failed_tc=None):
        sql = """
        INSERT INTO user_code_submissions 
        (uid, pid, code, language, error, num_pass_tc, num_fail_tc, btn, passed_tc, failed_tc)
        VALUES (:uid, :pid, :code, :lang, :err, :pass, :fail, :btn, :ptc, :ftc)
        """
        params = {
            'uid': uid, 'pid': pid, 'code': code, 'lang': language, 
            'err': error, 'pass': num_pass, 'fail': num_fail, 'btn': btn,
            'ptc': json.dumps(passed_tc or []),
            'ftc': json.dumps(failed_tc or [])
        }
        execute_write(sql, params)

    def add_message(self, uid, pid, role, content, code_context=None, error_context=None):
        """
        Add a single message to chat session.
        
        Usage:
            # User message
            logger.add_message(session_id, 'user', 'Why is my code slow?', current_code)
            
            # AI response
            logger.add_message(session_id, 'assistant', 'Your code is O(n^2)...')
        """
        sql = """
        INSERT INTO ai_chat_messages (uid, pid, role, content, code_context)
        VALUES (:uid, :pid, :role, :content, :ctx)
        """
        execute_write(sql, {
            'uid': uid, 'pid': pid, 'role': role, 
            'content': content, 'ctx': code_context
        })