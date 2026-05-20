// ============================================================================
// User Analytics Dashboard - TypeScript Interfaces
// ============================================================================

export interface UserAnalyticsSummary {
  uid: string
  name: string
  email: string
  problems_attempted: number
  problems_solved: number
  total_submissions: number
  total_ai_messages: number
  success_rate: number
  created_at?: string
}

export interface TelemetryEvent {
  event_type: 'debug' | 'run' | 'submit' | 'hint' | 'complexity' | 'ai_chat'
  count: number
  last_triggered?: string
}

export interface AIChatLog {
  id: string
  problem_id: string
  problem_title: string
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  session_start: string
}

export interface CodeSubmissionItem {
  id: string
  problem_id: string
  problem_title: string
  language: string
  code: string
  status: 'pass' | 'fail' | 'error'
  passed_tests: number
  total_tests: number
  timestamp: string
}

export interface StudentDetailedProfile {
  user: UserAnalyticsSummary
  difficulty_breakdown: {
    easy: { attempted: number; solved: number }
    medium: { attempted: number; solved: number }
    hard: { attempted: number; solved: number }
  }
  feature_usage: {
    debugger_activations: number
    code_runs: number
    code_submissions: number
    hints_used: number // 0-3 density
    complexity_analysis: number
  }
  ai_chat_logs: AIChatLog[]
  submission_history: CodeSubmissionItem[]
}

export interface PlatformStats {
  total_students: number
  total_submissions: number
  total_ai_messages: number
  global_success_rate: number
}

export interface DifficultyVelocityData {
  difficulty: string
  attempted: number
  solved: number
}

export interface AIAssistanceData {
  problem_title: string
  avg_ai_messages: number
}
