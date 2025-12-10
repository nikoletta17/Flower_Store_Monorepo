from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from ..repositories import reviews as reviews_repo
from ..schemas.review import ReviewCreate, ReviewRead
from .. import models
from ..utils.jwt_handler import get_current_user, is_admin
from ..models import User as UserModel


router = APIRouter(
    prefix="/review",  #for frontend!!!
    tags=["Review"]
)


@router.get("/", response_model=List[ReviewRead])
async def get_all_reviews(db: Session = Depends(get_db)):
    return reviews_repo.get_all(db)



@router.get("/{id}", response_model=ReviewRead, status_code=status.HTTP_200_OK)
async def get_single_review(id: int, db: Session = Depends(get_db)):
    return reviews_repo.get_review_by_id(id, db)


@router.post("/", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
async def create_new_review(
        request: ReviewCreate,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    return reviews_repo.create_review(db, request, current_user)



@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review_by_id(
        id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(is_admin)
):
    reviews_repo.delete_review(id, db)
    return
