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

        try:
            res = llm_provider.generate_json_response(system_prompt, user_prompt)
            if res and isinstance(res, dict) and "Beginner" in res:
                return res
        except Exception:
            pass

        # Industrial-grade dynamic fallback curriculum for missing skills
        skills_list = missing_skills if missing_skills else ["Core Architecture", "Cloud Infrastructure", "System Design"]
        primary = skills_list[0]
        secondary = skills_list[1] if len(skills_list) > 1 else "Database Optimization"
        advanced = skills_list[2] if len(skills_list) > 2 else "CI/CD & Kubernetes"

        return {
            "Beginner": [
                {
                    "topic": f"Core Foundations of {primary} & Syntax Patterns",
                    "estimated_duration": "1 Week (10 Hours)",
                    "recommended_resources": [
                        f"Official {primary} Getting Started Documentation",
                        f"FreeCodeCamp Interactive {primary} Masterclass",
                        "MDN & Developer Roadmap Tutorials"
                    ]
                },
                {
                    "topic": f"Practical Setup & Hands-on Lab Environment for {secondary}",
                    "estimated_duration": "1 Week (8 Hours)",
                    "recommended_resources": [
                        f"Official {secondary} Quickstart Guides",
                        "Docker & Local Development Container Environment"
                    ]
                }
            ],
            "Intermediate": [
                {
                    "topic": f"Architectural Patterns & Production Integration of {primary} with {secondary}",
                    "estimated_duration": "2 Weeks (15 Hours)",
                    "recommended_resources": [
                        "GitHub Production Architecture Templates & Reference Code",
                        "Udemy Microservices & High-Scale Systems Masterclass",
                        "System Design Interview Crash Course"
                    ]
                },
                {
                    "topic": f"Data Persistence, Caching & Performance Tuning using {secondary}",
                    "estimated_duration": "1 - 2 Weeks (12 Hours)",
                    "recommended_resources": [
                        "PostgreSQL & Redis Performance Optimization Handbook",
                        "AWS & Cloud Native Database Best Practices"
                    ]
                }
            ],
            "Advanced": [
                {
                    "topic": f"Production Deployment, Security Hardening & CI/CD with {advanced}",
                    "estimated_duration": "2 Weeks (20 Hours)",
                    "recommended_resources": [
                        "Cloud Native Computing Foundation (CNCF) Production Guidelines",
                        "Kubernetes & Terraform Infrastructure as Code Tutorials",
                        "Datadog & Prometheus Distributed Tracing Guides"
                    ]
                }
            ]
        }
