from fastapi import APIRouter, Depends, status, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Any, Dict

from ..database import get_db
from .. import services as service
from ..schemas.bouquet import BouquetCreate, BouquetUpdate, BouquetRead
from ..core.security import is_admin
from ..models import User as UserModel


router = APIRouter(
    prefix="/bouquet",  #for frontend!!!
    tags=["Bouquet"]
)



@router.get("/", response_model=Dict[str, Any])
async def get_all_bouquets(
        db: AsyncSession = Depends(get_db),
        skip: int = 0,
        limit: int = 8
):
    return await service.bouquet_service.get_all_bouquets(db, skip, limit)



@router.get("/{bouquet_id}", response_model=BouquetRead, status_code=status.HTTP_200_OK)
async def get_single_bouquet(
        bouquet_id: int,
        db: AsyncSession = Depends(get_db)
):
    return await service.bouquet_service.get_bouquet_by_id(bouquet_id, db)



@router.post("/", response_model=BouquetRead, status_code=status.HTTP_201_CREATED)
async def create_bouquet(
        title_ua: str = Form(...),
        title_en: str = Form(...),
        description_ua: str = Form(...),
        description_en: str = Form(...),
        price: float = Form(...),
        anchor_id: str = Form(None),
        file: UploadFile = File(...),
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    # Збираємо нову двомовну схему
    request = BouquetCreate(
        title_ua=title_ua,
        title_en=title_en,
        description_ua=description_ua,
        description_en=description_en,
        price=price,
        image_url="",
        anchor_id=anchor_id
    )
    return await service.bouquet_service.create_new_bouquet(db, request, current_user, file)




@router.put("/{bouquet_id}", response_model=BouquetRead)
async def update_existing_bouquet(
        bouquet_id: int,
        request: BouquetUpdate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    return await service.bouquet_service.update_bouquet(bouquet_id, db, request, current_user)



@router.delete("/{bouquet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bouquet_by_id(
        bouquet_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    await service.bouquet_service.delete_bouquet_by_id(bouquet_id, db, current_user)
    return None


