-- ============================================================================
-- 1. USER PROFILES (AUTH)
-- ============================================================================

CREATE TABLE public.user_profiles (
  uid UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  cohort TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);


-- ============================================================================
-- 2. CODE SUBMISSIONS
-- ============================================================================

CREATE TABLE public.user_code_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES user_profiles(uid) ON DELETE CASCADE,
  pid UUID NOT NULL,
  
  code TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'python',
  
  error TEXT,  -- 'none', 'TLE', 'MLE', 'syntax', 'semantic', 'runtime'
  num_pass_tc INTEGER DEFAULT 0,
  num_fail_tc INTEGER DEFAULT 0,
  
  btn TEXT NOT NULL,  -- 'run', 'test', 'submit'
  
  passed_tc JSONB,
  failed_tc JSONB,
  
  runtime_ms INTEGER,
  memory_mb REAL,
  
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT user_code_submissions_btn_check CHECK (btn IN ('run', 'test', 'submit'))
);

CREATE INDEX idx_submissions_uid ON public.user_code_submissions(uid);
CREATE INDEX idx_submissions_pid ON public.user_code_submissions(pid);
CREATE INDEX idx_submissions_btn ON public.user_code_submissions(btn);
CREATE INDEX idx_submissions_timestamp ON public.user_code_submissions(submitted_at);


-- ============================================================================
-- 3. AI CHAT SESSIONS (NEW - Session container)
-- ============================================================================

CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES user_profiles(uid) ON DELETE CASCADE,
  pid UUID NOT NULL,
  
  -- Session metadata
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  
  -- Optional: Context at session start
  code_context TEXT,
  error_context TEXT
);

CREATE INDEX idx_ai_sessions_uid ON public.ai_chat_sessions(uid);
CREATE INDEX idx_ai_sessions_pid ON public.ai_chat_sessions(pid);
CREATE INDEX idx_ai_sessions_started ON public.ai_chat_sessions(started_at);


-- ============================================================================
-- 4. AI CHAT MESSAGES (NEW - Individual messages)
-- ============================================================================

CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
  
  -- Message details
  role TEXT NOT NULL,  -- 'user' or 'assistant'
  content TEXT NOT NULL,
  
  -- Optional: Code snapshot when message was sent
  code_snapshot TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT ai_chat_messages_role_check CHECK (role IN ('user', 'assistant'))
);

CREATE INDEX idx_ai_messages_session ON public.ai_chat_messages(session_id);
CREATE INDEX idx_ai_messages_created ON public.ai_chat_messages(created_at);
CREATE INDEX idx_ai_messages_role ON public.ai_chat_messages(role);


-- ============================================================================
-- 5. FEATURE USAGE
-- ============================================================================

CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES user_profiles(uid) ON DELETE CASCADE,
  pid UUID NOT NULL,
  
  hints INTEGER DEFAULT 0,
  debug_btn INTEGER DEFAULT 0,
  performance_analyzer INTEGER DEFAULT 0,
  ai_used INTEGER DEFAULT 0,
  
  custom_tc INTEGER DEFAULT 0,
  dev_preferences JSONB,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_feature_usage_uid ON public.feature_usage(uid);
CREATE INDEX idx_feature_usage_pid ON public.feature_usage(pid);
CREATE UNIQUE INDEX idx_feature_usage_uid_pid ON public.feature_usage(uid, pid);


-- ============================================================================
-- 6. USER PROGRESS (AUTO-UPDATED)
-- ============================================================================

CREATE TABLE public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID NOT NULL REFERENCES user_profiles(uid) ON DELETE CASCADE,
  pid UUID NOT NULL,
  
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  run_count INTEGER DEFAULT 0,
  test_count INTEGER DEFAULT 0,
  
  first_attempted TIMESTAMPTZ,
  last_attempted TIMESTAMPTZ,
  solved_at TIMESTAMPTZ,
  
  UNIQUE(uid, pid)
);

CREATE INDEX idx_user_progress_uid ON public.user_progress(uid);
CREATE INDEX idx_user_progress_pid ON public.user_progress(pid);


-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update user_progress on submission
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_progress (uid, pid, attempts, run_count, test_count, first_attempted, last_attempted, solved, solved_at)
  VALUES (
    NEW.uid, NEW.pid,
    CASE WHEN NEW.btn = 'submit' THEN 1 ELSE 0 END,
    CASE WHEN NEW.btn = 'run' THEN 1 ELSE 0 END,
    CASE WHEN NEW.btn = 'test' THEN 1 ELSE 0 END,
    NEW.submitted_at, NEW.submitted_at,
    CASE WHEN NEW.btn = 'submit' AND NEW.error = 'none' AND NEW.num_fail_tc = 0 THEN TRUE ELSE FALSE END,
    CASE WHEN NEW.btn = 'submit' AND NEW.error = 'none' AND NEW.num_fail_tc = 0 THEN NEW.submitted_at ELSE NULL END
  )
  ON CONFLICT (uid, pid) DO UPDATE SET
    attempts = user_progress.attempts + CASE WHEN NEW.btn = 'submit' THEN 1 ELSE 0 END,
    run_count = user_progress.run_count + CASE WHEN NEW.btn = 'run' THEN 1 ELSE 0 END,
    test_count = user_progress.test_count + CASE WHEN NEW.btn = 'test' THEN 1 ELSE 0 END,
    last_attempted = NEW.submitted_at,
    solved = CASE WHEN NEW.btn = 'submit' AND NEW.error = 'none' AND NEW.num_fail_tc = 0 THEN TRUE ELSE user_progress.solved END,
    solved_at = CASE WHEN NEW.btn = 'submit' AND NEW.error = 'none' AND NEW.num_fail_tc = 0 AND user_progress.solved_at IS NULL THEN NEW.submitted_at ELSE user_progress.solved_at END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_code_submission
  AFTER INSERT ON user_code_submissions
  FOR EACH ROW EXECUTE FUNCTION update_user_progress();


