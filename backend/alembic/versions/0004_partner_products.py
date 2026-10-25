"""Каталог партнёрских товаров: теплота как у вещей, цена в рублях, url без повторов

Revision ID: 0004
Revises: 0003
Create Date: 2026-10-25
"""

from alembic import op
import sqlalchemy as sa


revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Каталог до этой миграции пустой: заливать его начали только с #73
    op.alter_column("partner_products", "min_warmth", new_column_name="warmth", nullable=False)
    op.create_check_constraint("partner_products_warmth_check", "partner_products", "warmth BETWEEN 1 AND 5")
    op.alter_column(
        "partner_products", "price", type_=sa.Integer(), existing_type=sa.Numeric(), postgresql_using="price::integer"
    )
    op.create_unique_constraint("partner_products_url_key", "partner_products", ["url"])


def downgrade() -> None:
    op.drop_constraint("partner_products_url_key", "partner_products", type_="unique")
    op.alter_column("partner_products", "price", type_=sa.Numeric(), existing_type=sa.Integer())
    op.drop_constraint("partner_products_warmth_check", "partner_products", type_="check")
    op.alter_column("partner_products", "warmth", new_column_name="min_warmth", nullable=True)
