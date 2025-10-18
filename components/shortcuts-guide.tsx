"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

const shortcuts = [
  {
    category: "Editor - Line Operations",
    items: [
      { keys: ["Alt", "Shift", "↓"], description: "Copy line down" },
      { keys: ["Alt", "Shift", "↑"], description: "Copy line up" },
      { keys: ["Alt", "↓"], description: "Move line down" },
      { keys: ["Alt", "↑"], description: "Move line up" },
      { keys: ["Ctrl", "Shift", "K"], description: "Delete line" },
      { keys: ["Ctrl", "Enter"], description: "Insert line below" },
      { keys: ["Ctrl", "Shift", "Enter"], description: "Insert line above" },
    ],
  },
  {
    category: "Editor - Selection",
    items: [
      { keys: ["Ctrl", "Shift", "←"], description: "Select word left" },
      { keys: ["Ctrl", "Shift", "→"], description: "Select word right" },
      { keys: ["Shift", "←"], description: "Select left" },
      { keys: ["Shift", "→"], description: "Select right" },
      { keys: ["Ctrl", "Alt", "↓"], description: "Add cursor below" },
      { keys: ["Ctrl", "Alt", "↑"], description: "Add cursor above" },
      { keys: ["Ctrl", "D"], description: "Select next occurrence" },
      { keys: ["Ctrl", "A"], description: "Select all" },
    ],
  },
  {
    category: "Editor - Text Manipulation",
    items: [
      { keys: ["Ctrl", "U"], description: "Transform to uppercase" },
      { keys: ["Ctrl", "Shift", "U"], description: "Transform to lowercase" },
      { keys: ["Ctrl", "/"], description: "Toggle line comment" },
      { keys: ["Ctrl", "Shift", "/"], description: "Toggle block comment" },
      { keys: ["Tab"], description: "Indent" },
      { keys: ["Shift", "Tab"], description: "Outdent" },
      { keys: ["Ctrl", "X"], description: "Cut line (empty selection)" },
      { keys: ["Ctrl", "C"], description: "Copy line (empty selection)" },
    ],
  },
  {
    category: "Editor - Navigation",
    items: [
      { keys: ["Ctrl", "F"], description: "Find" },
      { keys: ["Ctrl", "H"], description: "Replace" },
      { keys: ["Ctrl", "G"], description: "Go to line" },
      { keys: ["Ctrl", "Home"], description: "Go to beginning of file" },
      { keys: ["Ctrl", "End"], description: "Go to end of file" },
      { keys: ["Ctrl", "←"], description: "Move cursor word left" },
      { keys: ["Ctrl", "→"], description: "Move cursor word right" },
    ],
  },
  {
    category: "File Operations",
    items: [
      { keys: ["Ctrl", "S"], description: "Save file" },
      { keys: ["Ctrl", "Shift", "S"], description: "Save as" },
      { keys: ["Ctrl", "N"], description: "New file" },
      { keys: ["Ctrl", "O"], description: "Open file" },
    ],
  },
  {
    category: "IDE Navigation",
    items: [
      { keys: ["Ctrl", "B"], description: "Toggle AI chatbot" },
      { keys: ["Ctrl", "`"], description: "Toggle terminal" },
      { keys: ["Ctrl", "K"], description: "Show shortcuts" },
      { keys: ["F5"], description: "Run code" },
    ],
  },
  {
    category: "Terminal",
    items: [
      { keys: ["Ctrl", "C"], description: "Cancel command" },
      { keys: ["Ctrl", "L"], description: "Clear terminal" },
      { keys: ["↑"], description: "Previous command" },
      { keys: ["↓"], description: "Next command" },
      { keys: ["Tab"], description: "Auto-complete" },
    ],
  },
]

export function ShortcutsGuide({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card border border-border rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-border flex items-center justify-between px-6 bg-card">
          <h2 className="text-lg font-semibold text-card-foreground">Keyboard Shortcuts</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-card-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(85vh-7rem)] bg-card">
          <div className="space-y-6">
            {shortcuts.map((section) => (
              <div key={section.category}>
                <h3 className="text-sm font-semibold text-accent mb-3 uppercase tracking-wide">{section.category}</h3>
                <div className="space-y-2">
                  {section.items.map((shortcut, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted transition-colors"
                    >
                      <span className="text-sm text-card-foreground">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, j) => (
                          <span key={j} className="flex items-center gap-1">
                            <kbd className="px-2 py-1 text-xs font-mono bg-secondary text-secondary-foreground rounded border border-border shadow-sm min-w-[2rem] text-center">
                              {key}
                            </kbd>
                            {j < shortcut.keys.length - 1 && <span className="text-muted-foreground">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-border flex items-center justify-center px-6 bg-card">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 text-xs font-mono bg-muted rounded border border-border">Esc</kbd> to
            close
          </p>
        </div>
      </div>
    </div>
  )
}
