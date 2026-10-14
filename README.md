# Arvind Limited — Quality Inspection Tracker

> **Shop-floor Fabric Defect Logging, Tracking & Resolution System**  
> Built for shop-floor supervisors across Arvind's manufacturing plants (Naroda & Santej, Gujarat). Replaces manual paper registers and batch spreadsheets with a mobile-first, offline-resilient web application.

---

## ⚡ Quick Start (< 5 Minutes)

### Option A: With Docker Compose (Recommended)

Make sure Docker and Docker Compose are installed and running, then:

```bash
docker compose up --build
```

- **Mobile Web App:** [http://localhost:3000](http://localhost:3000)
- **FastAPI Interactive Docs (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check Endpoint:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

*(Preloaded with realistic seed defect records from Naroda and Santej plants upon first boot)*

---

### Option B: Local Development (Without Docker)

#### 1. Backend (Python 3.10+)
```bash
# From repository root
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# Run backend API server on port 8000
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### 2. Frontend (Node.js 18+)
```bash
# In a separate terminal tab
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your mobile browser or desktop browser in responsive mode (`390px` width).

---

## 📱 Mobile-First UX (Tested at 390px)

The user interface is designed specifically for plant shop-floor supervisors holding a smartphone on the plant floor:
- **Optimized for 390px:** Tested against iPhone 12/13/14/15 standard width (`390 x 844`).
- **Touch-Friendly Targets:** All buttons, dropdowns, and chips have a minimum 44px tap target.
- **Fast Logging Form:** Defaults to today's date, 1-tap severity chip selectors (Critical / Major / Minor), quick machine name suggestion chips (`Loom #14`, `Dyeing Jet #03`, etc.).
- **Severity Summary Matrix:** Real-time matrix cards showing Open and Resolved counts categorized by severity. Tapping any severity card instantly filters the feed.
- **Sortable & Filterable Feed:** Filter by Severity, Status (Open / Resolved), and Date range, with free-text search across machine IDs, remarks, and defect types.
- **Mandatory Resolution Sign-off:** Clear modal enforcing corrective action description before an issue can transition to `Resolved`.

---

## 🌟 Bonus Features Implemented

### 1. Offline Mode & Background Sync
- Operates reliably in factory areas with spotty Wi-Fi / cellular connectivity.
- When offline (`navigator.onLine === false` or network failure), logged defects are automatically saved into a client-side queue in `localStorage`.
- A prominent status banner displays pending local records and sync status.
- Once connectivity is restored, the app automatically triggers a background queue flush, syncing all pending records to the backend without supervisor intervention.

### 2. Mock SAP Quality Management (QM) Webhook
- Exposes `POST /api/sap-webhook` to receive automated inspection lot notifications from SAP QM or automated optical vision inspection systems.
- Normalizes incoming SAP defect codes and severity levels into standard application enums.
- Built-in UI simulator: Click the **"SAP"** button in the top navigation bar to test payloads directly from the browser, or use the cURL command below.

#### Expected SAP Webhook Payload Shape:
```json
{
  "notification_id": "QM-2026-90412",
  "plant_code": "ARV-SANTEJ",
  "work_center": "WEAVING-LOOM-22",
  "material_code": "DENIM-STRETCH-12OZ",
  "defect_code": "DEF_WEAVE_BROKEN_PICK",
  "defect_description": "Weave Defect - Missing Pick Across Roll",
  "severity": "Critical",
  "notes": "Automated vision scanner flagged continuous pick irregularity on loom beam #4."
}
```

#### Test with cURL:
```bash
curl -X POST http://localhost:8000/api/sap-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "notification_id": "QM-2026-90412",
    "plant_code": "ARV-SANTEJ",
    "work_center": "WEAVING-LOOM-22",
    "material_code": "DENIM-STRETCH-12OZ",
    "defect_code": "DEF_WEAVE_BROKEN_PICK",
    "defect_description": "Weave Defect - Missing Pick Across Roll",
    "severity": "Critical",
    "notes": "Automated vision scanner flagged continuous pick irregularity on loom beam #4."
  }'
```

### 3. Lightweight Supervisor Authentication
- Provides shift attribution (`POST /api/auth/login`) allowing supervisors to sign off under their profile (e.g. Ramesh Patel, Pooja Shah, or custom supervisor name).
- Profile is persisted in browser storage and attaches supervisor metadata to defects and resolutions.

---

## 🏛️ Architecture Decisions

1. **FastAPI (Python) for Backend:**  
   FastAPI was chosen because Arvind's AI & Analytics team works predominantly with Python data pipelines and ML models. It provides native asynchronous performance, automatic OpenAPI/Swagger documentation, and Pydantic v2 data validation with zero boilerplate.

2. **SQLite by Default with PostgreSQL Compatibility:**  
   SQLite was selected as the default storage engine because it requires zero external service setup, stores data reliably in a single file or mounted Docker volume, and allows reviewers to evaluate the system in under 60 seconds without database connectivity friction. The SQLAlchemy ORM abstraction enables switching to PostgreSQL in production simply by providing the `DATABASE_URL` environment variable.

3. **React + Vite + Tailwind CSS for Frontend:**  
   Vite provides sub-second builds and lean asset bundles (~58 KB gzipped). Tailwind CSS enables rapid development of a mobile-first, utility-based UI with precise viewport control (`max-w-md` centered layout) and high-contrast color coding for critical shop-floor alerts.

4. **Two-Tier Docker Compose with Nginx Reverse Proxy:**  
   The frontend is compiled via a multi-stage Docker build and served by an Alpine Nginx container that acts as a reverse proxy for `/api` requests to the backend. This eliminates CORS complications in production, serves static assets with gzip compression, and mirrors standard enterprise deployment topology.

---

## 🔮 What We Would Do Differently With More Time

1. **Progressive Web App (PWA) with Service Worker:**  
   Package the application as an installable PWA with a Service Worker cache for offline static assets and Background Sync API registration, allowing shop-floor supervisors to launch the app directly from their home screen like a native Android/iOS application.
2. **Camera Defect Attachment & OCR/Vision AI:**  
   Add a mobile camera upload button allowing supervisors to snap pictures of fabric defects, using a lightweight vision model (or OpenCV) to auto-classify weave anomalies and estimate defect severity directly in the browser or via backend inference.
3. **Role-Based Access Control (RBAC) & OAuth2/SSO:**  
   Integrate enterprise single sign-on (such as Arvind corporate Microsoft Azure AD / Okta) and enforce granular permissions (e.g., Shop Supervisor can log defects, Quality Manager can approve resolutions, Plant Head has read-only analytics).
4. **Export to SAP ERP / Excel:**  
   Add one-click export of filtered defect reports to Excel (.xlsx) and a bi-directional SAP RFC/OData connector to close the loop on maintenance work orders.

---

## 🧪 Automated Testing

Run the backend test suite:

```bash
PYTHONPATH=. ./backend/venv/bin/pytest backend/tests -v
```

The test suite validates:
- API health check (`GET /api/health`)
- Inspection creation and Pydantic validation rules (`POST /api/inspections`)
- Severity and status filtering, date range queries, and keyword search
- Defect resolution flow and enforcement of mandatory resolution notes (`PATCH /api/inspections/{id}/resolve`)
- Aggregated defect severity count matrix calculations (`GET /api/inspections/summary`)
- Mock SAP QM Webhook ingestion and defect normalization (`POST /api/sap-webhook`)

---

## 📂 Project Directory Structure

```
SQA/
├── docker-compose.yml         # Container orchestration
├── .dockerignore              # Root dockerignore
├── .gitignore                 # Git ignore patterns
├── .env.example               # Environment variables template
├── README.md                  # Project documentation & design decisions
│
├── backend/                   # FastAPI REST API Backend
│   ├── Dockerfile             # Multi-stage Python 3.11 container
│   ├── requirements.txt       # Dependencies (FastAPI, SQLAlchemy, Pydantic, pytest)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # App entry, lifespan, CORS, route registration
│   │   ├── database.py        # SQLAlchemy engine & session maker
│   │   ├── models.py          # Database schema (Inspection model)
│   │   ├── schemas.py         # Pydantic validation schemas
│   │   ├── crud.py            # Query logic, filtering, sorting, summary matrix
│   │   ├── seed.py            # Realistic plant defect sample data
│   │   └── routers/
│   │       ├── inspections.py # Core inspection CRUD endpoints
│   │       ├── sap.py         # Mock SAP QM webhook integration
│   │       └── auth.py        # Lightweight supervisor authentication
│   └── tests/
│       └── test_inspections.py# Automated pytest suite
│
└── frontend/                  # React + TypeScript + Vite + Tailwind Mobile UI
    ├── Dockerfile             # Multi-stage build + Nginx Alpine
    ├── nginx.conf             # Nginx reverse proxy & SPA routing
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── App.tsx            # Main state orchestrator & mobile container
        ├── main.tsx           # React entry point
        ├── types/             # TypeScript type definitions
        ├── services/
        │   ├── api.ts         # REST API client
        │   └── offlineSync.ts # Offline queue & auto-sync manager
        └── components/
            ├── Header.tsx     # Arvind branding, online/offline status, SAP toggle
            ├── SummaryCards.tsx# Severity summary count matrix
            ├── InspectionForm.tsx# Fast mobile-first defect logging form
            ├── InspectionList.tsx# Sortable, filterable defect list
            ├── ResolveModal.tsx# Mandatory resolution note modal
            ├── SapWebhookModal.tsx# Built-in SAP QM webhook tester
            └── LoginModal.tsx # Supervisor profile switcher
```
