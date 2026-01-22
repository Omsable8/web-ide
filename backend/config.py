import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    """Configuration class for the Flask application"""
    
    # Flask settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'True').lower() == 'true'
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 5000))
    
    # SSH settings
    SSH_HOSTNAME = os.getenv('SSH_HOSTNAME', '192.168.0.104')
    SSH_USERNAME = os.getenv('SSH_USERNAME', 'thunder')
    SSH_PASSWORD = os.getenv('SSH_PASSWORD', '')  # Set via environment variable
    SSH_PORT = int(os.getenv('SSH_PORT', 22))
    
    # AI settings
    AI_MODEL = os.getenv('AI_MODEL', 'gpt-4')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')
    
    # CORS settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000').split(',')
    
    @staticmethod
    def validate():
        """Validate required configuration"""
        if not Config.SSH_PASSWORD:
            print("WARNING: SSH_PASSWORD not set in environment variables")
        if not Config.OPENAI_API_KEY:
            print("WARNING: OPENAI_API_KEY not set in environment variables")
