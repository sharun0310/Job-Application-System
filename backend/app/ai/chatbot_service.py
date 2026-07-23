from typing import List, Dict, Any, Optional
import logging
from app.ai.llm_provider import llm_provider

logger = logging.getLogger(__name__)

CAREER_BOT_SYSTEM_PROMPT = """You are CareerPulse AI Advisor, an expert 24/7 career counselor, resume consultant, tech interviewer, and job search strategist.

Your responsibilities:
1. Provide highly practical, encouraging, and tailored career advice.
2. Help users optimize resume bullet points (e.g. STAR method: Situation, Task, Action, Result with quantifiable metrics).
3. Conduct mock interviews, prepare system design, coding, or behavioral questions with sample answers.
4. Bridge skill gaps for specific tech roles (e.g., Senior Full Stack Engineer, DevOps Lead, Data Scientist, Backend Engineer).
5. Guide salary negotiation, job search in specific regions (such as India, Remote, US, Europe), and career advancement.

Formatting rules:
- Format your response cleanly using GitHub Markdown (use bolding, clean bullet points, numbered lists, and code blocks where helpful).
- If the user asks a follow-up (like "yes", "give me examples", "how do I do that?"), check the previous conversation context and deliver the requested detailed information directly without repeating generic introductory messages.
- Be concise yet thorough and actionable.
"""

class ChatbotService:
    """
    Manages Career Chatbot multi-turn conversations and AI generation.
    """

    def generate_chat_response(
        self,
        message: str,
        history: Optional[List[Dict[str, Any]]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        system_prompt = CAREER_BOT_SYSTEM_PROMPT
        if user_context:
            system_prompt += f"\n\nUser Profile Context: {user_context}"

        try:
            response_text = llm_provider.generate_text_response(
                system_prompt=system_prompt,
                user_prompt=message,
                conversation_history=history or []
            )
            return response_text
        except Exception as e:
            logger.error(f"Chatbot Gemini generation failed: {e}")
            # Graceful fallback response if API key is invalid or quota exceeded
            return self._fallback_career_response(message, history)

    def _fallback_career_response(self, message: str, history: Optional[List[Dict[str, Any]]]) -> str:
        msg_lower = message.lower().strip()

        if any(w in msg_lower for w in ["yes", "sure", "please", "go ahead", "generate", "bullet"]):
            return (
                "Here are **actionable resume bullet points** tailored for top tech roles (using the STAR format):\n\n"
                "• **Architected & Deployed Microservices**: Engineered high-throughput REST APIs using FastAPI and PostgreSQL, reducing latency by **35%** across 100K+ daily requests.\n"
                "• **Optimized Frontend Performance**: Migrated legacy React code to Vite & Tailwind CSS, improving Lighthouse performance score from **62 to 98**.\n"
                "• **Automated CI/CD & Cloud Infrastructure**: Designed GitHub Actions deployment pipelines for Dockerized applications, cutting release cycle time from **3 days to 15 minutes**.\n"
                "• **Database Query Optimization**: Refactored complex SQL joins & added Redis caching, decreasing database CPU load by **45%** under peak traffic.\n\n"
                "Would you like me to tailor bullet points specifically for your target tech stack or company?"
            )
        elif "resume" in msg_lower:
            return (
                "### 🎯 Resume Optimization Checklist:\n\n"
                "1. **Use Impact Metrics**: Quantify your achievements with numbers (%, $, time saved, users reached).\n"
                "2. **ATS Keyword Optimization**: Match key skills directly from the job description (e.g. *React, Node.js, Python, Docker, PostgreSQL*).\n"
                "3. **Strong Action Verbs**: Start bullet points with dynamic verbs like *Architected, Spearheaded, Refactored, Optimized*.\n"
                "4. **Keep It Concise**: Stick to 1-2 pages maximum with standard fonts and consistent spacing.\n\n"
                "Tell me your target job title (e.g. *Senior Full Stack Engineer*), and I'll generate customized bullet points!"
            )
        elif "interview" in msg_lower:
            return (
                "### 💡 Top Tech Interview Preparation Tips:\n\n"
                "1. **System Design**: Focus on Scalability, Load Balancing, Caching (Redis), Database Sharding, and Message Queues (Kafka/RabbitMQ).\n"
                "2. **Behavioral Questions**: Prepare stories using the **STAR Method** (Situation, Task, Action, Result).\n"
                "3. **Coding & Data Structures**: Master Arrays, Dynamic Programming, Graphs, and Hash Maps.\n\n"
                "Would you like to start a mock interview for System Design or Coding?"
            )
        else:
            return (
                f"### Career Pulse AI Insights\n\n"
                f"Regarding **\"{message}\"**:\n\n"
                f"• Focus on demonstrating **measurable outcomes** and technical depth in your projects.\n"
                f"• Tailor your resume specifically to match the key requirements of your target position.\n"
                f"• Keep your LinkedIn and GitHub active with real projects.\n\n"
                f"What specific area would you like to explore next (e.g., *Resume bullet points, System Design questions, or Salary Advice*)?"
            )

chatbot_service = ChatbotService()
