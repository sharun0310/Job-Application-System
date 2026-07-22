from sentence_transformers import SentenceTransformer
from typing import List
import logging

logger = logging.getLogger(__name__)


class EmbeddingService:
    """
    Service to generate vector embeddings for text using Sentence Transformers.
    """

    def __init__(self):
        self._model = None
        self._model_name = "all-MiniLM-L6-v2"
        
    @property
    def model(self):
        if self._model is None:
            logger.info("Loading SentenceTransformer model lazily...")
            try:
                self._model = SentenceTransformer(self._model_name)
                logger.info("SentenceTransformer model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load SentenceTransformer: {e}")
                raise RuntimeError("Failed to initialize AI model")
        return self._model

    def generate_embedding(self, text: str) -> List[float]:
        """Generates a vector embedding for a single text string."""
        if not self.model:
            raise RuntimeError("Embedding model is not loaded.")
        # encode returns a numpy array, convert to standard python list for ChromaDB
        return self.model.encode(text).tolist()

    def generate_embeddings_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates embeddings for a batch of text strings."""
        if not self.model:
            raise RuntimeError("Embedding model is not loaded.")
        return self.model.encode(texts).tolist()


embedding_service = EmbeddingService()
