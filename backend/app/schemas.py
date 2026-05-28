from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.models import ListKind, ListVisibility


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    avatar_url: str | None = None

    model_config = {"from_attributes": True}


class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    name: str = Field(min_length=1, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    id_token: str


class PlaceRead(BaseModel):
    id: UUID
    name: str
    area: str
    city: str
    category: str
    restaurant_type: str
    cuisines: list[str]
    tags: list[str]
    occasions: list[str]
    emoji: str
    latitude: float
    longitude: float
    map_x: float
    map_y: float
    rating: float
    reviews_count: int
    score: float
    food_score: float
    ambience_score: float
    service_score: float
    value_score: float
    wait_score: float
    ai_summary: str
    photo_urls: list[str] = []

    model_config = {"from_attributes": True}


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: str | None = Field(default=None, max_length=2000)
    visited_at: datetime | None = None


class ReviewRead(BaseModel):
    id: UUID
    user_id: UUID
    place_id: UUID
    rating: int
    text: str | None
    visited_at: datetime | None
    created_at: datetime

    model_config = {"from_attributes": True}


class PhotoRead(BaseModel):
    id: UUID
    place_id: UUID
    review_id: UUID | None
    url: str
    caption: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ListCreate(BaseModel):
    name: str = Field(min_length=1, max_length=80)
    description: str | None = Field(default=None, max_length=300)
    emoji: str = Field(default="⭐", max_length=16)
    visibility: ListVisibility = ListVisibility.private
    kind: ListKind = ListKind.custom


class ListItemCreate(BaseModel):
    place_id: UUID
    note: str | None = Field(default=None, max_length=240)


class ListItemRead(BaseModel):
    id: UUID
    place_id: UUID
    note: str | None
    place: PlaceRead

    model_config = {"from_attributes": True}


class ListRead(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: str | None
    emoji: str
    visibility: ListVisibility
    kind: ListKind
    items: list[ListItemRead] = []

    model_config = {"from_attributes": True}


class OccasionRead(BaseModel):
    slug: str
    label: str
    description: str
    filters: dict


class HeatmapPoint(BaseModel):
    place_id: UUID
    latitude: float
    longitude: float
    weight: float
    label: str
