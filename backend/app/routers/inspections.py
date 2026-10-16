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
    PaginatedInspectionsResponse,
)
from backend.app import crud

router = APIRouter(prefix="/api/inspections", tags=["Inspections"])


@router.get("", response_model=PaginatedInspectionsResponse)
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
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    skip: Optional[int] = Query(None, ge=0),
    limit: Optional[int] = Query(None, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieve all logged inspections with server-side pagination, filtering, search, and sorting."""
    items, total, eff_page, eff_page_size, total_pages = crud.get_inspections(
        db=db,
        severity=severity,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
        skip=skip,
        limit=limit,
    )
    return {
        "items": items,
        "total": total,
        "page": eff_page,
        "page_size": eff_page_size,
        "total_pages": total_pages,
    }


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
