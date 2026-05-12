from typing import Any, List, Dict

#bouquets pagination from backend
def paginate_response(items: List[Any], skip: int, limit: int, total_count: int) -> Dict[str, Any]:
    return {
        "items": items,
        "total": total_count,
        "skip": skip,
        "limit": limit,
        "has_more": (skip + limit) < total_count
    }