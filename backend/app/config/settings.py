from pydantic_settings import BaseSettings, SettingsConfigDict
import urllib.parse


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Job Automation Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "Sharun@2310"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "job_automation_db"

    # JWT Auth
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION_0123456789"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Models
    GEMINI_API_KEY: str = ""
    CHROMA_DB_DIR: str = "./chroma_db"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        encoded_password = urllib.parse.quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql://{self.POSTGRES_USER}:{encoded_password}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()
