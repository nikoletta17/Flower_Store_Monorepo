from fastapi import HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List

from .. import models
from ..schemas.review import ReviewCreate
from ..models import User as UserModel



def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[models.Review]:
    reviews = db.query(models.Review).offset(skip).limit(limit).all()
    return reviews



def get_review_by_id(id: int, db: Session) -> models.Review:
    review = db.query(models.Review).filter(models.Review.id == id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review by id {id} not found")
    return review



def create_review(db: Session, request: ReviewCreate, current_user: UserModel) -> models.Review:
    author_name = current_user.name
    new_review = models.Review(
        text=request.text,
        author=author_name,
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



