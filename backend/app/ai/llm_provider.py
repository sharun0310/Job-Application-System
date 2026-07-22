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

        self.model_name = "gemini-2.5-flash"  # Use fast/cheap model by default

    def generate_json_response(
        self, system_prompt: str, user_prompt: str
    ) -> Dict[str, Any]:
        """
        Generates a structured JSON response from the LLM.
        """
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is missing")

        full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nReturn the response strictly as valid JSON without markdown wrapping."

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=full_prompt,
                config=genai.types.GenerateContentConfig(
                    response_mime_type="application/json", temperature=0.2
                ),
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"LLM Generation Error: {e}")
            raise


llm_provider = LLMProvider()
