from datetime import datetime


def format_price(cents: int) -> str:
    """
    Перетворює копійки (int) у гарний рядок з валютою.
    Приклад: 120050 -> '1 200.50 ₴'
    """
    if cents is None:
        return "Ціна недоступна"

    uah = cents / 100.0
    # format(uah, ",.2f") додає розділювач тисяч і 2 знаки після коми
    return f"{format(uah, ',.2f').replace(',', ' ')} ₴"


def format_date(dt: datetime) -> str:
    """Перетворює дату у звичний український формат."""
    if not dt:
        return ""
    return dt.strftime("%d.%m.%Y %H:%M")