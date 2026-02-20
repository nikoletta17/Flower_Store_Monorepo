from typing import Any

class FlowerAppException(Exception):
    """Базовий виняток."""
    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)

class NotFoundException(FlowerAppException):
    def __init__(self, entity: str, identifier: Any):
        super().__init__(f"{entity} з ідентифікатором '{identifier}' не знайдено.")

class AlreadyExistsException(FlowerAppException):
    def __init__(self,  message: str = "Такий об'єкт вже існує"):
        super().__init__(message)


# Коли ми почнемо робити Оплату або Замовлення, ми додамо, наприклад, InsufficientStockException (якщо квітів немає в наявності)