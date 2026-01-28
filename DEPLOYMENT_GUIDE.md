# Deployment Guide - WebIDELearn2 Enhanced Learning Interface

## Overview

This guide walks through deploying the enhanced learning interface with structured test cases, AI chatbot integration, performance analysis, and developer preferences.

## Prerequisites

- Supabase project set up and running
- Next.js application deployed or ready to deploy
- Python Flask backend running on `http://localhost:5000` (for local development)
- Git repository connected (optional but recommended)

## Step 1: Database Migration

### Execute SQL Scripts in Order

1. **Open Supabase SQL Editor**
   - Go to your Supabase project → SQL Editor
   - Create a new query for each script

2. **Run Script 002** (if not already created):
   ```
   Copy content from: /scripts/002_create_code_templates.sql
   Click "Run"
   ```
   - Creates the `code_templates` table
   - Sets up RLS policies
   - Creates indexes

3. **Run Script 004**:
   ```
   Copy content from: /scripts/004_update_test_cases_schema.sql
   Click "Run"
   ```
   - Adds `input_params` JSONB column to `test_cases`
   - Creates GIN index for performance
   - No data loss - existing rows unaffected

4. **Run Script 003**:
   ```
   Copy content from: /scripts/003_insert_sample_templates.sql
   Click "Run"
   ```
   - Inserts Two Sum sample problem
   - Creates templates for Python, C++, Java
   - Inserts test cases with structured parameters

### Verify Migration Success

Run verification queries in Supabase SQL Editor:

```sql
-- Check if code_templates table exists and has data
SELECT COUNT(*) as template_count FROM code_templates;

-- Check if test_cases has input_params column
SELECT COUNT(*) as test_count FROM test_cases WHERE input_params IS NOT NULL;

-- View sample Two Sum problem
SELECT id, title, difficulty FROM problems WHERE title = 'Two Sum';

-- View its test cases
SELECT input_params, expected_output FROM test_cases 
WHERE problem_id = (SELECT id FROM problems WHERE title = 'Two Sum' LIMIT 1)
LIMIT 2;
```

Expected results:
- `template_count`: 3 (Python, C++, Java)
- `test_count`: Should be > 0
- Problem should exist with "Easy" difficulty
- Test cases should show input_params JSON

## Step 2: Frontend Deployment

### Files to Deploy

The following new/updated files need to be deployed:

**New Components:**
```
/components/structured-test-cases.tsx
```

**Updated Components:**
```
/components/dev-preferences.tsx
/components/ai-chatbot.tsx
/components/performance-analyzer.tsx
/components/monaco-editor-instance.tsx
```

**Updated Pages:**
```
/app/learn/[id]/page.tsx
```

**Updated Utilities:**
```
/lib/api.ts
```

### Local Development Testing

1. **Clone/Pull Latest Code**
   ```bash
   git pull origin main
   ```

2. **Install Dependencies** (if new packages added)
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # App runs on http://localhost:3000
   ```

4. **Ensure Flask Backend is Running**
   ```bash
   # In a separate terminal, from backend directory
   python main.py
   # Should print: Running on http://localhost:5000
   ```

### Test in Browser

1. Navigate to `http://localhost:3000/learn`
2. Click on any problem (or "Two Sum" if available)
3. You should see the new interface:
   - Left panel with Description and Test Cases tabs
   - Center panel with Monaco editor
   - Headers with Run Tests, Complexity, Settings, AI Hints buttons

## Step 3: Feature Testing Checklist

### Test Case Interface

- [ ] Click "Test Cases" tab in left panel
- [ ] See "Case 1", "Case 2" tabs at the top
- [ ] Click each case tab and see different input values
- [ ] Verify "Testcase" and "Test Result" tabs at the top
- [ ] Click "+" to add custom test case
- [ ] Enter values in custom test case input fields
- [ ] Click trash icon to delete custom test case
- [ ] Verify predefined cases are read-only
- [ ] Verify custom cases are editable

### Code Execution

- [ ] Write code in Monaco editor
- [ ] Click "Run Tests" button
- [ ] Wait for execution
- [ ] Switch to "Test Result" tab
- [ ] See pass/fail results with color coding
- [ ] Verify failing tests show expected vs actual

### Complexity Analysis

- [ ] Click "Complexity" button in header
- [ ] Wait for analysis
- [ ] See right panel with complexity metrics
- [ ] Check Time Complexity and Space Complexity displayed
- [ ] See visual bar representation
- [ ] Verify analysis updates when code changes

### Hints System

- [ ] Click Hint 1, 2, 3 in Description tab
- [ ] See hint content appear with ChevronUp/Down icon
- [ ] Verify different hint levels have different content

### AI Chatbot

- [ ] Click "AI Hints" button in header
- [ ] See chatbot panel open on right side
- [ ] Type a message and press Enter
- [ ] See AI response appear with markdown rendering
- [ ] Write code and run tests
- [ ] See code context in chatbot
- [ ] Try different chat modes (dropdown)
- [ ] Switch AI models (dropdown)
- [ ] Click X to close chatbot panel

### Dev Preferences

- [ ] Click Settings icon in header
- [ ] Modal opens with three tabs
- [ ] Shortcuts tab: See keyboard shortcuts organized by category
- [ ] Language Syntax tab: Select Python/C++/Java, see syntax examples
- [ ] Complexity Cheatsheet tab: See tables with Big O notation
- [ ] Click X to close modal

