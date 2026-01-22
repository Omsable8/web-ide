# CodeIDE Backend

Flask backend for the CodeIDE web application with SSH terminal and AI chatbot capabilities.

## Features

- **SSH Connection Manager**: Connect to remote Ubuntu servers and execute commands
- **Code Execution**: Run Python, C++, and Java code on remote servers
- **AI Chatbot**: Intelligent tutoring for competitive programming and DSA
- **Real-time Terminal**: WebSocket-based terminal for interactive shell access
- **RESTful API**: Clean API endpoints for all functionality

## Setup

### 1. Install Dependencies

\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your actual values:
- `SSH_PASSWORD`: Your SSH server password
- `OPENAI_API_KEY`: Your OpenAI API key (for AI chatbot)

### 3. Run the Server

\`\`\`bash
python main.py
\`\`\`

The server will start on `http://localhost:5000`

## API Endpoints

### SSH / Terminal

- `POST /api/ssh/connect` - Connect to SSH server
- `POST /api/ssh/disconnect` - Disconnect from SSH server
- `POST /api/ssh/execute` - Execute command on server
  \`\`\`json
  {"command": "ls -la"}
  \`\`\`

### Code Execution

- `POST /api/code/run` - Run code on remote server
  \`\`\`json
  {
    "code": "print('Hello World')",
    "language": "python"
  }
  \`\`\`

### AI Chatbot

- `POST /api/ai/chat` - Chat with AI assistant
  \`\`\`json
  {
    "message": "Why is my code giving a segmentation fault?",
    "code": "int main() { ... }",
    "error": "Segmentation fault (core dumped)"
  }
  \`\`\`

- `POST /api/ai/analyze` - Analyze code for issues
  \`\`\`json
  {
    "code": "your code here",
    "language": "cpp"
  }
  \`\`\`

- `POST /api/ai/explain-failure` - Explain test case failure
  \`\`\`json
  {
    "expected": "5",
    "actual": "6",
    "input": "2 3"
  }
  \`\`\`

- `POST /api/ai/clear` - Clear chat history

### Health Check

- `GET /api/health` - Check server status

## WebSocket Events

For real-time terminal interaction:

- **Client → Server**: `terminal_input` with `{command: "ls"}`
- **Server → Client**: `terminal_output` with `{output: "file1 file2"}`

## Architecture

\`\`\`
backend/
├── main.py           # Flask app and API routes
├── ssh_manager.py    # SSH connection and command execution
├── ai_chatbot.py     # AI chatbot logic and conversation management
├── config.py         # Configuration management
├── requirements.txt  # Python dependencies
└── .env             # Environment variables (create from .env.example)
\`\`\`

## Security Notes

- Never commit `.env` file with real credentials
- Use environment variables for all sensitive data
- SSH password should be stored securely
- Consider using SSH keys instead of passwords for production
