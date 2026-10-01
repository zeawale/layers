"""Пользователи и фото

Revision ID: 0001
Revises:
Create Date: 2026-10-01
"""

from alembic import op
import sqlalchemy as sa


revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("city", sa.Text(), nullable=True),
        sa.Column("lat", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("lon", sa.Numeric(precision=5, scale=2), nullable=True),
        sa.Column("style", sa.Text(), nullable=True),
        sa.Column("liked_colors", sa.ARRAY(sa.Text()), server_default=sa.text("'{}'"), nullable=False),
        sa.Column("disliked_colors", sa.ARRAY(sa.Text()), server_default=sa.text("'{}'"), nullable=False),
        sa.Column("avatar_photo_id", sa.Integer(), nullable=True, unique=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_table(
        "photos",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("path", sa.Text(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    # users и photos ссылаются друг на друга, поэтому ключ на фото профиля
    # добавляем, когда обе таблицы уже есть
    op.create_foreign_key(
        "users_avatar_photo_id_fkey", "users", "photos", ["avatar_photo_id"], ["id"], ondelete="SET NULL"
    )


def downgrade() -> None:
    op.drop_constraint("users_avatar_photo_id_fkey", "users", type_="foreignkey")
    op.drop_table("photos")
    op.drop_table("users")
