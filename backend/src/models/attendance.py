from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class AttendanceStatus(str, Enum):
    PRESENT = "present"
    INCOMPLETE = "incomplete"
    ABSENT = "absent"

class PunchType(str, Enum):
    IN = "in"
    OUT = "out"

class Location(BaseModel):
    latitude: float
    longitude: float

class AttendanceRecord(BaseModel):
    user_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    type: PunchType
    location: Location
    selfie_url: Optional[str] = None  # URL or path to stored selfie
    face_verified: bool = False
    
class DailyAttendance(BaseModel):
    user_id: str
    date: str  # YYYY-MM-DD
    punch_in: Optional[datetime] = None
    punch_out: Optional[datetime] = None
    punch_in_photo: Optional[str] = None  # Base64 photo
    punch_out_photo: Optional[str] = None # Base64 photo
    total_hours: float = 0.0
    status: AttendanceStatus = AttendanceStatus.ABSENT
    is_fake: bool = False
    overtime_requested: bool = False
    overtime_approved: bool = False

class PunchRequest(BaseModel):
    user_id: str
    type: PunchType
    location: Location
    image: str

class FaceRegistrationRequest(BaseModel):
    user_id: str
    image: str
