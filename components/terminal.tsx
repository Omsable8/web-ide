"use client"
import { useState, useRef, useEffect } from "react"
import { TerminalIcon, X, Maximize2, Wifi, WifiOff, Plug, Plug2 as PlugX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { connectSSH, disconnectSSH, checkSSHStatus } from "@/lib/api"

export function Terminal({ outputContext }: { outputContext?: string }) {
  const [output, setOutput] = useState<string[]>([
    "$ Welcome to CodeIDE Terminal",
    "$ Click 'Connect' to establish SSH connection",
    "",
  ])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if (outputContext) {
      setOutput((prev) => [
        ...prev,
        "",
        "$ --- Code Output ---",
        ...outputContext.split("\n"),
        "$ --- End Output ---",
        "",
      ])
    }
  }, [outputContext])
  
  useEffect(() => {
    const checkStatus = async () => {
      const status = await checkSSHStatus()
      setIsConnected(status.connected)
      if (status.connected) {
        setOutput((prev) => [...prev, `$ Connected to ${status.username}@${status.hostname}`])
      }
    }
    checkStatus()
  }, [])

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleConnect = async () => {
    setIsConnecting(true)
    setOutput((prev) => [...prev, "$ Connecting to remote server..."])

    const result = await connectSSH()

    if (result.success) {
      setIsConnected(true)
      setOutput((prev) => [...prev, `$ ${result.message}`, "$ SSH connection established successfully"])
    } else {
      setOutput((prev) => [...prev, `$ Error: ${result.error}`])
    }

    setIsConnecting(false)
  }

  const handleDisconnect = async () => {
    const result = await disconnectSSH()

    if (result.success) {
      setIsConnected(false)
      setOutput((prev) => [...prev, `$ ${result.message}`])
    } else {
      setOutput((prev) => [...prev, `$ Error: ${result.error}`])
    }
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-terminal-bg)]">
      {/* Terminal Header */}
      <div className="h-10 border-b border-border bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium text-foreground">Terminal</span>
          {isConnected ? <Wifi className="w-3 h-3 text-green-500" /> : <WifiOff className="w-3 h-3 text-red-500" />}
          <span className="text-xs text-muted-foreground">{isConnected ? "Connected" : "Disconnected"}</span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={isConnected ? handleDisconnect : handleConnect}
            disabled={isConnecting}
          >
            {isConnected ? (
              <>
                <PlugX className="w-3 h-3 mr-1" />
                Disconnect
              </>
            ) : (
              <>
                <Plug className="w-3 h-3 mr-1" />
                Connect
              </>
            )}
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Terminal Content */}
      <div ref={terminalRef} className="flex-1 overflow-auto p-4 font-mono text-sm">
        {output.map((line, i) => (
          <div key={i} className={line.startsWith("$") ? "text-accent" : "text-foreground"}>
            {line}
          </div>
        ))}
      </div>
    </div>
  )
}
