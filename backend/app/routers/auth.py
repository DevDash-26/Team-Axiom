"""Auth routes. Login lives in Supabase; we only return the campus profile."""

from typing import Annotated

from fastapi import APIRouter, Depends

from app.models.user import User
from app.schemas.user import UserPublic
from app.security import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserPublic)
def read_me(user: Annotated[User, Depends(get_current_user)]) -> User:
    return user
