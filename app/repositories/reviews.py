from fastapi import HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas.review import ReviewCreate, ReviewUpdate



def get_all(db: Session) -> List[models.Review]:
    reviews = db.query(models.Review).all()
    return reviews



def get_review_by_id(id: int, db: Session) -> models.Review:
    review = db.query(models.Review).filter(models.Review.id == id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review by id {id} not found")
    return review



def create_review(db: Session, request: ReviewCreate) -> models.Review:
    new_review = models.Review(
        text=request.text,
        author=request.author,
        rating=request.rating
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review



def delete_review(id:int, db:Session) -> dict:
    review = db.query(models.Review).filter(models.Review.id == id)

    if not review.first():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review by id {id} not found")

    review.delete(synchronize_session=False)
    db.commit()
    return {"detail": "Review has been deleted"}



