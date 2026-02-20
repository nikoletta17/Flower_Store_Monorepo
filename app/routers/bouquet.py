from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from .. import repositories as repo
from ..schemas.bouquet import BouquetCreate, BouquetUpdate, BouquetRead
from ..core.security import is_admin
from ..models import User as UserModel


router = APIRouter(
    prefix="/bouquet",  #for frontend!!!
    tags=["Bouquet"]
)


@router.get("/", response_model=List[BouquetRead])
async def get_all_bouquets(
        db: AsyncSession = Depends(get_db)
):
    return await repo.bouquet.get_all(db)




@router.get("/{id}", response_model=BouquetRead, status_code=status.HTTP_200_OK)
async def get_single_bouquet(
        id: int,
        db: AsyncSession = Depends(get_db)
):
    return await repo.bouquet.get_bouquet_by_id(id, db)



@router.post("/", response_model=BouquetRead, status_code=status.HTTP_201_CREATED)
async def create_new_bouquet(
        request: BouquetCreate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    return await repo.bouquet.create_bouquet(db, request)



@router.put("/{id}", response_model=BouquetRead)
async def update_existing_bouquet(
        id: int,
        request: BouquetUpdate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    return await repo.bouquet.update_bouquet(id, db, request)




@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bouquet_by_id(
        id: int,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    await repo.bouquet.delete_bouquet(id, db)
    return None


