import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, or_

from backend.app.models import Inspection
from backend.app.schemas import (
    InspectionCreate,
    InspectionResolve,
    InspectionSummaryResponse,
    SeverityCount,
    SeverityEnum,
    StatusEnum,
)


def get_inspection(db: Session, inspection_id: int) -> Optional[Inspection]:
    return db.query(Inspection).filter(Inspection.id == inspection_id).first()


def get_inspections(
    db: Session,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    search: Optional[str] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    skip: int = 0,
    limit: int = 100,
) -> List[Inspection]:
    query = db.query(Inspection)

    # Filter by severity
    if severity and severity.lower() != "all":
        # Case-insensitive or normalized check
        matching_severities = [s.value for s in SeverityEnum if s.value.lower() == severity.lower()]
        if matching_severities:
            query = query.filter(Inspection.severity == matching_severities[0])
        else:
            query = query.filter(Inspection.severity == severity)

    # Filter by status
    if status and status.lower() != "all":
        matching_statuses = [s.value for s in StatusEnum if s.value.lower() == status.lower()]
        if matching_statuses:
            query = query.filter(Inspection.status == matching_statuses[0])
        else:
            query = query.filter(Inspection.status == status)

    # Filter by date range
    if start_date:
        query = query.filter(Inspection.date >= start_date)
    if end_date:
        query = query.filter(Inspection.date <= end_date)

    # Free-text search across machine line ID and remarks
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Inspection.line_id.ilike(search_term),
                Inspection.remarks.ilike(search_term),
                Inspection.defect_type.ilike(search_term),
                Inspection.sap_notification_id.ilike(search_term),
            )
        )

    # Sorting
    sort_column = Inspection.date
    if sort_by == "severity":
        sort_column = Inspection.severity
    elif sort_by == "line_id":
        sort_column = Inspection.line_id
    elif sort_by == "created_at":
        sort_column = Inspection.created_at
    elif sort_by == "status":
        sort_column = Inspection.status

    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_column), asc(Inspection.id))
    else:
        query = query.order_by(desc(sort_column), desc(Inspection.id))

    return query.offset(skip).limit(limit).all()


def create_inspection(
    db: Session,
    inspection_in: InspectionCreate,
    source: str = "MANUAL",
    sap_notification_id: Optional[str] = None,
) -> Inspection:
    db_inspection = Inspection(
        date=inspection_in.date,
        line_id=inspection_in.line_id.strip(),
        defect_type=inspection_in.defect_type.value
        if hasattr(inspection_in.defect_type, "value")
        else str(inspection_in.defect_type),
        severity=inspection_in.severity.value
        if hasattr(inspection_in.severity, "value")
        else str(inspection_in.severity),
        remarks=inspection_in.remarks.strip() if inspection_in.remarks else None,
        supervisor_name=inspection_in.supervisor_name.strip()
        if inspection_in.supervisor_name
        else "Shop-floor Supervisor",
        status="Open",
        source=source,
        sap_notification_id=sap_notification_id,
        created_at=datetime.datetime.now(datetime.timezone.utc),
        updated_at=datetime.datetime.now(datetime.timezone.utc),
    )
    db.add(db_inspection)
    db.commit()
    db.refresh(db_inspection)
    return db_inspection


def resolve_inspection(
    db: Session, inspection_id: int, resolution: InspectionResolve
) -> Optional[Inspection]:
    inspection = get_inspection(db, inspection_id)
    if not inspection:
        return None

    inspection.status = "Resolved"
    inspection.resolution_note = resolution.resolution_note.strip()
    inspection.resolved_at = datetime.datetime.now(datetime.timezone.utc)
    inspection.resolved_by = (
        resolution.resolved_by.strip()
        if resolution.resolved_by
        else "Shop-floor Supervisor"
    )
    inspection.updated_at = datetime.datetime.now(datetime.timezone.utc)

    db.commit()
    db.refresh(inspection)
    return inspection


def get_summary(db: Session) -> InspectionSummaryResponse:
    """Calculate counts of Open and Resolved inspections by severity."""
    # Query aggregation grouped by severity and status
    rows = (
        db.query(
            Inspection.severity,
            Inspection.status,
            func.count(Inspection.id).label("count"),
        )
        .group_by(Inspection.severity, Inspection.status)
        .all()
    )

    matrix = {
        "Critical": {"open": 0, "resolved": 0},
        "Major": {"open": 0, "resolved": 0},
        "Minor": {"open": 0, "resolved": 0},
    }

    for severity, status, count in rows:
        if severity in matrix:
            key = "open" if status == "Open" else "resolved"
            matrix[severity][key] = count

    def make_severity_count(sev: str) -> SeverityCount:
        op = matrix[sev]["open"]
        res = matrix[sev]["resolved"]
        return SeverityCount(open=op, resolved=res, total=op + res)

    crit = make_severity_count("Critical")
    maj = make_severity_count("Major")
    minr = make_severity_count("Minor")

    total_open = crit.open + maj.open + minr.open
    total_resolved = crit.resolved + maj.resolved + minr.resolved
    grand_total = total_open + total_resolved

    total_count = SeverityCount(
        open=total_open, resolved=total_resolved, total=grand_total
    )

    return InspectionSummaryResponse(
        critical=crit,
        major=maj,
        minor=minr,
        total=total_count,
        open_total=total_open,
        resolved_total=total_resolved,
        grand_total=grand_total,
    )
