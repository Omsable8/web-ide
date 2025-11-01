"use client"

import { useState, useRef } from "react"
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
    // Your solution here
    cout << "Hello from C++!" << endl;
    
    return 0;
}`,
  python: `# Sample Python code for competitive programming
def binary_search(arr, target):

    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 2 
            
    return -1

def run_test(name, arr, target, expected):
    """Runs a single test case and prints the result."""
    result = binary_search(arr, target)
    is_passing = (result == expected)
    
    status = "✅ PASS" if is_passing else "❌ FAIL"
    
    print(f"[{status}] {name}: Array={arr}, Target={target}, Expected={expected}, Actual={result}")
    return is_passing


# --- Test Cases ---
tests = [
    ("Test 1:", [10, 20, 30, 40, 50], 30, 2), 
    

    ("Test 2:", [10, 20, 30, 40, 50], 50, 4),
    

    ("Test 3:", [10, 20, 30], 40, -1),
    

    ("Test 4:", [10, 20, 30, 40, 50], 20, 1),
    

    ("Test 5:", [10, 20, 30], 10, 0),
]

for name, arr, target, expected in tests:
    run_test(name, arr, target, expected)

`,

  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Sample Java code for competitive programming
        
        // Your solution here
        System.out.println("Hello from Java!");
        
    }
}`,
}

export function CodeEditor({ onCodeExecuted }: { onCodeExecuted?: (output: string, code: string) => void }) {
  const [language, setLanguage] = useState<"cpp" | "python" | "java">("cpp")
  const [code, setCode] = useState(SAMPLE_CODE.cpp)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionOutput, setExecutionOutput] = useState<string>("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleLanguageChange = (newLang: "cpp" | "python" | "java") => {
    setLanguage(newLang)
    setCode(SAMPLE_CODE[newLang])
  }

  const updateCursorPosition = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const text = textarea.value.substring(0, textarea.selectionStart)
      const lines = text.split("\n")
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      setCursorPosition({ line, column })
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
        // setExecutionOutput(result.output || "Code executed successfully")
        const output = result.output || "Code executed successfully"
        setExecutionOutput(output)
        onCodeExecuted?.(output, code)
      } else {
        // setExecutionOutput(`Error: ${result.error || "Unknown error"}`)
        const errorMsg = `Error: ${result.error || "Unknown error"}`
        setExecutionOutput(errorMsg)
        onCodeExecuted?.(errorMsg, code)
      }
    } catch (error) {
      console.error("[v0] Execution error:", error)
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

      {/* Editor Area */}
      <div className="flex-1 overflow-auto p-4">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyUp={updateCursorPosition}
          onClick={updateCursorPosition}
          className="w-full h-full bg-transparent text-foreground font-mono text-sm resize-none outline-none leading-relaxed"
          spellCheck={false}
          style={{
            tabSize: 4,
            caretColor: "#f5daa7",
          }}
        />
      </div>

      {/* Execution Output Display */}
      {/* {executionOutput && (
        <div className="border-t border-border bg-muted p-3">
          <div className="text-xs font-semibold text-foreground mb-1">Output:</div>
          <pre className="text-xs text-foreground font-mono whitespace-pre-wrap">{executionOutput}</pre>
        </div>
      )} */}

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
