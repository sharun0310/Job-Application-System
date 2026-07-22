import fitz  # PyMuPDF
import docx
import easyocr
import io
import logging

logger = logging.getLogger(__name__)


class TextExtractor:
    def __init__(self):
        # Initialize EasyOCR reader (English only for now to save memory)
        try:
            self.reader = easyocr.Reader(["en"], gpu=False)
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {e}")
            self.reader = None

    def extract_from_pdf(self, file_bytes: bytes) -> str:
        text = ""
        try:
            doc = fitz.open(stream=file_bytes, filetype="pdf")
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            logger.error(f"PDF Extraction error: {e}")
            return ""

    def extract_from_docx(self, file_bytes: bytes) -> str:
        text = ""
        try:
            doc = docx.Document(io.BytesIO(file_bytes))
            for para in doc.paragraphs:
                text += para.text + "\n"
            return text
        except Exception as e:
            logger.error(f"DOCX Extraction error: {e}")
            return ""

    def extract_from_image(self, file_bytes: bytes) -> str:
        if not self.reader:
            return ""
        try:
            result = self.reader.readtext(file_bytes, detail=0)
            return " ".join(result)
        except Exception as e:
            logger.error(f"Image OCR error: {e}")
            return ""


text_extractor = TextExtractor()
