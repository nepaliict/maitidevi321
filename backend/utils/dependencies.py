from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Generator

async def get_database() -> AsyncIOMotorDatabase:
    """Database dependency"""
    from server import db
    return db
