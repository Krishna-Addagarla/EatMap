from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.models import Place
from app.routers.places import serialize_place
from app.schemas import OccasionRead, PlaceRead

router = APIRouter(prefix="/occasions", tags=["occasions"])

OCCASIONS = {
    "date": {
        "label": "Date spots",
        "description": "Romantic restaurants, dessert cafes, and rooftops with strong ambience.",
        "filters": {"occasions": ["date"], "min_rating": 4.2},
    },
    "team-lunch": {
        "label": "Team lunch",
        "description": "Group-friendly places with reliable service and broad menus.",
        "filters": {"occasions": ["team-lunch"], "min_rating": 4.0},
    },
    "rooftop": {
        "label": "Rooftop",
        "description": "Skyline views, restro bars, and higher ambience scores.",
        "filters": {"occasions": ["rooftop"], "category": "rooftop"},
    },
    "breakfast": {
        "label": "Breakfast and tiffins",
        "description": "Early, fast, high-value tiffin and cafe picks.",
        "filters": {"occasions": ["breakfast"], "category": "tiffin"},
    },
    "biryani-run": {
        "label": "Biryani run",
        "description": "High-scoring biryani staples and late-night cravings.",
        "filters": {"occasions": ["biryani-run"], "category": "biryani"},
    },
    "party": {
        "label": "Party places",
        "description": "Pubs, restro bars, cocktails, and high-energy venues.",
        "filters": {"occasions": ["party"], "restaurant_type": "restro bar"},
    },
}


@router.get("", response_model=list[OccasionRead])
async def list_occasions() -> list[OccasionRead]:
    return [OccasionRead(slug=slug, **payload) for slug, payload in OCCASIONS.items()]


@router.get("/{slug}/places", response_model=list[PlaceRead])
async def places_for_occasion(slug: str, session: AsyncSession = Depends(get_session)) -> list[PlaceRead]:
    config = OCCASIONS.get(slug)
    if not config:
        raise HTTPException(status_code=404, detail="Occasion not found")

    filters = config["filters"]
    stmt = select(Place).options(selectinload(Place.photos)).where(Place.is_active.is_(True))
    if filters.get("category"):
        stmt = stmt.where(Place.category == filters["category"])
    if filters.get("restaurant_type"):
        stmt = stmt.where(func.lower(Place.restaurant_type).like(f"%{filters['restaurant_type']}%"))
    if filters.get("min_rating"):
        stmt = stmt.where(Place.rating >= filters["min_rating"])
    for occasion in filters.get("occasions", []):
        stmt = stmt.where(func.lower(Place.occasions.cast(str)).like(f"%{occasion}%"))
    places = await session.scalars(stmt.order_by(Place.score.desc(), Place.rating.desc()))
    return [serialize_place(place) for place in places]
