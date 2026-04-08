'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, StepForward, Play, Square, GitCommit, LayoutGrid, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface VisualDebuggerProps {
  isOpen: boolean
  onClose: () => void
  debugState: any
  onStepOver: () => void
  onStepInto: () => void
  onStepOut: () => void
  onStop: () => void
  isRunning: boolean
}

export function VisualDebugger({
  isOpen,
  onClose,
  debugState,
  onStepOver,
  onStepInto,
  onStepOut,
  onStop,
  isRunning,
}: VisualDebuggerProps) {
  const [debugHeight, setDebugHeight] = useState(400)

  // Parsing logic for your flattened backend strings
  const getStructureType = (val: string) => {
    if (typeof val !== 'string') return 'primitive'
    const trimmed = val.trim()
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) return 'matrix'
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) return 'array'
    return 'primitive'
  }

  const parseArray = (val: string) => {
    return val
      .replace(/[\[\]]/g, '')
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== "")
  }

  const handleResize = (e: React.MouseEvent) => {
    e.preventDefault()
    const startY = e.clientY
    const startHeight = debugHeight
    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY
      setDebugHeight(Math.max(200, Math.min(800, startHeight + delta)))
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  if (!isOpen) return null

  return (
    <div 
      className="w-full bg-slate-950 border-t border-slate-800 shadow-2xl z-40 flex flex-col overflow-hidden relative"
      style={{ height: `${debugHeight}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleResize}
        className="h-1.5 w-full bg-slate-800 hover:bg-blue-500 cursor-row-resize transition-colors absolute top-0"
      />

      {/* Control Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-900/80 border-b border-slate-800 mt-1">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${debugState.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-xs font-bold uppercase tracking-tighter text-slate-400">Visual Debugger</span>
          </div>
          {debugState.line && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs border border-blue-500/30 font-mono">
              Line {debugState.line}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onStepOver} disabled={!isRunning} className="h-8 border-slate-700 hover:bg-slate-800 text-slate-300">
            <StepForward className="w-4 h-4 mr-1" /> Step
          </Button>
          <Button size="sm" onClick={onStop} variant="destructive" className="h-8 bg-rose-600 hover:bg-rose-500">
            Stop
          </Button>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-slate-500 hover:text-white ml-2">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Visualization Canvas */}
      <div className="flex-1 overflow-x-auto p-8 flex items-start gap-10 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px]">
        <AnimatePresence mode="popLayout">
          {Object.entries(debugState.variables || {}).map(([name, value]: [string, any]) => {
            const type = getStructureType(value)
            return (
              <motion.div
                key={name}
                layout
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex flex-col gap-3 min-w-[140px]"
              >
                <div className="flex items-center gap-2 px-1">
                  {type === 'array' ? <GitCommit className="w-3.5 h-3.5 text-emerald-400" /> : 
                   type === 'matrix' ? <LayoutGrid className="w-3.5 h-3.5 text-amber-400" /> : 
                   <Square className="w-3.5 h-3.5 text-blue-400" />}
                  <span className="text-xs font-mono font-bold text-slate-300 tracking-tight">{name}</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700 shadow-xl backdrop-blur-sm">
                  {type === 'array' && (
                    <div className="flex gap-1.5 flex-wrap max-w-[300px]">
                      {parseArray(value).map((item, i) => (
                        <motion.div
                          key={`${name}-${i}`}
                          layoutId={`${name}-${i}`}
                          className="w-10 h-10 flex items-center justify-center bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 font-mono text-sm shadow-inner"
                        >
                          {item}
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {type === 'primitive' && (
                    <div className="text-blue-400 font-mono text-lg font-medium px-2">
                      {String(value)}
                    </div>
                  )}

                  {type === 'matrix' && (
                    <div className="p-2 bg-amber-500/5 rounded border border-amber-500/20">
                      <pre className="text-amber-400 font-mono text-[10px] leading-tight whitespace-pre-wrap">
                        {value.replace(/\],/g, '],\n')}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
        
        {Object.keys(debugState.variables || {}).length === 0 && (
          <div className="flex items-center justify-center w-full h-full text-slate-600 font-mono text-sm italic">
            Waiting for execution to hit a breakpoint...
          </div>
        )}
      </div>

      {/* Footer Info Strip */}
      <div className="h-10 bg-black/60 border-t border-slate-800 px-6 flex items-center gap-4 flex-shrink-0">
        <Terminal className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Console Output</span>
        <span className="text-xs font-mono text-slate-400 truncate max-w-2xl">
          {debugState.output?.split('\n') || 'Ready...'}
        </span>
      </div>
    </div>
  )
}