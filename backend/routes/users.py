from fastapi import APIRouter, HTTPException, Depends, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.user import UserCreate, UserUpdate, UserResponse, UserInDB
from models.wallet import Wallet
from utils.security import get_password_hash
from middleware.auth import get_current_user, require_master_admin, require_admin, require_agent
from config.settings import settings
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/users', tags=['User Management'])

def can_manage_user(manager_role: str, target_role: str) -> bool:
    """Check if manager can manage target user based on hierarchy"""
    hierarchy = settings.ROLES_HIERARCHY
    return hierarchy.get(manager_role, 0) > hierarchy.get(target_role, 0)

@router.get('', response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    
):
    """List users (filtered by role permissions)"""
    try:
        # Build filter
        filter_query = {}
        
        # Role-based filtering
        if current_user['role'] == 'agent':
            # Agents can only see users they created
            filter_query['created_by'] = current_user['user_id']
        elif current_user['role'] == 'admin':
            # Admins can see agents and users
            filter_query['role'] = {'$in': ['agent', 'user']}
        # Master admin can see all
        
        if role:
            filter_query['role'] = role
        
        if is_active is not None:
            filter_query['is_active'] = is_active
        
        # Get users
        users = await db.users.find(filter_query).skip(skip).limit(limit).to_list(limit)
        
        # Get wallet balances
        result = []
        for user in users:
            user.pop('hashed_password', None)
            user.pop('totp_secret', None)
            
            wallets = await db.wallets.find({'user_id': user['id']}).to_list(10)
            total_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
            
            result.append(UserResponse(**user, wallet_balance=total_balance))
        
        return result
    
    except Exception as e:
        logger.error(f'List users error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to list users'
        )

@router.post('', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    current_user: dict = Depends(get_current_user),
    
):
    """Create user (respects hierarchy: Master Admin → Admin → Agent → User)"""
    try:
        # Validate hierarchy
        if not can_manage_user(current_user['role'], user_data.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f'You cannot create users with role: {user_data.role}'
            )
        
        # Check if user exists
        existing_user = await db.users.find_one({'$or': [
            {'email': user_data.email},
            {'username': user_data.username}
        ]})
        
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='User with this email or username already exists'
            )
        
        # Create user
        user_dict = user_data.dict()
        password = user_dict.pop('password')
        
        user_in_db = UserInDB(
            **user_dict,
            hashed_password=get_password_hash(password),
            created_by=current_user['user_id']
        )
        
        # Insert into database
        result = await db.users.insert_one(user_in_db.dict())
        
        # Create default wallets
        wallet_types = ['main_coin', 'bonus', 'locked']
        for wallet_type in wallet_types:
            wallet = Wallet(
                user_id=user_in_db.id,
                wallet_type=wallet_type,
                balance=0.0
            )
            await db.wallets.insert_one(wallet.dict())
        
        logger.info(f'User created: {user_in_db.email} (role: {user_in_db.role}) by {current_user["user_id"]}')
        
        return UserResponse(**user_in_db.dict(), wallet_balance=0.0)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Create user error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Failed to create user: {str(e)}'
        )

@router.get('/{user_id}', response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    
):
    """Get user by ID (role-based access)"""
    try:
        user = await db.users.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Check access permissions
        if current_user['role'] == 'agent':
            if user['created_by'] != current_user['user_id'] and user['id'] != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        elif current_user['role'] == 'admin':
            if user['role'] not in ['agent', 'user'] and user['id'] != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        
        # Get wallet balance
        wallets = await db.wallets.find({'user_id': user['id']}).to_list(10)
        total_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
        
        user.pop('hashed_password', None)
        user.pop('totp_secret', None)
        
        return UserResponse(**user, wallet_balance=total_balance)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get user error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get user'
        )

@router.patch('/{user_id}', response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdate,
    current_user: dict = Depends(get_current_user),
    
):
    """Update user (role-based access)"""
    try:
        user = await db.users.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Check permissions
        if current_user['role'] == 'agent':
            if user['created_by'] != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        elif current_user['role'] == 'admin':
            if user['role'] not in ['agent', 'user']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        
        # Update user
        update_dict = update_data.dict(exclude_unset=True)
        update_dict['updated_at'] = datetime.utcnow()
        
        await db.users.update_one(
            {'id': user_id},
            {'$set': update_dict}
        )
        
        # Get updated user
        updated_user = await db.users.find_one({'id': user_id})
        
        # Get wallet balance
        wallets = await db.wallets.find({'user_id': user_id}).to_list(10)
        total_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
        
        updated_user.pop('hashed_password', None)
        updated_user.pop('totp_secret', None)
        
        logger.info(f'User updated: {user_id} by {current_user["user_id"]}')
        
        return UserResponse(**updated_user, wallet_balance=total_balance)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Update user error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to update user'
        )

@router.post('/{user_id}/suspend')
async def suspend_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    
):
    """Suspend/unsuspend user (toggle is_active)"""
    try:
        user = await db.users.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Check permissions
        if not can_manage_user(current_user['role'], user['role']):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Access denied'
            )
        
        # Toggle active status
        new_status = not user.get('is_active', True)
        
        await db.users.update_one(
            {'id': user_id},
            {'$set': {'is_active': new_status}}
        )
        
        logger.info(f'User {"suspended" if not new_status else "activated"}: {user_id} by {current_user["user_id"]}')
        
        return {
            'message': f'User {"suspended" if not new_status else "activated"} successfully',
            'is_active': new_status
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Suspend user error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to suspend user'
        )

@router.patch('/{user_id}/change-role')
async def change_user_role(
    user_id: str,
    new_role: str,
    current_user: dict = Depends(require_master_admin()),
    
):
    """Change user role (Master Admin only)"""
    try:
        # Validate role
        if new_role not in ['master_admin', 'admin', 'agent', 'user']:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Invalid role'
            )
        
        user = await db.users.find_one({'id': user_id})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Update role
        await db.users.update_one(
            {'id': user_id},
            {'$set': {'role': new_role, 'updated_at': datetime.utcnow()}}
        )
        
        logger.info(f'User role changed: {user_id} from {user["role"]} to {new_role} by {current_user["user_id"]}')
        
        return {
            'message': 'Role changed successfully',
            'new_role': new_role
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Change role error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to change role'
        )
