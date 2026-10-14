import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.schemas import (
    InspectionCreate,
    InspectionResponse,
    InspectionResolve,
    InspectionSummaryResponse,
)
from backend.app import crud

router = APIRouter(prefix="/api/inspections", tags=["Inspections"])


@router.get("", response_model=List[InspectionResponse])
def list_inspections(
    severity: Optional[str] = Query(
        None, description="Filter by severity: Critical, Major, Minor, or All"
    ),
    status: Optional[str] = Query(
        None, description="Filter by status: Open, Resolved, or All"
    ),
    start_date: Optional[datetime.date] = Query(
        None, description="Filter records on or after this date (YYYY-MM-DD)"
    ),
    end_date: Optional[datetime.date] = Query(
        None, description="Filter records on or before this date (YYYY-MM-DD)"
    ),
    search: Optional[str] = Query(
        None, description="Search term for Machine/Line ID, defect type, or remarks"
    ),
    sort_by: str = Query(
        "date",
        pattern="^(date|severity|line_id|created_at|status)$",
        description="Field to sort by",
    ),
    sort_order: str = Query(
        "desc", pattern="^(asc|desc)$", description="Sort direction (asc or desc)"
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve all logged inspections with optional filtering, search, and sorting."""
    return crud.get_inspections(
        db=db,
        severity=severity,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit,
    )


@router.get("/summary", response_model=InspectionSummaryResponse)
def get_inspections_summary(db: Session = Depends(get_db)):
    """Retrieve summary counts of Open and Resolved inspections grouped by severity."""
    return crud.get_summary(db)


@router.get("/{inspection_id}", response_model=InspectionResponse)
def get_inspection_detail(inspection_id: int, db: Session = Depends(get_db)):
    """Retrieve a single inspection by ID."""
    inspection = crud.get_inspection(db, inspection_id=inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID {inspection_id} not found",
        )
    return inspection


@router.post("", response_model=InspectionResponse, status_code=status.HTTP_201_CREATED)
def create_new_inspection(
    inspection_in: InspectionCreate, db: Session = Depends(get_db)
):
    """Log a new fabric quality inspection defect."""
    return crud.create_inspection(db=db, inspection_in=inspection_in, source="MANUAL")


@router.patch("/{inspection_id}/resolve", response_model=InspectionResponse)
def mark_inspection_resolved(
    inspection_id: int,
    resolution: InspectionResolve,
    db: Session = Depends(get_db),
):
    """Mark an inspection defect as Resolved with a mandatory resolution note."""
    inspection = crud.get_inspection(db, inspection_id=inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID {inspection_id} not found",
        )

    if inspection.status == "Resolved":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Inspection {inspection_id} is already marked as Resolved.",
        )

    resolved = crud.resolve_inspection(
        db=db, inspection_id=inspection_id, resolution=resolution
    )
    return resolved


@router.delete("/{inspection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inspection(inspection_id: int, db: Session = Depends(get_db)):
    """Delete an inspection record (administrative use)."""
    inspection = crud.get_inspection(db, inspection_id=inspection_id)
    if not inspection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inspection with ID {inspection_id} not found",
        )
    db.delete(inspection)
    db.commit()
    return None