### Editor Features

- [ ] Language selector works (Python, C++, Java)
- [ ] Run button executes code
- [ ] See code output in bottom panel
- [ ] Syntax highlighting works
- [ ] Line numbers visible
- [ ] Cursor position shown in status bar

### Responsive Design

- [ ] Resize browser window
- [ ] Panels maintain proper layout
- [ ] Drag dividers between panels
- [ ] Touch events work on mobile (if testing on mobile)
- [ ] No horizontal scrolling needed on small screens

## Step 4: Backend Integration

### API Endpoints to Verify

Test these endpoints in your backend to ensure they work with new schema:

1. **Get Test Cases with input_params**
   ```
   GET /api/problems/{problemId}/test-cases
   Response should include:
   {
     "test_cases": [
       {
         "id": "...",
         "input_params": [...],  // NEW: structured params
         "expected_output": "...",
         "is_hidden": false,
         "is_example": true
       }
     ]
   }
   ```

2. **Run Tests with Structured Input**
   ```
   POST /api/problems/{problemId}/run-tests
   Body:
   {
     "code": "...",
     "language": "python"
   }
   Response should include:
   {
     "results": [
       {
         "test_id": "...",
         "input_params": [...],
         "expected": "...",
         "actual": "...",
         "passed": boolean,
         "error": "..."  // if failed
       }
     ]
   }
   ```

3. **Get Code Template**
   ```
   GET /api/problems/{problemId}/template?language=python
   Response:
   {
     "template": {
       "id": "...",
       "template_code": "...",
       "input_params": [
         {"name": "nums", "type": "array"},
         {"name": "target", "type": "integer"}
       ],
       "return_type": "array"
     }
   }
   ```

4. **Analyze Complexity**
   ```
   POST /api/code/complexity
   Body: {"code": "...", "language": "python"}
   Response:
   {
     "success": true,
     "analysis": {
       "time_complexity": "O(n)",
       "space_complexity": "O(1)",
       "explanation": "..."
     }
   }
   ```

5. **AI Chat**
   ```
   POST /api/ai/chat
   Body: {"message": "...", "code": "...", "error": "..."}
   Response:
   {
     "success": true,
     "response": "..."
   }
   ```

## Step 5: Production Deployment

### For Vercel Deployment

1. **Push to Git**
   ```bash
   git add .
   git commit -m "feat: enhanced learning interface with structured tests and AI"
   git push origin main
   ```

2. **Vercel Auto-Deploys**
   - Vercel detects push
   - Builds and deploys automatically
   - Check deployment logs for errors

3. **Set Environment Variables in Vercel**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url
   ```

### For Self-Hosted/Docker

1. **Update Environment**
   ```bash
   export NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. **Build**
   ```bash
   npm run build
   ```

3. **Deploy**
   ```bash
   npm start
   ```

## Step 6: Monitoring & Debugging

### Check Browser Console for Errors

1. Open DevTools (F12)
2. Go to Console tab
3. Look for any red errors
4. Common issues:
   - API_BASE_URL not configured
   - CORS errors from backend
   - Missing environment variables

### Check Network Requests

1. In DevTools, go to Network tab
2. Reload page
3. Look for requests to API endpoints
4. Check response status and body
5. Verify input_params are being sent/received correctly

### Common Issues & Solutions

**Issue**: "Cannot read property 'input_params' of undefined"
- **Solution**: Ensure backend returns `input_params` in test cases

**Issue**: Test cases not showing properly
- **Solution**: Check database migration 004 ran successfully

**Issue**: AI Chatbot returns empty response
- **Solution**: Verify Flask backend is running and accessible

**Issue**: Complexity analysis fails
- **Solution**: Check backend can parse code and reach AI API

**Issue**: Monaco Editor not loading
- **Solution**: Ensure CDN link works (check Network tab)

## Step 7: Performance Optimization

### Database Indexes

Verify indexes are created:

```sql
SELECT * FROM pg_stat_user_indexes 
WHERE tablename IN ('code_templates', 'test_cases');
```

Should show:
- `idx_code_templates_problem_id`
- `idx_code_templates_language`
- `idx_test_cases_input_params` (GIN index)

### Caching Strategies

Consider caching:
- Code templates (rarely change)
- Problem descriptions (rarely change)
- Test cases (except custom ones)

### Load Testing

Test with multiple users:
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:3000/learn/problem-id
```

## Rollback Plan

If issues occur:

1. **Quick Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Vercel auto-redeploys with previous version
   ```

2. **Database Rollback**
   - Don't drop columns, just ignore them
   - Existing code continues to work with old schema
   - Create new table if needed

3. **Feature Flag**
   - Consider feature flags to enable/disable new UI
   - Allows gradual rollout to users

## Success Criteria

- All tests pass ✓
- No console errors ✓
- API responses include input_params ✓
- Test cases display with separate input fields ✓
- AI chatbot receives and processes context ✓
- Complexity analysis displays correctly ✓
- Developer preferences modal works ✓
- Resizable panels function smoothly ✓
- Mobile responsive design works ✓

## Support

If issues persist after deployment:

1. Check `/IMPLEMENTATION_SUMMARY.md` for architecture details
2. Review `/DATABASE_SCHEMA_GUIDE.md` for data structure
3. Check browser console for specific error messages
4. Verify all files were deployed correctly
5. Ensure backend API endpoints are properly updated
