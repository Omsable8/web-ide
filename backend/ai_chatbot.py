import os
from typing import List, Dict, Optional
import json
import requests
import re
import markdown
class Message:
    """Represents a chat message"""
    def __init__(self, role: str, content: str):
        self.role = role  # 'user' or 'assistant'
        self.content = content
    
    def to_dict(self):
        return {"role": self.role, "content": self.content}

class AIChatbot:
    """AI Chatbot for helping with competitive programming and DSA"""
    
    def __init__(self, model: str = "openai/gpt-5-mini", api_key: Optional[str] = None):
        self.model = model
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.conversation_history: List[Message] = []
        self.system_prompt = """You are an expert competitive programming tutor and DSA mentor. 
                                Your role is to help students learn by:
                                1. Guiding them through debugging without giving away complete solutions or entire code snippets
                                2. Explaining error messages and their root causes in simple language
                                3. Teaching language nuances and best practices
                                4. Helping them understand why test cases fail and how to fix them
                                5. Encouraging problem-solving skills rather than memorization
                                6. Give very short answers - not too long or verbose
                                7. Keep in mind that the Code has a Solution class and user only has to complete the function. Rest is handled by driver code in backend.
                                When a student has an error:
                                - Explain what the error means in simple terms
                                - Point out the specific line or concept causing the issue - but don't give corrected code!
                                - Suggest how to fix it with hints, never give complete code
                                - Teach the underlying concept so they learn for the future
                                - let them debug on their own, just give them guidance

                                Be patient, encouraging, and focus on building understanding. AND DO NOT TOLERATE ANY OTHER QUESTIONS OUT OF YOUR SCOPE AS A MENTOR"""
        
        # Add system message
        self.conversation_history.append(Message("system", self.system_prompt))
    

    def set_model(self, model: str):
        """Set the AI model to use"""
        self.model = model
        print(f"[AI] Model changed to: {model}")
        
    def add_message(self, role: str, content: str):
        """Add a message to conversation history"""
        self.conversation_history.append(Message(role, content))
    
    def preprocess_markdown(self,text: str) -> str:
        """
        Cleans up AI output for Markdown rendering.
        - Normalizes line breaks
        - Wraps code snippets properly
        - Adds spacing for headings/lists
        """
        if not text:
            return ""

        # Normalize line endings
        text = text.replace('\r\n', '\n').strip()

        # Ensure code blocks are fenced properly
        text = re.sub(r'```(\s*\n)?', '```\n', text)

        # Add spacing before headers if missing
        text = re.sub(r'(?<!\n)#', '\n#', text)

        # Add newlines around lists and code blocks for better rendering
        text = re.sub(r'(\n\s*[-*]\s)', r'\n\1', text)
        text = re.sub(r'(```[\s\S]*?```)', r'\n\1\n', text)

        # Optionally convert to HTML-safe markdown (if you want to send HTML)
        # html = markdown.markdown(text, extensions=['fenced_code', 'tables'])
        # return html

        return text

    def get_response(self, user_message: str, code_context: Optional[str] = None, error_context: Optional[str] = None) -> str:
        """Get AI response from OpenRouter"""
        enhanced_message = user_message
        if code_context:
            enhanced_message += f"\n\n**Current Code:**\n```\n{code_context}\n```"
        if error_context:
            enhanced_message += f"\n\n**Error/Output:**\n```\n{error_context}\n```"

        self.add_message("user", enhanced_message)

        try:
            # Prepare messages for API call
            messages = [msg.to_dict() for msg in self.conversation_history]
            response_text = self._openrouter_request(messages)
            # response_text = self.preprocess_markdown(response_text)
            self.add_message("assistant", response_text)
            return response_text
        except Exception as e:
            error_msg = f"[AI ERROR] {str(e)}"
            print(error_msg)
            return "Sorry, I couldn’t connect to the AI service right now."
    
    def _openrouter_request(self, messages: List[Dict]) -> str:
        """Send conversation to OpenRouter and get model response"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": self.model,
            "messages": messages
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        if response.status_code == 200:
            data = response.json()
            return data["choices"][0]["message"]["content"]
        else:
            raise Exception(f"OpenRouter API Error: {response.text}")
    
    def simplify_error(self,raw_stack_trace):
        system_prompt = '''You are an error simplification assistant for students.
        Instructions:
        1) extract line numbers from Python, Java, or C++ stack traces and explain the core issue simply in the exact format :
            'line [number] : [one-sentence beginner-friendly explanation]'.
        2) outputting absolutely nothing else.
        3) Give a markdown version of the explanation, with line numbers in bold and explanations in italics.
        '''
        
        try:
            payload = {"model": self.model,
                "messages":[{"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"Simplify this error:\n\n{raw_stack_trace}"}],
                "max_tokens":300,
                "reasoning": {
                    "effort": "minimal"
                },
                "temperature":0.1 # Low temperature for strict adherence to format
            }
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            response = requests.post("https://openrouter.ai/api/v1/chat/completions",headers=headers,json=payload)
                
            data = response.json()
            
            return data["choices"][0]["message"]["content"]
        except Exception as e:
            print(f"OpenAI API failed: {e}")
            return raw_stack_trace # Fallback to raw error if the API call fails
    
    def get_conversation_history(self) -> List[Dict]:
        """Get conversation history as list of dicts"""
        return [msg.to_dict() for msg in self.conversation_history if msg.role != "system"]
    
    def clear_history(self):
        """Clear conversation history except system prompt"""
        self.conversation_history = [self.conversation_history[0]]  # Keep system prompt
