from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_session
from app.dependencies import get_current_user
from app.models import ListKind, ListVisibility, PlaceList, User
from app.schemas import GoogleLoginRequest, LoginRequest, SignupRequest, TokenResponse, UserRead
from app.security import create_access_token, hash_password, verify_google_id_token, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


async def ensure_favorites_list(session: AsyncSession, user: User) -> None:
    existing = await session.scalar(
        select(PlaceList).where(PlaceList.user_id == user.id, PlaceList.kind == ListKind.favorites)
    )
    if not existing:
        session.add(
            PlaceList(
                user_id=user.id,
                name="Favorites",
                description="Saved places",
                emoji="⭐",
                visibility=ListVisibility.private,
                kind=ListKind.favorites,
            )
        )


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: SignupRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    existing = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if existing:
        raise HTTPException(status_code=409, detail="Email is already registered")

    user = User(email=payload.email.lower(), name=payload.name, hashed_password=hash_password(payload.password))
    session.add(user)
    await session.flush()
    await ensure_favorites_list(session, user)
    await session.commit()
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    user = await session.scalar(select(User).where(User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/google", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest, session: AsyncSession = Depends(get_session)) -> TokenResponse:
    try:
        profile = verify_google_id_token(payload.id_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    email = str(profile.get("email", "")).lower()
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Google account did not return email")

    user = await session.scalar(select(User).where(User.email == email))
    if not user:
        user = User(
            email=email,
            name=profile.get("name") or email.split("@")[0],
            google_sub=profile.get("sub"),
            avatar_url=profile.get("picture"),
        )
        session.add(user)
        await session.flush()
        await ensure_favorites_list(session, user)
    elif not user.google_sub:
        user.google_sub = profile.get("sub")
        user.avatar_url = user.avatar_url or profile.get("picture")
    await session.commit()
    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserRead)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user
