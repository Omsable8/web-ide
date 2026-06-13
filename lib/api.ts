const API_BASE_DB_URL = process.env.NEXT_PUBLIC_API_DB_URL || "http://192.168.0.107:5000"
const API_BASE_EXE_URL = process.env.NEXT_PUBLIC_API_EXE_URL || "http://192.168.0.107:5001"
const API_BASE_AI_URL = process.env.NEXT_PUBLIC_API_AI_URL || "http://192.168.0.107:5002"

// Helper function to read a specific cookie value by name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export async function AuthenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  // Ensure init object exists
  const options: RequestInit = init || {};

  // 1. Force browser to include access/refresh cookies automatically
  options.credentials = 'include';
  // 2. Extract the CSRF token from the browser cookie
  const csrfToken = getCookie('csrf_access_token');
  // 3. Inject CSRF header for mutating state methods (POST, PUT, DELETE, PATCH)
  const method = (options.method || 'GET').toUpperCase();
  if (csrfToken && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    options.headers = {
      ...options.headers,
      'X-CSRF-TOKEN': csrfToken,
    };
  }
  // 4. Execute the fetch
  let response = await fetch(input, options);
  // 5. Automatic Silent Refresh: If token expired (401), try to refresh it once
  if (response.status === 401) {
    const refreshResponse = await fetch(`/token/refresh`, { credentials: 'include' });
    
    if (refreshResponse.ok) {
      // Retry the original request exactly as it was
      response = await fetch(input, options);
    } else {
      // Refresh token also failed or expired -> Redirect user to login page
      console.warn("Session expired. Redirecting to login.");
      window.location.href = '/login';
    }
  }
  return response;
}

export interface ExecuteCodeRequest {
  code: string
  language: string
  input?: string
}

export interface ExecuteCodeResponse {
  success: boolean
  output?: string
  error?: string
  exit_code?: number
}

export interface ChatRequest {
  pid:string
  message: string
  code?: string
  error?: string
}

export interface ChatResponse {
  success: boolean
  response: string
  history?: Array<{ role: string; content: string }>
}

// ============================================================================
// Code Templates
// ============================================================================

export interface CodeTemplate {
  id: string
  problem_id: string
  language: string
  template_code: string
  driver_code?: string
  solution_code?: string
  function_name: string
  input_params: Array<{
    name: string
    type: string
  }> | string
  return_type: string
}

export interface InputParam {
  name: string
  type: string
  value?: any
}

export interface TestCase {
  id: string
  problem_id: string
  input_params: InputParam[]
  is_hidden?: boolean
  explanation?: string
  created_at?: string
}

export interface CustomTestCase {
  input_params: InputParam[]
}

export interface TestResult {
  test_id: string
  input_params: InputParam[]
  expected: string
  actual: string
  passed: boolean
  error?: string
  is_hidden: boolean
}

