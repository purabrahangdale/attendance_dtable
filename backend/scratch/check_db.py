import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017")
    db = client["attendance_db"]
    
    print("--- Users ---")
    users = await db.users.find().to_list(10)
    for u in users:
        print(f"ID: {u['_id']}, Email: {u.get('email')}")
        
    print("\n--- Face Encodings ---")
    faces = await db.face_encodings.find().to_list(10)
    for f in faces:
        print(f"User: {f['user_id']}, Has Image: {'image' in f}")
        
    print("\n--- Daily Attendance ---")
    attendance = await db.daily_attendance.find().to_list(10)
    for a in attendance:
        print(f"User: {a['user_id']}, Date: {a['date']}, In: {a.get('punch_in')}, Has In Photo: {'punch_in_photo' in a}")

if __name__ == "__main__":
    asyncio.run(check_db())
