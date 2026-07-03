import jwt
from fastapi import Header, HTTPException
from app.config import JWT_SECRET, JWT_ALGO

def make_token(user_id: int) -> str:
    return jwt.encode({"uid": user_id}, JWT_SECRET, algorithm=JWT_ALGO)

async def current_user_id(authorization: str = Header(default="")) -> int:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        payload = jwt.decode(authorization[7:], JWT_SECRET, algorithms=[JWT_ALGO])
        return int(payload["uid"])
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")
