from pydantic import BaseModel
from typing import List

class EmailCreate(BaseModel):
    addresses: List[str]