# DSA Platform - Local Setup Guide

This guide walks you through setting up and running the DSA platform locally with all integrations.

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Git
- Supabase account (free tier available)
- OpenAI API key (for AI complexity analysis)
- SSH access to a remote server (optional, for code execution)

---

## Part 1: Supabase Configuration

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project (choose your region)
3. Wait for the project to initialize (2-3 minutes)

### Step 2: Get Your API Keys

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role secret` → `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Setup Database Tables

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `scripts/001_create_dsa_tables.sql`
4. Paste and execute
5. The database schema is now ready!

---

## Part 2: Frontend Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Flask Backend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000

# SSH Configuration (optional, for remote code execution)
SSH_HOSTNAME=192.168.0.104
SSH_USERNAME=thunder
SSH_PASSWORD=your_password_here
SSH_PORT=22
```

### Step 3: Run the Frontend

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

---

## Part 3: Backend Setup

### Step 1: Navigate to Backend

```bash
cd backend
```

### Step 2: Create Virtual Environment

```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Flask Configuration
FLASK_ENV=development
DEBUG=True
HOST=localhost
PORT=5000
SECRET_KEY=your_secret_key_here

# Supabase (for database access)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SSH Configuration (for remote code execution)
SSH_HOSTNAME=192.168.0.104
SSH_USERNAME=thunder
SSH_PASSWORD=your_password_here
SSH_PORT=22

# AI Configuration
AI_MODEL=openai/gpt-oss-20b:free
OPENAI_API_KEY=your_openai_key_here

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Step 5: Run the Backend

```bash
python main.py
```

The backend will be available at `http://localhost:5000`

---

## Part 4: SSH Setup (Optional - For Remote Code Execution)

If you want to execute code on a remote server:

### Prerequisites

- SSH access to a remote Ubuntu server
- Python, C++ compiler (g++), and Java compiler (javac) installed on the remote server

### Setup

1. Update `.env` in both frontend and backend with your SSH credentials
2. The SSH connection will be established when users click "Connect" in the IDE
3. Code execution happens on the remote server, not locally

### Testing SSH Connection

From the frontend, go to the IDE page and:
1. Click the **Connect** button in the terminal section
2. You should see a green WiFi icon indicating successful connection
3. Try running code to verify execution works

---

## Part 5: Adding Sample DSA Problems

### Option A: Add via Supabase Dashboard (Manual)

1. Go to Supabase → **Table Editor**
2. Click on the `problems` table
3. Click **Insert row** and add:
   - `title`: "Two Sum"
   - `description`: "Find two numbers that add up to target..."
   - `difficulty`: "Easy"
   - `category`: "Array"
   - `examples`: "Input: [2,7,11,15], target=9\nOutput: [0,1]"
   - `constraints`: "2 <= nums.length <= 10^4"

4. Do the same for `test_cases` table:
   - `problem_id`: ID of the problem you created
   - `input`: "2 7 11 15 9"
   - `expected_output`: "0 1"
   - `is_example`: true

5. Add hints in the `hints` table:
   - Level 1: "Think about using a hash map to store seen numbers"
   - Level 2: "Use a two-pointer approach or hash map for O(n) solution"
   - Level 3: "```python\nfor i, num in enumerate(nums):\n    complement = target - num\n    if complement in seen:\n        return [seen[complement], i]\n    seen[num] = i\n```"

### Option B: Use Python Script (Automated)

Create `backend/seed_problems.py`:

```python
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase_url = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
supabase_key = os.getenv('SUPABASE_SERVICE_ROLE_KEY')
supabase = create_client(supabase_url, supabase_key)

problems = [
    {
        "title": "Two Sum",
        "description": "Given an array of integers nums and an integer target...",
        "difficulty": "Easy",
        "category": "Array",
        "examples": "...",
        "constraints": "..."
    }
]

for problem in problems:
    supabase.table('problems').insert(problem).execute()
    print(f"Added: {problem['title']}")
```

Run: `python backend/seed_problems.py`

---

## Part 6: Testing Locally

### Test 1: Frontend Routes

Visit these URLs in your browser:

- `http://localhost:3000/` - Home dashboard
- `http://localhost:3000/code` - Blank practice IDE
- `http://localhost:3000/learn` - Problem list
- `http://localhost:3000/compete` - Compete section

### Test 2: Backend Endpoints

Use cURL or Postman to test:

```bash
# Health check
curl http://localhost:5000/api/health

# Get all problems
curl http://localhost:5000/api/problems

# Get specific problem
curl http://localhost:5000/api/problems/1

# Get test cases
curl http://localhost:5000/api/problems/1/test-cases

# Get hints (level 1)
curl http://localhost:5000/api/problems/1/hints/1

# Run tests
curl -X POST http://localhost:5000/api/problems/1/run-tests \
  -H "Content-Type: application/json" \
  -d '{"code":"print(1)","language":"python"}'

# Analyze complexity
curl -X POST http://localhost:5000/api/code/complexity \
  -H "Content-Type: application/json" \
  -d '{"code":"def foo(n):\n  for i in range(n):\n    print(i)","language":"python"}'
```

### Test 3: End-to-End Flow

1. Open `http://localhost:3000/learn`
2. Click on a problem
3. Click "Conceptual Help" button → should fetch Level 1 hints
4. Write code in the editor
5. Click "Run Tests" → should execute code and show results
6. Click "Analyze Complexity" → should show time/space complexity

### Test 4: Connect SSH (if configured)

1. Go to `http://localhost:3000/code`
2. Click "Connect" button in terminal
3. Should see "Connected ✓"
4. Try running code

---

## Troubleshooting

### Issue: "Supabase connection failed"

**Solution:**
- Check `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are correct
- Ensure Supabase project is active
- Check internet connection

### Issue: "Backend not responding"

**Solution:**
- Ensure Flask is running: `python backend/main.py`
- Check `NEXT_PUBLIC_API_URL` is `http://localhost:5000`
- Check CORS is enabled in Flask (should be by default)

### Issue: "SSH connection failed"

**Solution:**
- Verify SSH credentials are correct
- Ensure remote server is reachable
- Check firewall allows SSH (port 22 by default)
- Test SSH manually: `ssh thunder@192.168.0.104`

### Issue: "Code execution timeout"

**Solution:**
- Check remote server has compilers installed
- For Python: `python3 --version`
- For C++: `g++ --version`
- For Java: `javac -version`
- Check network latency to remote server

---

## Development Tips

### Hot Reload

- Frontend: Changes automatically reload (thanks to Next.js)
- Backend: Install `python-dotenv` reload manually

### Debugging

- Frontend: Use browser DevTools (F12)
- Backend: Check console output from `python main.py`
- Database: Use Supabase dashboard to inspect tables

### Common Ports

- Frontend: `3000`
- Backend: `5000`
- Supabase: Uses HTTPS (no local port needed)

---

## Next Steps

1. Add more DSA problems to the database
2. Implement user authentication
3. Add solution comparison
4. Create problem recommendations
5. Build leaderboards for competitive section

Happy coding!
