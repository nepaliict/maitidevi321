from fastapi import HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorDatabase
from utils.security import decode_token
from config.settings import settings
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles
    
    async def __call__(self, credentials: HTTPAuthorizationCredentials = Security(security)):
        token = credentials.credentials
        payload = decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid or expired token'
            )
        
        user_id = payload.get('sub')
        role = payload.get('role')
        
        if not user_id or not role:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid token payload'
            )
        
        if role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f'Access denied. Required roles: {self.allowed_roles}'
            )
        
        return {'user_id': user_id, 'role': role}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """Get current authenticated user"""
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid or expired token'
        )
    
    user_id = payload.get('sub')
    role = payload.get('role')
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid token payload'
        )
    
    return {'user_id': user_id, 'role': role}

def require_role(allowed_roles: List[str]):
    """Decorator to require specific roles"""
    return RoleChecker(allowed_roles)

def require_master_admin():
    return RoleChecker([settings.ROLE_MASTER_ADMIN])

def require_admin():
    return RoleChecker([settings.ROLE_MASTER_ADMIN, settings.ROLE_ADMIN])

def require_agent():
    return RoleChecker([settings.ROLE_MASTER_ADMIN, settings.ROLE_ADMIN, settings.ROLE_AGENT])

def require_authenticated():
    return get_current_user
