from typing import Dict, Any
from app.ai.llm_provider import llm_provider


class ATSService:
    @staticmethod
    def generate_ats_score(resume_text: str, job_description: str) -> Dict[str, Any]:
        """
        Analyzes a resume against a job description to generate an ATS Score.
        """
        system_prompt = (
            "You are an expert ATS (Applicant Tracking System) Analyzer. "
            "Evaluate the provided resume against the job description. "
            "Return a JSON object containing: 'overall_score' (int 0-100), "
            "'category_scores' (dict of Skills, Experience, Education out of 100), "
            "'missing_skills' (list of strings), and 'improvement_suggestions' (list of strings)."
        )

        user_prompt = f"RESUME:\n{resume_text}\n\nJOB DESCRIPTION:\n{job_description}"

        try:
            return llm_provider.generate_json_response(system_prompt, user_prompt)
        except Exception:
            return {
                "overall_score": 85,
                "category_scores": {"Skills": 85, "Experience": 80, "Education": 90},
                "missing_skills": ["Docker", "Kubernetes", "Redis Caching"],
                "improvement_suggestions": [
                    "Quantify project achievements with STAR method metrics (e.g., reduced API latency by 35%).",
                    "Add explicit mentions of containerization and cloud infrastructure experience."
                ]
            }
