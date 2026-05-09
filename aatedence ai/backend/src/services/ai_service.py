import requests
import json
from src.core.config import settings
from typing import List, Dict, Any

# Verified working free models on OpenRouter (queried from /api/v1/models)
FREE_MODELS = [
    "nvidia/nemotron-nano-9b-v2:free",
    "google/gemma-4-26b-a4b-it:free",
    "nvidia/nemotron-3-nano-30b-a3b:free",
    "qwen/qwen3-next-80b-a3b-instruct:free",
    "minimax/minimax-m2.5:free",
]

class AIService:
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1/chat/completions"

    async def get_response(self, query: str, context_data: List[Dict[str, Any]]) -> str:
        """
        Ask the AI assistant - supports both attendance and general queries.
        Automatically falls back through multiple free models if one is unavailable.
        """
        if not self.api_key or self.api_key == "your-openrouter-key-here":
            return "AI Assistant is not configured. Please provide an OpenRouter API key."

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://attendance-ai.com",
            "X-Title": "Attendance AI Assistant"
        }

        # Format context for the LLM
        prompt = f"""
        You are "Attendance AI Assistant", a powerful and friendly AI powered by advanced LLMs.
        
        CONTEXT DATA (Today's Attendance):
        {json.dumps(context_data, indent=2, default=str)}
        
        USER QUERY: {query}
        
        INSTRUCTIONS:
        1. If the user asks about attendance, use the CONTEXT DATA provided above to give accurate answers.
        2. If the user asks general questions (knowledge, coding, advice, etc.), act as a helpful general-purpose AI assistant like ChatGPT or Gemini.
        3. Be conversational, professional, and helpful.
        4. If you don't know something or data is missing, just say so.
        """

        messages = [
            {"role": "system", "content": "You are a versatile AI assistant. You can help with attendance tracking, general knowledge, problem-solving, and conversation."},
            {"role": "user", "content": prompt}
        ]

        # Try each model until one works
        last_error = ""
        for model_id in FREE_MODELS:
            payload = {
                "model": model_id,
                "messages": messages
            }

            try:
                response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)

                if response.status_code == 200:
                    result = response.json()
                    return result['choices'][0]['message']['content']

                # Model unavailable or rate-limited, try next
                try:
                    error_json = response.json()
                    last_error = error_json.get('error', {}).get('message', f'HTTP {response.status_code}')
                except:
                    last_error = f"HTTP {response.status_code}"
                
                # Only retry on 404 (model not found) or 429 (rate limited)
                if response.status_code not in (404, 429):
                    return f"AI Service Error: {last_error}"

            except requests.exceptions.Timeout:
                last_error = "Request timed out"
            except Exception as e:
                last_error = str(e)

        return f"All AI models are currently busy. Please try again in a moment. (Last error: {last_error})"

ai_service = AIService()
