from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import init_db
from app.routers import dashboard, heatmap, theft, quantum, transformer, sustainability, disaster, websocket_router
import app.models

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("Q-Grid Shield Backend Started")
    print("Database initialized")
    yield
    # Shutdown
    print("Q-Grid Shield Backend Shutting Down")


app = FastAPI(
    title="Q-Grid Shield API",
    description="Smart Grid Management Dashboard - AI & Quantum Powered",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(heatmap.router, prefix="/api/heatmap", tags=["Heatmap"])
app.include_router(theft.router, prefix="/api/theft", tags=["Theft Detection"])
app.include_router(quantum.router, prefix="/api/quantum", tags=["Quantum"])
app.include_router(transformer.router, prefix="/api/transformers", tags=["Transformers"])
app.include_router(sustainability.router, prefix="/api/sustainability", tags=["Sustainability"])
app.include_router(disaster.router, prefix="/api/disaster", tags=["Disaster Resilience"])
app.include_router(websocket_router.router, tags=["WebSocket"])


@app.get("/")
async def root():
    return {
        "name": "Q-Grid Shield API",
        "version": "1.0.0",
        "status": "operational",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
