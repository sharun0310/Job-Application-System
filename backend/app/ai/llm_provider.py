import json
from typing import Dict, Any
from google import genai
from app.config.settings import settings
import logging

logger = logging.getLogger(__name__)


class LLMProvider:
    """
    Abstraction layer for AI Models. Currently defaults to Google Gemini,
    but can be extended to OpenAI or local Llama without changing business logic.
    """

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            logger.warning("GEMINI_API_KEY is not set. AI Features will fail.")
        else:
            self.client = genai.Client(api_key=self.api_key)

        self.model_name = "gemini-2.0-flash"  # Primary fast model

    def generate_json_response(
        self, system_prompt: str, user_prompt: str
    ) -> Dict[str, Any]:
        """
        Generates a structured JSON response from the LLM.
        """
        if not self.api_key or not hasattr(self, 'client'):
            raise ValueError("GEMINI_API_KEY is missing or invalid")

        full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nReturn the response strictly as valid JSON without markdown wrapping."

        models_to_try = [self.model_name, "gemini-1.5-flash", "gemini-1.5-pro"]
        last_err = None
        for m in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=full_prompt,
                    config=genai.types.GenerateContentConfig(
                        response_mime_type="application/json", temperature=0.2
                    ),
                )
                return json.loads(response.text)
            except Exception as e:
                logger.warning(f"LLM Generation with model {m} failed: {e}")
                last_err = e
        raise last_err

    def generate_text_response(
        self, system_prompt: str, user_prompt: str, conversation_history: list = None
    ) -> str:
        """
        Generates markdown/text response for chatbot or multi-turn text generation.
        """
        if not self.api_key or not hasattr(self, 'client'):
            raise ValueError("GEMINI_API_KEY is missing or invalid")

        prompt_parts = [system_prompt]
        if conversation_history:
            prompt_parts.append("### Previous Conversation Context:")
            for msg in conversation_history[-6:]:
                role = "User" if msg.get("sender") == "user" or msg.get("role") == "user" else "Assistant"
                text = msg.get("text") or msg.get("content", "")
                prompt_parts.append(f"{role}: {text}")
        
        prompt_parts.append(f"### Current User Message:\n{user_prompt}")
        full_prompt = "\n\n".join(prompt_parts)

        models_to_try = [self.model_name, "gemini-1.5-flash", "gemini-1.5-pro"]
        last_err = None
        for m in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=m,
                    contents=full_prompt,
                    config=genai.types.GenerateContentConfig(
                        temperature=0.7
                    ),
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.warning(f"LLM Text Generation with model {m} failed: {e}")
                last_err = e

        if last_err:
            raise last_err
        return "I'm sorry, I couldn't generate a response at this moment. Please try again!"


llm_provider = LLMProvider()

