'use client'

import { useState, useEffect, useRef, useId } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, ChevronDown, ChevronUp, Lightbulb, Trash2, Plus, Settings, Zap, X, Bug } from 'lucide-react'
import { getProblem, getTestCases, getHints, runTests, submitCode, analyzeComplexity, getTemplate, updateFeaturesUsed} from '@/lib/api'
import { MonacoEditorInstance } from '@/components/monaco-editor-instance'
import { StructuredTestCases } from '@/components/structured-test-cases'
import { SubmissionModal } from '@/components/submission-modal'
import { DebugWindow } from '@/components/debug-window'
import { DevPreferences } from '@/components/dev-preferences'
import { ExamplesDisplay } from '@/components/examples-display'
import { PerformanceAnalyzer } from '@/components/performance-analyzer'
import { useDebugger } from '@/hooks/use-debugger'
import { VisualDebugger } from '@/components/visual-debugger'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/lib/auth-context'
import { simplifyError } from '@/components/structured-test-cases'
import { validateInput, formatInputValue, InputType } from '@/lib/inputParser'
interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  examples: string
  topic?: string
  constraints: string
  mode?: string
  time_complexity?: string
  space_complexity?: string
  created_at?: string
}

interface TestCase {
  id: string
  problem_id?: string
  input_params: Array<{ name: string; type: string; value?: any }>
  is_hidden?: boolean
  explanation?: string
  created_at?: string
}

interface Hint {
  level: number
  title: string
  content: string
}

interface TestResult {
  test_id: string
  input_params: Array<{ name: string; type: string; value?: any }>
  expected: string
  actual: string
  passed: boolean
  error?: string
}

// Helper to handle SessionStorage caching
// TTL (Time To Live) defaults to 60 minutes
async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 60 * 60 * 1000
): Promise<T | null> {
  if (typeof window === 'undefined') return null

  try {
    const cached = sessionStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < ttl) {
        return data as T
      }
    }
  } catch (e) {
    console.warn("Session storage read error:", e)
  }

  const data = await fetcher()

  if (data) {
    try {
      sessionStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
    } catch (e) {
      console.warn("Session storage write error:", e)
    }
  }

  return data
}
export default function ProblemDetailPageWrapper() {
  return (
    <ProtectedRoute>
      <ProblemDetailPage />
    </ProtectedRoute>
  )
}

