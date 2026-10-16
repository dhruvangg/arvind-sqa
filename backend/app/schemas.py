import datetime
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict, field_validator


class DefectTypeEnum(str, Enum):
    WEAVE_DEFECT = "Weave Defect"
    SHADE_VARIATION = "Shade Variation"
    HOLE_TEAR = "Hole/Tear"
    COUNT_DEVIATION = "Count Deviation"
    OTHER = "Other"


class SeverityEnum(str, Enum):
    CRITICAL = "Critical"
    MAJOR = "Major"
    MINOR = "Minor"


class StatusEnum(str, Enum):
    OPEN = "Open"
    RESOLVED = "Resolved"


class InspectionBase(BaseModel):
    date: datetime.date = Field(
        default_factory=datetime.date.today,
        description="Date of defect discovery (YYYY-MM-DD)",
    )
    line_id: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Machine or production line identifier (e.g. Loom-12, Stenter-02)",
    )
    defect_type: DefectTypeEnum = Field(..., description="Fabric defect classification")
    severity: SeverityEnum = Field(..., description="Defect severity rating")
    remarks: Optional[str] = Field(
        None, max_length=1000, description="Optional supervisor notes / observations"
    )
    supervisor_name: Optional[str] = Field(
        "Shop-floor Supervisor", max_length=100, description="Reporting supervisor name"
    )


class InspectionCreate(InspectionBase):
    pass


class InspectionResolve(BaseModel):
    resolution_note: str = Field(
        ...,
        min_length=3,
        max_length=2000,
        description="Mandatory explanation of the corrective action taken to resolve the defect",
    )
    resolved_by: Optional[str] = Field(
        "Shop-floor Supervisor",
        max_length=100,
        description="Name of supervisor marking defect as resolved",
    )

    @field_validator("resolution_note")
    @classmethod
    def note_must_not_be_blank(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Resolution note cannot be empty or only whitespace")
        return v.strip()


class InspectionResponse(InspectionBase):
    id: int
    status: StatusEnum
    resolution_note: Optional[str] = None
    resolved_at: Optional[datetime.datetime] = None
    resolved_by: Optional[str] = None
    source: str
    sap_notification_id: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class PaginatedInspectionsResponse(BaseModel):
    items: List[InspectionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SeverityCount(BaseModel):
    open: int = 0
    resolved: int = 0
    total: int = 0


class InspectionSummaryResponse(BaseModel):
    critical: SeverityCount
    major: SeverityCount
    minor: SeverityCount
    total: SeverityCount
    open_total: int
    resolved_total: int
    grand_total: int


# SAP Webhook Models
class SapWebhookPayload(BaseModel):
    notification_id: Optional[str] = Field(
        None, description="SAP QM Notification Number, e.g. QM-2026-90412"
    )
    plant_code: Optional[str] = Field(
        "ARV-NARODA", description="Arvind Plant Code (e.g., ARV-NARODA, ARV-SANTEJ)"
    )
    work_center: str = Field(
        ...,
        min_length=1,
        description="SAP Work Center / Line ID (e.g. LOOM-LINE-04B, DYE-JET-01)",
    )
    material_code: Optional[str] = Field(
        None, description="Material/Fabric grade, e.g. DENIM-INDIGO-14OZ"
    )
    defect_code: Optional[str] = Field(
        None, description="SAP Defect Catalog Code, e.g. DEF_WEAVE_01"
    )
    defect_description: Optional[str] = Field(
        None, description="Defect description or standard text"
    )
    defect_type: Optional[str] = Field(
        None, description="Direct defect type name if mapped"
    )
    severity: Optional[str] = Field(
        "Major", description="Severity: Critical, Major, Minor"
    )
    notes: Optional[str] = Field(None, description="Detailed inspection observations")
    inspection_date: Optional[datetime.date] = Field(
        None, description="Inspection date (defaults to today)"
    )


class SapWebhookResponse(BaseModel):
    status: str
    message: str
    sap_ack_token: str
    inspection: InspectionResponse
