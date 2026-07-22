import uvicorn
from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.utils.response import success_response

from app.routers.auth import router as auth_router
from app.routers.resume import router as resume_router
from app.routers.jobs import router as jobs_router
from app.routers.applications import router as applications_router
from app.routers.matching import router as matching_router
from app.routers.notifications import router as notifications_router
from app.routers.job_collection import router as job_collection_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


@app.get(f"{settings.API_V1_STR}/health", tags=["Health"])
async def health_check():
    return success_response(
        data={"status": "healthy", "version": settings.VERSION},
        message="API is running",
    )


app.include_router(
    auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["Authentication"]
)
app.include_router(
    resume_router, prefix=f"{settings.API_V1_STR}/resume", tags=["Resume"]
)
app.include_router(jobs_router, prefix=f"{settings.API_V1_STR}/jobs", tags=["Jobs"])
app.include_router(
    applications_router,
    prefix=f"{settings.API_V1_STR}/applications",
    tags=["Applications"],
)
app.include_router(
    matching_router,
    prefix=f"{settings.API_V1_STR}/matching",
    tags=["AI Semantic Matching"],
)
app.include_router(
    notifications_router,
    prefix=f"{settings.API_V1_STR}/notifications",
    tags=["Notifications"],
)
app.include_router(
    job_collection_router,
    prefix=f"{settings.API_V1_STR}/job-collection",
    tags=["Job Collection"],
)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
