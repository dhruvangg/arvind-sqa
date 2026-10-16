# Arvind Limited: Quality Inspection Tracker

Shop-floor defect logging, tracking, and resolution system for supervisors across Arvind manufacturing units. Replaces manual paper registers and delayed spreadsheet entry with a mobile-first, offline-ready web application.

---

## Setup Guide

Run the complete multi-container stack using Docker Compose:

```bash
docker compose up --build
```

Once started:
- Web Application: http://localhost:3000
- Backend REST API: http://localhost:8000
- Interactive API Documentation (Swagger): http://localhost:8000/docs
- Health Check: http://localhost:8000/api/health

The database auto-seeds with realistic textile defect records on first boot so all features are visible immediately.

---

## Architecture Decisions

1. **FastAPI (Python) for Backend**: Python is the standard language across analytics and ML pipelines. FastAPI delivers high performance with asynchronous request handling, automatic OpenAPI documentation, and strict request/response data validation via Pydantic v2 schemas.

2. **SQLite Storage with PostgreSQL Compatibility**: SQLite was chosen as the default storage engine because it runs in a single mounted container volume without requiring external database provisioning. The database layer uses SQLAlchemy ORM, so switching to a production PostgreSQL database only requires updating the `DATABASE_URL` environment variable.

3. **React with Vite, TypeScript, and Tailwind CSS**: Vite produces fast development reloads and a lean static production bundle. Tailwind CSS provides utility-first responsive styling with custom Arvind brand tokens, and TypeScript prevents runtime type mismatches across the frontend codebase.

4. **Dedicated Route Architecture with React Router**: The application separates the dashboard and feed (`/`) from the defect entry screen (`/new`). This prevents visual clutter, keeps the logging interface fast on mobile phones, and provides bookmarkable browser routes.

---

## Core Features & Testing

### 1. Defect Logging (`/new`)
Supervisors can log quality issues directly from plant lines:
- Date picker defaulting to current date
- Free-text Machine / Line ID with quick suggestion chips (`Loom #14`, `Dyeing Jet #03`, etc.)
- Defect type dropdown: Weave Defect, Shade Variation, Hole/Tear, Count Deviation, Other
- Severity selector: Critical, Major, Minor
- Optional remarks field for observations

### 2. Defect Feed & Server-Side Pagination (`/`)
- Paginated table/cards powered by backend pagination parameters (`page` and `page_size`)
- Configurable items per page (10, 25, 50)
- Search filter across machine IDs, defect descriptions, and remarks
- Severity filter (All, Critical, Major, Minor)
- Status filter (All, Open, Resolved)
- Date range filter (from date, to date)
- Sortable by date, severity, machine ID, and status

### 3. Defect Resolution Flow
- Every open defect includes an action to resolve
- Opens a resolution dialog requiring a mandatory corrective action note (blank entries rejected)
- Records timestamp and the supervisor who signed off on the fix

### 4. Severity Summary Matrix (`/`)
- Prominent cards displaying counts of Open and Resolved issues categorized by Critical, Major, and Minor severity
- Displays real-time resolution progress bars
- Clicking any severity card filters the feed below

---

## Bonus Implementations

### Offline Support and Local Storage Sync
Factory floors often experience intermittent network drops. When offline:
- Newly logged defects are queued in client storage (`localStorage`)
- An amber status banner alerts the user of pending local records
- Queued records display in the feed with a "Pending Sync" tag
- As soon as network connectivity is restored, the application flushes the queue to the backend automatically

### Mock SAP Quality Management Webhook
The backend exposes `POST /api/sap-webhook` to ingest automated quality notifications from SAP QM or optical inspection systems. It maps incoming defect codes and severity strings to standard application enums and registers the defect in the system.

Expected Payload Format:
```json
{
  "notification_id": "QM-2026-90412",
  "plant_code": "ARV-SANTEJ",
  "work_center": "WEAVING-LOOM-22",
  "material_code": "DENIM-STRETCH-12OZ",
  "defect_code": "DEF_WEAVE_BROKEN_PICK",
  "defect_description": "Weave Defect: Missing Pick Across Roll",
  "severity": "Critical",
  "notes": "Automated vision scanner flagged continuous pick irregularity on loom beam #4."
}
```

