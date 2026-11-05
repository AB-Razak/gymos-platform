"""add refresh sessions

Revision ID: 20261105_refresh_sessions
Revises: 106023d79f13
"""

from alembic import op
import sqlalchemy as sa

revision = "20261105_refresh_sessions"
down_revision = "106023d79f13"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "refresh_sessions",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("token_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(
        "ix_refresh_sessions_user_id",
        "refresh_sessions",
        ["user_id"],
    )

    op.create_index(
        "ix_refresh_sessions_token_hash",
        "refresh_sessions",
        ["token_hash"],
        unique=True,
    )


def downgrade():
    op.drop_index(
        "ix_refresh_sessions_token_hash",
        table_name="refresh_sessions",
    )

    op.drop_index(
        "ix_refresh_sessions_user_id",
        table_name="refresh_sessions",
    )

    op.drop_table("refresh_sessions")
