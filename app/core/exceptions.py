from typing import Any, Optional


class FlowerAppException(Exception):
    """Базовий виняток."""
    status_code = 400

    def __init__(self, message: str, details: Optional[dict] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)

class NotFoundException(FlowerAppException):
    status_code = 404
    def __init__(self, entity: str, identifier: Any):
        super().__init__(message=f"{entity} з ідентифікатором '{identifier}' не знайдено.")

class AlreadyExistsException(FlowerAppException):
    status_code = 409
    def __init__(self, message: str = "Такий об'єкт вже існує."):
        # Можно передать свой текст или оставить стандартный
        super().__init__(message=message)


class AIException(FlowerAppException):
    """Виняток для помилок AI-асистента."""
    def __init__(self, message: str, details: str = None):
        details = {
            "ai_detail": details
        } if details else None
        super().__init__(message=message, details=details)


class AccountNotVerifiedException(FlowerAppException):
    status_code = 403
    def __init__(self):
        details = {
            "error_code": "account_not_verified",
            "resolution": "Please check your email for verification details"
        }
        super().__init__(message="Account not verified", details=details)

# Коли ми почнемо робити Оплату або Замовлення, ми додамо, наприклад, InsufficientStockException (якщо квітів немає в наявності)