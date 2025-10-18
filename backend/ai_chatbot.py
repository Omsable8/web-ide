import os
from typing import List, Dict, Optional
import json

class Message:
    """Represents a chat message"""
    def __init__(self, role: str, content: str):
        self.role = role  # 'user' or 'assistant'
        self.content = content
    
    def to_dict(self):
        return {"role": self.role, "content": self.content}

class AIChatbot:
    """AI Chatbot for helping with competitive programming and DSA"""
    
    def __init__(self, model: str = "gpt-4", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.conversation_history: List[Message] = []
        self.system_prompt = """You are an expert competitive programming tutor and DSA mentor. 
Your role is to help students learn by:
1. Guiding them through debugging without giving away complete solutions
2. Explaining error messages and their root causes in detail
3. Teaching language nuances and best practices
4. Helping them understand why test cases fail and how to fix them
5. Encouraging problem-solving skills rather than memorization

When a student has an error:
- Explain what the error means in simple terms
- Point out the specific line or concept causing the issue
- Suggest how to fix it with hints, not complete code
- Teach the underlying concept so they learn for the future

Be patient, encouraging, and focus on building understanding."""
        
        # Add system message
        self.conversation_history.append(Message("system", self.system_prompt))
    
    def add_message(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append(Message(role, content))
    
    def get_response(self, user_message: str, code_context: Optional[str] = None, 
                     error_context: Optional[str] = None) -> str:
        """
        Get AI response for user message with optional code and error context
        
        Args:
            user_message: The user's question or request
            code_context: Current code being worked on
            error_context: Any error messages or test case failures
        """
        # Build enhanced message with context
        enhanced_message = user_message
        
        if code_context:
            enhanced_message += f"\n\n**Current Code:**\n```\n{code_context}\n```"
        
        if error_context:
            enhanced_message += f"\n\n**Error/Output:**\n```\n{error_context}\n```"
        
        # Add user message to history
        self.add_message("user", enhanced_message)
        
        try:
            # TODO: Replace with actual API call when integrating
            # For now, return a mock response
            response = self._mock_response(user_message, code_context, error_context)
            
            # Add assistant response to history
            self.add_message("assistant", response)
            
            return response
            
        except Exception as e:
            error_msg = f"Error getting AI response: {str(e)}"
            print(f"[AI] {error_msg}")
            return error_msg
    
    def _mock_response(self, message: str, code: Optional[str], error: Optional[str]) -> str:
        """Mock response for testing (replace with actual API call)"""
        if error:
            return f"""I can see you're encountering an error. Let me help you understand what's happening:

**Understanding the Error:**
The error message indicates there's an issue with your code. Let's break it down:

1. **What went wrong:** Look at the specific line mentioned in the error
2. **Why it happened:** This usually occurs when [explain common cause]
3. **How to fix it:** Try checking [give hint without full solution]

**Debugging Steps:**
- Add print statements to see variable values
- Check your loop conditions and array bounds
- Verify your input/output format matches the problem

Would you like me to explain any specific part in more detail?"""
        
        return """I'm here to help you learn! Instead of giving you the complete solution, let me guide you:

**Think about:**
1. What is the problem asking you to do?
2. What data structure would be most efficient?
3. What's the time complexity you're aiming for?

Try breaking down the problem into smaller steps. What's your initial approach?"""
    
    def analyze_code(self, code: str, language: str) -> Dict:
        """Analyze code for potential issues and improvements"""
        analysis = {
            "potential_issues": [],
            "suggestions": [],
            "complexity_hints": []
        }
        
        # Basic static analysis (can be enhanced)
        if language.lower() == "python":
            if "while True:" in code and "break" not in code:
                analysis["potential_issues"].append("Infinite loop detected - missing break statement")
            if "input()" in code:
                analysis["suggestions"].append("Remember to handle input parsing and edge cases")
        
        elif language.lower() == "cpp":
            if "#include" not in code:
                analysis["potential_issues"].append("Missing include statements")
            if "int main" not in code:
                analysis["potential_issues"].append("Missing main function")
        
        elif language.lower() == "java":
            if "public static void main" not in code:
                analysis["potential_issues"].append("Missing main method")
        
        return analysis
    
    def explain_test_case_failure(self, expected: str, actual: str, test_input: str) -> str:
        """Explain why a test case failed"""
        return f"""**Test Case Analysis:**

**Input:** {test_input}
**Expected Output:** {expected}
**Your Output:** {actual}

**What's Different:**
Let's compare the outputs carefully. Look for:
- Extra or missing spaces
- Incorrect values or calculations
- Off-by-one errors
- Edge case handling

**Debugging Approach:**
1. Trace through your code with this specific input
2. Print intermediate values to see where it diverges
3. Check your logic for this particular case

Can you identify where your logic might be producing the wrong result?"""
    
    def get_conversation_history(self) -> List[Dict]:
        """Get conversation history as list of dicts"""
        return [msg.to_dict() for msg in self.conversation_history if msg.role != "system"]
    
    def clear_history(self):
        """Clear conversation history except system prompt"""
        self.conversation_history = [self.conversation_history[0]]  # Keep system prompt
