import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.database import engine, Base, db_type
from app.routers import auth, fdrs, ocr, release, stats, maturity, audit

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fdr_guard")

# Initialize tables
Base.metadata.create_all(bind=engine)
logger.info(f"Database initialized successfully using engine: {db_type}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="AICTE National Security Deposit & Fixed Deposit Receipt (FDR) Management Portal with EasyOCR verification & Discrepancy Detection."
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure folders exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_DOCS_DIR, exist_ok=True)

# Mount static file routes
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount("/sample_docs", StaticFiles(directory=settings.SAMPLE_DOCS_DIR), name="sample_docs")

# Register routers under /api/v1
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(fdrs.router, prefix=api_prefix)
app.include_router(ocr.router, prefix=api_prefix)
app.include_router(release.router, prefix=api_prefix)
app.include_router(stats.router, prefix=api_prefix)
app.include_router(maturity.router, prefix=api_prefix)
app.include_router(audit.router, prefix=api_prefix)

@app.on_event("startup")
def startup_event():
    # Run seed script if database is fresh
    from app.seed_data import seed_initial_data
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        seed_initial_data(db)
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_engine": db_type,
        "status": "operational",
        "docs_url": "/docs"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": os.getenv("CURRENT_TIME", "2026-10-26")
    }
