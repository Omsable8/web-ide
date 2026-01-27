'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Loader2, Play, Plus, Trash2, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import {
  getProblem,
  getTemplate,
  getTestCases,
  runTests,
  analyzeComplexity,
  CodeTemplate,
  TestCase,
  TestResult,
  CustomTestCase,
  InputParam,
} from '@/lib/api'
import { StructuredTestInput } from '@/components/StructuredTestInput'
import { getDefaultInputFields } from '@/lib/inputParser'
import { MonacoEditorInstance } from '@/components/monaco-editor-instance'
// import {CodeEditor} from '@/components/code-editor'
interface Problem {
  id: string
  title: string
  description: string
  difficulty: string
  category: string
  example: string
  constraints: string
  time_complexity?: string
  space_complexity?: string
}

export default function ProblemDetailPage() {
  const params = useParams()
  const problemId = params.id as string

  // Problem state
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)

  // Code & Template state
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [template, setTemplate] = useState<CodeTemplate | null>(null)
  const [showTemplate, setShowTemplate] = useState(true)

  // Test Cases state
  const [testCases, setTestCases] = useState<TestCase[]>([])
  const [customTests, setCustomTests] = useState<CustomTestCase[]>([])
  const [showCustomTestModal, setShowCustomTestModal] = useState(false)

  // Test Results state
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [running, setRunning] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<'description' | 'tests' | 'custom'>('description')
  const [complexityAnalysis, setComplexityAnalysis] = useState<any>(null)
  const [analyzingComplexity, setAnalyzingComplexity] = useState(false)

  // Load problem and template
  useEffect(() => {
    fetchProblemData()
  }, [problemId, language])

  const fetchProblemData = async () => {
    setLoading(true)
    try {
      // Fetch problem details
      const problemRes = await getProblem(problemId)
      if (problemRes.success && problemRes.problem) {
        setProblem(problemRes.problem)
      }

      // Fetch template for selected language
      const templateRes = await getTemplate(problemId, language)
      if (templateRes.success && templateRes.template) {
        setTemplate(templateRes.template)
        setCode(templateRes.template.template_code)
      } else {
        console.warn('Template not found for language:', language)
      }

      // Fetch test cases
      const testCasesRes = await getTestCases(problemId)
      if (testCasesRes.success && testCasesRes.test_cases) {
        setTestCases(testCasesRes.test_cases)
      }
    } catch (error) {
      console.error('Failed to load problem:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle language change
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage)
  }

  // Run all tests (predefined + custom)
  const handleRunTests = async () => {
    if (!code.trim()) {
      alert('Please write some code first')
      return
    }

    setRunning(true)
    try {
      const result = await runTests(problemId, {
        code,
        language,
        custom_tests: customTests,
      })

      if (result.success && result.results) {
        setTestResults(result.results)
        setActiveTab('tests')
      } else {
        alert(`Error running tests: ${result.error}`)
      }
    } catch (error) {
      console.error('Failed to run tests:', error)
      alert('Failed to run tests')
    } finally {
      setRunning(false)
    }
  }

  // Add custom test case
  const handleAddCustomTest = (newTest: CustomTestCase) => {
    setCustomTests([...customTests, newTest])
    setShowCustomTestModal(false)
  }

  // Remove custom test case
  const handleRemoveCustomTest = (index: number) => {
    setCustomTests(customTests.filter((_, i) => i !== index))
  }

  // Analyze code complexity
  const handleAnalyzeComplexity = async () => {
    if (!code.trim()) {
      alert('Please write some code first')
      return
    }

    setAnalyzingComplexity(true)
    try {
      const result = await analyzeComplexity(code, language)
      if (result.success && result.analysis) {
        try {
          const parsed = JSON.parse(result.analysis)
          setComplexityAnalysis(parsed)
        } catch {
          setComplexityAnalysis({ explanation: result.analysis })
        }
      }
    } catch (error) {
      console.error('Failed to analyze complexity:', error)
    } finally {
      setAnalyzingComplexity(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading problem...</span>
      </div>
    )
  }

  if (!problem) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Problem not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const inputFields = template ? getDefaultInputFields(language, template.input_params) : []
  const passedTests = testResults.filter((r) => r.passed).length
  const totalTests = testResults.length

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div>
          <h1 className="text-lg font-semibold">{problem.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={problem.difficulty === 'Easy' ? 'default' : problem.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
            {problem.difficulty}
          </Badge>
          <Badge variant="outline">{problem.category}</Badge>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Problem Description & Test Cases */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
            <TabsList className="rounded-none border-b border-border bg-card">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="tests">
                Tests
                {testResults.length > 0 && (
                  <span className="ml-2 text-xs bg-muted px-2 py-0.5 rounded">
                    {passedTests}/{totalTests}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="custom">Custom Tests</TabsTrigger>
            </TabsList>

            {/* Description Tab */}
            <TabsContent value="description" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-sm font-semibold mb-2">Description</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.description}</p>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold mb-2">Examples</h2>
                    <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">{problem.example}</pre>
                  </div>

                  <div>
                    <h2 className="text-sm font-semibold mb-2">Constraints</h2>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{problem.constraints}</p>
                  </div>

                  {/* Complexity from Problem */}
                  {(problem.time_complexity || problem.space_complexity) && (
                    <Card className="bg-muted/30 border-muted">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Complexity Requirements</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {problem.time_complexity && (
                          <div>
                            <span className="font-medium">Time:</span> {problem.time_complexity}
                          </div>
                        )}
                        {problem.space_complexity && (
                          <div>
                            <span className="font-medium">Space:</span> {problem.space_complexity}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Analyzed Complexity */}
                  {complexityAnalysis && (
                    <Card className="bg-green-500/5 border-green-500/50">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Your Solution Analysis</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        {complexityAnalysis.time_complexity && (
                          <div>
                            <span className="font-medium">Time:</span> {complexityAnalysis.time_complexity}
                          </div>
                        )}
                        {complexityAnalysis.space_complexity && (
                          <div>
                            <span className="font-medium">Space:</span> {complexityAnalysis.space_complexity}
                          </div>
                        )}
                        {complexityAnalysis.explanation && (
                          <div>
                            <span className="font-medium">Explanation:</span>
                            <p className="text-xs text-muted-foreground mt-1">{complexityAnalysis.explanation}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Test Results Tab */}
            <TabsContent value="tests" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {testResults.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Run tests to see results</p>
                  ) : (
                    <>
                      {/* Summary */}
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">
                          {passedTests === totalTests ? (
                            <span className="text-green-600">✓ All tests passed!</span>
                          ) : (
                            <span className="text-orange-600">
                              {passedTests}/{totalTests} tests passed
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Test Results */}
                      {testResults.map((result, idx) => (
                        <Card key={result.test_id} className={result.passed ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-xs">
                                {result.is_hidden ? '🔒 Hidden' : '📝 Example'} Test #{idx + 1}
                              </CardTitle>
                              {result.passed ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium">Input:</span>
                              <div className="mt-1 space-y-1">
                                {result.input_params.map((param: InputParam) => (
                                  <div key={param.name} className="ml-2 text-muted-foreground">
                                    {param.name}: {JSON.stringify(param.value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Expected:</span>
                              <div className="ml-2 text-muted-foreground font-mono">{result.expected}</div>
                            </div>
                            <div>
                              <span className="font-medium">Actual:</span>
                              <div className="ml-2 text-muted-foreground font-mono">{result.actual || result.error}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Custom Tests Tab */}
            <TabsContent value="custom" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {customTests.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground mb-4">No custom tests yet</p>
                      <Button onClick={() => setShowCustomTestModal(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Custom Test
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button onClick={() => setShowCustomTestModal(true)} size="sm" className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Another Test
                      </Button>

                      {customTests.map((test, idx) => (
                        <Card key={idx}>
                          <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-xs">Custom Test #{idx + 1}</CardTitle>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveCustomTest(idx)}
                              className="h-6 w-6 p-0"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-2 text-xs">
                            <div>
                              <span className="font-medium">Input:</span>
                              <div className="mt-1 space-y-1">
                                {test.input_params.map((param) => (
                                  <div key={param.name} className="ml-2 text-muted-foreground">
                                    {param.name}: {JSON.stringify(param.value)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Expected Output:</span>
                              <div className="ml-2 text-muted-foreground font-mono">{test.expected_output}</div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Panel: Code Editor */}
        <div className="flex-1 flex flex-col border-r border-border overflow-hidden">
          {/* Language & Template Selector */}
          <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Language:</label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-muted text-foreground text-sm px-2 py-1 rounded border border-border"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplate(!showTemplate)}
                className="text-xs"
              >
                {showTemplate ? 'Hide' : 'Show'} Template
              </Button>
            </div>
          </div>

          {/* Template Info */}
          {showTemplate && template && (
            <div className="bg-muted/30 border-b border-border p-3 text-xs">
              <p className="font-medium mb-2">Function Signature:</p>
              <pre className="bg-muted p-2 rounded text-xs overflow-x-auto mb-2">
                {template.template_code.split('\n').slice(0, 3).join('\n')}
              </pre>
              <p className="text-muted-foreground">
                Edit the function body but keep the signature intact. Your function should accept these parameters:
              </p>
              <div className="mt-2 space-y-1">
                {template.input_params.map((param) => (
                  <div key={param.name} className="text-muted-foreground">
                    • <span className="font-mono">{param.name}</span> ({param.type})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditorInstance
              initialCode={code}
              initialLanguage={language as 'cpp' | 'python' | 'java'}
              onCodeChange={setCode}
              showRunButton={false}
              readOnly={false}
            />
          </div>

          {/* Action Buttons */}
          <div className="h-12 border-t border-border bg-card flex items-center justify-between px-4">
            <Button onClick={handleRunTests} disabled={running} className="gap-2">
              {running && <Loader2 className="h-4 w-4 animate-spin" />}
              <Play className="h-4 w-4" />
              Run Tests
            </Button>
            <Button
              onClick={handleAnalyzeComplexity}
              disabled={analyzingComplexity}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              {analyzingComplexity && <Loader2 className="h-4 w-4 animate-spin" />}
              Analyze Complexity
            </Button>
          </div>
        </div>
      </div>

      {/* Custom Test Modal */}
      {showCustomTestModal && template && (
        <StructuredTestInput
          inputFields={inputFields}
          onAddTest={handleAddCustomTest}
          onClose={() => setShowCustomTestModal(false)}
        />
      )}
    </div>
  )
}