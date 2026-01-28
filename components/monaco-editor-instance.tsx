"use client"

import { useState, useRef, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
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
}

export function MonacoEditorInstance({
  initialCode,
  initialLanguage = "cpp",
  onCodeChange,
  onLanguageChange,
  onRun,
  showRunButton = true,
  readOnly = false,
}: MonacoEditorProps) {
  const [language, setLanguage] = useState<"cpp" | "python" | "java">(initialLanguage)
  const [code, setCode] = useState(initialCode || SAMPLE_CODE[initialLanguage])
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>("")
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)
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

            monaco.editor.defineTheme("custom-dark", {
              base: "vs-dark",
              inherit: true,
              rules: [
                { token: "comment", foreground: "8b6f47" },
                { token: "string", foreground: "a3d5a3" },
              ],
              colors: {
                "editor.background": "#1a0f0f",
                "editor.foreground": "#f5daa7",
                "editor.lineNumbersBackground": "#3a2020",
                "editor.lineNumbersForeground": "#8b6f47",
                "editorCursor.foreground": "#f5daa7",
                "editor.selectionBackground": "#a3485a80",
                "editor.lineHighlightBackground": "#2a151515",
              },
            })

            const editor = monaco.editor.create(editorContainerRef.current, {
              value: code,
              language,
              theme: "custom-dark",
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
            })

            editorInstanceRef.current = editor

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
  }, [initialCode])

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
      {/* Input Panel */}
      <div className="border-b border-border bg-muted/50 p-3">
        <button
          onClick={() => setShowInputPanel(!showInputPanel)}
          className="text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          {showInputPanel ? "▼" : "▶"} Input (Optional)
        </button>
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
