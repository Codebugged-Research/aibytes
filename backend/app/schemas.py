from pydantic import BaseModel, EmailStr

class AuthReq(BaseModel):
    email: EmailStr
    name: str = ""
    authMethod: str = "email"          # email | phone | google | apple
    phone: str | None = None

class ProgressReq(BaseModel):
    xp: int = 0
    streak: int = 0
    lastLessonDate: str | None = None
    currentLesson: str = "u0-l1"
    completedLessons: list[str] = []
    lessonProgress: dict = {}

class ChatMsg(BaseModel):
    role: str
    content: str

class ChatReq(BaseModel):
    messages: list[ChatMsg]