-- Auto-update session metadata when message added
CREATE OR REPLACE FUNCTION update_chat_session()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ai_chat_sessions
  SET 
    last_message_at = NEW.created_at,
    message_count = message_count + 1
  WHERE id = NEW.session_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_chat_message
  AFTER INSERT ON ai_chat_messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_session();


-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW user_engagement AS
SELECT 
  up.uid, u.name, u.cohort,
  COUNT(DISTINCT up.pid) as problems_attempted,
  SUM(CASE WHEN up.solved THEN 1 ELSE 0 END) as problems_solved,
  SUM(up.attempts) as total_submissions,
  SUM(up.run_count) as total_runs,
  SUM(up.test_count) as total_tests
FROM user_progress up
JOIN user_profiles u ON up.uid = u.uid
GROUP BY up.uid, u.name, u.cohort;


CREATE VIEW feature_effectiveness AS
SELECT 
  f.pid,
  COUNT(*) as users_attempted,
  SUM(CASE WHEN f.hints > 0 THEN 1 ELSE 0 END) as used_hints,
  SUM(CASE WHEN f.debug_btn > 0 THEN 1 ELSE 0 END) as used_debugger,
  SUM(CASE WHEN f.performance_analyzer > 0 THEN 1 ELSE 0 END) as used_analyzer,
  SUM(CASE WHEN f.ai_used > 0 THEN 1 ELSE 0 END) as used_ai,
  SUM(CASE WHEN up.solved THEN 1 ELSE 0 END) as solved_count
FROM feature_usage f
LEFT JOIN user_progress up ON f.uid = up.uid AND f.pid = up.pid
GROUP BY f.pid;


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_code_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own data" ON user_profiles FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Users view own submissions" ON user_code_submissions FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Users insert own submissions" ON user_code_submissions FOR INSERT WITH CHECK (uid = auth.uid());
CREATE POLICY "Users view own chat sessions" ON ai_chat_sessions FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Users manage own chat sessions" ON ai_chat_sessions FOR ALL USING (uid = auth.uid());
CREATE POLICY "Users view own messages" ON ai_chat_messages FOR SELECT 
  USING (session_id IN (SELECT id FROM ai_chat_sessions WHERE uid = auth.uid()));
CREATE POLICY "Users insert own messages" ON ai_chat_messages FOR INSERT 
  WITH CHECK (session_id IN (SELECT id FROM ai_chat_sessions WHERE uid = auth.uid()));
CREATE POLICY "Users view own features" ON feature_usage FOR SELECT USING (uid = auth.uid());
CREATE POLICY "Users update own features" ON feature_usage FOR ALL USING (uid = auth.uid());


-- ============================================================================
-- EXAMPLE QUERIES
-- ============================================================================

/*
-- Get all messages in a chat session (chronological order)
SELECT role, content, created_at 
FROM ai_chat_messages 
WHERE session_id = 'session-uuid'
ORDER BY created_at ASC;

-- Get user's chat history for a problem
SELECT 
  s.id as session_id,
  s.started_at,
  COUNT(m.id) as message_count
FROM ai_chat_sessions s
LEFT JOIN ai_chat_messages m ON s.id = m.session_id
WHERE s.uid = 'user-uuid' AND s.pid = 'problem-uuid'
GROUP BY s.id, s.started_at
ORDER BY s.started_at DESC;

-- Search for messages containing specific text
SELECT m.*, s.uid, s.pid
FROM ai_chat_messages m
JOIN ai_chat_sessions s ON m.session_id = s.id
WHERE m.content ILIKE '%hashmap%'
ORDER BY m.created_at DESC;

-- Get average conversation length
SELECT 
  AVG(message_count) as avg_messages_per_session
FROM ai_chat_sessions;

-- Find sessions that led to solving the problem
SELECT 
  s.*,
  up.solved,
  up.solved_at
FROM ai_chat_sessions s
JOIN user_progress up ON s.uid = up.uid AND s.pid = up.pid
WHERE up.solved = TRUE
  AND up.solved_at > s.started_at
  AND up.solved_at < s.started_at + INTERVAL '1 hour';
*/
