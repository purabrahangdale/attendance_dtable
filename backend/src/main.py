from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from src.core.config import settings
from src.core.database import connect_to_mongo, close_mongo_connection
from src.routes import auth, attendance, ai

app = FastAPI(
    title="AI Attendance System API",
    description="Backend for AI-powered attendance with face recognition and AI assistant",
    version="1.0.0"
)

# Global exception handler to ensure CORS headers are sent on 500 errors
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)},
        headers={
            "Access-Control-Allow-Origin": "*",
        }
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routes
app.include_router(auth.router)
app.include_router(attendance.router)
app.include_router(ai.router)

@app.get("/")
async def root():
    return {"message": "Welcome to AI Attendance System API", "status": "active"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
