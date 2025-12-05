from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, ForeignKey

class Bouquet(Base):
    __tablename__ = 'bouquets'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    price = Column(String)
    # Шлях до зображення (відносно папки 'img/')
    image_url = Column(String)
    # HTML-якоря, наприклад '#bouquet1'
    anchor_id = Column(String)

    def __repr__(self):
        return f"<Bouquet(title='{self.title}', price='{self.price}')>"

