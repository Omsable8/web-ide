
def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)

a = int(input())
b = 10
b = fib(a)
print(b)
'''

The Architecture:

Frontend: Connects via WebSocket (e.g., Socket.IO). Sends commands like step_over, add_breakpoint(5).

Backend: Spawns the language's debugger (PDB, GDB, JDB) as a subprocess and keeps it alive.

The Bridge: The backend sits in the middle, writing frontend commands to the debugger's stdin and parsing the debugger's stdout to send back to the user.

Implementation Details by Language
1. Python (Wrapper around pdb)
Python's built-in pdb is easiest to wrap.

Launch: subprocess.Popen(['python3', '-m', 'pdb', 'solution.py'], stdin=PIPE, stdout=PIPE, ...)

Step Over: Write n\n to stdin.

Step Into: Write s\n to stdin.

Breakpoints: Write b 5\n (break at line 5).

Get Variables: Write p locals()\n (print local variables).

2. C++ (Wrapper around gdb)
Do not use standard GDB output; it is meant for humans. Use the Machine Interface (MI).

Launch: gdb --interpreter=mi ./a.out

Why MI? It outputs structured data (like JSON) instead of text, making it easier for your backend to parse the current line number and variables.

Commands:

Step Over: -exec-next

Step Into: -exec-step

Variables: -stack-list-variables --simple-values

3. Java (Wrapper around jdb)
Java's JDB is verbose but works similarly.

Launch: jdb -classpath . Main

Commands: step, next, stop at Main:10, locals.

'''