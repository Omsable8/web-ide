"""
Authentication functions for db_handler.py
Add these to your existing db_handler.py file
"""
from supabase import create_client, Client
import bcrypt
import os
from datetime import datetime, timezone
import secrets


class AuthHandler:
    """Handles user authentication with Supabase"""
    
    def __init__(self, supabase_url: str, supabase_key: str):
        self.supabase: Client = create_client(supabase_url, supabase_key)
    
    def signup(self, name: str, email: str, password: str, cohort: str = None):
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
        try:
            # Check if email already exists
            existing = self.supabase.table('user_profiles')\
                .select('uid')\
                .eq('email', email)\
                .execute()
            
            if existing.data:
                return {
                    'success': False,
                    'error': 'Email already registered'
                }
            
            # Hash password
            password_hash = bcrypt.hashpw(
                password.encode('utf-8'),
                bcrypt.gensalt()
            ).decode('utf-8')
            
            # Insert user
            user_data = {
                'name': name,
                'email': email,
                'password_hash': password_hash,
                'cohort': cohort,
                'consent_given': False  # User must explicitly consent later
            }
            
            result = self.supabase.table('user_profiles')\
                .insert(user_data)\
                .execute()
            
            if not result.data:
                return {
                    'success': False,
                    'error': 'Failed to create user'
                }
            
            user = result.data[0]
            
            # Generate session token
            token = self._generate_token(user['uid'])
            return {
                'success': True,
                'user': {
                    'uid': user['uid'],
                    'name': user['name'],
                    'email': user['email'],
                    'token': token
                }
            }
            
        except Exception as e:
            print(f"[ERROR] Signup failed: {e}")
            return {
                'success': False,
                'error': 'Internal server error'
            }
    
    def login(self, email: str, password: str):
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
        try:
            # Get user by email
            result = self.supabase.table('user_profiles')\
                .select('uid, name, email, password_hash')\
                .eq('email', email)\
                .execute()
            
            if not result.data:
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }
            
            user = result.data[0]
            
            # Verify password
            password_match = bcrypt.checkpw(
                password.encode('utf-8'),
                user['password_hash'].encode('utf-8')
            )
            
            if not password_match:
                return {
                    'success': False,
                    'error': 'Invalid email or password'
                }
            
            # Update last login
            self.supabase.table('user_profiles')\
                .update({'last_login': datetime.now(timezone.utc).isoformat()})\
                .eq('uid', user['uid'])\
                .execute()
            
            # Generate session token
            token = self._generate_token(user['uid'])
            
            return {
                'success': True,
                'user': {
                    'uid': user['uid'],
                    'name': user['name'],
                    'email': user['email'],
                    'token': token
                }
            }
            
        except Exception as e:
            print(f"[ERROR] Login failed: {e}")
            return {
                'success': False,
                'error': 'Internal server error'
            }
    
    def _generate_token(self, uid: str) -> str:
        """
        Generate a simple session token.
        
        For production, use JWT instead:
        - pip install PyJWT
        - import jwt
        - token = jwt.encode({'uid': uid, 'exp': ...}, SECRET_KEY, algorithm='HS256')
        """
        # Simple token for now (NOT SECURE FOR PRODUCTION)
        token = f"{uid}:{secrets.token_urlsafe(32)}"
        
        # TODO: Store session in database or Redis for validation
        # For now, just return the token
        return token
    
    def verify_token(self, token: str) -> dict:
        """
        Verify session token and return user info.
        
        Returns:
            {'valid': True, 'uid': 'uuid'}
            OR
            {'valid': False, 'error': 'Invalid token'}
        """
        try:
            # Simple token format: uid:random_string
            if ':' not in token:
                return {'valid': False, 'error': 'Invalid token format'}
            
            uid = token.split(':')[0]
            
            # Verify user exists
            result = self.supabase.table('user_profiles')\
                .select('uid')\
                .eq('uid', uid)\
                .execute()
            
            if not result.data:
                return {'valid': False, 'error': 'User not found'}
            
            return {'valid': True, 'uid': uid}
            
        except Exception as e:
            print(f"[ERROR] Token verification failed: {e}")
            return {'valid': False, 'error': 'Token verification failed'}


# ============================================================================
# IMPROVED VERSION WITH JWT (RECOMMENDED FOR PRODUCTION)
# ============================================================================

"""
pip install PyJWT

import jwt
from datetime import datetime, timedelta

class AuthHandlerJWT(AuthHandler):
    '''Enhanced auth handler with JWT tokens'''
    
    def __init__(self, supabase_url: str, supabase_key: str, jwt_secret: str):
        super().__init__(supabase_url, supabase_key)
        self.jwt_secret = jwt_secret
    
    def _generate_token(self, uid: str) -> str:
        '''Generate JWT token'''
        payload = {
            'uid': uid,
            'exp': datetime.utcnow() + timedelta(days=7),  # Token expires in 7 days
            'iat': datetime.utcnow()
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm='HS256')
        return token
    
    def verify_token(self, token: str) -> dict:
        '''Verify JWT token'''
        try:
            payload = jwt.decode(token, self.jwt_secret, algorithms=['HS256'])
            
            # Verify user still exists
            result = self.supabase.table('user_profiles')\\
                .select('uid')\\
                .eq('uid', payload['uid'])\\
                .execute()
            
            if not result.data:
                return {'valid': False, 'error': 'User not found'}
            
            return {'valid': True, 'uid': payload['uid']}
            
        except jwt.ExpiredSignatureError:
            return {'valid': False, 'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return {'valid': False, 'error': 'Invalid token'}
        except Exception as e:
            print(f"[ERROR] Token verification failed: {e}")
            return {'valid': False, 'error': 'Token verification failed'}


# Usage with JWT:
auth = AuthHandlerJWT(
    supabase_url=os.getenv('SUPABASE_URL'),
    supabase_key=os.getenv('SUPABASE_SERVICE_ROLE_KEY'),
    jwt_secret=os.getenv('JWT_SECRET')  # Add to .env
)
"""
