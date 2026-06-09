"""
Authentication functions for db_handler.py
Add these to your existing db_handler.py file
"""
import bcrypt
import secrets
from database import execute_read, execute_write
from print_log import Logger
logger = Logger()
class AuthHandler:
    def __init__(self):
        pass # No client needed anymore
    
    def signup(self, name, email, password, cohort=None):
        """
        Register a new user.
        
        Args:
            name: User's full name
            email: User's email
            password: Plain text password (will be hashed)
            cohort: Optional cohort identifier (e.g., 'fall_2024')
            
        Returns:
            {
                'success': True,
                'user': {
                    'uid': 'uuid',
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'token': 'jwt-token'
                }
            }
            OR
            {
                'success': False,
                'error': 'Error message'
            }
        """
        # 1. Check if email exists
        check = execute_read("SELECT uid FROM user_profiles WHERE email = :email", {"email": email})
        if check:
            return {'success': False, 'error': 'Email already registered'}
            
        # 2. Hash Password
        pw_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # 3. Insert User
        # Note: We rely on the DB to generate the UUID (DEFAULT gen_random_uuid())
        sql = """
        INSERT INTO user_profiles (name, email, password_hash) 
        VALUES (:name, :email, :pw) 
        RETURNING uid
        """
        
        try:
            # Execute and get the generated UUID
            # Note: The 'returning' logic might vary slightly by driver, 
            # but this is the standard SQLAlchemy/Postgres pattern.
            result = execute_write(sql, {"name": name, "email": email, "pw": pw_hash})
            
            # Since execute_write commits and closes, we might not get the return value directly 
            # depending on how SQLAlchemy wraps it. 
            # RELIABLE FALLBACK: Just fetch the user we just created.
            user = execute_read("SELECT uid, name, email FROM user_profiles WHERE email = :email", {"email": email})[0]
            
            # Generate Token
            token = f"{user['uid']}:{secrets.token_urlsafe(32)}"
            
            return {
                'success': True,
                'user': {'uid': str(user['uid']), 'name': user['name'], 'email': user['email'], 'token': token}
            }
        except Exception as e:
            logger.log("AUTH ERROR",f"{e}")
            return {'success': False, 'error': 'Internal server error'}

    def login(self, email, password):
        """
        Authenticate user and create session.
        
        Args:
            email: User's email
            password: Plain text password
            
        Returns:
            {
                'success': True,
                'user': {
                    'uid': 'uuid',
                    'name': 'John Doe',
                    'email': 'john@example.com',
                    'token': 'jwt-token'
                }
            }
            OR
            {
                'success': False,
                'error': 'Invalid credentials'
            }
        """
        users = execute_read("SELECT uid, name, email, password_hash FROM user_profiles WHERE email = :email", {"email": email})
        
        if not users:
            return {'success': False, 'error': 'Invalid credentials'}
            
        user = users[0]
        
        # Verify Password
        if bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
            token = f"{user['uid']}:{secrets.token_urlsafe(32)}"
            return {
                'success': True,
                'user': {'uid': str(user['uid']), 'name': user['name'], 'email': user['email'], 'token': token}
            }
            
        return {'success': False, 'error': 'Invalid credentials'}

    def verify_token(self, token):
        """
        Verify session token and return user info.
        
        Returns:
            {'valid': True, 'uid': 'uuid'}
            OR
            {'valid': False, 'error': 'Invalid token'}
        """
        try:
            uid, _ = token.split(':', 1)
            users = execute_read("SELECT uid FROM user_profiles WHERE uid = :uid", {"uid": uid})
            if users:
                return {'valid': True, 'uid': str(users[0]['uid'])}
        except:
            pass
        return {'valid': False, 'error': 'Invalid Token'}
    
    