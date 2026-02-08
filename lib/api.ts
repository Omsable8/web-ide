const API_BASE_DB_URL = process.env.NEXT_PUBLIC_API_DB_URL || "http://192.168.0.107:5000"
const API_BASE_EXE_URL = process.env.NEXT_PUBLIC_API_EXE_URL || "http://192.168.0.107:5001"
const API_BASE_AI_URL = process.env.NEXT_PUBLIC_API_AI_URL || "http://192.168.0.107:5002"

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
  function_name: string
  input_params: Array<{
    name: string
    type: string
  }>
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
    const response = await fetch(
      `${API_BASE_DB_URL}/api/problems/${problemId}/template?language=${language}`,
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
    const response = await fetch(
      `${API_BASE_DB_URL}/api/problems/${problemId}/test-cases`,
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
    const response = await fetch(`${API_BASE_EXE_URL}/api/problems/${problemId}/run-tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, custom_tests }),
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
    const response = await fetch(`${API_BASE_EXE_URL}/api/problems/${problemId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, language, custom_tests }),
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
    const response = await fetch(`${API_BASE_EXE_URL}/api/code/run`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/ai/chat`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/ai/set-model`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/ai/analyze`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/ai/explain-failure`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/ai/clear`, {
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
  created_at: string
}



export interface Hint {
  id: string
  problem_id: string
  level: number
  content: string
  created_at: string
}

export async function getProblems(filters?: { difficulty?: string; category?: string }) {
  try {
    const params = new URLSearchParams()
    if (filters?.difficulty) params.append('difficulty', filters.difficulty)
    if (filters?.category) params.append('category', filters.category)
    
    const response = await fetch(`${API_BASE_DB_URL}/api/problems${params.toString() ? `?${params}` : ''}`, {
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
    const response = await fetch(`${API_BASE_DB_URL}/api/problems/${problemId}`, {
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
    const response = await fetch(`${API_BASE_DB_URL}/api/problems/${problemId}/hints`, {
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
    const response = await fetch(`${API_BASE_AI_URL}/api/code/complexity`, {
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
