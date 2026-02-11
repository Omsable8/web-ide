'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { X, Play, Pause, StepForward, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

interface DebugWindowProps {
  isOpen: boolean
  onClose: () => void
  debugState: {
    line: number | null
    variables: Record<string, string>
    output: string
    stack: any[]
    isConnected: boolean
  }
  onStepOver: () => void
  onStepInto: () => void
  onStepOut: () => void
  onStop: () => void
  isRunning: boolean
}

export function DebugWindow({
  isOpen,
  onClose,
  debugState,
  onStepOver,
  onStepInto,
  onStepOut,
  onStop,
  isRunning,
}: DebugWindowProps) {
  const [expandedSections, setExpandedSections] = useState({
    variables: true,
    stack: true,
    output: true,
  })

  const toggleSection = (section: 'variables' | 'stack' | 'output') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  if (!isOpen) return null

  return (
    <div className="w-full h-80 bg-background border-t border-border shadow-lg z-40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${debugState.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-semibold">Debug Console</span>
          <span className="text-xs text-muted-foreground ml-2">
            {debugState.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {debugState.line !== null && (
            <span className="text-xs text-accent ml-4">Line {debugState.line}</span>
          )}
        </div>

        {/* Debug Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onStepOver}
            disabled={!isRunning}
            className="gap-2"
            title="Step Over (F10)"
          >
            <StepForward className="w-4 h-4" />
            Step Over
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onStepInto}
            disabled={!isRunning}
            className="gap-2"
            title="Step Into (F11)"
          >
            <ChevronRight className="w-4 h-4" />
            Step Into
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onStepOut}
            disabled={!isRunning}
            className="gap-2"
            title="Step Out (Shift+F11)"
          >
            <ChevronUp className="w-4 h-4" />
            Step Out
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onStop}
            disabled={!isRunning}
            className="gap-2 text-red-400 hover:text-red-500"
            title="Stop Debugging"
          >
            <Pause className="w-4 h-4" />
            Stop
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
            className="ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        {/* Local Variables Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('variables')}
            className="w-full flex items-center gap-2 p-3 hover:bg-accent/5 transition"
          >
            {expandedSections.variables ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">Local Variables</span>
            {debugState.line !== null && (
              <span className="text-xs text-muted-foreground ml-2">Line {debugState.line}</span>
            )}
          </button>

          {expandedSections.variables && (
            <div className="px-4 py-2 bg-background/50">
              {Object.entries(debugState.variables).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 mb-1">
                  {/* Variable Name: Keep it distinct */}
                  <span className="text-blue-400 font-medium shrink-0">{key}:</span>

                  {/* Variable Value: Allow it to wrap to the next line if it's long */}
                  <span className="text-green-400 break-all whitespace-pre-wrap">
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Call Stack Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('stack')}
            className="w-full flex items-center gap-2 p-3 hover:bg-accent/5 transition"
          >
            {expandedSections.stack ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">Call Stack</span>
          </button>

          {expandedSections.stack && (
            <div className="px-4 py-2 bg-background/50">
              <div className="text-xs text-muted-foreground italic">
                {debugState.line !== null ? (
                  <div>
                    <div>main() at line {debugState.line}</div>
                  </div>
                ) : (
                  'No call stack'
                )}
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="border-b border-border">
          <button
            onClick={() => toggleSection('output')}
            className="w-full flex items-center gap-2 p-3 hover:bg-accent/5 transition"
          >
            {expandedSections.output ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <span className="text-sm font-semibold">Output</span>
          </button>

          {expandedSections.output && (
            <div className="px-4 py-2 bg-background/50 font-mono text-xs max-h-32 overflow-y-auto">
              {debugState.output ? (
                <pre className="text-muted-foreground whitespace-pre-wrap break-words">
                  {debugState.output}
                </pre>
              ) : (
                <div className="text-muted-foreground italic">No output yet</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
