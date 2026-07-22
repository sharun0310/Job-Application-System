import chromadb
from chromadb.config import Settings
from app.config.settings import settings


class ChromaDBClient:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ChromaDBClient, cls).__new__(cls)
            cls._instance.client = chromadb.PersistentClient(
                path=settings.CHROMA_DB_DIR,
                settings=Settings(anonymized_telemetry=False),
            )
            cls._instance.resume_collection = (
                cls._instance.client.get_or_create_collection(name="resume_embeddings")
            )
            cls._instance.job_collection = (
                cls._instance.client.get_or_create_collection(name="job_embeddings")
            )
        return cls._instance

    @property
    def resumes(self):
        return self.resume_collection

    @property
    def jobs(self):
        return self.job_collection


# Singleton access
chroma_client = ChromaDBClient()
