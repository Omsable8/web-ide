"use client"

import { useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Loader2, RotateCcw } from "lucide-react"
import { executeCode } from "@/lib/api"

// HAVE TO REPLACE THIS WITH OTHER BRANCH SAMPLE CODES!!
const SAMPLE_CODE = {
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    return 0;
}`,
  python: `n = int(input())
arr = list(map(int, input().split()))
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
    }
}`,
}

interface MonacoEditorProps {
  initialCode?: string
  initialLanguage?: "cpp" | "python" | "java"
  onCodeChange?: (code: string) => void
  onLanguageChange?: (language: "cpp" | "python" | "java") => void
  onRun?: (code: string, output: string) => void
  showRunButton?: boolean
  readOnly?: boolean
  breakpoints?: number[]
  onBreakpointsChange?: (breakpoints: number[]) => void
  currentExecutionLine?: number | null
  onResetCode?: () => Promise<void>
}

export function MonacoEditorInstance({
  initialCode,
  initialLanguage = "java",
  onCodeChange,
  onLanguageChange,
  onRun,
  showRunButton = true,
  readOnly = false,
  breakpoints = [],
  onBreakpointsChange,
  currentExecutionLine = null,
  onResetCode,
}: MonacoEditorProps) {
  // ADD THIS: Track if editor is fully loaded
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [language, setLanguage] = useState<"cpp" | "python" | "java">(initialLanguage)
  const [code, setCode] = useState(initialCode || SAMPLE_CODE[initialLanguage])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isExecuting, setIsExecuting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>("")
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)
  const decorationIdsRef = useRef<string[]>([])
  const [userInput, setUserInput] = useState("")
  const [showInputPanel, setShowInputPanel] = useState(false)
  useEffect(() => {
    if (typeof window === "undefined" || !editorContainerRef.current) return

    const initMonaco = async () => {
      try {
        const monacoScript = document.createElement("script")
        monacoScript.src = "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs/loader.min.js"
        monacoScript.async = true

        monacoScript.onload = () => {
          const require = (window as any).require
          require.config({
            paths: { vs: "https://cdn.jsdelivr.net/npm/monaco-editor@latest/min/vs" },
          })

          require(["vs/editor/editor.main"], () => {
            if (!editorContainerRef.current || editorInstanceRef.current) return

            const monaco = (window as any).monaco

            monaco.editor.defineTheme("ide-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "comment", foreground: "8B93B0", fontStyle: "italic" },
                { token: "keyword", foreground: "8B5CF6" },
                { token: "string", foreground: "10B981" },
              ],
              colors: {
                "editor.background": "#1A2035",
                "editor.foreground": "#E8EAEF",
                "editor.lineHighlightBackground": "#2D5BFF30",
                "editorLineNumber.foreground": "#4A5568",
                "editorCursor.foreground": "#2D5BFF",
                "editor.selectionBackground": "#2D5BFF30",
              },
            })

            monaco.editor.defineTheme("ide-light", {
              base: "vs",
              inherit: true,
              rules: [
                { token: "comment", foreground: "6B7280", fontStyle: "italic" },
                { token: "keyword", foreground: "7C3AED" },
                { token: "string", foreground: "059669" },
              ],
              colors: {
                "editor.background": "#F8FAFC",
                "editor.foreground": "#1E293B",
                "editor.lineHighlightBackground": "#3B82F620",
                "editorLineNumber.foreground": "#CBD5E1",
                "editorCursor.foreground": "#3B82F6",
                "editor.selectionBackground": "#3B82F620",
              },
            })

            const editor = monaco.editor.create(editorContainerRef.current, {
              value: code,
              language,
              theme: "ide-dark",
              fontSize: 14,
              fontFamily: '"Geist Mono", Monaco, Menlo, "Courier New", monospace',
              lineHeight: 24,
              tabSize: 4,
              insertSpaces: true,
              automaticLayout: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              folding: true,
              bracketPairColorization: { enabled: true },
              wordWrap: "off",
              padding: { top: 10, bottom: 10 },
              readOnly: readOnly,
              glyphMargin: true,
            })

            editorInstanceRef.current = editor
            // ADD THIS: Signal that editor is ready
            setIsEditorReady(true)
            editor.onDidChangeModelContent(() => {
              const newCode = editor.getValue()
              setCode(newCode)
              onCodeChange?.(newCode)
            })

            editor.onDidChangeCursorPosition((e: any) => {
              setCursorPosition({ line: e.position.lineNumber, column: e.position.column })
            })

            editor.focus()
          })
        }

        document.head.appendChild(monacoScript)
      } catch (error) {
        console.error("[v0] Failed to initialize Monaco:", error)
      }
    }

    initMonaco()

    return () => {
      if (editorInstanceRef.current) {
        editorInstanceRef.current.dispose()
        editorInstanceRef.current = null
      }
    }
    }, [])

  // Listen for theme changes from dev preferences
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      const theme = e.detail?.theme === 'light' ? 'ide-light' : 'ide-dark'
      if (editorInstanceRef.current) {
        (window as any).monaco?.editor.setTheme(theme)
      }
    }

    const handleFontSizeChange = (e: any) => {
      const fontSize = e.detail?.fontSize
      if (editorInstanceRef.current && fontSize) {
        editorInstanceRef.current.updateOptions({ fontSize })
      }
    }

    window.addEventListener('editorThemeChange', handleThemeChange)
    window.addEventListener('editorFontSizeChange', handleFontSizeChange)

    // Apply saved theme and font size from localStorage
    const savedTheme = localStorage.getItem('editorTheme') || 'dark'
    const savedFontSize = localStorage.getItem('fontSize') || '14'
    if (editorInstanceRef.current) {
      const theme = savedTheme === 'light' ? 'ide-light' : 'ide-dark'
      ;(window as any).monaco?.editor.setTheme(theme)
      editorInstanceRef.current.updateOptions({ fontSize: parseInt(savedFontSize) })
    }

    return () => {
      window.removeEventListener('editorThemeChange', handleThemeChange)
      window.removeEventListener('editorFontSizeChange', handleFontSizeChange)
    }
  }, [isEditorReady])

  // Sync language when initialLanguage prop changes
  useEffect(() => {
    if (initialLanguage !== language) {
      setLanguage(initialLanguage)
    }
  }, [initialLanguage])

  // Sync code when initialCode prop changes
  useEffect(() => {
    if (editorInstanceRef.current && initialCode && initialCode !== code) {
      const newCode = initialCode
      setCode(newCode)
      editorInstanceRef.current.setValue(newCode)
    }
  }, [initialCode,isEditorReady])

  // Update breakpoint decorations and execution line
  useEffect(() => {
    if (!editorInstanceRef.current) return

    const decorations: any[] = []

    // Add breakpoint decorations (red circle in gutter)
    breakpoints.forEach((lineNum) => {
      decorations.push({
        range: new (window as any).monaco.Range(lineNum, 1, lineNum, 1),
        options: {
          glyphMargin: true,
          glyphMarginClassName: 'codicon codicon-circle-filled breakpoint-red',
          glyphMarginHoverMessage: { value: 'Breakpoint' },
        },
      })
    })

    // Add execution line decoration (yellow highlight)
    if (currentExecutionLine) {
      decorations.push({
        range: new (window as any).monaco.Range(currentExecutionLine, 1, currentExecutionLine, 1),
        options: {
          isWholeLine: true,
          className: 'execution-line-highlight',
          glyphMargin: true,
          glyphMarginClassName: 'codicon codicon-debug-continue',
        },
      })
    }

    // Update decorations - use deltaDecorations to replace old ones
    const newIds = editorInstanceRef.current.deltaDecorations(decorationIdsRef.current, decorations)
    decorationIdsRef.current = newIds
  }, [breakpoints, currentExecutionLine])

  // Handle content changes to adjust breakpoint lines
  useEffect(() => {
    if (!editorInstanceRef.current) return

    const editor = editorInstanceRef.current
    const model = editor.getModel()
    if (!model) return

    // Listen for content changes
    const changeListener = model.onDidChangeContent((event: any) => {
      // Only process if we have breakpoints
      if (breakpoints.length === 0) return

      // Check if lines were deleted
      const changes = event.changes
      if (!changes || changes.length === 0) return

      let adjustedBreakpoints = [...breakpoints]

      for (const change of changes) {
        const startLine = change.range.startLineNumber
        const endLine = change.range.endLineNumber
        const deletedLines = endLine - startLine

        if (deletedLines > 0) {
          // Lines were deleted - remove breakpoints from deleted lines
          adjustedBreakpoints = adjustedBreakpoints.filter(
            (bp) => !(bp >= startLine && bp <= endLine)
          )

          // Shift down breakpoints after the deleted section
          adjustedBreakpoints = adjustedBreakpoints.map((bp) =>
            bp > endLine ? bp - deletedLines : bp
          )
        }
      }

      // Only update if something changed
      if (JSON.stringify(adjustedBreakpoints.sort((a, b) => a - b)) !== JSON.stringify(breakpoints.sort((a, b) => a - b))) {
        onBreakpointsChange?.(adjustedBreakpoints.sort((a, b) => a - b))
      }
    })

    return () => {
      changeListener?.dispose()
    }
  }, [breakpoints, onBreakpointsChange])
  useEffect(() => {
    if (!editorInstanceRef.current) return

    const editor = editorInstanceRef.current
    const mouseDownListener = editor.onMouseDown((e: any) => {
      // Check multiple possible gutter/margin click scenarios
      // type === 2 is glyph margin, type === 1 is line number area
      if ((e.target?.type === 1 || e.target?.type === 2) && e.target?.position?.lineNumber) {
        const line = e.target.position.lineNumber
        
        const newBreakpoints = [...breakpoints]
        const index = newBreakpoints.indexOf(line)

        if (index > -1) {
          newBreakpoints.splice(index, 1) // Remove breakpoint
        } else {
          newBreakpoints.push(line) // Add breakpoint
        }

        onBreakpointsChange?.(newBreakpoints.sort((a, b) => a - b))
      }
    })

    return () => {
      mouseDownListener?.dispose()
    }
  }, [breakpoints, onBreakpointsChange])

  const handleLanguageChange = (newLang: "cpp" | "python" | "java") => {
    setLanguage(newLang)
    
    // Update Monaco language model
    if (editorInstanceRef.current) {
      const monaco = (window as any).monaco
      const model = editorInstanceRef.current.getModel()
      monaco.editor.setModelLanguage(model, newLang)
      editorInstanceRef.current.focus()
    }
    
    // Call parent component callback to load template from database
    if (onLanguageChange) {
      onLanguageChange(newLang)
    }
  }

  const handleRunCode = async () => {
    setIsExecuting(true)
    setExecutionOutput("")

    try {
      const result = await executeCode({
        code,
        language,
        input: userInput,
      })

      if (result.success) {
        const output = result.output || "Code executed successfully"
        setExecutionOutput(output)
        onRun?.(code, output)
      } else {
        const errorMsg = `Error: ${result.error || "Unknown error"}`
        setExecutionOutput(errorMsg)
        onRun?.(code, errorMsg)
      }
    } catch (error) {
      const errorMsg = "Error: Failed to execute code. Make sure Flask backend is running on http://localhost:5000"
      setExecutionOutput(errorMsg)
      onRun?.(code, errorMsg)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--editor-bg)" }}>
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <Select value={language} onValueChange={handleLanguageChange} disabled={readOnly}>
          <SelectTrigger className="w-40 bg-muted border-border text-card-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="java">Java</SelectItem>
          </SelectContent>
        </Select>

        {showRunButton && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 bg-transparent"
              onClick={async () => {
                if (onResetCode) {
                  setIsResetting(true)
                  try {
                    await onResetCode()
                  } finally {
                    setIsResetting(false)
                  }
                }
              }}
              disabled={isResetting}
              title="Reset to template code"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      {/* Input Panel */}
      <div className="border-b border-border bg-muted/50 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button
            onClick={() => setShowInputPanel(!showInputPanel)}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            {showInputPanel ? "▼" : "▶"} Input (Optional)
          </button>
          {showRunButton && userInput.trim() && (
            <Button
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleRunCode}
              disabled={isExecuting}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run
                </>
              )}
            </Button>
          )}
        </div>
        {showInputPanel && (
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter input here (one per line)"
            className="w-full h-20 p-2 bg-background text-foreground text-xs font-mono rounded border border-border"
          />
        )}
      </div>

      {/* Editor Container */}
      <div
        ref={editorContainerRef}
        className="flex-1 overflow-hidden"
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Execution Output Display */}
      {executionOutput && (
        <div className="border-t border-border bg-muted p-3 max-h-32 overflow-y-auto">
          <div className="text-xs font-semibold text-foreground mb-1">--- Code Output ---</div>
          <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">{executionOutput}</pre>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 border-t border-border bg-card flex items-center justify-between px-4 text-xs text-muted-foreground">
        <span>
          Line {cursorPosition.line}, Column {cursorPosition.column}
        </span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}
