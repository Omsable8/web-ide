"use client"

import { useState, useRef, useEffect } from "react"
import Editor, { useMonaco } from "@monaco-editor/react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Loader2, RotateCcw } from "lucide-react"
import { executeCode } from "@/lib/api"

const SAMPLE_CODE = {
  cpp: `#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for(int i = 0; i < n; i++) {\n        cin >> arr[i];\n    }\n    return 0;\n}`,
  python: `n = int(input())\narr = list(map(int, input().split()))\n`,
  java: `import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        int n = sc.nextInt();\n        int[] arr = new int[n];\n        for(int i = 0; i < n; i++) {\n            arr[i] = sc.nextInt();\n        }\n    }\n}`,
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
  errorLines?: number[]
  setErrorLines?: (lines: number[]) => void
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
  errorLines = [],
  setErrorLines,
  onBreakpointsChange,
  currentExecutionLine = null,
  onResetCode,
}: MonacoEditorProps) {
  const [language, setLanguage] = useState<"cpp" | "python" | "java">(initialLanguage)
  const [code, setCode] = useState(initialCode || SAMPLE_CODE[initialLanguage])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isExecuting, setIsExecuting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>("")
  const [userInput, setUserInput] = useState("")
  const [showInputPanel, setShowInputPanel] = useState(false)

  const editorRef = useRef<any>(null)
  const monacoRef = useRef<any>(null)
  const decorationIdsRef = useRef<string[]>([])
  // Add this near your other refs
  const breakpointsRef = useRef<number[]>(breakpoints)

  // Add this effect to keep the ref updated whenever the parent changes the breakpoints
  useEffect(() => {
    breakpointsRef.current = breakpoints
  }, [breakpoints])
  
  // Vim Refs
  const vimInstanceRef = useRef<any>(null)
  const vimStatusBarRef = useRef<HTMLDivElement>(null)

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor
    monacoRef.current = monaco

    // Define Custom Themes
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

    // Apply saved theme/font
    const savedTheme = sessionStorage.getItem('editorTheme') || 'dark'
    monaco.editor.setTheme(savedTheme === 'light' ? 'ide-light' : 'ide-dark')
    
    const savedFontSize = parseInt(sessionStorage.getItem('fontSize') || '14')
    editor.updateOptions({ fontSize: savedFontSize })

    // Track cursor
    editor.onDidChangeCursorPosition((e: any) => {
      setCursorPosition({ line: e.position.lineNumber, column: e.position.column })
    })

    // Breakpoint Click Listener
    editor.onMouseDown((e: any) => {
      if ([2, 3, 4].includes(e.target?.type) && e.target?.position?.lineNumber) {
        const line = e.target.position.lineNumber
        
        // Use the ref here instead of the stale `breakpoints` prop!
        const currentBreakpoints = breakpointsRef.current
        const newBreakpoints = [...currentBreakpoints]
        const index = newBreakpoints.indexOf(line)

        if (index > -1) {
          newBreakpoints.splice(index, 1) // Remove
        } else {
          newBreakpoints.push(line) // Add
        }
        onBreakpointsChange?.(newBreakpoints.sort((a, b) => a - b))
      }
    })
    
    // Check initial keybindings
    applyKeybindings(sessionStorage.getItem('keyBindings') || 'vscode')
  }

  // --- Theme & Font Listeners ---
  useEffect(() => {
    const handleThemeChange = (e: any) => {
      if (monacoRef.current) {
        monacoRef.current.editor.setTheme(e.detail?.theme === 'light' ? 'ide-light' : 'ide-dark')
      }
    }
    const handleFontSizeChange = (e: any) => {
      if (editorRef.current && e.detail?.fontSize) {
        editorRef.current.updateOptions({ fontSize: e.detail.fontSize })
      }
    }
    window.addEventListener('editorThemeChange', handleThemeChange)
    window.addEventListener('editorFontSizeChange', handleFontSizeChange)
    return () => {
      window.removeEventListener('editorThemeChange', handleThemeChange)
      window.removeEventListener('editorFontSizeChange', handleFontSizeChange)
    }
  }, [])

  // --- Vim Keybindings Listener ---
  const applyKeybindings = async (binding: string) => {
    if (vimInstanceRef.current) {
      vimInstanceRef.current.dispose()
      vimInstanceRef.current = null
    }
    
    if (binding === 'vim' && editorRef.current && vimStatusBarRef.current) {
      try {
        // Dynamically import only on the client when needed!
        const { initVimMode } = await import("monaco-vim")
        vimInstanceRef.current = initVimMode(editorRef.current, vimStatusBarRef.current)
      } catch (error) {
        console.error("Error loading vim mode:", error)
      }
    }
  }

  useEffect(() => {
    const handleKeybindingsChange = (e: any) => {
      applyKeybindings(e.detail?.binding || 'vscode')
    }
    window.addEventListener('editorKeybindingsChange', handleKeybindingsChange)
    return () => {
      window.removeEventListener('editorKeybindingsChange', handleKeybindingsChange)
      if (vimInstanceRef.current) vimInstanceRef.current.dispose()
    }
  }, [])

  // --- Breakpoint & Execution Line Decorations ---
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return

    const decorations: any[] = []
    breakpoints.forEach((lineNum) => {
      decorations.push({
        range: new monacoRef.current.Range(lineNum, 1, lineNum, 1),
        options: {
          glyphMargin: true,
          glyphMarginClassName: 'codicon codicon-circle-filled breakpoint-red',
        },
      })
    })
    
    errorLines.forEach((lineNum) => {
        decorations.push({
            range: new monacoRef.current.Range(lineNum, 1, lineNum, 1),
            options: {
                isWholeLine: true,
                className: 'error-line-highlight',
                stickiness: monacoRef.current.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
            },
        })
    })

    if (currentExecutionLine) {
      decorations.push({
        range: new monacoRef.current.Range(currentExecutionLine, 1, currentExecutionLine, 1),
        options: {
          isWholeLine: true,
          className: 'execution-line-highlight',
          glyphMargin: true,
          glyphMarginClassName: 'codicon codicon-debug-continue',
        },
      })
    }

    decorationIdsRef.current = editorRef.current.deltaDecorations(decorationIdsRef.current, decorations)
  }, [breakpoints, currentExecutionLine, errorLines])


  // --- Sync Props ---
  useEffect(() => {
    if (initialLanguage !== language) setLanguage(initialLanguage)
  }, [initialLanguage])

  useEffect(() => {
    if (initialCode !== undefined && initialCode !== code) {
      setCode(initialCode)
    }
  }, [initialCode])

  const handleLanguageChange = (newLang: "cpp" | "python" | "java") => {
    setLanguage(newLang)
    if (setErrorLines) setErrorLines([])
    if (onLanguageChange) onLanguageChange(newLang)
  }

  const handleRunCode = async () => {
    setIsExecuting(true)
    setExecutionOutput("")
    try {
      const result = await executeCode({ code, language, input: userInput })
      const output = result.success ? (result.output || "Code executed successfully") : `Error: ${result.error || "Unknown error"}`
      setExecutionOutput(output)
      onRun?.(code, output)
    } catch (error) {
      const errorMsg = "Error: Failed to execute code."
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
          <Button
            size="sm" variant="outline" className="gap-2 bg-transparent"
            onClick={async () => {
              if (onResetCode) {
                setIsResetting(true)
                try { await onResetCode() } finally { setIsResetting(false) }
              }
            }}
            disabled={isResetting}
            title="Reset to template code"
          >
            {isResetting ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting...</> : <><RotateCcw className="w-4 h-4" />Reset</>}
          </Button>
        )}
      </div>

      {/* Input Panel */}
      <div className="border-b border-border bg-muted/50 p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <button onClick={() => setShowInputPanel(!showInputPanel)} className="text-xs text-muted-foreground hover:text-foreground">
            {showInputPanel ? "▼" : "▶"} Input (Optional)
          </button>
          {showRunButton && userInput.trim() && (
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleRunCode} disabled={isExecuting}>
              {isExecuting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running...</> : <><Play className="w-4 h-4 mr-2" />Run</>}
            </Button>
          )}
        </div>
        {showInputPanel && (
          <textarea
            value={userInput} onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter input here (one per line)"
            className="w-full h-20 p-2 bg-background text-foreground text-xs font-mono rounded border border-border"
          />
        )}
      </div>

      {/* React Wrapper for Monaco */}
      <div className="flex-1 overflow-hidden w-full h-full relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={(val) => {
            const newCode = val || ""
            setCode(newCode)
            onCodeChange?.(newCode)
          }}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: '"Geist Mono", Monaco, Menlo, "Courier New", monospace',
            lineHeight: 24,
            tabSize: 4,
            insertSpaces: true,
            minimap: { enabled: false },
            padding: { top: 10, bottom: 10 },
            readOnly: readOnly,
            glyphMargin: true,
          }}
          loading={<div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="animate-spin w-6 h-6 mr-2" /> Loading Editor...</div>}
        />
      </div>

      {/* Execution Output Display */}
      {executionOutput && (
        <div className="border-t border-border bg-muted p-3 max-h-32 overflow-y-auto">
          <div className="text-xs font-semibold text-foreground mb-1">--- Code Output ---</div>
          <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">{executionOutput}</pre>
        </div>
      )}

      {/* Status Bar */}
      <div className="h-6 border-t border-border bg-card flex items-center justify-between px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Line {cursorPosition.line}, Column {cursorPosition.column}</span>
          {/* Vim Status Bar (shows INSERT, VISUAL, and typed commands) */}
          <div ref={vimStatusBarRef} className="font-mono font-bold text-accent min-w-[120px] empty:hidden bg-background px-2 rounded border border-border"></div>
        </div>
        <span>UTF-8</span>
      </div>
    </div>
  )
}