"""Supabase JWT verification and the reusable permission dependency."""

from __future__ import annotations

import logging
import uuid
from collections.abc import Callable
from typing import Annotated

import jwt
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from sqlalchemy.orm import Session

from app.config import Settings, get_settings
from app.constants import PERMISSION_ROLES, JWT_ALG_HS256, Permission, Role
from app.db import get_db
from app.errors import AppError
from app.models.user import User

logger = logging.getLogger(__name__)

_bearer = HTTPBearer(auto_error=False)
_jwks_client: PyJWKClient | None = None


def _get_jwks_client(settings: Settings) -> PyJWKClient:
    global _jwks_client
    if _jwks_client is None:
        jwks_url = f"{settings.supabase_url.rstrip('/')}/auth/v1/.well-known/jwks.json"
        _jwks_client = PyJWKClient(jwks_url, cache_jwk_set=True, lifespan=600)
    return _jwks_client


def decode_access_token(token: str, settings: Settings) -> dict:
    """Verify a Supabase access token (HS256 secret or JWKS for asymmetric keys)."""
    try:
        header = jwt.get_unverified_header(token)
    except jwt.InvalidTokenError as exc:
        raise AppError(401, "UNAUTHENTICATED", "Invalid access token") from exc

    algorithm = header.get("alg", JWT_ALG_HS256)
    decode_options = {"require": ["exp", "sub"]}
    try:
        if algorithm == JWT_ALG_HS256:
            if not settings.supabase_jwt_secret:
                raise AppError(401, "UNAUTHENTICATED", "Server is not configured to verify tokens")
            return jwt.decode(
                token,
                settings.supabase_jwt_secret,
                algorithms=[JWT_ALG_HS256],
                audience="authenticated",
                options=decode_options,
            )
        if not settings.supabase_url:
            raise AppError(401, "UNAUTHENTICATED", "Server is not configured to verify tokens")
        signing_key = _get_jwks_client(settings).get_signing_key_from_jwt(token)
        return jwt.decode(
            token,
            signing_key.key,
            algorithms=[algorithm],
            audience="authenticated",
            options=decode_options,
        )
    except AppError:
        raise
    except jwt.ExpiredSignatureError as exc:
        raise AppError(401, "UNAUTHENTICATED", "Access token has expired") from exc
    except jwt.InvalidTokenError as exc:
        raise AppError(401, "UNAUTHENTICATED", "Invalid access token") from exc


def _user_from_token(
    credentials: HTTPAuthorizationCredentials | None,
    db: Session,
    settings: Settings,
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError(401, "UNAUTHENTICATED", "Sign in to continue")
    payload = decode_access_token(credentials.credentials, settings)
    raw_sub = payload.get("sub")
    if not raw_sub:
        raise AppError(401, "UNAUTHENTICATED", "Invalid access token")
    try:
        user_id = uuid.UUID(str(raw_sub))
    except ValueError as exc:
        raise AppError(401, "UNAUTHENTICATED", "Invalid access token") from exc
    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise AppError(401, "UNAUTHENTICATED", "Account is not available")
    return user


def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> User:
    return _user_from_token(credentials, db, settings)


def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(_bearer)],
    db: Annotated[Session, Depends(get_db)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> User | None:
    if credentials is None:
        return None
    return _user_from_token(credentials, db, settings)


def user_has_permission(role: str, permission: Permission) -> bool:
    allowed = PERMISSION_ROLES.get(permission, frozenset())
    try:
        return Role(role) in allowed
    except ValueError:
        return False


def require_permission(permission: Permission) -> Callable[..., User]:
    def dependency(user: Annotated[User, Depends(get_current_user)]) -> User:
        if not user_has_permission(user.role, permission):
            raise AppError(403, "FORBIDDEN", "You do not have permission to do that")
        return user

    return dependency