Sample cURL request:
```bash
curl -X POST http://localhost:8000/api/sap-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": "QM-2026-90412",
    "plant_code": "ARV-SANTEJ",
    "work_center": "WEAVING-LOOM-22",
    "material_code": "DENIM-STRETCH-12OZ",
    "defect_code": "DEF_WEAVE_BROKEN_PICK",
    "defect_description": "Weave Defect: Missing Pick Across Roll",
    "severity": "Critical",
    "notes": "Automated vision scanner flagged continuous pick irregularity on loom beam #4."
  }'
```

An interactive test modal is accessible via the "SAP Webhook" button in the header.

### Supervisor Authentication & Session Control
Provides password-based supervisor authentication (`POST /api/auth/login`) with SHA-256 credential verification, session bearer tokens, and a dedicated Sign In page (`/login`). Routes are protected so unauthenticated users cannot record or resolve defects without logging in first.

Demo accounts for review (Password: `arvind123`):
- `ramesh` (Ramesh Patel, Weaving Shift Supervisor, Naroda Unit)
- `pooja` (Pooja Shah, Plant Quality Lead, Santej Plant)
- `vikram` (Vikram Desai, Spinning Shift Supervisor, Naroda Unit)

---

## What We Would Do Differently With More Time

1. **Progressive Web App (PWA) with Service Worker**: Add a service worker manifest and cache storage to make the app installable on Android and iOS devices, allowing plant supervisors to launch it from their home screen without opening a browser URL bar.
2. **Defect Photo Capture**: Implement camera capture so supervisors can snap photos of fabric flaws directly from their phones, with image compression and S3/MinIO storage.
3. **Enterprise Single Sign-On (SSO)**: Connect Azure Active Directory / SAML / OAuth2 alongside the current credential verification to integrate directly into Arvind corporate employee directories.
4. **Automated Defect Alerts**: Send automated push notifications or SMS alerts to maintenance leads whenever a Critical defect is logged.

---

## Automated Backend Tests

The project includes unit and integration tests covering CRUD operations, validation rules, pagination, filtering, mandatory resolution notes, supervisor authentication, and the SAP webhook.

To run tests in the backend environment:
```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests -v
```

---

## Project Structure

```
SQA/
├── docker-compose.yml         # Multi-container orchestration
├── README.md                  # Project documentation
├── backend/                   # FastAPI backend service
│   ├── Dockerfile             # Python 3.11 container definition
│   ├── requirements.txt       # Python dependencies
│   ├── app/
│   │   ├── main.py            # Application entry point and router registry
│   │   ├── database.py        # SQLAlchemy database engine and session
│   │   ├── models.py          # Database models
│   │   ├── schemas.py         # Pydantic schemas and validation
│   │   ├── crud.py            # Database operations and summary calculations
│   │   ├── seed.py            # Initial seed dataset
│   │   └── routers/
│   │       ├── inspections.py # Inspection endpoints and pagination
│   │       ├── sap.py         # SAP QM webhook endpoint
│   │       └── auth.py        # Supervisor authentication
│   └── tests/
│       └── test_inspections.py# Automated pytest suite
└── frontend/                  # React + TypeScript frontend
    ├── Dockerfile             # Multi-stage build with Nginx
    ├── nginx.conf             # Nginx reverse proxy configuration
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── App.tsx            # Main layout and route definitions
        ├── pages/
        │   ├── LoginPage.tsx            # Route /login (Credential Sign In)
        │   ├── InspectionListPage.tsx   # Route / (Feed, Summary, Pagination)
        │   └── InspectionCreatePage.tsx # Route /new (Focused Log Form)
        ├── components/
        │   ├── Header.tsx     # Arvind brand header, user status, logout
        │   ├── Pagination.tsx # Server-side pagination controls
        │   ├── SummaryCards.tsx # Severity summary counts
        │   ├── InspectionList.tsx # Defect feed cards
        │   ├── InspectionForm.tsx # Logging form
        │   ├── ResolveModal.tsx   # Mandatory resolution modal
        │   ├── SapWebhookModal.tsx# In-browser SAP webhook tester
        │   └── Toast.tsx      # Feedback toast notifications
        └── services/
            ├── api.ts         # REST client
            └── offlineSync.ts # Offline queue and sync manager
```
