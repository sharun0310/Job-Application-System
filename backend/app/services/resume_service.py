import logging
from sqlalchemy.orm import Session
from app.models.resume import Resume
from app.utils.text_extractor import text_extractor
from app.ai.llm_provider import llm_provider
from app.ai.embedding_service import embedding_service
from app.database.chroma import chroma_client

logger = logging.getLogger(__name__)


class ResumeService:
    @staticmethod
    def process_resume_background(
        db: Session, user_id: int, resume_id: int, file_bytes: bytes, content_type: str
    ):
        """
        Background task to process a resume: Extract text, parse with LLM, embed, and store.
        (Note: In a true production setting, this should be moved to Celery to prevent blocking the GIL).
        """
        logger.info(
            f"Starting background processing for resume {resume_id} of user {user_id}"
        )

        # 1. Extract Text
        extracted_text = ""
        if "pdf" in content_type:
            extracted_text = text_extractor.extract_from_pdf(file_bytes)
        elif "wordprocessingml" in content_type or "docx" in content_type:
            extracted_text = text_extractor.extract_from_docx(file_bytes)
        elif "image" in content_type:
            extracted_text = text_extractor.extract_from_image(file_bytes)
        else:
            logger.error("Unsupported file format.")
            return

        if not extracted_text.strip():
            logger.warning("No text could be extracted from the file.")
            return

        # 2. Parse Resume with LLM
        system_prompt = (
            "You are an expert Resume Parser. Extract the following entities from the resume text: "
            "name, email, phone, skills (list), education (list of dicts), experience (list of dicts), "
            "projects (list of dicts). Return ONLY a JSON object."
        )
        parsed_data = {}
        try:
            parsed_data = llm_provider.generate_json_response(
                system_prompt, extracted_text
            )
        except Exception as e:
            logger.error(f"Failed to parse resume with LLM: {e}")

        # 3. Generate Embeddings
        embedding = []
        try:
            embedding = embedding_service.generate_embedding(extracted_text)
        except Exception as e:
            logger.error(f"Failed to generate embeddings: {e}")

        # 4. Save to ChromaDB
        if embedding:
            try:
                chroma_client.resumes.add(
                    documents=[extracted_text],
                    embeddings=[embedding],
                    metadatas=[{"user_id": user_id, "resume_id": resume_id}],
                    ids=[str(resume_id)],
                )
            except Exception as e:
                logger.error(f"Failed to save to ChromaDB: {e}")

        # 5. Update Database
        try:
            resume = db.query(Resume).filter(Resume.id == resume_id).first()
            if resume:
                resume.parsed_data = parsed_data
                db.commit()
                logger.info(f"Successfully processed and stored resume {resume_id}")
        except Exception as e:
            logger.error(f"Database update failed: {e}")
            db.rollback()
