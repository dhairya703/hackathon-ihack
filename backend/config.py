import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    NVD_API_KEY: str = os.getenv("NVD_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

settings = Settings()
