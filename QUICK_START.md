# Quick Start - 5 Minutes

## TL;DR - Fastest Way to Get Running

### 1. Get Supabase Credentials (2 min)

Go to [supabase.com](https://supabase.com):
- Sign up → Create project → Wait for initialization
- Settings → API → Copy:
  - `Project URL` 
  - `anon public`
  - `service_role secret`

### 2. Create `.env.local` in project root

```env
NEXT_PUBLIC_SUPABASE_URL=<paste_project_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<paste_service_role>
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=ws://localhost:5000
```

### 3. Create `.env` in `backend/` folder

```env
FLASK_ENV=development
DEBUG=True
HOST=localhost
PORT=5000
SECRET_KEY=dev_secret_key_12345
NEXT_PUBLIC_SUPABASE_URL=<same_as_above>
SUPABASE_SERVICE_ROLE_KEY=<same_as_above>
CORS_ORIGINS=http://localhost:3000
```

### 4. Setup Database (1 min)

1. Go to Supabase → SQL Editor → New Query
2. Copy entire contents of `scripts/001_create_dsa_tables.sql`
3. Paste and execute
4. Done!

### 5. Start Everything (2 min)

**Terminal 1 - Frontend:**
```bash
npm install
npm run dev
```
→ Opens at `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or: venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py
```
→ Runs at `http://localhost:5000`

## You're Done! 🎉

- Visit `http://localhost:3000`
- Go to `/learn` to see problems (empty for now)
- Go to `/code` for blank practice IDE

## Next: Add Sample Problems

Go to Supabase → Table Editor → `problems` → Insert row:

```
title: Two Sum
description: Find two numbers that add up to target
difficulty: Easy
category: Array
examples: Input: [2,7,11,15], target=9 → Output: [0,1]
constraints: 2 <= nums.length <= 10^4
```

Then add test cases in the `test_cases` table, and hints in the `hints` table.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "Cannot GET /" | Frontend not running. Run `npm run dev` |
| "API connection failed" | Backend not running. Run `python main.py` in `backend/` |
| "No such table: problems" | Database not set up. Run SQL migration in Supabase |
| "Invalid Supabase key" | Check `.env.local` has correct values |

## Important Files

- Frontend env: `.env.local`
- Backend env: `backend/.env`
- DB Schema: `scripts/001_create_dsa_tables.sql`
- Full guide: `SETUP_GUIDE.md`

---

Need more help? See `SETUP_GUIDE.md` for detailed instructions.
