"""
Fixed Flask-SocketIO debug server with proper DAP flow and disconnect handling
"""
import eventlet
eventlet.monkey_patch()

from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
import tempfile
import os

from debug_adapter_factory import DebugSessionManager, DebugAdapterFactory, Language
from base_debug_adapter import DebuggerState


# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet', logger=True, engineio_logger=False)

# Global session manager
session_manager = DebugSessionManager(port_range_start=5678, port_range_end=6678)


def get_language_enum(language_str: str) -> Language:
    """Convert language string to enum"""
    language_map = {
        'python': Language.PYTHON,
        'java': Language.JAVA,
        'cpp': Language.CPP,
        'c++': Language.CPP,
    }
    return language_map.get(language_str.lower(), Language.PYTHON)


@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    sid = request.sid
    print(f"\n[SERVER] ✓ Client connected: {sid}")
    join_room(sid)
    socketio.emit('connected', {'status': 'ready'}, room=sid)


@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection and cleanup"""
    sid = request.sid
    print(f"\n[SERVER] ✗ Client disconnected: {sid}")
    
    # Clean up session
    adapter = session_manager.get_session(sid)
    if adapter:
        print(f"[SERVER] Cleaning up debug session for {sid}")
        session_manager.stop_session(sid)
    
    leave_room(sid)


@socketio.on('start_debug')
def handle_start_debug(data):
    """
    Start a new debug session with proper DAP flow:
    1. Initialize DAP
    2. Set breakpoints
    3. Send configurationDone to start execution
    """
    sid = request.sid
    print(f"\n[SERVER] === START DEBUG REQUEST from {sid} ===")
    
    try:
        code = data.get('code', '')
        language_str = data.get('language', 'python')
        input_data = data.get('input', '')
        breakpoints = data.get('breakpoints', [])
        
        print(f"[SERVER] Language: {language_str}")
        print(f"[SERVER] Code length: {len(code)} chars")
        print(f"[SERVER] Breakpoints: {breakpoints}")
        print(f"[SERVER] Input data: {len(input_data)} chars")
        
        if not code:
            print("[SERVER] ERROR: No code provided")
            socketio.emit('debug_error', {'error': 'No code provided'}, room=sid)
            return
        
        # Convert language
        language = get_language_enum(language_str)
        
        # Event handler for debug events
        def on_debug_event(event_type: str, event_data: dict):
            """Forward debug events to frontend"""
            try:
                print(f"[SERVER] Event: {event_type}")
                
                if event_type == 'output':
                    # Don't send telemetry
                    if event_data.get('category') == 'telemetry':
                        return
                    
                    socketio.emit('debug_output', {
                        'output': event_data.get('output', ''),
                        'category': event_data.get('category', 'stdout')
                    }, room=sid)
                
                elif event_type == 'stopped':
                    state = event_data.get('state', {})
                    reason = event_data.get('reason', 'breakpoint')
                    
                    print(f"[SERVER] Stopped at line {state.get('line')}")
                    print(f"[SERVER] Variables: {len(state.get('variables', []))}")
                    print(f"[SERVER] Stack frames: {len(state.get('stack', []))}")
                    
                    socketio.emit('debug_stopped', {
                        'reason': reason,
                        'line': state.get('line'),
                        'column': state.get('column'),
                        'function': state.get('function'),
                        'variables': format_variables(state.get('variables', [])),
                        'stack': state.get('stack', [])
                    }, room=sid)
                
                elif event_type == 'continued':
                    socketio.emit('debug_continued', {}, room=sid)
                
                elif event_type == 'terminated':
                    print(f"[SERVER] Program terminated")
                    socketio.emit('debug_terminated', {'status': 'finished'}, room=sid)
                    
            except Exception as e:
                print(f"[SERVER] ERROR in event handler: {e}")
                import traceback
                traceback.print_exc()
        
        # Create debug session
        print(f"[SERVER] Creating debug session...")
        adapter = session_manager.create_session(
            session_id=sid,
            code=code,
            language=language,
            input_data=input_data,
            on_event=on_debug_event
        )
        
        if not adapter:
            print("[SERVER] ERROR: Failed to create adapter")
            socketio.emit('debug_error', {'error': 'Failed to create debug adapter'}, room=sid)
            return
        
        # Start debugger in background
        def start_debugger_async():
            try:
                print(f"[SERVER] Starting debugger async...")
                
                # Start debugger (initializes DAP but doesn't start execution)
                if not adapter.start(timeout=10.0):
                    print("[SERVER] ERROR: Debugger start failed")
                    socketio.emit('debug_error', {'error': 'Failed to start debugger'}, room=sid)
                    session_manager.stop_session(sid)
                    return
                
                print(f"[SERVER] Debugger started, launching with breakpoints...")
                
                # Set breakpoints and send configurationDone (THIS starts execution)
                if not adapter.launch_with_breakpoints(breakpoints):
                    print("[SERVER] ERROR: Launch with breakpoints failed")
                    socketio.emit('debug_error', {'error': 'Failed to launch debugger'}, room=sid)
                    session_manager.stop_session(sid)
                    return
                
                print(f"[SERVER] Debugger launched successfully")
                socketio.emit('debug_started', {
                    'status': 'running',
                    'language': language_str,
                    'port': adapter.port
                }, room=sid)
                
            except Exception as e:
                print(f"[SERVER] ERROR in start_debugger_async: {e}")
                import traceback
                traceback.print_exc()
                socketio.emit('debug_error', {'error': str(e)}, room=sid)
        
        # Run in eventlet greenthread
        eventlet.spawn(start_debugger_async)
    
    except Exception as e:
        print(f"[SERVER] ERROR in handle_start_debug: {e}")
        import traceback
        traceback.print_exc()
        socketio.emit('debug_error', {'error': str(e)}, room=sid)


@socketio.on('continue')
def handle_continue():
    """Continue execution"""
    sid = request.sid
    print(f"\n[SERVER] Continue request from {sid}")
    
    adapter = session_manager.get_session(sid)
    if not adapter:
        print("[SERVER] ERROR: No active session")
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    if adapter.continue_execution():
        print("[SERVER] Continue successful")
    else:
        print("[SERVER] ERROR: Continue failed")
        socketio.emit('debug_error', {'error': 'Failed to continue'}, room=sid)


@socketio.on('step_over')
def handle_step_over():
    """Step over"""
    sid = request.sid
    print(f"\n[SERVER] Step over request from {sid}")
    
    adapter = session_manager.get_session(sid)
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    if adapter.step_over():
        print("[SERVER] Step over successful")
    else:
        print("[SERVER] ERROR: Step over failed")


@socketio.on('step_into')
def handle_step_into():
    """Step into"""
    sid = request.sid
    print(f"\n[SERVER] Step into request from {sid}")
    
    adapter = session_manager.get_session(sid)
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    adapter.step_into()


@socketio.on('step_out')
def handle_step_out():
    """Step out"""
    sid = request.sid
    print(f"\n[SERVER] Step out request from {sid}")
    
    adapter = session_manager.get_session(sid)
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    adapter.step_out()


@socketio.on('set_breakpoints')
def handle_set_breakpoints(data):
    """Update breakpoints dynamically"""
    sid = request.sid
    print(f"\n[SERVER] Set breakpoints request from {sid}")
    
    adapter = session_manager.get_session(sid)
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    breakpoints = data.get('breakpoints', [])
    print(f"[SERVER] New breakpoints: {breakpoints}")
    
    if adapter.set_breakpoints(breakpoints):
        socketio.emit('breakpoints_updated', {'breakpoints': breakpoints}, room=sid)
    else:
        socketio.emit('debug_error', {'error': 'Failed to set breakpoints'}, room=sid)


@socketio.on('evaluate')
def handle_evaluate(data):
    """Evaluate expression"""
    sid = request.sid
    adapter = session_manager.get_session(sid)
    
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    if adapter.state != DebuggerState.PAUSED:
        socketio.emit('debug_error', {'error': 'Can only evaluate when paused'}, room=sid)
        return
    
    expression = data.get('expression', '')
    print(f"[SERVER] Evaluate: {expression}")
    
    if not expression:
        socketio.emit('debug_error', {'error': 'No expression provided'}, room=sid)
        return
    
    result = adapter.evaluate(expression)
    socketio.emit('evaluation_result', {
        'expression': expression,
        'result': result
    }, room=sid)


@socketio.on('get_variables')
def handle_get_variables():
    """Get current variables"""
    sid = request.sid
    adapter = session_manager.get_session(sid)
    
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    if adapter.state != DebuggerState.PAUSED:
        socketio.emit('debug_error', {'error': 'Can only get variables when paused'}, room=sid)
        return
    
    variables = adapter.get_variables()
    socketio.emit('variables_update', {
        'variables': format_variables(variables)
    }, room=sid)


@socketio.on('get_stack_trace')
def handle_get_stack_trace():
    """Get current stack trace"""
    sid = request.sid
    adapter = session_manager.get_session(sid)
    
    if not adapter:
        socketio.emit('debug_error', {'error': 'No active debug session'}, room=sid)
        return
    
    if adapter.state != DebuggerState.PAUSED:
        socketio.emit('debug_error', {'error': 'Can only get stack when paused'}, room=sid)
        return
    
    stack = adapter.get_stack_trace()
    socketio.emit('stack_trace_update', {'stack': stack}, room=sid)


@socketio.on('stop_debug')
def handle_stop_debug():
    """Stop the debug session - CRITICAL: This must trigger disconnect"""
    sid = request.sid
    print(f"\n[SERVER] === STOP DEBUG REQUEST from {sid} ===")
    
    adapter = session_manager.get_session(sid)
    if adapter:
        print(f"[SERVER] Stopping debug session...")
        session_manager.stop_session(sid)
        print(f"[SERVER] Session stopped")
    else:
        print(f"[SERVER] No active session to stop")
    
    # Send terminated event
    socketio.emit('debug_terminated', {'status': 'stopped'}, room=sid)
    print(f"[SERVER] Sent debug_terminated event")
    
    # IMPORTANT: Explicitly disconnect the client
    # This ensures clean session cleanup
    # print(f"[SERVER] Disconnecting client {sid}")
    # socketio.emit('force_disconnect', {}, room=sid)


def format_variables(variables: list) -> dict:
    """
    Format variables for frontend display.
    """
    result = {}
    for var in variables:
        name = var.get('name', '')
        value = var.get('value', '')
        var_type = var.get('type', '')
        
        # Skip special Python variables
        if name.startswith('__') and name.endswith('__'):
            continue
        
        # Include type for non-primitives
        if var_type and var_type not in ['int', 'str', 'float', 'bool']:
            result[name] = f"{value} ({var_type})"
        else:
            result[name] = value
    
    return result


if __name__ == '__main__':
    print("\n" + "="*60)
    print("Starting Multi-Language Debug Server")
    print("="*60)
    print("Supported languages: Python, Java, C++")
    print("Server: http://localhost:5003")
    print("="*60 + "\n")
    
    try:
        socketio.run(
            app,
            host='0.0.0.0',
            port=5003,
            debug=True,
            allow_unsafe_werkzeug=True,
            use_reloader=False
        )
    finally:
        print("\n[SERVER] Shutting down...")
        session_manager.stop_all_sessions()
        print("[SERVER] All sessions cleaned up")