'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Home, ArrowLeft, ChevronDown, ChevronUp, Lightbulb, Trash2, Plus, Settings, Zap, X } from 'lucide-react'
import { getProblem, getTestCases, getHints, runTests, analyzeComplexity } from '@/lib/api'
import { MonacoEditorInstance } from '@/components/monaco-editor-instance'
import { AIChatbot } from '@/components/ai-chatbot'
import { DevPreferences } from '@/components/dev-preferences'
import { PerformanceAnalyzer } from '@/components/performance-analyzer'

interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  examples: string
  constraints: string
}

interface TestCase {
  id: string
  input: string
  expected_output: string
  is_example: boolean
}

interface Hint {
  id: string
  level: number
  content: string
}

interface TestResult {
  test_case_id: string
  input: string
  expected: string
  actual: string
  passed: boolean
}

export default function ProblemDetailPage() {
  const params = useParams()
  const problemId = params.id as string

  const [problem, setProblem] = useState<Problem | null>(null)
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [customTestCases, setCustomTestCases] = useState<Array<{ input: string; expected_output: string }>>([])
  const [hints, setHints] = useState<Record<number, Hint[]>>({})
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [showHints, setShowHints] = useState<Record<number, boolean>>({ 1: false, 2: false, 3: false })
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'custom'>('description')
  const [chatbotWidth, setChatbotWidth] = useState(320)
  const [showChatbot, setShowChatbot] = useState(true)
  const [codeContext, setCodeContext] = useState<string>('')
  const [outputContext, setOutputContext] = useState<string>('')
  const [running, setRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [showDevPreferences, setShowDevPreferences] = useState(false)
  const [showPerformanceAnalyzer, setShowPerformanceAnalyzer] = useState(false)
  const [complexityAnalysis, setComplexityAnalysis] = useState<{ timeComplexity: string; spaceComplexity: string; explanation?: string } | null>(null)
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false)
  const [customOutput, setCustomOutput] = useState<string>('')

  useEffect(() => {
    fetchProblemData()
  }, [problemId])

  const handleRunTests = async () => {
    if (!code.trim()) return
    setRunning(true)
    try {
      const result = await runTests(problemId, code, language)
      if (result.success && result.results) {
        setTestResults(result.results)
        setCodeContext(code)
      }
    } catch (error) {
      console.error('Failed to run tests:', error)
    } finally {
      setRunning(false)
    }
  }

  const handleAnalyzeComplexity = async () => {
    if (!code.trim()) return;
    setAnalyzingComplexity(true);
    try {
      const result = await analyzeComplexity(code, language);
      if (result.success && result.analysis) {
        // Extract JSON content if the AI wrapped it in markdown code blocks
        const rawContent = typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis);
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : rawContent;
        
        const analysis = JSON.parse(cleanJson);
        
        setComplexityAnalysis({
          timeComplexity: analysis.time_complexity || analysis.timeComplexity || 'O(n)',
          spaceComplexity: analysis.space_complexity || analysis.spaceComplexity || 'O(1)',
          explanation: analysis.explanation || ''
        });
        setShowPerformanceAnalyzer(true);
      }
    } catch (error) {
      console.error('Failed to parse complexity analysis JSON:', error);
    } finally {
      setAnalyzingComplexity(false);
    }
  }

  const fetchProblemData = async () => {
    setLoading(true)
    try {
      // Fetch problem details
      const problemRes = await getProblem(problemId)
      if (problemRes.success) {
        setProblem(problemRes.problem)
        setCode(problemRes.problem?.description || '')
      }

      // Fetch test cases
      const testCasesRes = await getTestCases(problemId)
      if (testCasesRes.success) {
        setTestCases(testCasesRes.test_cases || [])
      }

      // Fetch hints for all levels
      for (let level = 1; level <= 3; level++) {
        const hintsRes = await getHints(problemId, level)
        if (hintsRes.success) {
          setHints((prev) => ({
            ...prev,
            [level]: hintsRes.hints || [],
          }))
        }
      }
    } catch (error) {
      console.error('Failed to load problem:', error)
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
          <span className={`text-xs px-2 py-1 rounded font-semibold ${problem.difficulty === 'Easy' ? 'text-green-500 bg-green-500/10' : problem.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500/10' : 'text-red-500 bg-red-500/10'}`}>
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleRunTests} disabled={running} className="bg-accent hover:bg-accent/90">
            {running ? 'Running...' : 'Run Tests'}
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
              <button
                onClick={() => setActiveTab('custom')}
                className={`px-3 py-2 text-sm font-medium ${activeTab === 'custom' ? 'text-accent border-b-2 border-accent' : 'text-muted-foreground'}`}
              >
                Custom
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
                  {[1, 2, 3].map((level) => (
                    <div key={level} className="bg-background/30 rounded border border-border">
                      <button
                        onClick={() => setShowHints((prev) => ({ ...prev, [level]: !prev[level] }))}
                        className="w-full flex items-center justify-between p-3 hover:bg-background/50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-accent" />
                          <span className="font-medium text-sm">
                            {level === 1 ? 'Hint 1: Conceptual' : level === 2 ? 'Hint 2: Algorithm & DS' : 'Hint 3: Code Help'}
                          </span>
                        </div>
                        {showHints[level] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {showHints[level] && (
                        <div className="px-3 pb-3 text-sm text-muted-foreground border-t border-border pt-2">
                          {hints[level]?.[0]?.content || `Loading hint level ${level}...`}
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
                {/* Test Results Display */}
                {testResults.length > 0 && (
                  <div className="bg-muted/30 p-4 rounded border border-border mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold text-foreground">Test Results</span>
                      <span className={`text-sm font-bold ${testResults.every(r => r.passed) ? 'text-green-500' : 'text-red-500'}`}>
                        {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                      </span>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {testResults.map((result, idx) => (
                        <div key={result.test_case_id} className={`p-3 rounded border text-xs ${result.passed ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-bold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                              {result.passed ? '✓' : '✗'} Test Case {idx + 1}
                            </span>
                          </div>
                          {!result.passed && (
                            <div className="space-y-1 font-mono text-[11px]">
                              <div><span className="text-muted-foreground">Input:</span> <pre className="inline bg-background p-1 rounded">{result.input}</pre></div>
                              <div><span className="text-muted-foreground">Expected:</span> <pre className="inline bg-background p-1 rounded text-green-400">{result.expected}</pre></div>
                              <div><span className="text-muted-foreground">Got:</span> <pre className="inline bg-background p-1 rounded text-red-400">{result.actual}</pre></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Predefined Test Cases */}
                <div className="text-xs font-semibold text-accent/80 mb-2">Test Cases</div>
                {testCases.map((tc, idx) => (
                  <div key={tc.id} className="bg-blue-500/5 p-3 rounded border border-blue-500/20">
                    <h4 className="font-medium text-sm text-blue-500 mb-2">Example {idx + 1}</h4>
                    <div className="space-y-1 text-xs font-mono">
                      <div>
                        <span className="text-muted-foreground">Input:</span>
                        <pre className="bg-background text-foreground mt-1 p-2 rounded overflow-x-auto text-xs">{tc.input}</pre>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Output:</span>
                        <pre className="bg-background text-foreground mt-1 p-2 rounded overflow-x-auto text-xs">{tc.expected_output}</pre>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Custom Test Cases */}
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-xs font-semibold text-accent/80">Custom Test Cases</div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-accent hover:bg-accent/10" onClick={() => setCustomTestCases([...customTestCases, { input: '', expected_output: '' }])}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {customTestCases.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">No custom test cases yet. Click + to add one.</p>
                  )}
                  {customTestCases.map((tc, idx) => (
                    <div key={idx} className="bg-blue-500/5 p-3 rounded border border-blue-500/20 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm text-blue-500">Custom {idx + 1}</h4>
                        <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-500 hover:bg-red-500/10" onClick={() => setCustomTestCases(customTestCases.filter((_, i) => i !== idx))}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="space-y-2 text-xs">
                        <textarea
                          value={tc.input}
                          onChange={(e) => {
                            const newCustom = [...customTestCases]
                            newCustom[idx].input = e.target.value
                            setCustomTestCases(newCustom)
                          }}
                          className="w-full h-16 p-2 rounded bg-background border border-border text-foreground text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Input"
                        />
                        <textarea
                          value={tc.expected_output}
                          onChange={(e) => {
                            const newCustom = [...customTestCases]
                            newCustom[idx].expected_output = e.target.value
                            setCustomTestCases(newCustom)
                          }}
                          className="w-full h-16 p-2 rounded bg-background border border-border text-foreground text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Expected Output"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Tab */}
            {activeTab === 'custom' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-accent/80 mb-2">Custom Output</div>
                <pre className="bg-background/50 p-3 rounded text-xs text-muted-foreground overflow-x-auto border border-border">
                  {customOutput}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* Middle Panel - Code Editor and Test Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditorInstance
              initialCode={code}
              initialLanguage={language as "cpp" | "python" | "java"}
              onCodeChange={setCode}
              onRun={(newCode, output) => {
                setCodeContext(newCode)
                setOutputContext(output)
                setCustomOutput(output)
              }}
              showRunButton={true}
            />
          </div>
        </div>

        {/* Resizable Divider for Right Panels */}
        {(showChatbot || showPerformanceAnalyzer) && (
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
              className="w-1 bg-border hover:bg-accent cursor-col-resize transition-colors flex-shrink-0"
            />

            {/* Right Panel - Chatbot or Performance Analyzer */}
            <div style={{ width: `${chatbotWidth}px` }} className="flex flex-col overflow-hidden flex-shrink-0">
              {showPerformanceAnalyzer && (
                <div className="flex-1 overflow-hidden">
                  <div className="h-10 border-b border-border flex items-center justify-between px-4 flex-shrink-0 bg-card">
                    <span className="text-sm font-semibold text-foreground">Performance Analyzer</span>
                    <Button size="sm" variant="ghost" onClick={() => setShowPerformanceAnalyzer(false)} className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <PerformanceAnalyzer analysis={complexityAnalysis || undefined} loading={analyzingComplexity} />
                </div>
              )}
              {showChatbot && !showPerformanceAnalyzer && (
                <AIChatbot onClose={() => setShowChatbot(false)} codeContext={codeContext} outputContext={outputContext} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
