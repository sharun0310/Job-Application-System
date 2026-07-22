from typing import List, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.resume import Resume
from app.models.job import Job
from app.database.chroma import chroma_client
from app.ai.ats_service import ATSService
from app.ai.roadmap_service import RoadmapService


class MatchingService:
    @staticmethod
    def get_recommended_jobs(
        db: Session, user_id: int, top_k: int = 5
    ) -> List[Dict[str, Any]]:
        # 1. Fetch user's resume
        resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        if not resume:
            raise HTTPException(
                status_code=404,
                detail="Resume not found. Please upload a resume first.",
            )

        # 2. Get resume embeddings from ChromaDB
        try:
            resume_vector_data = chroma_client.resumes.get(
                ids=[str(resume.id)], include=["embeddings"]
            )
            if not resume_vector_data["embeddings"]:
                raise HTTPException(
                    status_code=400, detail="Resume embeddings not ready. Please wait."
                )

            resume_embedding = resume_vector_data["embeddings"][0]

            # 3. Query Jobs collection in ChromaDB
            results = chroma_client.jobs.query(
                query_embeddings=[resume_embedding],
                n_results=top_k,
                include=["metadatas", "distances"],
            )

            recommended_jobs = []
            if results["metadatas"] and len(results["metadatas"]) > 0:
                for i in range(len(results["metadatas"][0])):
                    metadata = results["metadatas"][0][i]
                    distance = results["distances"][0][i]

                    # Distance in Chroma is typically cosine distance.
                    # Match score % roughly = (1 - distance) * 100
                    match_score = round(max(0, (1 - distance)) * 100, 2)

                    # Fetch real job from PG
                    job_id = metadata.get("job_id")
                    if job_id:
                        pg_job = db.query(Job).filter(Job.id == int(job_id)).first()
                        if pg_job:
                            recommended_jobs.append(
                                {"job": pg_job, "match_score": match_score}
                            )

            # Sort by match_score descending
            recommended_jobs.sort(key=lambda x: x["match_score"], reverse=True)
            return recommended_jobs

        except Exception as e:
            raise HTTPException(
                status_code=500, detail=f"Matching engine error: {str(e)}"
            )

    @staticmethod
    def analyze_skill_gap(db: Session, user_id: int, job_id: int) -> Dict[str, Any]:
        resume = db.query(Resume).filter(Resume.user_id == user_id).first()
        job = db.query(Job).filter(Job.id == job_id).first()

        if not resume or not job:
            raise HTTPException(status_code=404, detail="Resume or Job not found")

        # Call ATS LLM Service
        # In reality we'd pull the raw text from Chroma or DB,
        # but here we'll pass the parsed data stringified for speed.
        return ATSService.generate_ats_score(
            resume_text=str(resume.parsed_data), job_description=job.description
        )

    @staticmethod
    def generate_learning_roadmap(
        missing_skills: List[str], target_role: str
    ) -> Dict[str, Any]:
        return RoadmapService.generate_learning_roadmap(missing_skills, target_role)
