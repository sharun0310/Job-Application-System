from typing import List, Dict, Any
from app.services.job_collection.base_provider import JobProvider
import hashlib
import json
from sqlalchemy.orm import Session
from app.models.job import Job, Company
from app.database.chroma import chroma_client
from app.ai.embedding_service import embedding_service
from app.schemas.job import JobCreate

class JobCollectorService:
    """
    Orchestrates the collection of jobs from various registered providers.
    Follows: Collect -> Normalize -> Duplicate Removal -> Save.
    """

    def __init__(self):
        self._providers: List[JobProvider] = []

    def register_provider(self, provider: JobProvider):
        self._providers.append(provider)

    def collect_jobs(self, query: str, location: str, db: Session = None) -> List[Dict[str, Any]]:
        raw_jobs = []
        for provider in self._providers:
            # 1. Collect
            raw_jobs.extend(provider.fetch_jobs(query, location))

        # 2. Normalize
        normalized_jobs = self._normalize(raw_jobs)

        # 3. Remove Duplicates
        unique_jobs = self._remove_duplicates(normalized_jobs)

        # 4. Generate Embeddings & Save to DB
        if db:
            for job_data in unique_jobs:
                # Find or create company
                company_name = job_data["company"]
                company = db.query(Company).filter(Company.name.ilike(company_name)).first()
                if not company:
                    company = Company(name=company_name)
                    db.add(company)
                    db.commit()
                    db.refresh(company)
                
                # Check if job already exists for this company
                existing_job = db.query(Job).filter(
                    Job.company_id == company.id, 
                    Job.title.ilike(job_data["title"])
                ).first()

                if not existing_job:
                    # Save Job to Postgres
                    skills_str = json.dumps(job_data["skills_required"]) if isinstance(job_data["skills_required"], list) else str(job_data.get("skills_required", ""))
                    job_in = JobCreate(
                        title=job_data["title"],
                        company_id=company.id,
                        location=job_data.get("location"),
                        description=job_data.get("description", ""),
                        required_skills=skills_str,
                        application_link=job_data.get("url")
                    )
                    pg_job = Job(**job_in.model_dump())
                    db.add(pg_job)
                    db.commit()
                    db.refresh(pg_job)

                    # Generate embeddings
                    text_to_embed = f"{pg_job.title} {pg_job.description} {pg_job.required_skills}"
                    emb = embedding_service.generate_embedding(text_to_embed)

                    # Classify Domain
                    domain = self._classify_domain(text_to_embed)

                    # Save to ChromaDB
                    chroma_client.jobs.add(
                        ids=[str(pg_job.id)],
                        embeddings=[emb],
                        metadatas=[{"job_id": pg_job.id, "title": pg_job.title, "company": company.name, "domain": domain}]
                    )

        return unique_jobs

    def _normalize(self, raw_jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        # Map disparate fields to a unified schema
        normalized = []
        for job in raw_jobs:
            normalized.append(
                {
                    "title": job.get("job_title", job.get("title")),
                    "company": job.get("company_name", job.get("company")),
                    "location": job.get("job_location", job.get("location")),
                    "description": job.get("job_description", job.get("description")),
                    "skills_required": job.get("skills_required", []),
                    "url": job.get("url", ""),
                }
            )
        return normalized

    def _remove_duplicates(self, jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seen_hashes = set()
        unique_jobs = []
        for job in jobs:
            # Create a simple hash based on title + company to detect dupes
            unique_string = f"{job['title']}_{job['company']}".lower()
            job_hash = hashlib.md5(unique_string.encode()).hexdigest()

            if job_hash not in seen_hashes:
                seen_hashes.add(job_hash)
                unique_jobs.append(job)

        return unique_jobs

    def _classify_domain(self, text: str) -> str:
        """
        Agentic Domain Classifier: Categorizes jobs based on keywords.
        """
        text = text.lower()
        if "full stack" in text or "fullstack" in text: return "Full Stack"
        if "machine learning" in text or "ml" in text or "data sci" in text or "ai" in text: return "Machine Learning"
        if "devops" in text or "kubernetes" in text or "aws" in text or "azure" in text: return "DevOps"
        if "test" in text or "qa" in text or "quality assurance" in text: return "Software Testing"
        if "salesforce" in text: return "Salesforce"
        if "cyber" in text or "security" in text or "infosec" in text: return "Cyber Security"
        return "Other"
