"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Send, Sparkles, Loader2 } from "lucide-react"
import { sendChatMessage } from "@/lib/api"

interface Message {
  role: "user" | "assistant"
  content: string
}

export function AIChatbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm your AI programming assistant. I can help you debug code, understand test cases, and learn DSA concepts. What would you like to work on?",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage({ message: input })

      const aiMessage: Message = {
        role: "assistant",
        content: response.response,
      }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, I encountered an error. Please make sure the Flask backend is running on http://localhost:5000",
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="h-12 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">AI Assistant</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onClose}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </Button>
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
              {msg.content}
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

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about debugging, test cases, or DSA..."
            className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
            disabled={isLoading}
          />
          <Button
            size="sm"
            onClick={handleSend}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </>
  )
}
