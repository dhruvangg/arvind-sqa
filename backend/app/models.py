import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from backend.app.database import Base


class Inspection(Base):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, index=True)
    line_id = Column(String(100), nullable=False, index=True)  # machine / line ID
    defect_type = Column(String(50), nullable=False, index=True)
    # Allowed: 'Weave Defect', 'Shade Variation', 'Hole/Tear', 'Count Deviation', 'Other'
    severity = Column(String(20), nullable=False, index=True)
    # Allowed: 'Critical', 'Major', 'Minor'
    remarks = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, default="Open", index=True)
    # Allowed: 'Open', 'Resolved'

    # Resolution fields
    resolution_note = Column(Text, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    resolved_by = Column(String(100), nullable=True)

    # Metadata & Integrations
    supervisor_name = Column(String(100), nullable=True, default="Shop-floor Supervisor")
    source = Column(String(50), nullable=False, default="MANUAL")  # MANUAL, SAP_WEBHOOK
    sap_notification_id = Column(String(100), nullable=True, index=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )
