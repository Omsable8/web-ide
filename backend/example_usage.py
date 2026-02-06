"""
Example usage of the debug adapter system
Shows how to use adapters programmatically (without Flask)
"""
import time
from debug_adapter_factory import DebugAdapterFactory, Language


def test_python_debugger():
    """Test Python debugging"""
    print("\n=== Testing Python Debugger ===")
    
    code = """
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

result = fibonacci(5)
print(f"Result: {result}")
"""
    
    def on_event(event_type, data):
        print(f"[EVENT] {event_type}: {data}")
    
    # Create adapter
    adapter = DebugAdapterFactory.create_from_code(
        code=code,
        language=Language.PYTHON,
        port=5678,
        on_event=on_event
    )
    
    if not adapter:
        print("Failed to create adapter")
        return
    
    # Start debugger
    print("Starting debugger...")
    if not adapter.start():
        print("Failed to start debugger")
        return
    
    # Set breakpoint at line 3 (if n <= 1:)
    print("Setting breakpoint at line 3...")
    adapter.set_breakpoints([3])
    
    # Continue to breakpoint
    print("Continuing to breakpoint...")
    adapter.continue_execution()
    
    # Wait for stop
    time.sleep(2)
    
    # Get state
    state = adapter.get_current_state()
    if state:
        print(f"\nStopped at line {state['line']}")
        print(f"Variables: {state['variables']}")
        print(f"Stack frames: {len(state['stack'])}")
    
    # Step over a few times
    print("\nStepping over 3 times...")
    for i in range(3):
        adapter.step_over()
        time.sleep(1)
        state = adapter.get_current_state()
        if state:
            print(f"  Step {i+1}: Line {state['line']}")
    
    # Continue to completion
    print("\nContinuing to completion...")
    adapter.continue_execution()
    time.sleep(2)
    
    # Cleanup
    adapter.stop()
    print("Test complete!")


def test_java_debugger():
    """Test Java debugging"""
    print("\n=== Testing Java Debugger ===")
    
    code = """
public class Solution {
    public int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
    
    public static void main(String[] args) {
        Solution sol = new Solution();
        int result = sol.factorial(5);
        System.out.println("Result: " + result);
    }
}
"""
    
    def on_event(event_type, data):
        print(f"[EVENT] {event_type}: {data}")
    
    # Create adapter
    adapter = DebugAdapterFactory.create_from_code(
        code=code,
        language=Language.JAVA,
        port=5679,
        on_event=on_event
    )
    
    if not adapter:
        print("Failed to create adapter (Java might not be installed)")
        return
    
    # Start debugger
    print("Starting Java debugger...")
    if not adapter.start():
        print("Failed to start debugger")
        return
    
    # Set breakpoint in factorial method
    print("Setting breakpoint...")
    adapter.set_breakpoints([3])  # if (n <= 1)
    
    # Continue
    print("Running...")
    adapter.continue_execution()
    time.sleep(2)
    
    # Get state
    state = adapter.get_current_state()
    if state:
        print(f"\nStopped at line {state['line']}")
        print(f"Variables: {state['variables']}")
    
    # Cleanup
    adapter.stop()
    print("Java test complete!")


def test_cpp_debugger():
    """Test C++ debugging"""
    print("\n=== Testing C++ Debugger ===")
    
    code = """
#include <iostream>
using namespace std;

int power(int base, int exp) {
    int result = 1;
    for (int i = 0; i < exp; i++) {
        result *= base;
    }
    return result;
}

int main() {
    int result = power(2, 5);
    cout << "Result: " << result << endl;
    return 0;
}
"""
    
    def on_event(event_type, data):
        print(f"[EVENT] {event_type}: {data}")
    
    # Create adapter
    adapter = DebugAdapterFactory.create_from_code(
        code=code,
        language=Language.CPP,
        port=5680,
        on_event=on_event
    )
    
    if not adapter:
        print("Failed to create adapter (C++ compiler might not be installed)")
        return
    
    # Start debugger
    print("Starting C++ debugger...")
    if not adapter.start():
        print("Failed to start debugger")
        return
    
    # Set breakpoint in loop
    print("Setting breakpoint...")
    adapter.set_breakpoints([7])  # for loop
    
    # Continue
    print("Running...")
    adapter.continue_execution()
    time.sleep(2)
    
    # Get state
    state = adapter.get_current_state()
    if state:
        print(f"\nStopped at line {state['line']}")
        print(f"Variables: {state['variables']}")
    
    # Cleanup
    adapter.stop()
    print("C++ test complete!")


def test_session_manager():
    """Test concurrent session management"""
    print("\n=== Testing Session Manager ===")
    
    from debug_adapter_factory import DebugSessionManager
    
    manager = DebugSessionManager()
    
    python_code = "x = 10\nprint(x)"
    
    # Create multiple sessions
    print("Creating 3 concurrent sessions...")
    sessions = {}
    for i in range(3):
        session_id = f"user_{i}"
        adapter = manager.create_session(
            session_id=session_id,
            code=python_code,
            language=Language.PYTHON
        )
        if adapter:
            sessions[session_id] = adapter
            print(f"  Session {session_id}: Port {adapter.port}")
    
    # Start all sessions
    print("\nStarting all sessions...")
    for session_id, adapter in sessions.items():
        adapter.start()
        adapter.set_breakpoints([1])
        adapter.continue_execution()
    
    time.sleep(2)
    
    # Stop all
    print("\nStopping all sessions...")
    manager.stop_all_sessions()
    print("Session manager test complete!")


if __name__ == '__main__':
    print("=" * 60)
    print("Debug Adapter System - Example Usage")
    print("=" * 60)
    
    # Test Python (should always work)
    test_python_debugger()
    
    # Test Java (might not be available)
    try:
        test_java_debugger()
    except Exception as e:
        print(f"Java test skipped: {e}")
    
    # Test C++ (might not be available)
    try:
        test_cpp_debugger()
    except Exception as e:
        print(f"C++ test skipped: {e}")
    
    # Test session manager
    test_session_manager()
    
    print("\n" + "=" * 60)
    print("All tests complete!")
