import datetime
from sqlalchemy.orm import Session
from backend.app.models import Inspection


SAMPLE_INSPECTIONS = [
    {
        "date": datetime.date.today() - datetime.timedelta(days=2),
        "line_id": "Loom #14 (Naroda Weaving Unit)",
        "defect_type": "Weave Defect",
        "severity": "Critical",
        "remarks": "Continuous warp thread breakage causing missing picks across 40m roll.",
        "status": "Resolved",
        "resolution_note": "Replaced damaged reed wire and calibrated warp tension sensors. Retested 10m sample with zero defects.",
        "resolved_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=1),
        "resolved_by": "Ramesh Patel (Weaving Supervisor)",
        "supervisor_name": "Ramesh Patel",
        "source": "MANUAL",
    },
    {
        "date": datetime.date.today() - datetime.timedelta(days=1),
        "line_id": "Dyeing Jet #03 (Santej Plant)",
        "defect_type": "Shade Variation",
        "severity": "Major",
        "remarks": "Delta-E color deviation > 1.8 between center and selvage on denim batch D-882.",
        "status": "Open",
        "supervisor_name": "Pooja Shah",
        "source": "MANUAL",
    },
    {
        "date": datetime.date.today() - datetime.timedelta(days=1),
        "line_id": "Finishing Stenter-02",
        "defect_type": "Hole/Tear",
        "severity": "Critical",
        "remarks": "Pin-plate misalignment causing fabric edge tears near entry roll.",
        "status": "Open",
        "supervisor_name": "Arun Verma",
        "source": "MANUAL",
    },
    {
        "date": datetime.date.today(),
        "line_id": "Spinning Ring Frame #08",
        "defect_type": "Count Deviation",
        "severity": "Minor",
        "remarks": "Yarn count variation +/- 1.2 Ne observed during hourly bobbin sampling.",
        "status": "Resolved",
        "resolution_note": "Adjusted draft gear ratio and replaced worn apron on spindle block 3.",
        "resolved_at": datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=3),
        "resolved_by": "Vikram Desai",
        "supervisor_name": "Vikram Desai",
        "source": "MANUAL",
    },
    {
        "date": datetime.date.today(),
        "line_id": "Inspection Table #05 (Naroda)",
        "defect_type": "Other",
        "severity": "Minor",
        "remarks": "Superficial oil spots from overhead transport rail on 5 meters of grey fabric.",
        "status": "Open",
        "supervisor_name": "Ramesh Patel",
        "source": "MANUAL",
    },
    {
        "date": datetime.date.today(),
        "line_id": "Automated Vision Line #01",
        "defect_type": "Weave Defect",
        "severity": "Major",
        "remarks": "Repeated slub defects flagged by optical scanner on shuttleless loom.",
        "status": "Open",
        "supervisor_name": "SAP Auto-Sync",
        "source": "SAP_WEBHOOK",
        "sap_notification_id": "QM-2026-88019",
    },
]


def seed_data_if_empty(db: Session):
    count = db.query(Inspection).count()
    if count == 0:
        for item in SAMPLE_INSPECTIONS:
            insp = Inspection(
                date=item["date"],
                line_id=item["line_id"],
                defect_type=item["defect_type"],
                severity=item["severity"],
                remarks=item.get("remarks"),
                status=item.get("status", "Open"),
                resolution_note=item.get("resolution_note"),
                resolved_at=item.get("resolved_at"),
                resolved_by=item.get("resolved_by"),
                supervisor_name=item.get("supervisor_name", "Shop-floor Supervisor"),
                source=item.get("source", "MANUAL"),
                sap_notification_id=item.get("sap_notification_id"),
                created_at=datetime.datetime.now(datetime.timezone.utc),
                updated_at=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(insp)
        db.commit()
