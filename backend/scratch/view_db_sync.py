import pymongo
import os
from dotenv import load_dotenv
from pprint import pprint

load_dotenv()

def list_db_entries():
    mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    database_name = os.getenv("DATABASE_NAME", "attendance_db")
    
    print(f"Connecting to {mongodb_url}...")
    try:
        client = pymongo.MongoClient(mongodb_url, serverSelectionTimeoutMS=5000)
        db = client[database_name]
        
        # Check connection
        client.server_info()
        print("Connection successful!")
        
        # List collections
        collections = db.list_collection_names()
        print(f"\nCollections in {database_name}: {collections}")
        
        for coll_name in collections:
            print(f"\n--- {coll_name} ---")
            count = db[coll_name].count_documents({})
            print(f"Total documents: {count}")
            
            cursor = db[coll_name].find().limit(5)
            for doc in cursor:
                # Mask long fields
                if 'encoding' in doc:
                    doc['encoding'] = f"[Vector of length {len(doc['encoding'])}]"
                pprint(doc)
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_db_entries()
