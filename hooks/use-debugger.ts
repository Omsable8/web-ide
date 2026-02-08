import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Enhanced debugger state with debugging
 */
interface DebugState {
  // Execution state
  isConnected: boolean;
  isRunning: boolean;
  isPaused: boolean;
  
  // Current position
  line: number | null;
  column: number | null;
  function: string | null;
  
  // Variables (simplified format: name -> value)
  variables: Record<string, string>;
  
  // Call stack
  stack: StackFrame[];
  
  // Output (accumulated)
  output: string;
  
  // Error state
  error: string | null;
  
  // Debug info
  port: number | null;
}

interface StackFrame {
  id: number;
  name: string;
  line: number;
  column: number;
  source?: {
    path: string;
  };
}

interface UseDebuggerOptions {
  serverUrl?: string;
  autoConnect?: boolean;
  onOutput?: (output: string, category: 'stdout' | 'stderr') => void;
  onStopped?: (reason: string, line: number) => void;
  onTerminated?: () => void;
  debug?: boolean;
}

const DEFAULT_SERVER_URL = process.env.NEXT_PUBLIC_API_DEBUG_URL || "http://192.168.0.107:5003";

export const useDebugger = (options: UseDebuggerOptions = {}) => {
  const {
    serverUrl = DEFAULT_SERVER_URL,
    autoConnect = false,
    onOutput,
    onStopped,
    onTerminated,
    debug = true,
  } = options;

  const [debugState, setDebugState] = useState<DebugState>({
    isConnected: false,
    isRunning: false,
    isPaused: false,
    line: null,
    column: null,
    function: null,
    variables: {},
    stack: [],
    output: '',
    error: null,
    port: null,
  });

  const socketRef = useRef<Socket | null>(null);

  const log = (msg: string) => {
    if (debug) {
      console.log(`[DEBUGGER-HOOK] ${msg}`);
    }
  };

  useEffect(() => {
    log('Initializing socket connection...');
    
    // Initialize socket connection
    socketRef.current = io(serverUrl, {
      transports: ['websocket'],
      autoConnect,
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      log('✓ Connected to debug server');
      setDebugState(prev => ({ 
        ...prev, 
        isConnected: true,
        error: null 
      }));
    });

    socket.on('disconnect', (reason) => {
      log(`✗ Disconnected: ${reason}`);
      setDebugState(prev => ({ 
        ...prev, 
        isConnected: false,
        isRunning: false,
        isPaused: false 
      }));
    });

    socket.on('connected', (data: any) => {
      log(`Server ready: ${JSON.stringify(data)}`);
    });

    // Debug session events
    socket.on('debug_started', (data: any) => {
      log(`Session started: port=${data.port}`);
      setDebugState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
        error: null,
        output: '',
        port: data.port,
      }));
    });

    socket.on('debug_output', (data: { output: string; category: string }) => {
      const outputText = data.output;
      log(`Output (${data.category}): ${outputText.substring(0, 50)}...`);
      
      setDebugState(prev => ({
        ...prev,
        output: prev.output + outputText,
      }));
      
      if (onOutput) {
        onOutput(outputText, data.category as 'stdout' | 'stderr');
      }
    });

    socket.on('debug_stopped', (data: {
      reason: string;
      line: number;
      column: number;
      function: string;
      variables: Record<string, string>;
      stack: StackFrame[];
    }) => {
      log(`*** STOPPED at line ${data.line} (${data.reason}) ***`);
      log(`Variables: ${Object.keys(data.variables).length}`);
      log(`Stack frames: ${data.stack.length}`);
      
      // Log variables for debugging
      if (debug) {
        console.log('Variables:', data.variables);
        console.log('Stack:', data.stack);
      }
      
      setDebugState(prev => ({
        ...prev,
        isRunning: false,
        isPaused: true,
        line: data.line,
        column: data.column,
        function: data.function,
        variables: data.variables || {},
        stack: data.stack || [],
      }));
      
      if (onStopped) {
        onStopped(data.reason, data.line);
      }
    });

    socket.on('debug_continued', () => {
      log('*** CONTINUED ***');
      setDebugState(prev => ({
        ...prev,
        isRunning: true,
        isPaused: false,
      }));
    });

    socket.on('debug_terminated', (data: any) => {
      log(`*** TERMINATED: ${data.status} ***`);
      setDebugState(prev => ({
        ...prev,
        isConnected:false,
        isRunning: false,
        isPaused: false,
        line: null,
        variables: {},
        stack: [],
      }));
      
      if (onTerminated) {
        onTerminated();
      }
    });

    socket.on('debug_error', (data: { error: string }) => {
      log(`ERROR: ${data.error}`);
      console.error('[Debugger Error]', data.error);
      
      setDebugState(prev => ({
        ...prev,
        error: data.error,
        isRunning: false,
        isPaused: false,
      }));
    });

    socket.on('variables_update', (data: { variables: Record<string, string> }) => {
      log(`Variables updated: ${Object.keys(data.variables).length}`);
      setDebugState(prev => ({
        ...prev,
        variables: data.variables,
      }));
    });

    socket.on('stack_trace_update', (data: { stack: StackFrame[] }) => {
      log(`Stack trace updated: ${data.stack.length} frames`);
      setDebugState(prev => ({
        ...prev,
        stack: data.stack,
      }));
    });

    socket.on('breakpoints_updated', (data: { breakpoints: number[] }) => {
      log(`Breakpoints updated: ${data.breakpoints}`);
    });

    socket.on('evaluation_result', (data: { expression: string; result: string }) => {
      log(`Evaluation: ${data.expression} = ${data.result}`);
    });

    // Force disconnect event from server
    socket.on('force_disconnect', () => {
      log('Server requested disconnect');
      socket.disconnect();
    });

    // Cleanup on unmount
    return () => {
      log('Cleaning up socket connection');
      socket.disconnect();
    };
  }, [serverUrl, autoConnect, onOutput, onStopped, onTerminated, debug]);

  // === Control Functions ===

  const connect = useCallback(() => {
    log('Manual connect requested');
    if (!socketRef.current?.connected) {
      socketRef.current?.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    log('Manual disconnect requested');
    socketRef.current?.disconnect();
  }, []);

  const startDebugger = useCallback((
    code: string,
    language: 'python' | 'java' | 'cpp'|string,
    breakpoints: number[] = [],
    input?: string
  ) => {
    log('=== START DEBUGGER ===');
    log(`Language: ${language}`);
    log(`Breakpoints: ${breakpoints}`);
    log(`Code length: ${code.length}`);
    
    if (!socketRef.current?.connected) {
      log('Not connected, connecting first...');
      socketRef.current?.connect();
    }

    // Reset state
    setDebugState(prev => ({
      ...prev,
      line: null,
      column: null,
      function: null,
      variables: {},
      stack: [],
      output: '',
      error: null,
      isRunning: false,
      isPaused: false,
    }));

    // Emit start command
    log('Emitting start_debug event...');
    socketRef.current?.emit('start_debug', {
      code,
      language,
      breakpoints,
      input: input || '',
    });
  }, []);

  const continueExecution = useCallback(() => {
    log('Continue execution requested');
    socketRef.current?.emit('continue');
  }, []);

  const stepOver = useCallback(() => {
    log('Step over requested');
    socketRef.current?.emit('step_over');
  }, []);

  const stepInto = useCallback(() => {
    log('Step into requested');
    socketRef.current?.emit('step_into');
  }, []);

  const stepOut = useCallback(() => {
    log('Step out requested');
    socketRef.current?.emit('step_out');
  }, []);

  const setBreakpoints = useCallback((breakpoints: number[]) => {
    log(`Set breakpoints: ${breakpoints}`);
    socketRef.current?.emit('set_breakpoints', { breakpoints });
  }, []);

  const evaluateExpression = useCallback((expression: string) => {
    log(`Evaluate: ${expression}`);
    socketRef.current?.emit('evaluate', { expression });
  }, []);

  const getVariables = useCallback(() => {
    log('Get variables requested');
    socketRef.current?.emit('get_variables');
  }, []);

  const getStackTrace = useCallback(() => {
    log('Get stack trace requested');
    socketRef.current?.emit('get_stack_trace');
  }, []);

  const stopDebugger = useCallback(() => {
    log('=== STOP DEBUGGER ===');
    
    // Emit stop event
    socketRef.current?.emit('stop_debug');
    
    // Wait a moment for server cleanup, then disconnect
    setTimeout(() => {
      log('Disconnecting socket after stop');
      socketRef.current?.disconnect();
      
      // Reset state
      setDebugState(prev => ({
        ...prev,
        isConnected: false,
        isRunning: false,
        isPaused: false,
        line: null,
        column: null,
        function: null,
        variables: {},
        stack: [],
        port: null,
      }));
    }, 500);
  }, []);

  return {
    // State
    debugState,
    
    // Connection control
    connect,
    disconnect,
    
    // Debug session control
    startDebugger,
    stopDebugger,
    
    // Execution control
    continueExecution,
    stepOver,
    stepInto,
    stepOut,
    
    // Breakpoints
    setBreakpoints,
    
    // Inspection
    evaluateExpression,
    getVariables,
    getStackTrace,
  };
};

// Export types
export type { DebugState, StackFrame, UseDebuggerOptions };