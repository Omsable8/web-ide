"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Send, Sparkles, Loader2, ChevronDown } from "lucide-react"
import { sendChatMessage, setAIModel, updateFeaturesUsed } from "@/lib/api"
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
  role: "user" | "assistant"
  content: string
}

type ChatMode = "chat" | "explain-failure" | "analyze" | "clear"

export function AIChatbot({
  onClose,
  codeContext,
  outputContext,
}: {
  onClose?: () => void
  codeContext?: string
  outputContext?: string
}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI programming assistant. I can help you debug code, understand test cases, and learn DSA concepts. What would you like to work on?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedModel, setSelectedModel] = useState("openai/gpt-oss-20b:free")
  const [aiUsed, setAiUsed] = useState<number>(0) // 0-1: 0=never, 1=used
  const [chatMode, setChatMode] = useState<ChatMode>("chat")
  const [showModeMenu, setShowModeMenu] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)

  const handleModelChange = async (model: string) => {
    setSelectedModel(model)
    setShowModelMenu(false)
    try {
      await setAIModel(model)
    } catch (error) {
      console.error("[v0] Failed to set model:", error)
    }
  }

  const handleModeChange = (mode: ChatMode) => {
    if (mode === "clear") {
      setMessages([
        {
          role: "assistant",
          content:
            "Hi! I'm your AI programming assistant. I can help you debug code, understand test cases, and learn DSA concepts. What would you like to work on?",
        },
      ])
    } else {
      setChatMode(mode)
    }
    setShowModeMenu(false)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage({
        uid: localStorage.getItem('uid') || '',
        pid: sessionStorage.getItem('problemID')||'',
        message: input,
        code: codeContext,
        error: outputContext,
      })

      const aiMessage: Message = {
        role: "assistant",
        content: response.response,
      }
      setMessages((prev) => [...prev, aiMessage])
      updateFeaturesUsed(localStorage.getItem('uid')||'', sessionStorage.getItem('problemID')||'', {ai_used:1},{ai_used:aiUsed})
      setAiUsed(1)
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please make sure the Flask backend is running on http://localhost:5002",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-card/30 rounded-lg border border-border">
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI Assistant</span>
        </div>
        {onClose && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-foreground rounded-lg p-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border p-4 space-y-3 flex-shrink-0">
        {/* Context Display */}
        {(codeContext || outputContext) && (
          <div className="bg-muted/50 border border-border rounded p-2 text-xs text-muted-foreground">
            <div className="font-semibold mb-1">Context:</div>
            {codeContext && <div className="truncate">Code: {codeContext.substring(0, 50)}...</div>}
            {outputContext && <div className="truncate">Output: {outputContext.substring(0, 50)}...</div>}
          </div>
        )}

        {/* Input Controls */}
        <div className="flex gap-2">
          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2 text-xs bg-transparent"
              onClick={() => setShowModeMenu(!showModeMenu)}
            >
              {chatMode}
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            {showModeMenu && (
              <div className="absolute bottom-full mb-1 left-0 bg-card border border-border rounded shadow-lg z-10">
                {(["chat", "clear"] as ChatMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleModeChange(mode)}
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-muted text-foreground"
                  >
                    {mode}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input field */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about debugging, test cases, or DSA..."
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />

          <div className="relative">
            <Button
              size="sm"
              variant="outline"
              className="h-9 px-2 text-xs bg-transparent"
              onClick={() => setShowModelMenu(!showModelMenu)}
            >
              Model
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            {showModelMenu && (
              <div className="absolute bottom-full mb-1 right-0 bg-card border border-border rounded shadow-lg z-10 min-w-max">
                <button
                  onClick={() => handleModelChange("openai/gpt-oss-20b:free")}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-muted text-foreground"
                >
                  openai/gpt-oss
                </button>
                {/* <button
                  onClick={() => handleModelChange("google/gemma-3-27b-it:free")}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-muted text-foreground"
                  >
                  google/gemma-3-27b-it
                </button> */}
                <button
                  onClick={() => handleModelChange("stepfun/step-3.5-flash:free")}
                  className="block w-full text-left px-3 py-2 text-xs hover:bg-muted text-foreground"
                  >
                  stepfun/step-3.5-flash
                </button>
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            size="sm"
            onClick={handleSend}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-9"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
