import json
from fastapi import APIRouter, Depends, HTTPException
from app.db import get_pool
from app.schemas import ProgressReq
from app.auth import current_user_id
from app.routers.auth import progress_row_to_dict

router = APIRouter()

@router.get("/progress")
async def get_progress(uid: int = Depends(current_user_id)):
    pool = await get_pool()
    async with pool.acquire() as con:
        row = await con.fetchrow("SELECT * FROM progress WHERE user_id = $1", uid)
    if not row:
        raise HTTPException(status_code=404, detail="No progress")
    return progress_row_to_dict(row)

@router.put("/progress")
async def put_progress(req: ProgressReq, uid: int = Depends(current_user_id)):
    pool = await get_pool()
    async with pool.acquire() as con:
        row = await con.fetchrow(
            """UPDATE progress SET
                 xp = $2, streak = $3, last_lesson_date = $4, current_lesson = $5,
                 completed_lessons = $6::jsonb, lesson_progress = $7::jsonb, updated_at = now()
               WHERE user_id = $1 RETURNING *""",
            uid, req.xp, req.streak, req.lastLessonDate, req.currentLesson,
            json.dumps(req.completedLessons), json.dumps(req.lessonProgress),
        )
    if not row:
        raise HTTPException(status_code=404, detail="No progress row")
    return progress_row_to_dict(row)
