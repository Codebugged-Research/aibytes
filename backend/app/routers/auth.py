import json
from fastapi import APIRouter, Depends
from app.db import get_pool
from app.schemas import AuthReq
from app.auth import make_token

router = APIRouter()

def progress_row_to_dict(row) -> dict:
    return {
        "xp": row["xp"],
        "streak": row["streak"],
        "lastLessonDate": row["last_lesson_date"],
        "currentLesson": row["current_lesson"],
        "completedLessons": json.loads(row["completed_lessons"]),
        "lessonProgress": json.loads(row["lesson_progress"]),
    }

@router.post("/auth")
async def auth(req: AuthReq):
    """Upsert user by email, ensure a progress row, return JWT + user + progress."""
    pool = await get_pool()
    async with pool.acquire() as con:
        async with con.transaction():
            user = await con.fetchrow(
                """INSERT INTO users (email, name, auth_method, phone)
                   VALUES ($1, $2, $3, $4)
                   ON CONFLICT (email) DO UPDATE
                     SET name = COALESCE(NULLIF(EXCLUDED.name, ''), users.name),
                         auth_method = EXCLUDED.auth_method,
                         phone = COALESCE(EXCLUDED.phone, users.phone)
                   RETURNING id, email, name, auth_method, phone""",
                req.email, req.name, req.authMethod, req.phone,
            )
            prog = await con.fetchrow(
                """INSERT INTO progress (user_id) VALUES ($1)
                   ON CONFLICT (user_id) DO UPDATE SET updated_at = now()
                   RETURNING *""",
                user["id"],
            )
    return {
        "token": make_token(user["id"]),
        "user": {"id": user["id"], "email": user["email"], "name": user["name"],
                 "authMethod": user["auth_method"], "phone": user["phone"]},
        "progress": progress_row_to_dict(prog),
    }
