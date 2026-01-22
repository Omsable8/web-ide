import requests
import json
import time
from typing import Dict, Any

# Configuration
BASE_URL = "http://localhost:5000"
TIMEOUT = 10

class APITester:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.results = []
    
    def log_result(self, endpoint: str, method: str, status: str, response: Any):
        """Log test result"""
        result = {
            "endpoint": endpoint,
            "method": method,
            "status": status,
            "response": response
        }
        self.results.append(result)
        print(f"\n{'='*60}")
        print(f"[{status}] {method} {endpoint}")
        print(f"{'='*60}")
        print(json.dumps(response, indent=2))
    
    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/api/health", timeout=TIMEOUT)
            self.log_result("/api/health", "GET", "✓ PASS" if response.status_code == 200 else "✗ FAIL", response.json())
        except Exception as e:
            self.log_result("/api/health", "GET", "✗ ERROR", {"error": str(e)})
    
    def test_root(self):
        """Test root endpoint"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=TIMEOUT)
            self.log_result("/", "GET", "✓ PASS" if response.status_code == 200 else "✗ FAIL", response.json())
        except Exception as e:
            self.log_result("/", "GET", "✗ ERROR", {"error": str(e)})
    
    def test_ssh_connect(self):
        """Test SSH connection"""
        try:
            response = self.session.post(f"{self.base_url}/api/ssh/connect", timeout=TIMEOUT)
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ssh/connect", "POST", status, response.json())
            return response.status_code == 200
        except Exception as e:
            self.log_result("/api/ssh/connect", "POST", "✗ ERROR", {"error": str(e)})
            return False
    
    def test_ssh_execute(self, command: str = "ls -la"):
        """Test SSH command execution"""
        try:
            payload = {"command": command}
            response = self.session.post(
                f"{self.base_url}/api/ssh/execute",
                json=payload,
                timeout=TIMEOUT
            )
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result(f"/api/ssh/execute (cmd: {command})", "POST", status, response.json())
        except Exception as e:
            self.log_result(f"/api/ssh/execute (cmd: {command})", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_code_run(self, code: str = 'print("Hello from SSH")', language: str = "python"):
        """Test code execution"""
        try:
            payload = {"code": code, "language": language}
            response = self.session.post(
                f"{self.base_url}/api/code/run",
                json=payload,
                timeout=TIMEOUT
            )
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result(f"/api/code/run ({language})", "POST", status, response.json())
        except Exception as e:
            self.log_result(f"/api/code/run ({language})", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_ai_chat(self, message: str = "How do I debug a Python error?"):
        """Test AI chatbot"""
        try:
            payload = {"message": message}
            response = self.session.post(
                f"{self.base_url}/api/ai/chat",
                json=payload,
                timeout=TIMEOUT
            )
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ai/chat", "POST", status, response.json())
        except Exception as e:
            self.log_result("/api/ai/chat", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_ai_analyze(self, code: str = 'x = 1\nprint(x', language: str = "python"):
        """Test code analysis"""
        try:
            payload = {"code": code, "language": language}
            response = self.session.post(
                f"{self.base_url}/api/ai/analyze",
                json=payload,
                timeout=TIMEOUT
            )
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ai/analyze", "POST", status, response.json())
        except Exception as e:
            self.log_result("/api/ai/analyze", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_ai_explain_failure(self):
        """Test test case failure explanation"""
        try:
            payload = {
                "expected": "10",
                "actual": "5",
                "input": "5"
            }
            response = self.session.post(
                f"{self.base_url}/api/ai/explain-failure",
                json=payload,
                timeout=TIMEOUT
            )
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ai/explain-failure", "POST", status, response.json())
        except Exception as e:
            self.log_result("/api/ai/explain-failure", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_ai_clear(self):
        """Test clearing chat history"""
        try:
            response = self.session.post(f"{self.base_url}/api/ai/clear", timeout=TIMEOUT)
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ai/clear", "POST", status, response.json())
        except Exception as e:
            self.log_result("/api/ai/clear", "POST", "✗ ERROR", {"error": str(e)})
    
    def test_ssh_disconnect(self):
        """Test SSH disconnection"""
        try:
            response = self.session.post(f"{self.base_url}/api/ssh/disconnect", timeout=TIMEOUT)
            status = "✓ PASS" if response.status_code == 200 else "✗ FAIL"
            self.log_result("/api/ssh/disconnect", "POST", status, response.json())
        except Exception as e:
            self.log_result("/api/ssh/disconnect", "POST", "✗ ERROR", {"error": str(e)})
    
    def run_all_tests(self):
        """Run all tests"""
        print("\n" + "="*60)
        print("STARTING FLASK ENDPOINT TESTS")
        print("="*60)
        
        # Basic tests
        self.test_root()
        self.test_health_check()
        
        # SSH tests
        print("\n\n[SSH TESTS]")
        ssh_connected = self.test_ssh_connect()
        
        if ssh_connected:
            time.sleep(1)
            self.test_ssh_execute("pwd")
            self.test_ssh_execute("echo 'Testing SSH connection'")
            self.test_code_run('print("Hello from Python")', "python")
        
        # AI tests
        print("\n\n[AI CHATBOT TESTS]")
        self.test_ai_chat("What is a binary search?")
        self.test_ai_analyze('x = 1\nprint(x')
        self.test_ai_explain_failure()
        self.test_ai_clear()
        
        # Disconnect
        print("\n\n[CLEANUP]")
        self.test_ssh_disconnect()
        
        # Summary
        self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        print("\n\n" + "="*60)
        print("TEST SUMMARY")
        print("="*60)
        passed = sum(1 for r in self.results if "PASS" in r["status"])
        failed = sum(1 for r in self.results if "FAIL" in r["status"])
        errors = sum(1 for r in self.results if "ERROR" in r["status"])
        
        print(f"Total Tests: {len(self.results)}")
        print(f"✓ Passed: {passed}")
        print(f"✗ Failed: {failed}")
        print(f"⚠ Errors: {errors}")
        print("="*60)

if __name__ == "__main__":
    print("Make sure Flask backend is running on http://localhost:5000")
    print("Starting tests in 2 seconds...\n")
    time.sleep(2)
    
    tester = APITester()
    tester.run_all_tests()
