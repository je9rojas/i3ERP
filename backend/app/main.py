from fastapi import FastAPI
from app import app
from app.blueprints.auth import routes as auth_routes
from app.blueprints.users import routes as user_routes

app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])
app.include_router(user_routes.router, prefix="/api/users", tags=["users"])