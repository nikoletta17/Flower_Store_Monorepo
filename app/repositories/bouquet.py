from fastapi import HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas.bouquet import BouquetCreate, BouquetUpdate



def get_all(db: Session) -> List[models.Bouquet]:
    bouquets = db.query(models.Bouquet).all()
    return bouquets

def get_bouquet_by_id(id: int, db: Session) -> models.Bouquet:
    bouquet = db.query(models.Bouquet).filter(models.Bouquet.id == id).first()
    if not bouquet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bouquet by id {id} not found")
    return bouquet



def create_bouquet(db:Session, request: BouquetCreate) -> models.Bouquet:
    price_in_cents = int(request.price * 100)

    new_bouquet = models.Bouquet(
        title = request.title,
        description = request.description,
        price = price_in_cents,
        image_url = request.image_url,
        anchor_id = request.anchor_id
    )

    db.add(new_bouquet)
    db.commit()
    db.refresh(new_bouquet)
    return new_bouquet



def update_bouquet(id: int, db: Session, request: BouquetUpdate) -> models.Bouquet:
    bouquet = db.query(models.Bouquet).filter(models.Bouquet.id == id)
    if not bouquet.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Bouquet not found")

    updated_data = request.model_dump(exclude_unset=True)

    if 'price' in updated_data and updated_data['price'] is not None:
        updated_data['price'] = int(updated_data['price'] * 100)

    bouquet.update(updated_data)
    db.commit()
    return bouquet.first()



def delete_bouquet(id:int, db:Session) -> dict:
    bouquet = db.query(models.Bouquet).filter(models.Bouquet.id == id)

    if not bouquet.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bouquet by id {id} not found")

    bouquet.delete(synchronize_session=False)
    db.commit()
    return {"detail": "Bouquet has been deleted"}
