"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Save, Download, Loader2 } from "lucide-react"
import { executeCode } from "@/lib/api"

const SAMPLE_CODE = {
  cpp: `#include <iostream>

// Structure for a tree node
struct Node {
    int data;
    Node* left;
    Node* right;

    Node(int val) : data(val), left(nullptr), right(nullptr) {}
};

Node* insert(Node* root, int data) {
    if (root == nullptr) {
        return new Node(data);
    }
    if (data < root->data) {
        root->left = insert(root->left, data);
    } else if (data > root->data) {
        root->right = insert(root->right, data);
    }
    return root;
}

Node* search(Node* node, int key) {

    if (key == node->data) {
        return node;
    }

    if (node == nullptr) { 
        return nullptr;
    }

    if (key < node->data) {
        return search(node->left, key);
    } else {
        return search(node->right, key);
    }
}

void run_test(const std::string& name, Node* root, int target) {
    std::cout << name << ": Searching for " << target << "..." << std::endl;
    Node* result = search(root, target);

    if (result != nullptr) {
        std::cout << "  ✅ PASS: Element found at address " << result << std::endl;
    } else {
        std::cout << "  ✅ PASS: Element not found (Correctly returned nullptr)" << std::endl;
    }
}

// Cleanup function to avoid memory leaks
void delete_tree(Node* node) {
    if (node != nullptr) {
        delete_tree(node->left);
        delete_tree(node->right);
        delete node;
    }
}

int main() {
    Node* root = nullptr;
    root = insert(root, 10);
    insert(root, 5);
    insert(root, 15);
    insert(root, 2);
    insert(root, 7);
    
    // --- Test Cases ---

    run_test("Test 1", root, 10);

    run_test("Test 2", root, 6);

    delete_tree(root);

    return 0;
}
`,
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
      {/* {executionOutput && (
        <div className="border-t border-border bg-muted p-3 max-h-32 overflow-y-auto">
          <div className="text-xs font-semibold text-foreground mb-1">--- Code Output ---</div>
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
