from fastapi import APIRouter, HTTPException, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.auth import Token, Login2FARequest, Setup2FAResponse, LoginRequest
from models.user import UserCreate, UserInDB, UserResponse
from utils.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    generate_totp_secret,
    generate_qr_code,
    verify_totp
)
from middleware.auth import get_current_user
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/auth', tags=['Authentication'])

@router.post('/register', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user (public endpoint - creates user account)"""
    try:
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
            hashed_password=get_password_hash(password)
        )
        
        # Insert into database
        result = await db.users.insert_one(user_in_db.dict())
        
        # Create default wallets
        from models.wallet import Wallet
        wallet_types = ['main_coin', 'bonus', 'locked']
        for wallet_type in wallet_types:
            wallet = Wallet(
                user_id=user_in_db.id,
                wallet_type=wallet_type,
                balance=0.0
            )
            await db.wallets.insert_one(wallet.dict())
        
        logger.info(f'User registered: {user_in_db.email} (role: {user_in_db.role})')
        
        return UserResponse(**user_in_db.dict(), wallet_balance=0.0)
    
    except Exception as e:
        logger.error(f'Registration error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Registration failed: {str(e)}'
        )

@router.post('/login', response_model=Token)
async def login(login_data: Login2FARequest):
    """Login with email and password (with optional 2FA)"""
    try:
        # Find user
        user = await db.users.find_one({'email': login_data.email})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid email or password'
            )
        
        # Verify password
        if not verify_password(login_data.password, user['hashed_password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid email or password'
            )
        
        # Check if user is active
        if not user.get('is_active', True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Account is suspended'
            )
        
        # Check 2FA if enabled
        if user.get('is_2fa_enabled', False):
            if not login_data.totp_code:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail='2FA code required',
                    headers={'X-Require-2FA': 'true'}
                )
            
            # Verify TOTP
            if not verify_totp(user['totp_secret'], login_data.totp_code):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail='Invalid 2FA code'
                )
        
        # Update last login
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {'last_login': datetime.utcnow()}}
        )
        
        # Create tokens
        token_data = {'sub': user['id'], 'role': user['role'], 'email': user['email']}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        logger.info(f'User logged in: {user["email"]} (role: {user["role"]})')
        
        # Remove sensitive data
        user.pop('hashed_password', None)
        user.pop('totp_secret', None)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Login error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Login failed'
        )

@router.post('/logout')
async def logout(current_user: dict = Depends(get_current_user)):
    """Logout (client should discard tokens)"""
    logger.info(f'User logged out: {current_user["user_id"]}')
    return {'message': 'Logged out successfully'}

@router.get('/me', response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Get wallet balance
        wallets = await db.wallets.find({'user_id': user['id']}).to_list(10)
        total_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
        
        user.pop('hashed_password', None)
        user.pop('totp_secret', None)
        
        return UserResponse(**user, wallet_balance=total_balance)
    
    except Exception as e:
        logger.error(f'Get me error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get user profile'
        )

@router.post('/2fa/setup', response_model=Setup2FAResponse)
async def setup_2fa(
    current_user: dict = Depends(get_current_user),
    
):
    """Setup 2FA for admin roles"""
    try:
        # Only allow for admin roles
        if current_user['role'] not in ['master_admin', 'admin']:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='2FA is only available for admin roles'
            )
        
        user = await db.users.find_one({'id': current_user['user_id']})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Generate TOTP secret
        secret = generate_totp_secret()
        qr_code = generate_qr_code(secret, user['email'])
        
        # Save secret (but don't enable yet)
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {'totp_secret': secret}}
        )
        
        logger.info(f'2FA setup initiated for user: {user["email"]}')
        
        return Setup2FAResponse(
            secret=secret,
            qr_code_url=qr_code,
            manual_entry_key=secret
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'2FA setup error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to setup 2FA'
        )

@router.post('/2fa/verify')
async def verify_2fa(
    totp_code: str,
    current_user: dict = Depends(get_current_user),
    
):
    """Verify and enable 2FA"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})
        
        if not user or not user.get('totp_secret'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='2FA not setup. Call /2fa/setup first'
            )
        
        # Verify code
        if not verify_totp(user['totp_secret'], totp_code):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid 2FA code'
            )
        
        # Enable 2FA
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {'is_2fa_enabled': True}}
        )
        
        logger.info(f'2FA enabled for user: {user["email"]}')
        
        return {'message': '2FA enabled successfully'}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'2FA verify error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to verify 2FA'
        )

@router.post('/2fa/disable')
async def disable_2fa(
    password: str,
    current_user: dict = Depends(get_current_user),
    
):
    """Disable 2FA (requires password confirmation)"""
    try:
        user = await db.users.find_one({'id': current_user['user_id']})
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='User not found'
            )
        
        # Verify password
        if not verify_password(password, user['hashed_password']):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail='Invalid password'
            )
        
        # Disable 2FA
        await db.users.update_one(
            {'id': user['id']},
            {'$set': {
                'is_2fa_enabled': False,
                'totp_secret': None
            }}
        )
        
        logger.info(f'2FA disabled for user: {user["email"]}')
        
        return {'message': '2FA disabled successfully'}
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'2FA disable error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to disable 2FA'
        )
