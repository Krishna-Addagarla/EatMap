from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_session
from app.dependencies import get_current_user
from app.models import ListKind, ListVisibility, Place, PlaceList, PlaceListItem, User
from app.schemas import ListCreate, ListItemCreate, ListRead

router = APIRouter(prefix="/lists", tags=["lists"])


def list_query() -> Select[tuple[PlaceList]]:
    return select(PlaceList).options(selectinload(PlaceList.items).selectinload(PlaceListItem.place).selectinload(Place.photos))


@router.get("", response_model=list[ListRead])
async def my_lists(
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[PlaceList]:
    result = await session.scalars(list_query().where(PlaceList.user_id == current_user.id).order_by(PlaceList.created_at.desc()))
    return list(result.unique().all())


@router.get("/public", response_model=list[ListRead])
async def public_lists(session: AsyncSession = Depends(get_session)) -> list[PlaceList]:
    result = await session.scalars(
        list_query().where(PlaceList.visibility == ListVisibility.public).order_by(PlaceList.created_at.desc())
    )
    return list(result.unique().all())


@router.post("", response_model=ListRead, status_code=status.HTTP_201_CREATED)
async def create_list(
    payload: ListCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PlaceList:
    place_list = PlaceList(user_id=current_user.id, **payload.model_dump())
    session.add(place_list)
    await session.commit()
    result = await session.scalar(list_query().where(PlaceList.id == place_list.id))
    return result


@router.post("/{list_id}/items", response_model=ListRead, status_code=status.HTTP_201_CREATED)
async def add_place_to_list(
    list_id: UUID,
    payload: ListItemCreate,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PlaceList:
    place_list = await session.scalar(list_query().where(PlaceList.id == list_id, PlaceList.user_id == current_user.id))
    if not place_list:
        raise HTTPException(status_code=404, detail="List not found")
    if not await session.get(Place, payload.place_id):
        raise HTTPException(status_code=404, detail="Place not found")
    existing = await session.scalar(
        select(PlaceListItem).where(PlaceListItem.list_id == list_id, PlaceListItem.place_id == payload.place_id)
    )
    if not existing:
        session.add(PlaceListItem(list_id=list_id, **payload.model_dump()))
        await session.commit()
    result = await session.scalar(list_query().where(PlaceList.id == list_id))
    return result


@router.delete("/{list_id}/items/{place_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_place_from_list(
    list_id: UUID,
    place_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> None:
    place_list = await session.scalar(select(PlaceList).where(PlaceList.id == list_id, PlaceList.user_id == current_user.id))
    if not place_list:
        raise HTTPException(status_code=404, detail="List not found")
    item = await session.scalar(select(PlaceListItem).where(PlaceListItem.list_id == list_id, PlaceListItem.place_id == place_id))
    if item:
        await session.delete(item)
        await session.commit()


@router.post("/favorites/{place_id}", response_model=ListRead, status_code=status.HTTP_201_CREATED)
async def favorite_place(
    place_id: UUID,
    session: AsyncSession = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> PlaceList:
    favorites = await session.scalar(
        list_query().where(PlaceList.user_id == current_user.id, PlaceList.kind == ListKind.favorites)
    )
    if not favorites:
        favorites = PlaceList(
            user_id=current_user.id,
            name="Favorites",
            description="Saved places",
            emoji="⭐",
            visibility=ListVisibility.private,
            kind=ListKind.favorites,
        )
        session.add(favorites)
        await session.flush()
    if not await session.get(Place, place_id):
        raise HTTPException(status_code=404, detail="Place not found")
    existing = await session.scalar(
        select(PlaceListItem).where(PlaceListItem.list_id == favorites.id, PlaceListItem.place_id == place_id)
    )
    if not existing:
        session.add(PlaceListItem(list_id=favorites.id, place_id=place_id))
        await session.commit()
    result = await session.scalar(list_query().where(PlaceList.id == favorites.id))
    return result
