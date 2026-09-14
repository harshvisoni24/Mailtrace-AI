import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    database_url: str = os.getenv("DATABASE_URL", "")
    port: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    env: str = os.getenv("ENV", "development")

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key)


settings = Settings()
