import subprocess
import threading
import queue
import re
import json
import time

class PdbSession:
    def __init__(self, file_path):
        self.file_path = file_path
        self.process = None
        self.output_queue = queue.Queue()
        self.active = False
        
    def start(self):
        # -u for unbuffered is key
        self.process = subprocess.Popen(
            ['python3', '-u', '-m', 'pdb', self.file_path],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=0 
        )
        self.active = True
        # Background thread to read PDB stdout
        threading.Thread(target=self._read_stream, daemon=True).start()

    def _read_stream(self):
        buffer = ""
        while self.active:
            if not self.process: break
            char = self.process.stdout.read(1)
            if not char: break
            buffer += char
            # PDB prompt is "(Pdb) "
            if buffer.endswith("(Pdb) "):
                self.output_queue.put(buffer)
                buffer = ""

    def send_command(self, cmd):
        '''write a command to pdb. Available commands: https://docs.python.org/3/library/pdb.html#debugger-commands'''
        if self.process and self.active:
            try:
                self.process.stdin.write(cmd + "\n")
                self.process.stdin.flush()
            except Exception:
                self.active = False

    def get_state(self):
        try:
            # Block until PDB responds
            raw = self.output_queue.get(timeout=2)
            
            # Parse Line Number: > /tmp/tmpfile.py(5)<module>()
            match = re.search(r'>\s+.*?\.py\((\d+)\)', raw)
            line = int(match.group(1)) if match else None
            
            return {"line_number": line, "raw_output": raw}
        except queue.Empty:
            return {"line_number": None, "raw_output": ""}

    def get_variables(self):
        # Inject code to print locals as JSON
        # Filter out __builtins__, PDB internals, and imports
        injection = "import json; print('VAR_START:' + json.dumps({k:str(v) for k,v in locals().items() if not k.startswith('__') and k != 'sys' and k!='json'}))"
        
        self.send_command("!" + injection)
        
        # We need to fetch the output of this specific print command
        response = self.get_state() 
        raw = response['raw_output']
        
        match = re.search(r'VAR_START:(.*)', raw)
        if match:
            try:
                return json.loads(match.group(1))
            except:
                pass
        return {}

    def stop(self):
        self.active = False
        if self.process:
            self.process.kill()