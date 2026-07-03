import json
from fastapi import APIRouter, HTTPException
from app.config import DATA_DIR

router = APIRouter()

def load_json_file(filename: str):
    with open(DATA_DIR / filename, "r", encoding="utf-8") as f:
        return json.load(f)

@router.get("/curriculum")
async def get_curriculum():
    return load_json_file("index.json")

@router.get("/lessons/{lesson_id}")
async def get_lesson(lesson_id: str):
    if "/" in lesson_id or ".." in lesson_id:
        raise HTTPException(status_code=400, detail="Bad lesson id")
    try:
        return load_json_file(f"{lesson_id}.json")
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Lesson not found")
