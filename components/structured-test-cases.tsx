'use client'

import React, { useEffect, useState } from 'react'
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
  is_hidden?: boolean
}

interface TestResultData {
  test_id: string
  input_params: InputParam[]
  expected: string
  actual: string
  passed: boolean
  error?: string
  is_hidden?: boolean
  type?: 'public' | 'private' | 'custom'
}

interface StructuredTestCasesProps {
  testCases: TestCaseData[]
  testResults: TestResultData[]
  customTestCases: TestCaseData[]
  onAddCustomTestCase: () => void
  onRemoveCustomTestCase: (index: number) => void
  onUpdateCustomTestCase: (index: number, testCase: TestCaseData) => void
  isSubmitMode?: boolean
}
export const simplifyError = async (error: string) =>
  fetch('http://localhost:5002/service/ai/explain-failure',
    {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error })
    }).
    then(res => res.json()).
    then(data => data.success ? data.explanation : error).
    catch(() => error);

// Make sure to import your simplifyError function here

function SimplifiedErrorDisplay({ rawError }: { rawError: string }) {
  // Extract the actual error part from your custom delimiter
  const cleanedRawError = rawError.replace("Execution Error:\n", "")

  const [errorMsg, setErrorMsg] = useState<string>("Simplifying error...")

  useEffect(() => {
    let isMounted = true;

    simplifyError(cleanedRawError).then((simplified) => {
      if (isMounted) {
        setErrorMsg(simplified);
      }
    });

    return () => { isMounted = false; }; // Cleanup to prevent state updates on unmounted components
  }, [cleanedRawError]);

  return (
    <div className="text-red-300 font-mono text-sm whitespace-pre-wrap break-all leading-relaxed">
      {errorMsg}
    </div>
  );
}
export function StructuredTestCases({
  testCases,
  testResults,
  customTestCases,
  onAddCustomTestCase,
  onRemoveCustomTestCase,
  onUpdateCustomTestCase,
  isSubmitMode,
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
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'testcase'
            ? 'border-b-2 border-accent text-accent'
            : 'text-muted-foreground hover:text-foreground'
            }`}
        >
          ✓ Testcase
        </button>
        <button
          onClick={() => setActiveTab('result')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'result'
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
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${selectedCaseIndex === idx
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

              {/* Note: Expected output is auto-generated from solution code */}
              {selectedCaseIndex >= testCases.length && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                  Expected output will be generated automatically when you run tests.
                </div>
              )}

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
            <>
              {isSubmitMode && (
                <div className="p-4 rounded-lg border-2 border-accent/30 bg-accent/5">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-foreground">
                      Submission Results
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <div>Total Tests: {testResults.length}</div>
                      <div className="text-green-400">Passed: {testResults.filter(r => r.passed).length}</div>
                      <div className="text-red-400">Failed: {testResults.filter(r => !r.passed).length}</div>
                    </div>
                    {testResults.every(r => r.passed) && (
                      <div className="text-sm font-semibold text-green-400 pt-2">
                        ✓ All tests passed!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {testResults
                .filter(result => !isSubmitMode || !result.is_hidden)
                .map((result, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-2 transition-colors ${result.passed
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
                        {result.type === 'custom' ? 'Custom Test' : `Test Case ${idx + 1}`}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs font-mono">
                      {/* Input */}
                      <div className="bg-background p-3 rounded">
                        <div className="text-muted-foreground mb-1">Input:</div>
                        <div className="text-foreground">
                          {result.input_params.map((param, pidx) => (
                            <div key={pidx}>
                              {param.name} = <span className="text-blue-400">{getParamValue(param)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Expected Output */}
                      <div className="bg-background p-3 rounded">
                        <div className="text-muted-foreground mb-1">Expected:</div>
                        <div className="text-green-400">{result.expected}</div>
                      </div>

                      {/* Actual Output or Error */}
                      {result.actual.includes("Execution Error:") ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md mt-2">
                          <div className="text-red-400 font-semibold text-sm mb-2">Runtime Error:</div>
                          {/* Call the new component here */}
                          <SimplifiedErrorDisplay rawError={result.actual} />
                        </div>
                      ) : (
                        <div className="bg-background p-3 rounded">
                          <div className="text-muted-foreground mb-1">Actual:</div>
                          <div className={result.passed ? 'text-green-400' : 'text-red-400 whitespace-pre-wrap'}>
                            {result.actual}
                          </div>
                        </div>
                      )}

                      {result.error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-md mt-2">
                          <div className="text-red-400 font-semibold text-sm mb-2">Execution Error:</div>
                          <div className="text-red-300 font-mono text-sm whitespace-pre-wrap leading-relaxed">
                            {result.error}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
