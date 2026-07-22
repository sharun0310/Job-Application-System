from typing import Dict, Any
from app.ai.llm_provider import llm_provider


class RoadmapService:
    @staticmethod
    def generate_learning_roadmap(
        missing_skills: list[str], target_role: str
    ) -> Dict[str, Any]:
        """
        Generates a structured learning roadmap based on missing skills.
        """
        system_prompt = (
            "You are an expert Career Coach and Technical Mentor. "
            "Given a target role and a list of missing skills, generate a detailed learning roadmap. "
            "Return a JSON object with three keys: 'Beginner', 'Intermediate', and 'Advanced'. "
            "Each key should map to an array of objects containing 'topic', 'estimated_duration', and 'recommended_resources' (list of strings)."
        )

        user_prompt = (
            f"TARGET ROLE: {target_role}\nMISSING SKILLS: {', '.join(missing_skills)}"
        )

        return llm_provider.generate_json_response(system_prompt, user_prompt)
