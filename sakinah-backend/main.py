from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from routers import pool, interest, match, conversation, decision, safety, kyc

load_dotenv()

app = FastAPI(title="Sakinah Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pool.router, prefix="/pool")
app.include_router(interest.router, prefix="/interest")
app.include_router(match.router, prefix="/match")
app.include_router(conversation.router, prefix="/conversation")
app.include_router(decision.router, prefix="/decision")
app.include_router(safety.router, prefix="/safety")
app.include_router(kyc.router, prefix="/kyc")


@app.get("/")
def root():
    return {"status": "sakinah backend running"}
