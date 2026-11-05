from uuid import UUID

from fastapi import Depends, Header, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.identity import User, TenantUser


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Authentication credentials are required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.secret_key,
            algorithms=["HS256"],
        )

        if payload.get("type") != "access":
            raise HTTPException(
                status_code=401,
                detail="Invalid access token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user_id = UUID(payload["sub"])

    except (JWTError, KeyError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        raise HTTPException(
            status_code=401,
            detail="Inactive or unavailable user",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_tenant_membership(
    x_tenant_id: UUID = Header(..., alias="X-Tenant-ID"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> TenantUser:
    membership = (
        db.query(TenantUser)
        .filter_by(
            tenant_id=x_tenant_id,
            user_id=user.id,
            is_active=True,
        )
        .first()
    )

    if membership is None:
        raise HTTPException(
            status_code=403,
            detail="No access to this workspace",
        )

    return membership