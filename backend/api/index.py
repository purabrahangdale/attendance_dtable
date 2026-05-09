from fastapi import FastAPI
from mangum import Mangum

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Backend Working"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/auth/register")
def register():
    return {"message": "Register route working"}

handler = Mangum(app)