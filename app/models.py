from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, CheckConstraint

class Bouquet(Base):
    __tablename__ = 'bouquets'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(Integer)
    # Шлях до зображення (відносно папки 'img/')
    image_url = Column(String)
    # HTML-якоря, наприклад '#bouquet1'
    anchor_id = Column(String)

    def __repr__(self):
        return f"<Bouquet(title='{self.title}', price='{self.price}')>"


class Review(Base):
    __tablename__ = 'reviews'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(String)
    author = Column(String)
    rating = Column(Integer, default=5)

    __table_args__ = (
        CheckConstraint('rating >= 1 AND rating <= 5', name='rating_check'),
    )

    def __repr__(self):
        return f"<Review(author='{self.author}')>"


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True)
    password = Column(String)
    role = Column(String, default="user")

