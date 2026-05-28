import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, Float, ForeignKey, Integer, String, Text, UniqueConstraint, Uuid, func
from sqlalchemy.ext.mutable import MutableList
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import JSON

from app.database import Base


def uuid_pk() -> Mapped[uuid.UUID]:
    return mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)


class ListVisibility(str, enum.Enum):
    public = "public"
    private = "private"


class ListKind(str, enum.Enum):
    custom = "custom"
    favorites = "favorites"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    google_sub: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    reviews: Mapped[list["Review"]] = relationship(back_populates="user")
    lists: Mapped[list["PlaceList"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Place(Base):
    __tablename__ = "places"

    id: Mapped[uuid.UUID] = uuid_pk()
    name: Mapped[str] = mapped_column(String(180), index=True)
    area: Mapped[str] = mapped_column(String(120), index=True)
    city: Mapped[str] = mapped_column(String(80), default="Hyderabad", index=True)
    category: Mapped[str] = mapped_column(String(60), index=True)
    restaurant_type: Mapped[str] = mapped_column(String(80), index=True)
    cuisines: Mapped[list[str]] = mapped_column(MutableList.as_mutable(JSON), default=list)
    tags: Mapped[list[str]] = mapped_column(MutableList.as_mutable(JSON), default=list)
    occasions: Mapped[list[str]] = mapped_column(MutableList.as_mutable(JSON), default=list)
    emoji: Mapped[str] = mapped_column(String(16), default="🍽")
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    map_x: Mapped[float] = mapped_column(Float, default=50)
    map_y: Mapped[float] = mapped_column(Float, default=50)
    rating: Mapped[float] = mapped_column(Float, default=0)
    reviews_count: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[float] = mapped_column(Float, default=0)
    food_score: Mapped[float] = mapped_column(Float, default=0)
    ambience_score: Mapped[float] = mapped_column(Float, default=0)
    service_score: Mapped[float] = mapped_column(Float, default=0)
    value_score: Mapped[float] = mapped_column(Float, default=0)
    wait_score: Mapped[float] = mapped_column(Float, default=0)
    ai_summary: Mapped[str] = mapped_column(Text, default="")
    external_provider: Mapped[str | None] = mapped_column(String(80), nullable=True)
    external_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    reviews: Mapped[list["Review"]] = relationship(back_populates="place", cascade="all, delete-orphan")
    photos: Mapped[list["Photo"]] = relationship(back_populates="place", cascade="all, delete-orphan")


class Review(Base):
    __tablename__ = "reviews"
    __table_args__ = (UniqueConstraint("user_id", "place_id", name="uq_review_user_place"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"), index=True)
    rating: Mapped[int] = mapped_column(Integer)
    text: Mapped[str | None] = mapped_column(Text, nullable=True)
    visited_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="reviews")
    place: Mapped[Place] = relationship(back_populates="reviews")
    photos: Mapped[list["Photo"]] = relationship(back_populates="review")


class Photo(Base):
    __tablename__ = "photos"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"), index=True)
    review_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("reviews.id", ondelete="SET NULL"), nullable=True)
    url: Mapped[str] = mapped_column(String(700))
    caption: Mapped[str | None] = mapped_column(String(160), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    place: Mapped[Place] = relationship(back_populates="photos")
    review: Mapped[Review | None] = relationship(back_populates="photos")


class PlaceList(Base):
    __tablename__ = "place_lists"

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    emoji: Mapped[str] = mapped_column(String(16), default="⭐")
    visibility: Mapped[ListVisibility] = mapped_column(Enum(ListVisibility), default=ListVisibility.private)
    kind: Mapped[ListKind] = mapped_column(Enum(ListKind), default=ListKind.custom)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship(back_populates="lists")
    items: Mapped[list["PlaceListItem"]] = relationship(back_populates="list", cascade="all, delete-orphan")


class PlaceListItem(Base):
    __tablename__ = "place_list_items"
    __table_args__ = (UniqueConstraint("list_id", "place_id", name="uq_list_place"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    list_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("place_lists.id", ondelete="CASCADE"), index=True)
    place_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("places.id", ondelete="CASCADE"), index=True)
    note: Mapped[str | None] = mapped_column(String(240), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    list: Mapped[PlaceList] = relationship(back_populates="items")
    place: Mapped[Place] = relationship()
