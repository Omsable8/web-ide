# Backend Setup & Configuration

## Overview

The backend is a Flask server that handles:
- **Code execution** (Python, C++, C, Java via subprocess)
- **AI-powered assistance** (chat, code analysis, complexity analysis)
- **DSA problem management** (via Supabase)

## Key Changes: Local Code Execution

This backend has been refactored to execute code **directly on the current machine** using Python's `subprocess` module. This means:

✅ **Local development**: Code runs on your laptop
✅ **Cloud deployment**: Code runs on the cloud instance (EC2, etc.)
✅ **No SSH dependency**: No need for separate server SSH access
✅ **Same behavior everywhere**: Development and production environments are identical

## Execution Limits

To prevent abuse and resource exhaustion:

| Limit | Value |
|-------|-------|
| **Timeout** | 10 seconds per execution |
| **Max Output** | 1MB per execution |
| **Memory** | System default (no hard cap) |
| **Temp Files** | Auto-cleaned from `/tmp/` |

**What happens if limits are exceeded:**
- Timeout: Code is killed, returns error "Execution timeout (>10s)"
- Output overflow: Output is truncated at 1MB with a notice
- Compiler not found: Clear error message with installation instructions

## Requirements

### System Dependencies

Ensure these are installed on the machine where the backend runs:

```bash
# Python 3.9+
python3 --version

# C++ compiler (for g++)
g++ --version

# C compiler (for gcc)
gcc --version

# Java compiler (for javac)
javac -version

# Python pip
pip3 --version
```

**Install missing dependencies:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install python3 python3-pip build-essential default-jdk

# macOS
brew install python3 gcc openjdk

# Windows
# Download from official sites or use package managers like chocolatey
```

### Python Dependencies

```bash
pip install -r requirements.txt
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Flask Configuration
FLASK_ENV=development
DEBUG=True
HOST=0.0.0.0
PORT=5000
SECRET_KEY=your_secret_key_here

# Supabase (for database access)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# AI Configuration
AI_MODEL=gpt-4
OPENAI_API_KEY=your_openai_key_here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## Running the Backend

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

Server will start at `http://localhost:5000`

## API Endpoints

### Code Execution

**POST** `/api/code/run`
```json
{
  "code": "print('Hello')",
  "language": "python",
  "input": "optional stdin input"
}
```

**Response:**
```json
{
  "success": true,
  "output": "Hello\n",
  "error": null,
  "exit_code": 0
}
```

### Test Running

**POST** `/api/problems/<problem_id>/run-tests`
```json
{
  "code": "def twoSum(nums, target): ...",
  "language": "python"
}
```

Automatically runs against all test cases in the database.

### AI Endpoints

- **POST** `/api/ai/chat` - Chat with AI assistant
- **POST** `/api/ai/analyze` - Analyze code for issues
- **POST** `/api/code/complexity` - Analyze time/space complexity
- **POST** `/api/ai/explain-failure` - Explain test failure

### Health Check

**GET** `/api/health`
```json
{
  "status": "healthy",
  "ai_ready": true,
  "code_execution": "local"
}
```

## Supported Languages

| Language | Extension | Compiler | Status |
|----------|-----------|----------|--------|
| Python | `.py` | python3 | ✅ Fully supported |
| C++ | `.cpp` | g++ | ✅ Fully supported |
| C | `.c` | gcc | ✅ Fully supported |
| Java | `.java` | javac | ✅ Fully supported |

## Troubleshooting

### "Compiler not found" Error

If you get an error like `Compiler not found: g++`:

1. **Check if installed:**
   ```bash
   g++ --version  # or gcc, python3, javac
   ```

2. **Install missing compiler:**
   - **Ubuntu**: `sudo apt-get install build-essential default-jdk`
   - **macOS**: `brew install gcc openjdk`
   - **Windows**: Download from official websites

3. **Update PATH** (if needed):
   - Ensure the compiler directory is in your system PATH

### "Execution timeout" Error

Code took longer than 10 seconds. Possible causes:
- Infinite loop in user code
- Very large input processing
- Inefficient algorithm

### "Output truncated" Notice

User code produced more than 1MB of output. This is intentional to prevent memory issues.

### Supabase Connection Errors

Ensure environment variables are set correctly:
```bash
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

## Architecture

```
main.py
  ├── /api/code/run → CodeExecutor.execute()
  ├── /api/problems/*/run-tests → CodeExecutor.execute() (for each test case)
  ├── /api/ai/* → AIChatbot
  └── /api/problems/* → Supabase queries
```

**CodeExecutor** (`code_executor.py`):
1. Creates temp file in `/tmp/`
2. Compiles (if needed)
3. Runs with timeout
4. Captures output
5. Cleans up temp files

This approach works identically whether running locally or on a cloud server.

## Migration from SSH

**Old flow:**
```
Frontend → Backend → SSH → Remote Server
```

**New flow:**
```
Frontend → Backend (executes directly)
```

Benefits:
- Simpler deployment (no SSH setup needed)
- Faster execution (no network overhead)
- Same codebase for dev and production
- Easier debugging (code runs locally)

## Notes for Cloud Deployment

When deploying to EC2 or Ubuntu server:

1. **Install dependencies first:**
   ```bash
   sudo apt-get update
   sudo apt-get install python3 python3-pip build-essential default-jdk
   ```

2. **Set environment variables** in `.env` or as system env vars

3. **No SSH config needed** anymore (remove SSH variables from config if present)

4. **Use supervisord/systemd** for process management:
   ```bash
   # Example systemd service
   [Unit]
   Description=CodeIDE Backend
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/web-ide-with-ai/backend
   ExecStart=/usr/bin/python3 main.py
   Restart=always

   [Install]
   WantedBy=multi-user.target
   ```

---

**Questions?** Check `/api/health` for status or review `main.py` for implementation details.