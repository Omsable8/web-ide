'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CodeEditor } from '@/components/code-editor'
import { Terminal } from '@/components/terminal'
import { AIChatbot } from '@/components/ai-chatbot'
import { ShortcutsGuide } from '@/components/shortcuts-guide'
import { Button } from '@/components/ui/button'
import { Keyboard, MessageSquare, Code2, Home } from 'lucide-react'

export default function CodePage() {
  const [terminalHeight, setTerminalHeight] = useState(250)
  const [chatbotWidth, setChatbotWidth] = useState(384)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showChatbot, setShowChatbot] = useState(true)
  const [codeContext, setCodeContext] = useState<string>('')
  const [outputContext, setOutputContext] = useState<string>('')

  const handleCodeExecuted = (output: string, code: string) => {
    setOutputContext(output)
    setCodeContext(code)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Header */}
      <header className="h-12 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Home className="w-5 h-5 text-accent" />
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </Link>
          <div className="w-px h-6 bg-border" />
          <Code2 className="w-6 h-6 text-accent" />
          <h1 className="text-lg font-semibold text-accent">Practice Code</h1>
          <span className="text-xs text-muted-foreground">Blank IDE for Free Practice</span>
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

      {/* Main Content - Editor, Terminal, and Chatbot */}
      <div className="flex-1 flex overflow-hidden gap-1 p-1 bg-background">
        {/* Left: Editor and Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <CodeEditor onCodeExecuted={handleCodeExecuted} />

          {/* Resizable Terminal */}
          <div
            onMouseDown={(e) => {
              const startY = e.clientY
              const startHeight = terminalHeight

              const handleMouseMove = (e: MouseEvent) => {
                const delta = startY - e.clientY
                setTerminalHeight(Math.max(150, startHeight + delta))
              }

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
              }

              document.addEventListener('mousemove', handleMouseMove)
              document.addEventListener('mouseup', handleMouseUp)
            }}
            className="h-1 bg-border hover:bg-accent cursor-row-resize transition-colors"
          />

          <Terminal height={terminalHeight} />
        </div>

        {/* Resizable Divider */}
        <div
          onMouseDown={(e) => {
            const startX = e.clientX
            const startWidth = chatbotWidth

            const handleMouseMove = (e: MouseEvent) => {
              const delta = e.clientX - startX
              setChatbotWidth(Math.max(300, Math.min(800, startWidth - delta)))
            }

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove)
              document.removeEventListener('mouseup', handleMouseUp)
            }

            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
          }}
          className="w-1 bg-border hover:bg-accent cursor-col-resize transition-colors"
        />

        {/* Right: Chatbot */}
        {showChatbot && (
          <div style={{ width: `${chatbotWidth}px` }} className="flex flex-col overflow-hidden">
            <AIChatbot onClose={() => setShowChatbot(false)} codeContext={codeContext} outputContext={outputContext} />
          </div>
        )}
      </div>

      {/* Modals */}
      {showShortcuts && <ShortcutsGuide onClose={() => setShowShortcuts(false)} />}
    </div>
  )
}
