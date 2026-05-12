"""merge password and order heads

Revision ID: fdd3d5a79431
Revises: 043a51e0082f, a7080871d985
Create Date: 2026-03-07 13:10:26.377891

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fdd3d5a79431'
down_revision: Union[str, Sequence[str], None] = ('043a51e0082f', 'a7080871d985')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
