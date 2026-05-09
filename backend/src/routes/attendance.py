from fastapi import APIRouter, Depends, HTTPException, Body
from src.core.database import db
from src.models.attendance import (
    AttendanceRecord, PunchType, Location, DailyAttendance, 
    AttendanceStatus, PunchRequest, FaceRegistrationRequest
)
from src.services.face_service import face_service
from datetime import datetime, date
from typing import Optional
import numpy as np

router = APIRouter(prefix="/attendance", tags=["attendance"])

@router.post("/register-face")
async def register_face(req: FaceRegistrationRequest):
    """
    Register initial face encoding for a user
    """
    encoding = face_service.get_face_encoding(req.image)
    if not encoding:
        raise HTTPException(status_code=400, detail="No face detected in the image")
    # Save encoding and image
    await db.db.face_encodings.update_one(
        {"user_id": req.user_id},
        {"$set": {
            "encoding": encoding,
            "image": req.image,
            "updated_at": datetime.utcnow()
        }},
        upsert=True
    )
    return {"message": "Face registered successfully"}

@router.get("/face-status")
async def get_face_status(user_id: str):
    """
    Check if a user has a registered face and return the image
    """
    stored_face = await db.db.face_encodings.find_one({"user_id": user_id})
    return {
        "is_registered": stored_face is not None,
        "image": stored_face.get("image") if stored_face else None
    }

@router.post("/punch")
async def punch(req: PunchRequest):
    """
    Punch In/Out with face verification
    """
    # Get stored encoding
    stored_face = await db.db.face_encodings.find_one({"user_id": req.user_id})
    if not stored_face:
        raise HTTPException(status_code=400, detail="Face not registered. Please register first.")
    
    # Verify face
    is_verified, distance = face_service.verify_face(stored_face["encoding"], req.image)
    
    if not is_verified:
        # Log failed attempt
        await db.db.failed_attempts.insert_one({
            "user_id": req.user_id,
            "timestamp": datetime.utcnow(),
            "location": req.location.dict(),
            "distance": distance
        })
        raise HTTPException(status_code=401, detail="Face verification failed. Please try again.")
    
    # Record punch
    record = AttendanceRecord(
        user_id=req.user_id,
        type=req.type,
        location=req.location,
        face_verified=True
    )
    await db.db.attendance_records.insert_one(record.dict())
    
    # Update daily attendance logic
    today = date.today().isoformat()
    daily = await db.db.daily_attendance.find_one({"user_id": req.user_id, "date": today})
    
    if req.type == PunchType.IN:
        if not daily:
            await db.db.daily_attendance.insert_one({
                "user_id": req.user_id,
                "date": today,
                "punch_in": datetime.utcnow(),
                "punch_in_photo": req.image,
                "status": AttendanceStatus.INCOMPLETE
            })
            return {"message": "Punched in successfully"}
    else: # OUT
        if daily and daily.get("punch_in"):
            punch_in = daily["punch_in"]
            punch_out = datetime.utcnow()
            duration = (punch_out - punch_in).total_seconds() / 3600
            
            status = AttendanceStatus.PRESENT if duration >= 8 else AttendanceStatus.INCOMPLETE
            
            await db.db.daily_attendance.update_one(
                {"user_id": req.user_id, "date": today},
                {"$set": {
                    "punch_out": punch_out,
                    "punch_out_photo": req.image,
                    "total_hours": duration,
                    "status": status
                }}
            )
            return {"message": "Punched out successfully"}
    
    return {"message": "Punch recorded"}
            
def sanitize_doc(doc):
    if not doc:
        return doc
    if "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc

@router.get("/history")
async def get_history(user_id: str):
    """
    Get user's attendance history with photos
    """
    records = await db.db.daily_attendance.find({"user_id": user_id}).sort("date", -1).to_list(100)
    return [sanitize_doc(r) for r in records]

@router.get("/team-history")
async def get_team_history():
    """
    Get all team attendance history (Admin/Manager)
    """
    records = await db.db.daily_attendance.find().sort("date", -1).to_list(200)
    # Enrich with user details
    for record in records:
        user = await db.db.users.find_one({"email": record["user_id"]})
        if user:
            record["user_name"] = user["full_name"]
        sanitize_doc(record)
    return records

@router.post("/mark-invalid")
async def mark_invalid(user_id: str, date: str):
    """
    Mark a record as fake/invalid
    """
    await db.db.daily_attendance.update_one(
        {"user_id": user_id, "date": date},
        {"$set": {"is_fake": True}}
    )
    return {"message": "Record marked as invalid"}
