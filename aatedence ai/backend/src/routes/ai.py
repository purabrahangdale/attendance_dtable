from fastapi import APIRouter, Body
from src.services.ai_service import ai_service
from src.core.database import db
from datetime import date

router = APIRouter(prefix="/ai", tags=["ai"])

@router.post("/chat")
async def chat(query: str = Body(..., embed=True)):
    """
    AI Assistant chat endpoint
    """
    # Fetch today's attendance data for context
    today = date.today().isoformat()
    attendance_data = await db.db.daily_attendance.find({"date": today}).to_list(100)
    
    # Enrich with user names
    for record in attendance_data:
        user = await db.db.users.find_one({"_id": record["user_id"]})
        if user:
            record["user_name"] = user["full_name"]
    
    response = await ai_service.get_response(query, attendance_data)
    return {"response": response}
