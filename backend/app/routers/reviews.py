from pathlib import Path
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_session
from app.dependencies import get_current_user
from app.models import Photo, Place, Review, User
from app.schemas import PhotoRead, ReviewCreate, ReviewRead

router = APIRouter(prefix="/places/{place_id}", tags=["reviews"])


async def recalculate_place_rating(session: AsyncSession, place_id: UUID) -> None:
    avg_rating, count = (
        await session.execute(select(func.avg(Review.rating), func.count(Review.id)).where(Review.place_id == place_id))
    ).one()
    place = await session.get(Place, place_id)
    if place and count:
        place.rating = round(float(avg_rating), 2)
        place.reviews_count = int(count)


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def upsert_review(
    place_id: UUID,
    payload: ReviewCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Review:
    if not await session.get(Place, place_id):
        raise HTTPException(status_code=404, detail="Place not found")
    review = await session.scalar(select(Review).where(Review.place_id == place_id, Review.user_id == current_user.id))
    if review:
        review.rating = payload.rating
        review.text = payload.text
        review.visited_at = payload.visited_at
    else:
        review = Review(user_id=current_user.id, place_id=place_id, **payload.model_dump())
        session.add(review)
    await session.flush()
    await recalculate_place_rating(session, place_id)
    await session.commit()
    await session.refresh(review)
    return review


@router.get("/reviews", response_model=list[ReviewRead])
async def list_reviews(place_id: UUID, session: AsyncSession = Depends(get_session)) -> list[Review]:
    return list((await session.scalars(select(Review).where(Review.place_id == place_id).order_by(Review.created_at.desc()))).all())


@router.post("/photos", response_model=PhotoRead, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    place_id: UUID,
    image: UploadFile = File(...),
    caption: str | None = Form(default=None),
    review_id: UUID | None = Form(default=None),
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Photo:
    if not await session.get(Place, place_id):
        raise HTTPException(status_code=404, detail="Place not found")
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    settings = get_settings()
    upload_dir = Path(settings.media_root) / "places" / str(place_id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    suffix = Path(image.filename or "upload.jpg").suffix.lower()[:12] or ".jpg"
    filename = f"{uuid4()}{suffix}"
    destination = upload_dir / filename
    destination.write_bytes(await image.read())

    url = f"{settings.public_media_base_url}/places/{place_id}/{filename}"
    photo = Photo(user_id=current_user.id, place_id=place_id, review_id=review_id, url=url, caption=caption)
    session.add(photo)
    await session.commit()
    await session.refresh(photo)
    return photo
