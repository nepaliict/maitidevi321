from fastapi import APIRouter, HTTPException, Depends, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.wallet import WalletResponse, Transaction, TransactionCreate
from middleware.auth import get_current_user, require_master_admin
from config.settings import settings
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/wallets', tags=['Wallet Management'])

@router.get('/my-balance', response_model=WalletResponse)
async def get_my_balance(
    current_user: dict = Depends(get_current_user),
    
):
    """Get current user's wallet balance"""
    try:
        wallets = await db.wallets.find({'user_id': current_user['user_id']}).to_list(10)
        
        balance_map = {}
        for wallet in wallets:
            balance_map[wallet['wallet_type']] = wallet.get('balance', 0.0)
        
        main_coin = balance_map.get('main_coin', 0.0)
        bonus = balance_map.get('bonus', 0.0)
        locked = balance_map.get('locked', 0.0)
        
        return WalletResponse(
            user_id=current_user['user_id'],
            main_coin=main_coin,
            bonus=bonus,
            locked=locked,
            total=main_coin + bonus
        )
    
    except Exception as e:
        logger.error(f'Get balance error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get balance'
        )

@router.get('/{user_id}', response_model=WalletResponse)
async def get_user_balance(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    
):
    """Get user balance (role-based access)"""
    try:
        # Check permissions
        if current_user['role'] == 'user' and current_user['user_id'] != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Access denied'
            )
        
        if current_user['role'] == 'agent':
            # Check if user was created by this agent
            user = await db.users.find_one({'id': user_id})
            if not user or user.get('created_by') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        
        wallets = await db.wallets.find({'user_id': user_id}).to_list(10)
        
        balance_map = {}
        for wallet in wallets:
            balance_map[wallet['wallet_type']] = wallet.get('balance', 0.0)
        
        main_coin = balance_map.get('main_coin', 0.0)
        bonus = balance_map.get('bonus', 0.0)
        locked = balance_map.get('locked', 0.0)
        
        return WalletResponse(
            user_id=user_id,
            main_coin=main_coin,
            bonus=bonus,
            locked=locked,
            total=main_coin + bonus
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get user balance error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get user balance'
        )