export async function getTemplate(
  problemId: string,
  language: string
): Promise<{ success: boolean; template?: CodeTemplate; error?: string }> {
  try {
    const response = await AuthenticatedFetch(
      `/api/problems/${problemId}/template?language=${language}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
    return await response.json()
  } catch (error) {
    console.error("[API] Get template error:", error)
    return { success: false, error: String(error) }
  }
}

export async function getTestCases(
  problemId: string
): Promise<{ success: boolean; public_test_cases?: any[]; private_test_cases?: any[]; error?: string }> {
  try {
    const response = await AuthenticatedFetch(
      `/api/problems/${problemId}/test-cases`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    )
    const data = await response.json()
    
    // Flatten nested test cases structure
    if (data.success) {
      const flatPublicTests = []
      const flatPrivateTests = []
      
      // Flatten public test cases (each row has multiple test cases)
      if (data.public_test_cases) {
        for (const testRow of data.public_test_cases) {
          const paramsList = Array.isArray(testRow.input_params) ? testRow.input_params : []
          for (const params of paramsList) {
            flatPublicTests.push({
              id: testRow.id,
              input_params: params,
              is_hidden: false
            })
          }
        }
      }
      
      // Flatten private test cases (for submit endpoint)
      if (data.private_test_cases) {
        for (const testRow of data.private_test_cases) {
          const paramsList = Array.isArray(testRow.input_params) ? testRow.input_params : []
          for (const params of paramsList) {
            flatPrivateTests.push({
              id: testRow.id,
              input_params: params,
              is_hidden: true
            })
          }
        }
      }
      
      return {
        success: true,
        public_test_cases: flatPublicTests,
        private_test_cases: flatPrivateTests
      }
    }
    
    return data
  } catch (error) {
    console.error("[API] Get test cases error:", error)
    return { success: false, error: String(error) }
  }
}

export interface RunTestsRequest {
  code: string
  language: string
  custom_tests?: CustomTestCase[]
}

export async function runTests(
  problemId: string,
  code: string,
  language: string,
  custom_tests?: any[]
): Promise<{ success: boolean; total_tests?: number; passed_tests?: number; results?: TestResult[]; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/service/execute/problems/${problemId}/run-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, custom_tests}),
    })
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }
    
    return await response.json()
  } catch (error) {
    console.error("[API] Run tests error:", error)
    return { success: false, error: String(error) }
  }
}

export async function submitCode(
  problemId: string,
  code: string,
  language: string,
  custom_tests?: any[]
): Promise<{ success: boolean; total_tests?: number; passed_tests?: number; results?: TestResult[]; accepted?: boolean; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/service/execute/problems/${problemId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, custom_tests}),
    })

    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}` }
    }

    return await response.json()
  } catch (error) {
    console.error("[API] Submit code error:", error)
    return { success: false, error: String(error) }
  }
}

// Execute code on remote server
export async function executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
  try {
    const response = await AuthenticatedFetch(`/service/execute/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Execute code error:", error)
    return { success: false, error: String(error) }
  }
}

// Send message to AI chatbot
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const response = await AuthenticatedFetch(`/service/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Chat error:", error)
    return { success: false, response: String(error) }
  }
}

export async function setAIModel(model: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/service/ai/set-model`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Set model error:", error)
    return { success: false, error: String(error) }
  }
}

// Analyze code for issues
export async function analyzeCode(code: string, language: string) {
  try {
    const response = await AuthenticatedFetch(`/service/ai/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Analyze code error:", error)
    return { success: false, error: String(error) }
  }
}

// Explain test case failure
export async function explainTestFailure(expected: string, actual: string, input: string) {
  try {
    const response = await AuthenticatedFetch(`/service/ai/explain-failure`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expected, actual, input }),
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Explain failure error:", error)
    return { success: false, error: String(error) }
  }
}

