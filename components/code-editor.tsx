"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Save, Download, Loader2 } from "lucide-react"
import { executeCode } from "@/lib/api"

const SAMPLE_CODE = {
  cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // Sample C++ code for competitive programming
    int n;
    cout << "Enter number of elements: ";
    cin >> n;
    
    vector<int> arr(n);
    for(int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    // Your solution here
    cout << "Hello from C++!" << endl;
    
    return 0;
}`,
  python: `# Sample Python code for competitive programming
def solve():
    n = int(input("Enter number of elements: "))
    arr = list(map(int, input().split()))
    
    # Your solution here
    print("Hello from Python!")

if __name__ == "__main__":
    solve()`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Sample Java code for competitive programming
        Scanner sc = new Scanner(System.in);
        
        System.out.print("Enter number of elements: ");
        int n = sc.nextInt();
        
        int[] arr = new int[n];
        for(int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        // Your solution here
        System.out.println("Hello from Java!");
        
        sc.close();
    }
}`,
}

export function CodeEditor({ onCodeExecuted }: { onCodeExecuted?: (output: string, code: string) => void }) {
  const [language, setLanguage] = useState<"cpp" | "python" | "java">("cpp")
  const [code, setCode] = useState(SAMPLE_CODE.cpp)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>("")
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const editorInstanceRef = useRef<any>(null)

  useEffect(() => {
    if (typeof window === "undefined" || !editorContainerRef.current) return

    const initMonaco = async () => {
      try {
        // Load Monaco from jsDelivr
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

            console.log("[v0] Initializing Monaco Editor")

            const monaco = (window as any).monaco

            // Define custom theme
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

            // Create editor instance
            const editor = monaco.editor.create(editorContainerRef.current, {
              value: SAMPLE_CODE.cpp,
              language: "cpp",
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
            })

            editorInstanceRef.current = editor

            // Listeners
            editor.onDidChangeModelContent(() => {
              setCode(editor.getValue())
            })

            editor.onDidChangeCursorPosition((e: any) => {
              setCursorPosition({ line: e.position.lineNumber, column: e.position.column })
            })

            editor.focus()
            console.log("[v0] Monaco Editor initialized successfully")
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
      }
    }
  }, [])

  const handleLanguageChange = (newLang: "cpp" | "python" | "java") => {
    setLanguage(newLang)
    const newCode = SAMPLE_CODE[newLang]
    setCode(newCode)

    if (editorInstanceRef.current) {
      const monaco = (window as any).monaco
      const model = editorInstanceRef.current.getModel()

      monaco.editor.setModelLanguage(model, newLang)
      editorInstanceRef.current.setValue(newCode)
      editorInstanceRef.current.focus()

      console.log("[v0] Language changed to " + newLang)
    }
  }

  const handleRunCode = async () => {
    setIsExecuting(true)
    setExecutionOutput("")

    try {
      const result = await executeCode({
        code,
        language,
      })

      if (result.success) {
        const output = result.output || "Code executed successfully"
        setExecutionOutput(output)
        onCodeExecuted?.(output, code)
      } else {
        const errorMsg = `Error: ${result.error || "Unknown error"}`
        setExecutionOutput(errorMsg)
        onCodeExecuted?.(errorMsg, code)
      }
    } catch (error) {
      console.error("Execution error:", error)
      const errorMsg = "Error: Failed to execute code. Make sure Flask backend is running on http://localhost:5000"
      setExecutionOutput(errorMsg)
      onCodeExecuted?.(errorMsg, code)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: "var(--editor-bg)" }}>
      {/* Toolbar */}
      <div className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-40 bg-muted border-border text-card-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cpp">C++</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="java">Java</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border" />

          <span className="text-xs text-muted-foreground">
            {language === "cpp" ? "main.cpp" : language === "python" ? "main.py" : "Main.java"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            className="text-card-foreground hover:text-accent-foreground hover:bg-accent"
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-card-foreground hover:text-accent-foreground hover:bg-accent"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
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
                Run Code
              </>
            )}
          </Button>
        </div>
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
