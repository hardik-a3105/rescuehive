"""Phase 4A: Add Ollama Vision LLM fields to detections

Revision ID: 001_phase4a_vision
Revises: 
Create Date: 2026-10-17 12:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_phase4a_vision'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('detections', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('detections', sa.Column('evidence', sa.Text(), nullable=True))
    op.add_column('detections', sa.Column('location_description', sa.String(length=255), nullable=True))
    op.add_column('detections', sa.Column('analysis_source', sa.String(length=100), server_default='ROBOT_TELEMETRY', nullable=True))
    op.add_column('detections', sa.Column('model_name', sa.String(length=100), nullable=True))
    op.add_column('detections', sa.Column('review_priority', sa.String(length=50), nullable=True))
    op.add_column('detections', sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id'), nullable=True))


def downgrade():
    op.drop_column('detections', 'user_id')
    op.drop_column('detections', 'review_priority')
    op.drop_column('detections', 'model_name')
    op.drop_column('detections', 'analysis_source')
    op.drop_column('detections', 'location_description')
    op.drop_column('detections', 'evidence')
    op.drop_column('detections', 'description')
