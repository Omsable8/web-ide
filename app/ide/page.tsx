"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { AIChatbot } from "@/components/ai-chatbot"
import { ShortcutsGuide } from "@/components/shortcuts-guide"
import { Button } from "@/components/ui/button"
import { Keyboard, MessageSquare, Code2 } from "lucide-react"

export default function WebIDE() {
  const [terminalHeight, setTerminalHeight] = useState(250)
  const [chatbotWidth, setChatbotWidth] = useState(384)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showChatbot, setShowChatbot] = useState(true)
  const [codeContext, setCodeContext] = useState<string>("")
  const [outputContext, setOutputContext] = useState<string>("")

  const handleCodeExecuted = (output: string, code: string) => {
    setOutputContext(output)
    setCodeContext(code)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-semibold text-accent">CodeIDE</h1>
          <span className="text-xs text-muted-foreground">Competitive Programming Environment</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChatbot(!showChatbot)}
            className="text-foreground hover:text-accent"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Assistant
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcuts(true)}
            className="text-foreground hover:text-accent"
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Shortcuts
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 overflow-hidden" style={{ height: `calc(100% - ${terminalHeight}px)` }}>
            <CodeEditor onCodeExecuted={handleCodeExecuted} />
          </div>

          {/* Resizer */}
          <div
            className="h-1 bg-border hover:bg-primary cursor-row-resize transition-colors"
            onMouseDown={(e) => {
              e.preventDefault()
              const startY = e.clientY
              const startHeight = terminalHeight

              const handleMouseMove = (e: MouseEvent) => {
                const delta = startY - e.clientY
                const newHeight = Math.max(100, Math.min(600, startHeight + delta))
                setTerminalHeight(newHeight)
              }

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
              }

              document.addEventListener("mousemove", handleMouseMove)
              document.addEventListener("mouseup", handleMouseUp)
            }}
          />

          {/* Terminal */}
          {/* <div className="overflow-hidden" style={{ height: `${terminalHeight}px` }}>
            <Terminal outputContext={outputContext} />
          </div> */}
        </div>

        {/* Resizer for chatbot */}
        {showChatbot && (
          <div
            className="w-1 bg-border hover:bg-primary cursor-col-resize transition-colors"
            onMouseDown={(e) => {
              e.preventDefault()
              const startX = e.clientX
              const startWidth = chatbotWidth

              const handleMouseMove = (e: MouseEvent) => {
                const delta = startX - e.clientX
                const newWidth = Math.max(300, Math.min(800, startWidth + delta))
                setChatbotWidth(newWidth)
              }

              const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
              }

              document.addEventListener("mousemove", handleMouseMove)
              document.addEventListener("mouseup", handleMouseUp)
            }}
          />
        )}

        {/* AI Chatbot Sidebar */}
        {showChatbot && (
          <div className="border-l border-border bg-card flex flex-col" style={{ width: `${chatbotWidth}px` }}>
            <AIChatbot onClose={() => setShowChatbot(false)} codeContext={codeContext} outputContext={outputContext} />
          </div>
        )}
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && <ShortcutsGuide onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
