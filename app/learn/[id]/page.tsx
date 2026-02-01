'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, ChevronDown, ChevronUp, Lightbulb, Trash2, Plus, Settings, Zap, X } from 'lucide-react'
import { getProblem, getTestCases, getHints, runTests, submitCode, analyzeComplexity, getTemplate } from '@/lib/api'
import { MonacoEditorInstance } from '@/components/monaco-editor-instance'
import { AIChatbot } from '@/components/ai-chatbot'
import { StructuredTestCases } from '@/components/structured-test-cases'
import { SubmissionModal } from '@/components/submission-modal'
import {DevPreferences} from '@/components/dev-preferences' // Import DevPreferences
import {PerformanceAnalyzer} from '@/components/performance-analyzer' // Import PerformanceAnalyzer

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  examples: string
  topic?: string
  constraints: string
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

export default function ProblemDetailPage() {
  const params = useParams()
  const problemId = params.id as string

  const [problem, setProblem] = useState<Problem |undefined| null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [customTestCases, setCustomTestCases] = useState<TestCase[]>([])
  const [hints, setHints] = useState<Hint[]>([])
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [showHints, setShowHints] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false })
  const [activeTab, setActiveTab] = useState<'description' | 'testcases'>('description')
  const [chatbotWidth, setChatbotWidth] = useState(320)
  const [showChatbot, setShowChatbot] = useState(true)
  const [codeContext, setCodeContext] = useState<string>('')
  const [outputContext, setOutputContext] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [submissionResult, setSubmissionResult] = useState<{ total: number|undefined; passed: number|undefined; accepted: boolean |undefined} | null>(null)
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [showDevPreferences, setShowDevPreferences] = useState(false)
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false)
  const [complexityAnalysis, setComplexityAnalysis] = useState<{ timeComplexity: string; spaceComplexity: string; explanation?: string } | null>(null)
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Declare isSubmitting variable

  useEffect(() => {
    fetchProblemData()
  }, [problemId])

  // Load template when language changes
  useEffect(() => {
    const loadTemplate = async () => {
      const templateRes = await getTemplate(problemId, language)
      if (templateRes.success && templateRes.template?.template_code) {
        setCode(templateRes.template.template_code)
      }
    }
    loadTemplate()
  }, [language, problemId])

  const handleRunTests = async () => {
    if (!code.trim()) return
    setRunning(true)
    try {
      const result = await runTests(problemId, code, language, customTestCases)
      if (result.success && result.results) {
        setTestResults(result.results)
        setCodeContext(code)
        setActiveTab('testcases')
      }
    } catch (error) {
      console.error('Failed to run tests:', error)
    } finally {
      setRunning(false)
    }
  }

  const handleSubmit = async () => {
    if (!code.trim()) return
    setRunning(true)
    try {
      const result = await submitCode(problemId, code, language, customTestCases)
      if (result.success && result.results) {
        // Filter out private tests for display
        const publicResults = result.results.filter(r => !r.is_hidden)
        setTestResults(publicResults)
        setCodeContext(code)
        setActiveTab('testcases')
        
        // Store submission result and show modal
        setSubmissionResult({
          total: result.total_tests,
          passed: result.passed_tests,
          accepted: result.accepted || false
        })
        setShowSubmissionModal(true)
      }
    } catch (error) {
      console.error('Failed to submit code:', error)
    } finally {
      setRunning(false)
    }
  }

  const handleAnalyzeComplexity = async () => {
    if (!code.trim()) return
    setAnalyzingComplexity(true)
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
      const problemRes = await getProblem(problemId)
      if (problemRes.success) {
        setProblem(problemRes.problem)
      }

      const testCasesRes = await getTestCases(problemId)
      if (testCasesRes.success && testCasesRes.public_test_cases) {
        setTestCases(testCasesRes.public_test_cases)
      }

      const hintsRes = await getHints(problemId)
      if (hintsRes.success && hintsRes.hints) {
        setHints(hintsRes.hints)
      }
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
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/learn" className="flex items-center gap-1 hover:opacity-80 transition">
            <Home className="w-5 h-5 text-accent" />
          </Link>
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold text-accent">{problem.title}</h1>
          <span
            className={`text-xs px-2 py-1 rounded font-semibold ${
              problem.difficulty === 'Easy'
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
          <Button size="sm" variant="ghost" onClick={() => setShowDevPreferences(true)} className="text-foreground hover:text-accent">
            <Settings className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setShowChatbot(!showChatbot)} className="text-foreground hover:text-accent">
            AI Hints
          </Button>
        </div>
      </header>

      {/* Dev Preferences Modal */}
      <DevPreferences isOpen={showDevPreferences} onClose={() => setShowDevPreferences(false)} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden gap-1 p-1 bg-background">
        {/* Left Panel - Problem Description and Hints */}
        <div className="w-96 flex flex-col border-r border-border overflow-hidden bg-card/30 flex-shrink-0">
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
                  <pre className="bg-background/50 p-3 rounded text-xs text-muted-foreground overflow-x-auto border border-border">
                    {problem.examples}
                  </pre>
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
                        onClick={() => setShowHints((prev) => ({ ...prev, [hint.level]: !prev[hint.level] }))}
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

                {/* AI Dynamic Help */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="text-sm font-semibold text-accent mb-2">Dynamic AI Help</div>
                  <p className="text-xs text-muted-foreground mb-3">Get personalized assistance from AI based on your code and test results.</p>
                  <Button size="sm" className="w-full bg-accent hover:bg-accent/90" onClick={() => setShowChatbot(true)}>
                    Open AI Assistant
                  </Button>
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

        {/* Middle Panel - Code Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <MonacoEditorInstance
              initialCode={code}
              initialLanguage={language as 'cpp' | 'python' | 'java'}
              onCodeChange={setCode}
              onLanguageChange={setLanguage}
              onRun={(newCode, output) => {
                setCodeContext(newCode)
                setOutputContext(output)
              }}
              showRunButton={true}
            />
          </div>
        </div>

        {/* Resizable Divider and Right Panels */}
        {showChatbot && (
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
              className="w-0.5 bg-border hover:bg-accent cursor-col-resize transition-colors"
            />
            <div style={{ width: `${chatbotWidth}px` }} className="flex flex-col overflow-hidden flex-shrink-0">
              <AIChatbot onClose={() => setShowChatbot(false)} codeContext={codeContext} outputContext={outputContext} />
            </div>
          </>
        )}

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
              className="w-0.5 bg-border hover:bg-accent cursor-col-resize transition-colors"
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

      {/* Submission Results Modal */}
      {showSubmissionModal && submissionResult && (
        <SubmissionModal
          result={submissionResult}
          onClose={() => setShowSubmissionModal(false)}
        />
      )}
      </div>
    </div>
  )
}
