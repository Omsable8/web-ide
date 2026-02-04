import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of the data coming from the backend
interface DebugState {
  line: number | null;       // Current line number to highlight
  variables: Record<string, string>; // Local variables (e.g., {'i': '5', 'x': '10'})
  output: string;            // Accumulated stdout/pdb output
  isConnected: boolean;
}

const SOCKET_URL = 'http://localhost:5000';

export const useDebugger = () => {
  const [debugState, setDebugState] = useState<DebugState>({
    line: null,
    variables: {},
    output: '',
    isConnected: false,
  });

  // Use a ref to persist the socket instance across renders
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Initialize Connection
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'], // Force WebSocket to avoid polling issues
      autoConnect: false,        // Wait until we explicitly call connect
    });

    // 2. Setup Event Listeners
    const socket = socketRef.current;

    socket.on('connect', () => {
      console.log('Connected to Debugger');
      setDebugState(prev => ({ ...prev, isConnected: true }));
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Debugger');
      setDebugState(prev => ({ ...prev, isConnected: false }));
    });

    // HANDLE UPDATES FROM BACKEND
    socket.on('debug_update', (data: { line: number; variables: any; output: string }) => {
      // NOTE: If you appended user code + driver, you might need to subtract an offset here
      // const USER_CODE_OFFSET = 0; 
      
      setDebugState(prev => ({
        ...prev,
        line: data.line, // - USER_CODE_OFFSET,
        variables: data.variables || {},
        output: data.output || prev.output
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // --- CONTROLS ---

  const startDebugger = useCallback((code: string, input: string, breakpoints: number[]) => {
    if (!socketRef.current?.connected) {
      socketRef.current?.connect();
    }
    
    // Clear previous state
    setDebugState({ line: null, variables: {}, output: '', isConnected: true });

    // Emit start command
    socketRef.current?.emit('start_debug', {
      code,
      input,
      breakpoints
    });
  }, []);

  const stepOver = useCallback(() => {
    socketRef.current?.emit('step_over');
  }, []);

  const stepInto = useCallback(() => {
    socketRef.current?.emit('step_into');
  }, []);

  const stopDebugger = useCallback(() => {
    socketRef.current?.emit('stop_debug'); // Optional: tell backend to kill process
    socketRef.current?.disconnect();
    setDebugState(prev => ({ ...prev, isConnected: false, line: null }));
  }, []);

  return {
    debugState,
    startDebugger,
    stepOver,
    stepInto,
    stopDebugger
  };
};