function ProblemDetailPage() {
  const params = useParams()
  const problemId = params.id as string
  const { user } = useAuth()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([])
  const [hints, setHints] = useState<Hint[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('java')
  const [showHints, setShowHints] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false })

  const [hintsUsed, setHintsUsed] = useState<number>(0) // 0-3: 0=never, 1=level1, 2=level2, 3=level3
  const [debuggerUsed, setDebuggerUsed] = useState<number>(0) // 0-1: 0=never, 1=used
  const [complexityUsed, setComplexityUsed] = useState<number>(0) // 0-1: 0=never, 1=used
  const [devprefUsed, setDevPrefUsed] = useState<number>(0) // 0-1: 0=never, 1=used
  const [customTcUsed, setCustomTcUsed] = useState<number>(0) // 0-1: 0=never, 1=used

  const [activeTab, setActiveTab] = useState<'description' | 'testcases'>('description')
  const [chatbotWidth, setChatbotWidth] = useState(320)
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [submissionResult, setSubmissionResult] = useState<{ total: number; passed: number; accepted: boolean } | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showDevPreferences, setShowDevPreferences] = useState(false)
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false)
  const [complexityAnalysis, setComplexityAnalysis] = useState<{ timeComplexity: string; spaceComplexity: string; explanation?: string } | null>(null)
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDebugWindow, setShowDebugWindow] = useState(false)
  const [isDebugging, setIsDebugging] = useState(false)
  const [showVisualDebugger, setShowVisualDebugger] = useState(false)
  const [breakpoints, setBreakpoints] = useState<number[]>([])
  const [currentExecutionLine, setCurrentExecutionLine] = useState<number | null>(null)
  const [errorLines, setErrorLines] = useState<number[]>([])
  // Inside ProblemDetailPage component
  const [leftPanelWidth, setLeftPanelWidth] = useState(384) // Default 96 (w-96)
  const [showLeftPanel, setShowLeftPanel] = useState(true)
  const handleToggleHint = async (hintLevel: number, isOpening: boolean) => {
    // Update UI
    setShowHints((prev) => ({ ...prev, [hintLevel]: !prev[hintLevel] }))

    // Track hint usage - only update if opening a hint and haven't tracked this level yet
    if (isOpening && hintLevel > hintsUsed && user) {
      const newHintsUsed = hintLevel
      setHintsUsed(newHintsUsed)

      // Call backend to update features used
      try {
        await updateFeaturesUsed(
          problemId,
          { hints: newHintsUsed },
          { hints: hintsUsed }
        )
      } catch (error) {
        console.error('[v0] Failed to update hints usage:', error)
      }
    }
  }

  const handleBreakpointsChange = (newBreakpoints: number[]) => {
    setBreakpoints(newBreakpoints)
  }

  const { startDebugger, stopDebugger, debugState, stepOver, stepInto, stepOut, setBreakpoints: setDebuggerBreakpoints } = useDebugger()

  useEffect(() => {
    fetchProblemData()
  }, [problemId])

  // Update execution line when debugState changes
  useEffect(() => {
    if (debugState.line) {
      setCurrentExecutionLine(debugState.line)
    }
  }, [debugState.line])

  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Ref to hold the latest code for the interval to read without re-triggering
  const codeRef = useRef(code)

  // Keep codeRef in sync
  useEffect(() => {
    codeRef.current = code
  }, [code])

  // LOGIC: Load Code (Storage -> Cache -> DB) & Setup Auto-Save
  useEffect(() => {
    const storageKey = `autosave_${problemId}_${language}`

    const loadCode = async () => {
      // 1. Try sessionStorage First (User's draft)
      const savedCode = sessionStorage.getItem(storageKey)

      if (savedCode) {
        console.log(`[AutoSave] Restored from local storage for ${language}`)
        setCode(savedCode)
        return
      }

      // 2. If no draft, fetch Template (Cache -> DB)
      const cacheKey = `template_${problemId}_${language}`
      const templateCode = await fetchWithCache(
        cacheKey,
        async () => {
          const templateRes = await getTemplate(problemId, language)
          return (templateRes.success && templateRes.template?.template_code)
            ? templateRes.template.template_code
            : ""
        }
      )

      if (templateCode) {
        setCode(templateCode)
      }
    }

    loadCode()

    // 3. Setup Auto-Save Interval (Every 2 minutes)
    const saveInterval = setInterval(() => {
      if (codeRef.current) {
        sessionStorage.setItem(storageKey, codeRef.current)
        setLastSaved(new Date())
        console.log(`[AutoSave] Saved draft for ${language} at ${new Date().toLocaleTimeString()}`)
      }
    }, 2 * 60 * 1000) // 2 minutes

    // Cleanup on language change or unmount
    return () => clearInterval(saveInterval)

  }, [language, problemId])

  //helper function
  const ExtractErrorLines = (simplified_errorMsg: string) => {
    // Regex matches "line", optional space, digits, and a colon
    
    const lines = simplified_errorMsg.split('\n')
        .map(line => line.match(/line\s*(\d+)/i)) // 'i' flag for case-insensitive
        .filter(match => match !== null)
        .map(match => parseInt(match![1]));

    setErrorLines(lines);
    // console.log(lines); // Log 'lines' directly to verify extraction
  }

  const handleRunTests = async () => {
    if (!code.trim()) return
    
    // 1. Robust Validation
    for (let i = 0; i < customTestCases.length; i++) {
      for (const param of customTestCases[i].input_params) {
        const validation = validateInput(String(param.value || ''), param.type as InputType)
        if (!validation.valid) {
          // Alert the user exactly which field is wrong and how to fix it
          alert(`Custom Test Case ${i + 1} Error in '${param.name}': ${validation.error}`)
          return // Stop execution immediately
        }
      }
    }
    
    setRunning(true)
    setErrorLines([])
    try {
      const result = await runTests(problemId, code, language, customTestCases)
      if (result.success && result.results) {
        setTestResults(result.results)
        setActiveTab('testcases')
      } else if (!result.success) {
        // Display compilation/runtime error
        const errorMsg = result.error || 'Unknown error occurred'
        const simplified_errorMsg = await simplifyError(errorMsg)
        ExtractErrorLines(simplified_errorMsg)
        
        setTestResults([{ 
          test_id:'NA',
          passed: false, 
          error: simplified_errorMsg,
          input_params: [{}],
          expected: 'N/A',
          actual: 'N/A'
        }] as TestResult[])
        setActiveTab('testcases')
      }
    } catch (error) {
      console.error('Failed to run tests:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to run tests'
      setTestResults([{ 
          test_id:'NA',
          passed: false, 
          error: errorMessage,
          input_params: {},
          expected: 'N/A',
          actual: "N/A"
        }] as TestResult[])
      setActiveTab('testcases')
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    // 1. Robust Validation
    for (let i = 0; i < customTestCases.length; i++) {
      for (const param of customTestCases[i].input_params) {
        const validation = validateInput(String(param.value || ''), param.type as InputType)
        if (!validation.valid) {
          // Alert the user exactly which field is wrong and how to fix it
          alert(`Custom Test Case ${i + 1} Error in '${param.name}': ${validation.error}`)
          return // Stop execution immediately
        }
      }
    }
    setRunning(true)
    setErrorLines([])
    try {
      const result = await submitCode(problemId, code, language, customTestCases)
      if (result.success && result.results) {
        // Filter out private tests for display
        const publicResults = result.results.filter(r => !r.is_hidden)
        setTestResults(publicResults)
        setActiveTab('testcases')

        // Store submission result and show modal
        setSubmissionResult({
          total: result.total_tests || 0,
          passed: result.passed_tests || 0,
          accepted: result.accepted || false
        })
        setShowSubmissionModal(true)
      } else if (!result.success) {
        // Display compilation/runtime error
        const errorMsg = result.error || 'Unknown error occurred'
        const simplified_errorMsg = await simplifyError(errorMsg)
        ExtractErrorLines(simplified_errorMsg)
        setTestResults([{ 
          test_id:'NA',
          passed: false, 
          error: simplified_errorMsg,
          input_params: [{}],
          expected: 'N/A',
          actual: 'N/A'
        }] as TestResult[])
        setActiveTab('testcases')
      }
    } catch (error) {
      console.error('Failed to submit code:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit code'
      setTestResults([{ 
          test_id:'NA',
          passed: false, 
          error: errorMessage,
          input_params: {},
          expected: 'N/A',
          actual: "N/A"
        }] as TestResult[])
      setActiveTab('testcases')
    } finally {
      setRunning(false)
    }
  }

  const handleDebug = async () => {
    if (!code.trim()) return
    setIsDebugging(true)
    setShowDebugWindow(true)
    setDebuggerUsed(1)
    try {
      await updateFeaturesUsed(problemId, { debug_btn: 1 }, { debug_btn: debuggerUsed })
      setDebuggerUsed(1)
    } catch (error) {
      console.error('[v0] Failed to update hints usage:', error)
    }
    try {
      // Build stdin string from the first test case
      // const stdin = '1\n2 2\n1 1 1\n0 0 0\n1 1 1\n1\n1\n2'  // Example: t=1, then input for 1 test case
      const stdin = ''
      startDebugger(code, language, breakpoints, problemId, stdin)
    } catch (error) {
      console.error('Failed to start debugger:', error)
      setIsDebugging(false)
    }
  }

  const handleStopDebug = () => {
    stopDebugger()
    setIsDebugging(false)
    setShowDebugWindow(false)
    setCurrentExecutionLine(null)
  }
    // Modify handleDebug to support visual mode
  const handleVisualDebug = async () => {
    if (!code.trim()) return
    setIsDebugging(true)
    setShowVisualDebugger(true) // Open the visual one
    setShowDebugWindow(false)    // Ensure standard one is closed
    
    // Track feature usage
    // updateFeaturesUsed(uid, problemId, { debug_btn: 1 }, { debug_btn: 0 })
    
    try {
      startDebugger(code, language, breakpoints, problemId, '')
    } catch (error) {
      console.error('Failed to start visual debugger:', error)
      setIsDebugging(false)
    }
  }
  const handleStopVisualDebug = () => {
    stopDebugger()
    setIsDebugging(false)
    setShowDebugWindow(false)
    setShowVisualDebugger(false) // Close visualizer
    setCurrentExecutionLine(null)
  }
  const handleResetCode = async () => {
    try {
      setErrorLines([])
      const cacheKey = `template_${problemId}_${language}`
      const templateCode = await fetchWithCache(
        cacheKey,
        async () => {
          const templateRes = await getTemplate(problemId, language)
          return (templateRes.success && templateRes.template?.template_code)
            ? templateRes.template.template_code
            : ""
        }
      )

      if (templateCode) {
        setCode(templateCode)
        // Clear auto-save for this problem/language
        const storageKey = `problem_${problemId}_${language}`
        sessionStorage.removeItem(storageKey)
        console.log("[v0] Code reset to template and auto-save cleared")
      }
    } catch (error) {
      console.error('Failed to reset code:', error)
    }
  }

  const handleAnalyzeComplexity = async () => {
    if (!code.trim()) return
    setAnalyzingComplexity(true)
    updateFeaturesUsed(problemId, { performance_analyzer: 1 }, { performance_analyzer: complexityUsed })
    setComplexityUsed(1)
    try {
      const result = await analyzeComplexity(code, language)
      if (result.success && result.analysis) {
        const rawContent = typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis)
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
        const cleanJson = jsonMatch ? jsonMatch[0] : rawContent

        const analysis = JSON.parse(cleanJson)

        setComplexityAnalysis({
          timeComplexity: analysis.time_complexity || analysis.timeComplexity || 'O(n)',
          spaceComplexity: analysis.space_complexity || analysis.spaceComplexity || 'O(1)',
          explanation: analysis.explanation || '',
        })
        setShowPerformanceAnalyzer(true)
      }
    } catch (error) {
      console.error('Failed to parse complexity analysis JSON:', error)
    } finally {
      setAnalyzingComplexity(false)
    }
  }

  const fetchProblemData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Problem with Cache
      const problemData = await fetchWithCache(
        `problem_${problemId}`,
        async () => {
          const problemRes = await getProblem(problemId)
          return problemRes.success ? problemRes.problem : null
        }
      )
      if (problemData) {
        setProblem(problemData)
        sessionStorage.setItem('problemID', problemData.id)
      }
      // 2. Fetch Test Cases with Cache
      const testCasesData = await fetchWithCache(
        `testcases_${problemId}`,
        async () => {
          const testCasesRes = await getTestCases(problemId)
          return testCasesRes.success ? testCasesRes.public_test_cases : []
        }
      )
      if (testCasesData) setTestCases(testCasesData)

      // 3. Fetch Hints with Cache
      const hintsData = await fetchWithCache(
        `hints_${problemId}`,
        async () => {
          const hintsRes = await getHints(problemId)
          return hintsRes.success ? hintsRes.hints : []
        }
      )
      if (hintsData) setHints(hintsData)
    } catch (error) {
      console.error('[v0] Failed to load problem:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Loading problem...</div>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-muted-foreground">Problem not found</div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden mode-compete">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/compete" className="flex items-center gap-1 hover:opacity-80 transition">
            <Home className="w-5 h-5 text-accent" />
          </Link>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-accent">{problem.title}</h1>
          {/* Inside the Header's first div, next to the Title */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowLeftPanel(!showLeftPanel)}
            className="p-1 h-8 w-8"
          >
            {showLeftPanel ? <ChevronDown className="rotate-90" /> : <ChevronDown className="-rotate-90" />}
          </Button>
          <span
            className={`text-xs px-2 py-1 rounded font-semibold ${problem.difficulty === 'Easy'
              ? 'text-green-500 bg-green-500/10'
              : problem.difficulty === 'Medium'
                ? 'text-yellow-500 bg-yellow-500/10'
                : 'text-red-500 bg-red-500/10'
              }`}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRunTests} disabled={running} className="bg-accent hover:bg-accent/90">
            {running ? 'Running...' : 'Run Tests'}
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={running} variant="default" className="bg-green-600 hover:bg-green-700">
            {running ? 'Submitting...' : 'Submit'}
          </Button>
          <Button size="sm" onClick={handleAnalyzeComplexity} disabled={analyzingComplexity} variant="outline" className="gap-2 bg-transparent">
            <Zap className="w-4 h-4" />
            Complexity
          </Button>
          <Button size="sm" onClick={handleDebug} disabled={isDebugging} variant="outline" className="gap-2 bg-transparent">
            <Bug className="w-4 h-4" />
            Debug
          </Button>
          <Button size="sm" onClick={handleVisualDebug} disabled={isDebugging} variant="outline" className="gap-2 bg-blue-500/10 border-blue-500/50 text-blue-400">
            <Zap className="w-4 h-4" />
            Visual Debug
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setShowDevPreferences(true);

            updateFeaturesUsed(problemId, { dev_preferences: 1 }, { dev_preferences: devprefUsed });
            setDevPrefUsed(1);
          }} className="text-foreground hover:text-accent">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Dev Preferences Modal */}
      <DevPreferences isOpen={showDevPreferences} onClose={() => setShowDevPreferences(false)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-1 p-1 bg-background">

        {/* Updated Left Panel */}
        {showLeftPanel && (
          <div
            style={{ width: `${leftPanelWidth}px` }}
            className="flex flex-col border-r border-border overflow-hidden bg-card/30 flex-shrink-0"
          >
            <div className="flex-1 overflow-y-auto p-4">
              {/* Tabs */}
              <div className="flex gap-2 mb-4 border-b border-border">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'description' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab('testcases')}
                  className={`px-3 py-2 text-sm font-medium ${activeTab === 'testcases' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}
                >
                  Test Cases
                </button>
              </div>

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-accent mb-3">Description</h3>
                    <div className="bg-background/50 p-4 rounded border border-border max-h-96 overflow-y-auto">
                      <p className="text-muted-foreground text-sm whitespace-pre-wrap leading-relaxed">{problem.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-accent mb-2">Examples</h3>
                    <ExamplesDisplay examples={problem.examples} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-accent mb-2">Constraints</h3>
                    <p className="text-muted-foreground text-sm whitespace-pre-wrap">{problem.constraints}</p>
                  </div>

                  {/* Hints */}
                  <div className="space-y-2 border-t border-border pt-4">
                    {hints.map((hint) => (
                      <div key={hint.level} className="bg-background/30 rounded border border-border">
                        <button
                          onClick={() => handleToggleHint(hint.level, !showHints[hint.level])}
                          className="w-full flex items-center justify-between p-3 hover:bg-background/50 transition"
                        >
                          <div className="flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-accent" />
                            <span className="font-medium text-sm">
                              Hint {hint.level}: {hint.title}
                            </span>
                          </div>
                          {showHints[hint.level] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showHints[hint.level] && (
                          <div className="px-3 pb-3 text-sm text-muted-foreground border-t border-border pt-2">
                            {hint.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  
                </div>
              )}

              {/* Test Cases Tab */}
              {activeTab === 'testcases' && (
                <div className="space-y-3">
                  <StructuredTestCases
                    testCases={testCases}
                    testResults={testResults}
                    customTestCases={customTestCases}
                    onAddCustomTestCase={() => {
                      if (testCases.length === 0) return
                      setCustomTestCases([
                        ...customTestCases,
                        {
                          id: `custom-${Date.now()}`,
                          input_params: testCases[0].input_params.map((p) => ({ name: p.name, type: p.type, value: '' })) || []
                        },
                      ])
                      updateFeaturesUsed(problemId, { custom_tc: 1 }, { custom_tc: customTcUsed })
                      setCustomTcUsed(1)
                    }}
                    onRemoveCustomTestCase={(index) => setCustomTestCases(customTestCases.filter((_, i) => i !== index))}
                    onUpdateCustomTestCase={(index, testCase) => {
                      const newCustom = [...customTestCases]
                      newCustom[index] = testCase
                      setCustomTestCases(newCustom)
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
        {/* Insert this between the Left Panel and Middle Panel */}
        {showLeftPanel && (
          <div
            onMouseDown={(e) => {
              const startX = e.clientX
              const startWidth = leftPanelWidth

              const handleMouseMove = (e: MouseEvent) => {
                const delta = e.clientX - startX
                setLeftPanelWidth(Math.max(250, Math.min(600, startWidth + delta)))
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
            className="w-4 shrink-0 bg-clip-content px-[7px] bg-border hover:bg-accent cursor-col-resize transition-colors"
          />
        )}
        {/* Middle Panel - Code Editor with Debug Window below */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoEditorInstance
              initialCode={code}
              initialLanguage={language as 'cpp' | 'python' | 'java'}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              onRun={(newCode, output) => {
                
              }}
              breakpoints={breakpoints}
              onBreakpointsChange={handleBreakpointsChange}
              errorLines={errorLines}
              setErrorLines={setErrorLines}
              currentExecutionLine={currentExecutionLine}
              showRunButton={true}
              onResetCode={handleResetCode}
            />
          </div>

          {/* Debug Window at Bottom of Editor Panel */}
          <DebugWindow
            isOpen={showDebugWindow}
            onClose={handleStopDebug}
            debugState={debugState}
            onStepOver={stepOver}
            onStepInto={stepInto}
            onStepOut={stepOut}
            onStop={handleStopDebug}
            isRunning={isDebugging}
          />
          <VisualDebugger
            isOpen={showVisualDebugger}
            onClose={handleStopVisualDebug}
            debugState={debugState}
            onStepOver={stepOver}
            onStepInto={stepInto}
            onStepOut={stepOut}
            onStop={handleStopVisualDebug}
            isRunning={isDebugging}
          />
        </div>
        
        
        {showPerformanceAnalyzer && (
          <>
            <div
              onMouseDown={(e) => {
                const startX = e.clientX
                const startWidth = chatbotWidth

                const handleMouseMove = (e: MouseEvent) => {
                  const delta = e.clientX - startX
                  setChatbotWidth(Math.max(300, Math.min(600, startWidth - delta)))
                }

                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove)
                  document.removeEventListener('mouseup', handleMouseUp)
                }

                document.addEventListener('mousemove', handleMouseMove)
                document.addEventListener('mouseup', handleMouseUp)
              }}
              className="w-4 shrink-0 bg-clip-content px-[7px] bg-border hover:bg-accent cursor-col-resize transition-colors"
            />
            <div style={{ width: `${chatbotWidth}px` }} className="flex flex-col overflow-hidden flex-shrink-0">
              <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
                <span className="text-sm font-medium text-foreground">Performance Analysis</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPerformanceAnalyzer(false)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto">
                <PerformanceAnalyzer analysis={complexityAnalysis} loading={analyzingComplexity} />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Submission Results Modal */}
      {showSubmissionModal && submissionResult && (
        <SubmissionModal
          result={submissionResult}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}
    </div>
  )
}
