from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from sqlalchemy import select, update


from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    generate_refresh_token,
    hash_refresh_token,
    refresh_token_expiry,
)

from app.models import (
    Tenant,
    User,
    TenantUser,
    Branch,
    Member,
    RefreshSession,
)

from app.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshRequest,
    LogoutRequest,
    TokenOut,
    UserOut,
    WorkspaceOut,
    AuthMeOut,
    MemberCreate,
    MemberOut,
    BranchCreate,
)

from app.api.dependencies import (
    get_current_user,
    get_tenant_membership,
)


router = APIRouter()


def create_session_tokens(
    db: Session,
    user: User,
) -> TokenOut:
    refresh_token = generate_refresh_token()

    session = RefreshSession(
        user_id=user.id,
        token_hash=hash_refresh_token(refresh_token),
        expires_at=refresh_token_expiry(),
    )

    db.add(session)

    return TokenOut(
        access_token=create_access_token(str(user.id)),
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


def get_user_workspaces(
    db: Session,
    user_id,
):
    memberships = db.scalars(
        select(TenantUser).where(
            TenantUser.user_id == user_id,
            TenantUser.is_active.is_(True),
        )
    ).all()

    results = []

    for membership in memberships:
        tenant = db.get(Tenant, membership.tenant_id)

        if tenant is None:
            continue

        results.append(
            WorkspaceOut(
                id=tenant.id,
                name=tenant.name,
                slug=tenant.slug,
                status=tenant.status,
                role=membership.role_name,
                currency=tenant.default_currency,
                timezone=tenant.timezone,
            )
        )

    return results


# --------------------------------------------------
# AUTHENTICATION
# --------------------------------------------------

@router.post(
    "/auth/register",
    response_model=TokenOut,
    status_code=status.HTTP_201_CREATED,
)
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower().strip()
    slug = data.gym_slug.lower().strip()

    existing_user = db.scalar(
        select(User).where(User.email == email)
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered",
        )

    existing_tenant = db.scalar(
        select(Tenant).where(Tenant.slug == slug)
    )

    if existing_tenant:
        raise HTTPException(
            status_code=409,
            detail="Workspace slug already taken",
        )

    try:
        user = User(
            email=email,
            full_name=data.full_name.strip(),
            password_hash=hash_password(data.password),
            is_active=True,
        )

        tenant = Tenant(
            name=data.gym_name.strip(),
            slug=slug,
            status="active",
            default_currency="GHS",
            timezone="Africa/Accra",
        )

        db.add_all([user, tenant])
        db.flush()

        membership = TenantUser(
            tenant_id=tenant.id,
            user_id=user.id,
            role_name="owner",
            is_active=True,
        )

        db.add(membership)

        tokens = create_session_tokens(db, user)

        db.commit()

        return tokens

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=409,
            detail="Registration conflict. Check the email and workspace slug.",
        )

    except Exception:
        db.rollback()
        raise


@router.post(
    "/auth/login",
    response_model=TokenOut,
)
def login(
    data: LoginRequest,
    db: Session = Depends(get_db),
):
    email = str(data.email).lower().strip()

    user = db.scalar(
        select(User).where(User.email == email)
    )

    if not user or not verify_password(
        data.password,
        user.password_hash,
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is inactive",
        )

    tokens = create_session_tokens(db, user)

    db.commit()

    return tokens


@router.post(
    "/auth/refresh",
    response_model=TokenOut,
)
def refresh(
    data: RefreshRequest,
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    token_hash = hash_refresh_token(data.refresh_token)

    # Atomically revoke the token only if it is still valid.
    # Only one concurrent request can successfully update this row.
    result = db.execute(
        update(RefreshSession)
        .where(
            RefreshSession.token_hash == token_hash,
            RefreshSession.revoked_at.is_(None),
            RefreshSession.expires_at > now,
        )
        .values(revoked_at=now)
        .returning(RefreshSession.user_id)
    )

    user_id = result.scalar_one_or_none()

    if user_id is None:
        # Determine whether this was a previously revoked token.
        existing_session = db.scalar(
            select(RefreshSession).where(
                RefreshSession.token_hash == token_hash
            )
        )

        if (
            existing_session is not None
            and existing_session.revoked_at is not None
        ):
            # Possible refresh-token reuse.
            # Revoke every remaining active session for this user.
            db.execute(
                update(RefreshSession)
                .where(
                    RefreshSession.user_id == existing_session.user_id,
                    RefreshSession.revoked_at.is_(None),
                )
                .values(revoked_at=now)
            )
            db.commit()

            raise HTTPException(
                status_code=401,
                detail="Refresh token reuse detected. Please log in again.",
            )

        db.rollback()

        raise HTTPException(
            status_code=401,
            detail="Refresh token is invalid or expired",
        )

    user = db.get(User, user_id)

    if user is None or not user.is_active:
        # Revoke any other active sessions belonging to this account.
        db.execute(
            update(RefreshSession)
            .where(
                RefreshSession.user_id == user_id,
                RefreshSession.revoked_at.is_(None),
            )
            .values(revoked_at=now)
        )
        db.commit()

        raise HTTPException(
            status_code=401,
            detail="Account is unavailable. Please log in again.",
        )

    # The old token is already revoked.
    # Create a replacement refresh session and access token.
    tokens = create_session_tokens(db, user)

    db.commit()

    return tokens

@router.post("/auth/logout")
def logout(
    data: LogoutRequest,
    db: Session = Depends(get_db),
):
    token_hash = hash_refresh_token(data.refresh_token)

    session = db.scalar(
        select(RefreshSession).where(
            RefreshSession.token_hash == token_hash
        )
    )

    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        db.commit()

    return {"message": "Logged out successfully"}


@router.get(
    "/auth/me",
    response_model=AuthMeOut,
)
def me(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return AuthMeOut(
        user=UserOut.model_validate(user),
        workspaces=get_user_workspaces(db, user.id),
    )


@router.get(
    "/workspaces",
    response_model=list[WorkspaceOut],
)
def list_workspaces(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_user_workspaces(db, user.id)


# --------------------------------------------------
# BRANCHES
# --------------------------------------------------

@router.post("/branches", status_code=201)
def create_branch(
    data: BranchCreate,
    db: Session = Depends(get_db),
    membership=Depends(get_tenant_membership),
):
    branch = Branch(
        tenant_id=membership.tenant_id,
        **data.model_dump(),
    )

    db.add(branch)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Branch code already exists in this workspace",
        )

    db.refresh(branch)

    return {
        "id": str(branch.id),
        "name": branch.name,
        "code": branch.code,
    }


# --------------------------------------------------
# MEMBERS
# --------------------------------------------------

@router.post(
    "/members",
    response_model=MemberOut,
    status_code=201,
)
def create_member(
    data: MemberCreate,
    db: Session = Depends(get_db),
    membership=Depends(get_tenant_membership),
):
    member = Member(
        tenant_id=membership.tenant_id,
        **data.model_dump(),
    )

    db.add(member)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="Member could not be created; check the member number",
        )

    db.refresh(member)

    return member


@router.get(
    "/members",
    response_model=list[MemberOut],
)
def list_members(
    db: Session = Depends(get_db),
    membership=Depends(get_tenant_membership),
):
    return db.scalars(
        select(Member)
        .where(Member.tenant_id == membership.tenant_id)
        .order_by(Member.created_at.desc())
    ).all()