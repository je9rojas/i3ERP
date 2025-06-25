from fastapi import FastAPI
from .core.database import db

app = FastAPI(
    title="pyERP API",
    version="1.0.0",
    description="Sistema ERP Profesional"
)

@app.on_event("startup")
async def startup_event():
    await init_db()