from __future__ import annotations

from pydantic import BaseModel, EmailStr
from typing import Optional

from ..models.user import UserTier


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    tier: Optional[UserTier] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    username: str
    tier: UserTier

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

