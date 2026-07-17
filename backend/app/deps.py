from uuid import UUID

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import Permission, RolePermission, User
from app.security import decode_access_token


def current_user(authorization: str | None = Header(None), db: Session = Depends(get_db)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    payload = decode_access_token(authorization.split(" ", 1)[1])
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.get(User, UUID(payload["sub"]))
    if not user or user.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user")
    return user


def require_permission(permission_code: str):
    def checker(user: User = Depends(current_user), db: Session = Depends(get_db)) -> User:
        if user.role.code == "admin":
            return user
        stmt = (
            select(Permission.code)
            .join(RolePermission, Permission.id == RolePermission.permission_id)
            .where(RolePermission.role_id == user.role_id, Permission.code == permission_code)
        )
        if not db.scalar(stmt):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Missing permission: {permission_code}")
        return user

    return checker

