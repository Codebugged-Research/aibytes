from fastapi import FastAPI, APIRouter
from starlette.middleware.cors import CORSMiddleware
from app.config import CORS_ORIGINS, OPENAI_API_KEY
from app.db import get_pool, close_pool
from app.routers import lessons, auth, progress, chat

app = FastAPI(title="AIBites API")
api_router = APIRouter(prefix="/api")

# Register routers
api_router.include_router(lessons.router)
api_router.include_router(auth.router)
api_router.include_router(progress.router)
api_router.include_router(chat.router)


@api_router.get("/")
async def root():
    return {"message": "AIBites API", "chat": bool(OPENAI_API_KEY)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    # Warm up the database pool and ensure schema on start
    await get_pool()


@app.on_event("shutdown")
async def shutdown():
    # Clean up the pool on shutdown
    await close_pool()
