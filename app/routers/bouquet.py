from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..repositories import bouquet as bouquet_repo
from ..schemas.bouquet import BouquetCreate, BouquetUpdate, BouquetRead
from .. import models


router = APIRouter(
    prefix="/bouquet",  #for frontend!!!
    tags=["Bouquet"]
)


#Function to convert money:
def convert_to_uah(bouquet_data: models.Bouquet):
    if bouquet_data.price is not None:
        bouquet_data.price = bouquet_data.price / 100.0
    return bouquet_data



@router.get("/", response_model=List[BouquetRead])
async def get_all_bouquets(db: Session = Depends(get_db)):
    bouquets = bouquet_repo.get_all(db)

    for bouquet in bouquets:
        convert_to_uah(bouquet)
    return bouquets



@router.get("/{id}", response_model=BouquetRead, status_code=status.HTTP_200_OK)
async def get_single_bouquet(id: int, db: Session = Depends(get_db)):
    bouquet = bouquet_repo.get_bouquet_by_id(id, db)
    return convert_to_uah(bouquet)



@router.post("/", response_model=BouquetRead, status_code=status.HTTP_201_CREATED)
async def create_new_bouquet(
        request: BouquetCreate,
        db: Session = Depends(get_db)
        # add admin later!!!!
):
    new_bouquet = bouquet_repo.create_bouquet(db, request)
    return convert_to_uah(new_bouquet)



@router.put("/{id}", response_model=BouquetRead)
async def update_existing_bouquet(
        id: int,
        request: BouquetUpdate,
        db: Session = Depends(get_db)
        # add admin later!!!!
):
    updated_bouquet = bouquet_repo.update_bouquet(id, db, request)
    return convert_to_uah(updated_bouquet)



@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bouquet_by_id(
        id: int,
        db: Session = Depends(get_db)
        # add admin later!!!!
):
    bouquet_repo.delete_bouquet(id, db)
    return


