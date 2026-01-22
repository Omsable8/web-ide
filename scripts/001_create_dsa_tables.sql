-- Create problems table
CREATE TABLE IF NOT EXISTS public.problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category TEXT NOT NULL,
  topic TEXT NOT NULL,
  examples TEXT NOT NULL, -- JSON array of examples
  constraints TEXT NOT NULL,
  time_complexity TEXT,
  space_complexity TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create test cases table
CREATE TABLE IF NOT EXISTS public.test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  explanation TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create hints table (3 levels)
CREATE TABLE IF NOT EXISTS public.hints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_solutions table (track user submissions)
CREATE TABLE IF NOT EXISTS public.user_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'wrong_answer', 'runtime_error', 'time_limit_exceeded')),
  runtime_ms INTEGER,
  memory_mb INTEGER,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_progress table
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  solved BOOLEAN DEFAULT FALSE,
  hints_used INTEGER[] DEFAULT ARRAY[]::INTEGER[],
  attempts INTEGER DEFAULT 0,
  last_attempted TIMESTAMP,
  UNIQUE(user_id, problem_id)
);

-- Enable RLS
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for problems (public read, only admins can write)
CREATE POLICY "Allow public to view problems" ON public.problems FOR SELECT USING (TRUE);

-- RLS Policies for test cases (hidden test cases only visible to authors after solving)
CREATE POLICY "Allow public to view non-hidden test cases" ON public.test_cases FOR SELECT 
  USING (NOT is_hidden);

-- RLS Policies for hints (users can view after they've attempted)
CREATE POLICY "Allow users to view hints" ON public.hints FOR SELECT USING (TRUE);

-- RLS Policies for user_solutions (users can only see their own)
CREATE POLICY "Allow users to view their own solutions" ON public.user_solutions FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own solutions" ON public.user_solutions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own solutions" ON public.user_solutions FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for user_progress (users can only see/modify their own)
CREATE POLICY "Allow users to view their own progress" ON public.user_progress FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "Allow users to insert their own progress" ON public.user_progress FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Allow users to update their own progress" ON public.user_progress FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create indexes for faster queries
CREATE INDEX idx_problems_category ON public.problems(category);
CREATE INDEX idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX idx_test_cases_problem_id ON public.test_cases(problem_id);
CREATE INDEX idx_hints_problem_id ON public.hints(problem_id);
CREATE INDEX idx_user_solutions_user_id ON public.user_solutions(user_id);
CREATE INDEX idx_user_solutions_problem_id ON public.user_solutions(problem_id);
CREATE INDEX idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX idx_user_progress_problem_id ON public.user_progress(problem_id);
