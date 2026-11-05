import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.config import settings
from app.database import Base, engine
from app.seed import seed_database
from app.routers import (
    auth, cycles, symptoms, fertility, reminders, reports, education, assistant, admin, dashboard
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database tables and initial data are seeded on startup
    seed_database()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Secure, Modern REST API for Reproductive Health Tracking, Menstrual Cycle Analytics, Fertility Awareness, and Education.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS setup for web clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers with /api prefix
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(dashboard.router, prefix=settings.API_V1_STR)
app.include_router(cycles.router, prefix=settings.API_V1_STR)
app.include_router(symptoms.router, prefix=settings.API_V1_STR)
app.include_router(fertility.router, prefix=settings.API_V1_STR)
app.include_router(reminders.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)
app.include_router(education.router, prefix=settings.API_V1_STR)
app.include_router(assistant.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)

# API Status Endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

# Mount frontend production build if available
frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(frontend_dist, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    # Do not intercept API or docs routes
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
        return {"error": "API route not found"}

    file_path = os.path.join(frontend_dist, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)

    index_path = os.path.join(frontend_dist, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {
        "service": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "note": "Frontend build not detected. Please run 'npm run build' in the frontend directory."
    }
