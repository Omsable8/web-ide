import os
from dotenv import load_dotenv
from datetime import timedelta
# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the Flask application"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    DBPORT = int(os.getenv('DBPORT', 5000))
    EXEPORT = int(os.getenv('EXEPORT', 5001))
    AIPORT = int(os.getenv('AIPORT', 5002))
    DEBUGPORT = int(os.getenv('DEBUGPORT', 5003))
    
    # JWT CONFIG
    JWT_SECRET_KEY = "change-this-to-a-secure-key"
    JWT_TOKEN_LOCATION = ["cookies"]

    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=5)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(minutes=10)
    JWT_COOKIE_SECURE = False    
    JWT_COOKIE_SAMESITE = 'Lax'
    JWT_COOKIE_CSRF_PROTECT = True
    JWT_CSRF_IN_COOKIES = True
    # JWT_ACCESS_COOKIE_PATH = "/"

    # AWS RDS Connection
    # Ensure your .env has: DATABASE_URL=postgresql://user:pass@host:5432/dbname
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    # AI settings
    AI_MODEL = os.getenv('AI_MODEL', 'openai/gpt-4o-mini')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        if not Config.OPENAI_API_KEY:
            print("WARNING: OPENAI_API_KEY not set in environment variables")
        print("[INFO] Configuration loaded successfully")
