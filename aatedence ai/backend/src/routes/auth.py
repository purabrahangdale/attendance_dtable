from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.core.security import verify_password, get_password_hash, create_access_token
from src.core.database import db
from src.models.user import UserCreate, UserResponse
from datetime import datetime
from src.services.face_service import face_service

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
async def register(user_in: UserCreate):
    # Check if user exists
    existing_user = await db.db.users.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Handle face encoding if image provided
    encoding = None
    if user_in.image:
        encoding = face_service.get_face_encoding(user_in.image)
        if not encoding:
            raise HTTPException(status_code=400, detail="No face detected in the registration image")

    # Create new user
    user_dict = user_in.dict()
    image = user_dict.pop("image", None)
    user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
    user_dict["is_active"] = True
    user_dict["created_at"] = datetime.utcnow()
    
    result = await db.db.users.insert_one(user_dict)
    user_id = str(result.inserted_id)
    
    # Store face encoding if created
    if encoding:
        await db.db.face_encodings.update_one(
            {"user_id": user_id},
            {"$set": {"encoding": encoding, "updated_at": datetime.utcnow()}},
            upsert=True
        )
        
    user_dict["_id"] = user_id
    return user_dict

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.db.users.find_one({"email": form_data.username})
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user["email"], "role": user["role"]}
    )
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]}
