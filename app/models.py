from sqlalchemy.orm import relationship
from .database import Base
from sqlalchemy import Column, Integer, String, CheckConstraint, ForeignKey, Float, Boolean, DateTime, Enum
from datetime import datetime
import enum

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

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    user = relationship("User", back_populates="reviews")

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

    #for email
    is_verified = Column(Boolean, default=False)

    #security
    failed_login_attempts = Column(Integer, default=0)
    is_locked_until = Column(DateTime, nullable=True)

    reviews = relationship("Review", back_populates="user", cascade="all, delete-orphan")
    cart = relationship("Cart", back_populates="user", uselist=False)
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")


class Cart(Base):
    __tablename__ = 'carts'
    id = Column(Integer, primary_key=True, index=True)

    user = relationship("User", back_populates="cart")
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    items = relationship("CartItem", back_populates="cart", cascade="all, delete-orphan")


class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    quantity = Column(Integer, default=1, nullable=False)
    price_on_add = Column(Float, nullable=False)

    cart_id = Column(Integer, ForeignKey("carts.id"), nullable=False)
    bouquet_id = Column(Integer, ForeignKey("bouquets.id"), nullable=False)

    cart = relationship("Cart", back_populates="items")
    bouquet = relationship("Bouquet")

    @property
    def subtotal(self) -> float:
        """Обчислює загальну вартість цієї позиції у гривнях."""
        return round(self.quantity * self.price_on_add, 2)


class OrderStatus(enum.Enum):
    PENDING = "pending"   # Очікує підтвердження
    ACCEPTED = "accepted" # Прийнято адміном
    REJECTED = "rejected"
    PAID = "paid"
    SHIPPED = "shipped"   # Відправлено
    DELIVERED = "delivered"
    CANCELED = "canceled"



class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    delivery_address = Column(String, nullable=False)
    phone_number = Column(String, nullable=False)

    total_price = Column(Integer, nullable=False)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")



class OrderItem(Base):
    __tablename__ = 'orders_items'
    id = Column(Integer, primary_key=True, index=True)

    quantity = Column(Integer, default=1, nullable=False)
    # Фіксуємо ціну в копійках на момент замовлення
    price_at_purchase = Column(Integer, nullable=False)

    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    bouquet_id = Column(Integer, ForeignKey("bouquets.id"), nullable=False)

    order = relationship("Order", back_populates="items")
    bouquet = relationship("Bouquet")