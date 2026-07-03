import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://localhost/aibites")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-insecure-change-me-in-production")
JWT_ALGO = "HS256"

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")
DATA_DIR = BASE_DIR / "data"
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")
