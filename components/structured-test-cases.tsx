'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react'

interface InputParam {
  name: string
  type: string
  value?: any
}

interface TestCaseData {
  id: string
  input_params: InputParam[]
  expected_output: string
  is_example?: boolean
}

interface TestResultData {
  test_id: string
  input_params: InputParam[]
  expected: string
  actual: string
  passed: boolean
  error?: string
}

interface StructuredTestCasesProps {
  testCases: TestCaseData[]
  testResults: TestResultData[]
  customTestCases: TestCaseData[]
  onAddCustomTestCase: () => void
  onRemoveCustomTestCase: (index: number) => void
  onUpdateCustomTestCase: (index: number, testCase: TestCaseData) => void
}

export function StructuredTestCases({
  testCases,
  testResults,
  customTestCases,
  onAddCustomTestCase,
  onRemoveCustomTestCase,
  onUpdateCustomTestCase,
}: StructuredTestCasesProps) {
  const [activeTab, setActiveTab] = useState<'testcase' | 'result'>('testcase')
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0)

  const allTestCases = [...testCases, ...customTestCases]
  const selectedTestCase = allTestCases[selectedCaseIndex]

  const getParamValue = (param: InputParam) => {
    if (typeof param.value === 'object') {
      return JSON.stringify(param.value)
    }
    return String(param.value || '')
  }

  const parseParamValue = (value: string, type: string) => {
    // Keep values as strings in the component state
    // Backend will handle type conversion
    return value
  }

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('testcase')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'testcase'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          ✓ Testcase
        </button>
        <button
          onClick={() => setActiveTab('result')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'result'
              ? 'border-b-2 border-accent text-accent'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Test Result
        </button>
      </div>

      {/* Test Case Tab */}
      {activeTab === 'testcase' && (
        <div className="space-y-4">
          {/* Case Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {allTestCases.map((tc, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCaseIndex(idx)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCaseIndex === idx
                    ? 'bg-muted text-foreground border-2 border-accent'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                Case {idx + 1}
              </button>
            ))}
            <button
              onClick={onAddCustomTestCase}
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted text-muted-foreground transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Input Fields */}
          {selectedTestCase && (
            <div className="space-y-3 bg-muted/20 p-4 rounded-lg border border-border">
              {selectedTestCase.input_params.map((param, idx) => (
                <div key={idx} className="space-y-2">
                  <label className="text-sm font-medium text-foreground">{param.name} =</label>
                  <input
                    type="text"
                    value={getParamValue(param)}
                    onChange={(e) => {
                      const newTestCase = { ...selectedTestCase }
                      newTestCase.input_params[idx].value = parseParamValue(e.target.value, param.type)
                      if (selectedCaseIndex >= testCases.length) {
                        onUpdateCustomTestCase(selectedCaseIndex - testCases.length, newTestCase)
                      }
                    }}
                    disabled={selectedCaseIndex < testCases.length}
                    className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                    placeholder={`Enter ${param.type}`}
                  />
                </div>
              ))}

              {/* Expected Output (Read-only for predefined, editable for custom) */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="text-sm font-medium text-foreground">Expected Output</label>
                <textarea
                  value={selectedTestCase.expected_output}
                  onChange={(e) => {
                    const newTestCase = { ...selectedTestCase }
                    newTestCase.expected_output = e.target.value
                    if (selectedCaseIndex >= testCases.length) {
                      onUpdateCustomTestCase(selectedCaseIndex - testCases.length, newTestCase)
                    }
                  }}
                  disabled={selectedCaseIndex < testCases.length}
                  className="w-full bg-background border border-border rounded px-3 py-2 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 resize-none h-20"
                />
              </div>

              {/* Delete Button for Custom Cases */}
              {selectedCaseIndex >= testCases.length && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => {
                    onRemoveCustomTestCase(selectedCaseIndex - testCases.length)
                    setSelectedCaseIndex(Math.max(0, selectedCaseIndex - 1))
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Custom Case
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test Result Tab */}
      {activeTab === 'result' && (
        <div className="space-y-3">
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>Run tests to see results</p>
            </div>
          ) : (
            testResults.map((result, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  result.passed
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-red-500/5 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  {result.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                  <span className={`font-semibold ${result.passed ? 'text-green-500' : 'text-red-500'}`}>
                    Test Case {idx + 1}
                  </span>
                </div>

                {!result.passed && (
                  <div className="space-y-2 text-xs font-mono">
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Expected: </span>
                      <span className="text-green-400">{result.expected}</span>
                    </div>
                    <div className="bg-background p-2 rounded">
                      <span className="text-muted-foreground">Got: </span>
                      <span className="text-red-400">{result.actual}</span>
                    </div>
                    {result.error && (
                      <div className="bg-background p-2 rounded">
                        <span className="text-muted-foreground">Error: </span>
                        <span className="text-yellow-400">{result.error}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
