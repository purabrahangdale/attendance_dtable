import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

async def list_db_entries():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "attendance_db")
    
    print(f"Connecting to {mongodb_url}...")
    client = AsyncIOMotorClient(mongodb_url)
    db = client[database_name]
    
    # List collections
    collections = await db.list_collection_names()
    print(f"\nCollections in {database_name}: {collections}")
    
    for coll_name in collections:
        print(f"\n--- {coll_name} (first 5 entries) ---")
        cursor = db[coll_name].find().limit(5)
        async for doc in cursor:
            # Mask the encoding if it's too long
            if 'encoding' in doc:
                doc['encoding'] = f"[Vector of length {len(doc['encoding'])}]"
            pprint(doc)

if __name__ == "__main__":
    asyncio.run(list_db_entries())
