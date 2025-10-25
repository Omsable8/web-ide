const API_BASE_URL = "http://localhost:5000"

export interface ExecuteCodeRequest {
  code: string
  language: string
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

// SSH Connection Management
export async function connectSSH(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ssh/connect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] SSH connect error:", error)
    return { success: false, error: String(error) }
  }
}

export async function disconnectSSH(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ssh/disconnect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] SSH disconnect error:", error)
    return { success: false, error: String(error) }
  }
}

export async function checkSSHStatus(): Promise<{ connected: boolean; hostname?: string; username?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ssh/status`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] SSH status error:", error)
    return { connected: false }
  }
}

// Execute code on remote server
export async function executeCode(request: ExecuteCodeRequest): Promise<ExecuteCodeResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/code/run`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ai/set-model`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ai/explain-failure`, {
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
    const response = await fetch(`${API_BASE_URL}/api/ai/clear`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    return await response.json()
  } catch (error) {
    console.error("[v0] Clear chat error:", error)
    return { success: false, error: String(error) }
  }
}
