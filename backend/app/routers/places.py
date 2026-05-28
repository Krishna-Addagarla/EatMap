from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import Place
from app.schemas import HeatmapPoint, PlaceRead

router = APIRouter(prefix="/places", tags=["places"])


def serialize_place(place: Place) -> PlaceRead:
    data = PlaceRead.model_validate(place)
    data.photo_urls = [photo.url for photo in place.photos]
    return data


def filter_places_query(
    q: str | None,
    category: str | None,
    cuisine: list[str],
    restaurant_type: list[str],
    occasion: str | None,
    area: str | None,
    min_rating: float | None,
) -> Select[tuple[Place]]:
    stmt = select(Place).options(selectinload(Place.photos)).where(Place.is_active.is_(True))
    if q:
        needle = f"%{q.lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Place.name).like(needle),
                func.lower(Place.area).like(needle),
                func.lower(Place.category).like(needle),
                func.lower(Place.restaurant_type).like(needle),
            )
        )
    if category:
        stmt = stmt.where(Place.category == category)
    if area:
        stmt = stmt.where(func.lower(Place.area) == area.lower())
    if min_rating is not None:
        stmt = stmt.where(Place.rating >= min_rating)
    if cuisine:
        stmt = stmt.where(or_(*[func.lower(Place.cuisines.cast(str)).like(f"%{item.lower()}%") for item in cuisine]))
    if restaurant_type:
        stmt = stmt.where(
            or_(*[func.lower(Place.restaurant_type).like(f"%{item.lower()}%") for item in restaurant_type])
        )
    if occasion:
        stmt = stmt.where(func.lower(Place.occasions.cast(str)).like(f"%{occasion.lower()}%"))
    return stmt.order_by(Place.score.desc(), Place.rating.desc())


@router.get("", response_model=list[PlaceRead])
async def list_places(
    session: Annotated[AsyncSession, Depends(get_session)],
    q: str | None = None,
    category: str | None = None,
    cuisine: Annotated[list[str], Query()] = [],
    restaurant_type: Annotated[list[str], Query()] = [],
    occasion: str | None = None,
    area: str | None = None,
    min_rating: float | None = Query(default=None, ge=0, le=5),
) -> list[PlaceRead]:
    result = await session.scalars(
        filter_places_query(q, category, cuisine, restaurant_type, occasion, area, min_rating)
    )
    return [serialize_place(place) for place in result]


@router.get("/meta/filters")
async def get_filter_options(session: AsyncSession = Depends(get_session)) -> dict:
    places = (await session.scalars(select(Place).where(Place.is_active.is_(True)))).all()
    return {
        "categories": sorted({place.category for place in places}),
        "cuisines": sorted({cuisine for place in places for cuisine in place.cuisines}),
        "restaurant_types": sorted({place.restaurant_type for place in places}),
        "areas": sorted({place.area for place in places}),
        "occasions": sorted({occasion for place in places for occasion in place.occasions}),
    }


@router.get("/meta/heatmap", response_model=list[HeatmapPoint])
async def heatmap(
    session: AsyncSession = Depends(get_session),
    mode: str = Query(default="popularity", pattern="^(popularity|rating|trending|crowd)$"),
    category: str | None = None,
) -> list[HeatmapPoint]:
    stmt = select(Place).where(Place.is_active.is_(True))
    if category:
        stmt = stmt.where(Place.category == category)
    places = (await session.scalars(stmt)).all()
    points = []
    for place in places:
        if mode == "rating":
            weight = place.rating / 5
        elif mode == "crowd":
            weight = max(0.1, 1 - place.wait_score / 5)
        elif mode == "trending":
            weight = min(1, (place.score + (place.reviews_count / 2500)) / 12)
        else:
            weight = min(1, place.reviews_count / 9000)
        points.append(HeatmapPoint(place_id=place.id, latitude=place.latitude, longitude=place.longitude, weight=round(weight, 3), label=place.name))
    return points


@router.get("/{place_id}", response_model=PlaceRead)
async def get_place(place_id: UUID, session: AsyncSession = Depends(get_session)) -> PlaceRead:
    place = await session.scalar(select(Place).options(selectinload(Place.photos)).where(Place.id == place_id))
    if not place:
        raise HTTPException(status_code=404, detail="Place not found")
    return serialize_place(place)