// Clear chat history
export async function clearChatHistory() {
  try {
    const response = await AuthenticatedFetch(`/service/ai/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Clear chat error:", error)
    return { success: false, error: String(error) }
  }
}

// ============================================================================
// DSA Problems Endpoints
// ============================================================================

export interface Problem {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  examples: string
  constraints: string
  mode: string 
}



export interface Hint {
  id: string
  problem_id: string
  level: number
  content: string
}

export async function getProblems(filters?: { difficulty?: string; category?: string, mode:string}) {
  try {
    const params = new URLSearchParams()
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.category) params.append('category', filters.category)
    if (filters?.mode) params.append('mode', filters.mode)
    
    const response = await AuthenticatedFetch(`/api/problems${params.toString() ? `?${params}` : ''}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Get problems error:", error)
    return { success: false, error: String(error) }
  }
}

export async function getProblem(problemId: string): Promise<{ success: boolean; problem?: Problem; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/problems/${problemId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Get problem error:", error)
    return { success: false, error: String(error) }
  }
}


export async function getHints(problemId: string): Promise<{ success: boolean; hints?: Array<{ level: number; title: string; content: string }>; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/problems/${problemId}/hints`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    const data = await response.json()
    
    // Parse the nested hints_data JSON array from the single hints row
    if (data.success && data.hints_data) {
      const hintsArray = Array.isArray(data.hints_data) ? data.hints_data : JSON.parse(data.hints_data)
      return {
        success: true,
        hints: hintsArray
      }
    }
    
    return data
  } catch (error) {
    console.error("[v0] Get hints error:", error)
    return { success: false, error: String(error) }
  }
}

export async function analyzeComplexity(code: string, language: string) {
  try {
    const response = await AuthenticatedFetch(`/service/ai/code/complexity`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language }),
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Analyze complexity error:", error)
    return { success: false, error: String(error) }
  }
}

// ============================================================================
// Feature Usage Tracking
// ============================================================================

export interface FeaturesUsed {
  hints?: number // 0-3: 0=never, 1=level1, 2=level2, 3=level3
  debug_btn?: number // 0-1: 0=never, 1=used
  performance_analyzer?: number // 0-1: 0=never, 1=used
  ai_used?: number // 0-1: 0=never, 1=used
  custom_tc?: number // 0-1: 0=never, 1=used
  dev_preferences?: any
}

/**
 * Update features used for a problem
 * Only calls backend if the feature hasn't been tracked yet (value is null/0)
 */
export async function updateFeaturesUsed(
  problemId: string,
  features: FeaturesUsed,
  initialFeatures: FeaturesUsed
): Promise<{ success: boolean; error?: string }> {
  try {
    const needsUpdate: Partial<FeaturesUsed> = {}

    // Helper to check if a numeric feature has increased
    // We check if current > initial to avoid overwriting with lower values (race conditions)
    // OR if initial was null/undefined
    const hasIncreased = (current: number | undefined, initial: number | undefined | null) => {
      if (current === undefined) return false
      const safeInitial = initial ?? 0
      return current > safeInitial
    }

    // 1. Numeric Counters (Hints, AI, Custom TCs, etc.)
    // Logic: Only update if the count has INCREASED
    if (hasIncreased(features.hints, initialFeatures.hints)) {
      needsUpdate.hints = features.hints
    }
    if (hasIncreased(features.ai_used, initialFeatures.ai_used)) {
      needsUpdate.ai_used = features.ai_used
    }
    if (hasIncreased(features.custom_tc, initialFeatures.custom_tc)) {
      needsUpdate.custom_tc = features.custom_tc
    }

    // 2. Boolean/Binary Flags (Debug Button, Performance Analyzer)
    // Logic: Update if it changed from falsy (0/null) to truthy (1)
    if (features.debug_btn && !initialFeatures.debug_btn) {
      needsUpdate.debug_btn = features.debug_btn
    }
    if (features.performance_analyzer && !initialFeatures.performance_analyzer) {
      needsUpdate.performance_analyzer = features.performance_analyzer
    }

    // 3. Preferences (Strings/Objects)
    // Logic: Update if the value is different
    if (features.dev_preferences !== undefined && 
        features.dev_preferences !== initialFeatures.dev_preferences) {
      needsUpdate.dev_preferences = features.dev_preferences
    }

    // If nothing valid changed, skip the call
    if (Object.keys(needsUpdate).length === 0) {
      return { success: true }
    }

    const response = await AuthenticatedFetch(`/api/features/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pid: problemId,
        features: needsUpdate,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[v0] Update features error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Get features used for a problem by user
 */
export async function getFeaturesUsed(
  uid: string,
  problemId: string
): Promise<{ success: boolean; features?: FeaturesUsed; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/features/${uid}/${problemId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    return await response.json()
  } catch (error) {
    console.error('[v0] Get features error:', error)
    return { success: false, error: String(error) }
  }
}

// ============================================================================
// Admin API Endpoints (Placeholder)
// ============================================================================

export interface AdminProblem extends Problem {
  topic?: string
  time_complexity?: string
  space_complexity?: string
  created_at?: string
  updated_at?: string
}

export interface AdminCodeTemplate {
  id?: string
  language: string
  template_code: string
  driver_code: string
  solution_code: string
  function_name: string
  input_params: Array<{ name: string; type: string }> | string
  return_type: string
}

export interface AdminProblemDetail {
  problem: AdminProblem
  hints: Array<{ level: number; title: string; content: string }>
  public_test_cases: any[]
  private_test_cases: any[]
  code_templates: AdminCodeTemplate[]
}


export async function getAdminProblems(mode: 'learn' | 'compete'): Promise<{ success: boolean; problems?: AdminProblem[]; error?: string }> {
  // Placeholder: Use existing getProblems endpoint
  try {
    const response = await getProblems({ mode })
    return response
  } catch (error) {
    console.error('[Admin API] Get problems error:', error)
    return { success: false, error: String(error) }
  }
}

export async function getAdminProblemDetail(problemId: string): Promise<{ success: boolean; data?: AdminProblemDetail; error?: string }> {
  const SUPPORTED_LANGUAGES = ['java', 'python', 'cpp']

  try {
    // Fetch problem, hints, raw test cases, and each language template in parallel
    const [problemRes, hintsRes, testCasesRes, ...templateResults] = await Promise.all([
      getProblem(problemId),
      getHints(problemId),
      // Fetch raw test cases (not flattened) for admin view
      AuthenticatedFetch(`/api/problems/${problemId}/test-cases`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }).then(res => res.json()),
      // Fetch each language template using the same pattern as getTemplate()
      ...SUPPORTED_LANGUAGES.map(lang =>
        AuthenticatedFetch(`/api/problems/${problemId}/template?language=${lang}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        })
          .then(res => res.json())
          .catch(() => ({ success: false }))
      )
    ])

    if (!problemRes.success || !problemRes.problem) {
      return { success: false, error: 'Problem not found' }
    }

    // Collect templates that were found (success === true)
    const code_templates = templateResults
      .filter((r: any) => r.success && r.template)
      .map((r: any) => r.template)

    return {
      success: true,
      data: {
        problem: problemRes.problem as AdminProblem,
        hints: hintsRes.hints || [],
        public_test_cases: testCasesRes.public_test_cases || [],
        private_test_cases: testCasesRes.private_test_cases || [],
        code_templates
      }
    }
  } catch (error) {
    console.error('[Admin API] Get problem detail error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Create a new problem with all related data (hints, test cases, templates)
 * POST /api/admin/problems
 */
export async function adminCreateProblem(data: {
  problem: Partial<AdminProblem> & { mode: string }
  hints: Array<{ level: number; title: string; content: string }>
  public_test_cases: any[]
  private_test_cases: any[]
  code_templates: AdminCodeTemplate[]
}): Promise<{ success: boolean; problem_id?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Create problem error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Update problem metadata only
 * PUT /api/admin/problems/<problem_id>
 */
export async function adminUpdateProblem(problemId: string, problemData: Partial<AdminProblem>): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems/${problemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(problemData),
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Update problem error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Update hints for a problem
 * PUT /api/admin/problems/<problem_id>/hints
 */
export async function adminUpdateHints(problemId: string, hints: Array<{ level: number; title: string; content: string }>): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems/${problemId}/hints`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hints }),
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Update hints error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Update test cases for a problem
 * PUT /api/admin/problems/<problem_id>/test-cases
 */
export async function adminUpdateTestCases(problemId: string, publicTestCases: any[], privateTestCases: any[]): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems/${problemId}/test-cases`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_test_cases: publicTestCases,
        private_test_cases: privateTestCases,
      }),
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Update test cases error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Update code template for a specific language
 * PUT /api/admin/problems/<problem_id>/templates/<language>
 */
export async function adminUpdateTemplate(problemId: string, language: string, templateData: {
  template_code: string
  driver_code: string
  solution_code: string
  function_name: string
  input_params: Array<{ name: string; type: string }> | string
  return_type: string
}): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems/${problemId}/templates/${language}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templateData),
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Update template error:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Delete a problem and all associated data
 * DELETE /api/admin/problems/<problem_id>
 */
export async function adminDeleteProblem(problemId: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/admin/problems/${problemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    })
    return await response.json()
  } catch (error) {
    console.error('[Admin API] Delete problem error:', error)
    return { success: false, error: String(error) }
  }
}

// Keep old function names as aliases for backward compatibility
export const createProblem = adminCreateProblem
export const updateProblem = adminUpdateProblem
export const deleteProblem = adminDeleteProblem

/**
 * Fetches all compete views and their populated problem data.
 */
export async function fetchAllViews(): Promise<any> {
    const response = await AuthenticatedFetch(`/api/admin/views`);
    return await response.json();
}

/**
 * Creates or updates a compete view with the provided problem IDs.
 */
export async function createOrUpdateView(name: string, problemIds: string[]): Promise<any> {
    const response = await AuthenticatedFetch(`/api/admin/views`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, problem_ids: problemIds })
    });
    return await response.json();
}

/**
 * Deletes a specified compete view.
 */
export async function deleteView(name: string): Promise<any> {
    const response = await AuthenticatedFetch(`/api/admin/views`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
    });
    return await response.json();
}
// ============================================================================
// User Analytics Dashboard API
// ============================================================================

import type {
  UserAnalyticsSummary,
  StudentDetailedProfile,
  PlatformStats,
  DifficultyVelocityData,
  AIAssistanceData,
} from './analytics-types';

/**
 * Fetch global platform statistics (KPIs).
 */
export async function fetchPlatformStats(): Promise<{ success: boolean; stats?: PlatformStats; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/analytics/stats`);
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch all users with their summary analytics (paginated).
 */
export async function fetchAllUsersAnalytics(
  page: number = 1,
  limit: number = 10,
  search?: string,
  filter?: string
): Promise<{ success: boolean; users?: UserAnalyticsSummary[]; total?: number; page?: number; total_pages?: number; error?: string }> {
  try {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (search) params.append('search', search);
    if (filter) params.append('filter', filter);
    
    const response = await AuthenticatedFetch(`/api/analytics/users?${params}`);
    return await response.json();
  } catch (error) {
    console.log('error: ',error)
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch detailed profile for a specific student.
 */
export async function fetchStudentDetails(uid: string): Promise<{ success: boolean; profile?: StudentDetailedProfile; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/analytics/users/${uid}`);
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch problem velocity by difficulty.
 */
export async function fetchDifficultyVelocity(): Promise<{ success: boolean; data?: DifficultyVelocityData[]; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/analytics/charts/velocity`);
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Fetch average AI assistance per problem.
 */
export async function fetchAIAssistanceData(): Promise<{ success: boolean; data?: AIAssistanceData[]; error?: string }> {
  try {
    const response = await AuthenticatedFetch(`/api/analytics/charts/ai-assistance`);
    return await response.json();
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

/**
 * Export global system CSV.
 */
export function handleGlobalExportCSV(): void {
  window.location.href = `/api/analytics/export/system`;
}

/**
 * Export individual student CSV ledger.
 */
export function handleStudentExportCSV(uid: string): void {
  window.location.href = `/api/analytics/export/user/${uid}`;
}

// ============================================================================
// Admin Auth API
// ============================================================================

/**
 * Check if a user is an admin.
 * GET /api/auth/check-admin
 *
 * Expected backend response: { success: boolean, is_admin: boolean }
 */
export async function checkAdminStatus(): Promise<boolean> {
  try {
    const response = await AuthenticatedFetch(`/api/auth/check-admin`)
    if (!response.ok) return false
    const data = await response.json()
    return data.success === true && data.is_admin === true
  } catch {
    return false
  }
}
