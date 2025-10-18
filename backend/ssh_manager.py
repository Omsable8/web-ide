import paramiko
import time
from typing import Optional

class SSHManager:
    """Manages SSH connection to remote server for code execution"""
    
    def __init__(self, hostname: str, username: str, password: str, port: int = 22):
        self.hostname = hostname
        self.username = username
        self.password = password
        self.port = port
        self.client: Optional[paramiko.SSHClient] = None
        self.is_connected = False
        
    def connect(self) -> bool:
        """Establish SSH connection to the remote server"""
        try:
            self.client = paramiko.SSHClient()
            self.client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Connect to the server
            self.client.connect(
                hostname=self.hostname,
                username=self.username,
                password=self.password,
                port=self.port,
                timeout=10
            )
            
            self.is_connected = True
            print(f"[SSH] Connected to {self.username}@{self.hostname}")
            return True
            
        except Exception as e:
            print(f"[SSH] Connection failed: {str(e)}")
            self.is_connected = False
            return False
    
    def run_code(self, code: str, language: str) -> dict:
        """Execute code on the remote server and return output"""
        if not self.is_connected or not self.client:
            return {"success": False, "error": "Not connected to server"}
        
        try:
            file_extensions = {
                "python": "py",
                "cpp": "cpp",
                "java": "java"
            }
            
            ext = file_extensions.get(language.lower(), "txt")
            filename = f"temp_code_{int(time.time())}.{ext}"
            
            # Write code to file using echo
            escaped_code = code.replace('"', '\\"').replace('$', '\\$')
            write_cmd = f'echo "{escaped_code}" > {filename}'
            
            stdin, stdout, stderr = self.client.exec_command(write_cmd)
            stdout.channel.recv_exit_status()
            
            # Compile and run based on language
            if language.lower() == "python":
                exec_cmd = f"python3 {filename}"
            elif language.lower() == "cpp":
                exec_cmd = f"g++ {filename} -o temp_code_{int(time.time())} && ./temp_code_{int(time.time())}"
            elif language.lower() == "java":
                exec_cmd = f"javac {filename} && java TempCode"
            else:
                return {"success": False, "error": f"Unsupported language: {language}"}
            
            # Execute the code
            stdin, stdout, stderr = self.client.exec_command(exec_cmd, timeout=10)
            
            # Get output and errors
            output = stdout.read().decode('utf-8', errors='ignore')
            error = stderr.read().decode('utf-8', errors='ignore')
            exit_code = stdout.channel.recv_exit_status()
            
            # Cleanup
            cleanup_cmd = f"rm -f {filename} temp_code_*"
            self.client.exec_command(cleanup_cmd)
            
            if exit_code != 0 and error:
                return {
                    "success": False,
                    "error": error,
                    "output": output,
                    "exit_code": exit_code
                }
            
            return {
                "success": True,
                "output": output,
                "error": error if error else None,
                "exit_code": exit_code
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def disconnect(self):
        """Close SSH connection"""
        self.is_connected = False
        
        if self.client:
            self.client.close()
        
        print("[SSH] Disconnected")
    
    def __del__(self):
        """Cleanup on object destruction"""
        self.disconnect()
