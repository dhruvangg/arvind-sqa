from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.database import engine, Base, SessionLocal
from backend.app.seed import seed_data_if_empty
from backend.app.routers import inspections, sap, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    Base.metadata.create_all(bind=engine)
    # Seed initial realistic plant data if table is empty
    db = SessionLocal()
    try:
        seed_data_if_empty(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Arvind Quality Inspection Tracker API",
    description="Shop-floor Fabric Defect Logging, Tracking & Resolution System for Arvind Limited AI & Analytics",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for mobile browsers and frontend dev/prod servers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(inspections.router)
app.include_router(sap.router)
app.include_router(auth.router)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "arvind-quality-inspection-tracker-api",
        "version": "1.0.0",
    }
