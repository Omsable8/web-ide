"use client"

import { useState } from "react"
import { CodeEditor } from "@/components/code-editor"
import { Terminal } from "@/components/terminal"
import { AIChatbot } from "@/components/ai-chatbot"
import { ShortcutsGuide } from "@/components/shortcuts-guide"
import { Button } from "@/components/ui/button"
import { Keyboard, MessageSquare, Code2 } from "lucide-react"

export default function WebIDE() {
  const [terminalHeight, setTerminalHeight] = useState(250)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showChatbot, setShowChatbot] = useState(true)

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
            <CodeEditor />
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
          <div className="overflow-hidden" style={{ height: `${terminalHeight}px` }}>
            <Terminal />
          </div>
        </div>

        {/* AI Chatbot Sidebar */}
        {showChatbot && (
          <div className="w-96 border-l border-border bg-card flex flex-col">
            <AIChatbot onClose={() => setShowChatbot(false)} />
          </div>
        )}
      </div>

      {/* Shortcuts Modal */}
      {showShortcuts && <ShortcutsGuide onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
