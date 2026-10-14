import datetime
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas import (
    SapWebhookPayload,
    SapWebhookResponse,
    InspectionCreate,
    DefectTypeEnum,
    SeverityEnum,
)
from backend.app import crud

router = APIRouter(prefix="/api/sap-webhook", tags=["SAP Integration"])


def map_defect_to_enum(code: str = None, desc: str = None) -> DefectTypeEnum:
    """Intelligently map SAP QM Defect catalog descriptions/codes to internal defect types."""
    combined = f"{code or ''} {desc or ''}".lower()

    if any(k in combined for k in ["weave", "warp", "weft", "loom", "pick", "slub"]):
        return DefectTypeEnum.WEAVE_DEFECT
    elif any(k in combined for k in ["shade", "color", "delta", "dye", "stain", "hue"]):
        return DefectTypeEnum.SHADE_VARIATION
    elif any(k in combined for k in ["hole", "tear", "cut", "rip", "pin"]):
        return DefectTypeEnum.HOLE_TEAR
    elif any(k in combined for k in ["count", "yarn", "ne", "denier", "spindle", "weight"]):
        return DefectTypeEnum.COUNT_DEVIATION
    else:
        return DefectTypeEnum.OTHER


def map_severity_to_enum(sev: str = None) -> SeverityEnum:
    """Map SAP severity string/code to Critical, Major, or Minor."""
    if not sev:
        return SeverityEnum.MAJOR
    normalized = sev.strip().lower()
    if any(k in normalized for k in ["crit", "high", "1", "urgent"]):
        return SeverityEnum.CRITICAL
    elif any(k in normalized for k in ["minor", "low", "3", "trivial"]):
        return SeverityEnum.MINOR
    return SeverityEnum.MAJOR


@router.post(
    "",
    response_model=SapWebhookResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Mock SAP QM Inspection Webhook",
    description="Receives SAP Quality Management (QM) inspection lot payloads, normalizes defect data, and auto-generates a shop-floor inspection record.",
)
def receive_sap_webhook(
    payload: SapWebhookPayload, db: Session = Depends(get_db)
):
    # Determine defect enum
    defect_enum = map_defect_to_enum(payload.defect_code, payload.defect_description)
    if payload.defect_type:
        try:
            defect_enum = DefectTypeEnum(payload.defect_type)
        except ValueError:
            pass

    # Determine severity enum
    severity_enum = map_severity_to_enum(payload.severity)

    # Compose informative remarks
    details = []
    if payload.plant_code:
        details.append(f"Plant: {payload.plant_code}")
    if payload.material_code:
        details.append(f"Material: {payload.material_code}")
    if payload.defect_code:
        details.append(f"SAP Code: {payload.defect_code}")
    if payload.notes:
        details.append(f"Notes: {payload.notes}")
    elif payload.defect_description:
        details.append(f"Desc: {payload.defect_description}")

    remarks_text = " | ".join(details) if details else "Ingested from SAP QM Webhook"

    # Line / Work center identifier
    line_identifier = payload.work_center
    if payload.plant_code and payload.plant_code not in line_identifier:
        line_identifier = f"{payload.work_center} ({payload.plant_code})"

    insp_in = InspectionCreate(
        date=payload.inspection_date or datetime.date.today(),
        line_id=line_identifier,
        defect_type=defect_enum,
        severity=severity_enum,
        remarks=remarks_text,
        supervisor_name="SAP QM Integration",
    )

    created_record = crud.create_inspection(
        db=db,
        inspection_in=insp_in,
        source="SAP_WEBHOOK",
        sap_notification_id=payload.notification_id
        or f"SAP-{uuid.uuid4().hex[:8].upper()}",
    )

    ack_token = f"ACK-SAP-{uuid.uuid4().hex[:12].upper()}"

    return SapWebhookResponse(
        status="SUCCESS",
        message="SAP QM Inspection Lot successfully ingested and registered on shop-floor tracker.",
        sap_ack_token=ack_token,
        inspection=created_record,
    )
