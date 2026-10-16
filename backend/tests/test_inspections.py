import pytest
import datetime
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.main import app
from backend.app.database import Base, get_db
from backend.app.seed import seed_data_if_empty
from sqlalchemy.pool import StaticPool

# Use an in-memory SQLite database with StaticPool for isolated tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    seed_data_if_empty(db)
    db.close()
    yield
    Base.metadata.drop_all(bind=engine)


client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_inspections_and_summary():
    # Verify initial seeded inspections with pagination
    response = client.get("/api/inspections?page=1&page_size=10")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "page" in data
    assert "page_size" in data
    assert "total_pages" in data
    assert len(data["items"]) >= 5
    assert data["total"] >= 5

    # Check summary counts
    sum_resp = client.get("/api/inspections/summary")
    assert sum_resp.status_code == 200
    summary = sum_resp.json()

    assert "critical" in summary
    assert "major" in summary
    assert "minor" in summary
    assert summary["grand_total"] == summary["open_total"] + summary["resolved_total"]
    assert (
        summary["critical"]["open"]
        + summary["major"]["open"]
        + summary["minor"]["open"]
        == summary["open_total"]
    )


def test_create_inspection():
    new_defect = {
        "date": str(datetime.date.today()),
        "line_id": "Rapier Loom #07 (Naroda)",
        "defect_type": "Weave Defect",
        "severity": "Critical",
        "remarks": "Warp end breakout detected by sensor.",
        "supervisor_name": "Ramesh Patel",
    }
    response = client.post("/api/inspections", json=new_defect)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] is not None
    assert created["status"] == "Open"
    assert created["line_id"] == "Rapier Loom #07 (Naroda)"
    assert created["defect_type"] == "Weave Defect"
    assert created["severity"] == "Critical"


def test_create_inspection_validation_failure():
    # Missing required line_id and invalid defect_type
    bad_payload = {
        "line_id": "",
        "defect_type": "InvalidType",
        "severity": "SuperCritical",
    }
    response = client.post("/api/inspections", json=bad_payload)
    assert response.status_code == 422


def test_filter_and_search_inspections():
    # Filter by severity = Critical
    crit_resp = client.get("/api/inspections?severity=Critical")
    assert crit_resp.status_code == 200
    crit_data = crit_resp.json()
    assert "items" in crit_data
    for item in crit_data["items"]:
        assert item["severity"] == "Critical"

    # Filter by status = Open
    open_resp = client.get("/api/inspections?status=Open")
    assert open_resp.status_code == 200
    open_data = open_resp.json()
    assert "items" in open_data
    for item in open_data["items"]:
        assert item["status"] == "Open"

    # Search keyword
    search_resp = client.get("/api/inspections?search=Naroda")
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert len(search_data["items"]) > 0


def test_resolve_inspection_flow():
    # 1. Create an open inspection
    new_defect = {
        "date": str(datetime.date.today()),
        "line_id": "Finishing Calender #02",
        "defect_type": "Hole/Tear",
        "severity": "Major",
        "remarks": "Small fabric snag on roller guide.",
        "supervisor_name": "Pooja Shah",
    }
    create_resp = client.post("/api/inspections", json=new_defect)
    assert create_resp.status_code == 201
    insp_id = create_resp.json()["id"]

    # 2. Try resolving with empty note (should fail)
    empty_note_resp = client.patch(
        f"/api/inspections/{insp_id}/resolve",
        json={"resolution_note": "   ", "resolved_by": "Pooja Shah"},
    )
    assert empty_note_resp.status_code == 422

    # 3. Resolve with valid mandatory note
    resolve_resp = client.patch(
        f"/api/inspections/{insp_id}/resolve",
        json={
            "resolution_note": "Polished guide surface and cleared burrs. Sample run verified clear.",
            "resolved_by": "Pooja Shah",
        },
    )
    assert resolve_resp.status_code == 200
    updated = resolve_resp.json()
    assert updated["status"] == "Resolved"
    assert (
        updated["resolution_note"]
        == "Polished guide surface and cleared burrs. Sample run verified clear."
    )
    assert updated["resolved_at"] is not None
    assert updated["resolved_by"] == "Pooja Shah"

    # 4. Attempting to resolve an already resolved inspection should return 400
    repeat_resolve = client.patch(
        f"/api/inspections/{insp_id}/resolve",
        json={"resolution_note": "Another note"},
    )
    assert repeat_resolve.status_code == 400


def test_mock_sap_webhook_integration():
    sap_payload = {
        "notification_id": "SAP-QM-2026-99120",
        "plant_code": "ARV-SANTEJ",
        "work_center": "LOOM-LINE-09A",
        "material_code": "COTTON-KHADI-60S",
        "defect_code": "DEF_SHADE_DELTA",
        "defect_description": "Color / shade mismatch between lots",
        "severity": "Critical",
        "notes": "Automated spectrophotometer triggered threshold alert",
    }

    response = client.post("/api/sap-webhook", json=sap_payload)
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["status"] == "SUCCESS"
    assert "sap_ack_token" in res_data
    assert res_data["inspection"]["defect_type"] == "Shade Variation"
    assert res_data["inspection"]["severity"] == "Critical"
    assert res_data["inspection"]["source"] == "SAP_WEBHOOK"
    assert res_data["inspection"]["sap_notification_id"] == "SAP-QM-2026-99120"
