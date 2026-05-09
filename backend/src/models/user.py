from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class Role(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: Role = Role.EMPLOYEE

class UserCreate(UserBase):
    password: str
    image: Optional[str] = None # Base64 image for face registration

class UserResponse(UserBase):
    id: str = Field(alias="_id")
    is_active: bool = True
    created_at: datetime
    
    class Config:
        populate_by_name = True

class FaceEncoding(BaseModel):
    user_id: str
    encoding: List[float]  # 128D encoding from face_recognition
    created_at: datetime = Field(default_factory=datetime.utcnow)
