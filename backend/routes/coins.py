from fastapi import APIRouter, HTTPException, Depends, status, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import BaseModel, Field
from models.wallet import Transaction, TransactionCreate
from middleware.auth import get_current_user, require_master_admin
from config.settings import settings
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/coins', tags=['Coin Management'])

async def get_db():
    from server import db
    return db

class MintCoinsRequest(BaseModel):
    to_user_id: str
    amount: float = Field(gt=0)
    description: Optional[str] = 'Coin minting by Master Admin'

class TransferCoinsRequest(BaseModel):
    to_user_id: str
    amount: float = Field(gt=0)
    wallet_type: str = 'main_coin'
    description: Optional[str] = None

async def update_wallet_balance(db, user_id: str, wallet_type: str, amount: float, operation: str = 'add'):
    """Update wallet balance atomically"""
    wallet = await db.wallets.find_one({
        'user_id': user_id,
        'wallet_type': wallet_type
    })
    
    if not wallet:
        raise ValueError(f'Wallet not found for user {user_id}, type {wallet_type}')
    
    current_balance = wallet.get('balance', 0.0)
    
    if operation == 'add':
        new_balance = current_balance + amount
    elif operation == 'subtract':
        if current_balance < amount:
            raise ValueError(f'Insufficient balance. Have: {current_balance}, Need: {amount}')
        new_balance = current_balance - amount
    else:
        raise ValueError(f'Invalid operation: {operation}')
    
    await db.wallets.update_one(
        {'user_id': user_id, 'wallet_type': wallet_type},
        {'$set': {'balance': new_balance, 'updated_at': datetime.utcnow()}}
    )
    
    return new_balance

@router.post('/mint', response_model=Transaction)
async def mint_coins(
    request: MintCoinsRequest,
    current_user: dict = Depends(require_master_admin()),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mint new coins (Master Admin only)"""
    try:
        # Verify target user exists
        target_user = await db.users.find_one({'id': request.to_user_id})
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Target user not found'
            )
        
        # Create transaction
        transaction = Transaction(
            from_user_id=None,  # System mint
            to_user_id=request.to_user_id,
            amount=request.amount,
            transaction_type=settings.TXN_TYPE_MINT,
            wallet_type='main_coin',
            description=request.description,
            status='completed',
            created_by=current_user['user_id']
        )
        
        # Update wallet
        new_balance = await update_wallet_balance(
            db, 
            request.to_user_id, 
            'main_coin', 
            request.amount, 
            'add'
        )
        
        # Save transaction
        await db.transactions.insert_one(transaction.dict())
        
        logger.info(f'Coins minted: {request.amount} to user {request.to_user_id} by {current_user["user_id"]}')
        
        return transaction
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Mint coins error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Failed to mint coins: {str(e)}'
        )

@router.post('/transfer', response_model=Transaction)
async def transfer_coins(
    request: TransferCoinsRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Transfer coins (respects hierarchy: Master Admin → Admin → Agent → User)"""
    try:
        # Get sender and receiver
        sender = await db.users.find_one({'id': current_user['user_id']})
        receiver = await db.users.find_one({'id': request.to_user_id})
        
        if not receiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Receiver not found'
            )
        
        # Validate hierarchy
        sender_level = settings.ROLES_HIERARCHY.get(sender['role'], 0)
        receiver_level = settings.ROLES_HIERARCHY.get(receiver['role'], 0)
        
        # Can only transfer down the hierarchy
        if sender_level <= receiver_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='You can only transfer coins to users below you in hierarchy'
            )
        
        # Users cannot transfer at all
        if sender['role'] == 'user':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Users cannot transfer coins'
            )
        
        # Check sender balance
        sender_wallet = await db.wallets.find_one({
            'user_id': current_user['user_id'],
            'wallet_type': request.wallet_type
        })
        
        if not sender_wallet or sender_wallet.get('balance', 0) < request.amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail='Insufficient balance'
            )
        
        # Create transaction
        transaction = Transaction(
            from_user_id=current_user['user_id'],
            to_user_id=request.to_user_id,
            amount=request.amount,
            transaction_type=settings.TXN_TYPE_TRANSFER,
            wallet_type=request.wallet_type,
            description=request.description or f'Transfer from {sender["username"]} to {receiver["username"]}',
            status='completed',
            created_by=current_user['user_id']
        )
        
        # Perform transfer (atomic)
        # Subtract from sender
        await update_wallet_balance(
            db,
            current_user['user_id'],
            request.wallet_type,
            request.amount,
            'subtract'
        )
        
        # Add to receiver
        await update_wallet_balance(
            db,
            request.to_user_id,
            request.wallet_type,
            request.amount,
            'add'
        )
        
        # Save transaction
        await db.transactions.insert_one(transaction.dict())
        
        logger.info(f'Coins transferred: {request.amount} from {current_user["user_id"]} to {request.to_user_id}')
        
        return transaction
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Transfer coins error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Failed to transfer coins: {str(e)}'
        )

@router.get('/transactions', response_model=List[Transaction])
async def get_transactions(
    transaction_type: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get transaction history (role-based filtering)"""
    try:
        # Build filter
        filter_query = {}
        
        # Role-based filtering
        if current_user['role'] == 'user':
            # Users see their own transactions
            filter_query['$or'] = [
                {'from_user_id': current_user['user_id']},
                {'to_user_id': current_user['user_id']}
            ]
        elif current_user['role'] == 'agent':
            # Agents see their own and their users' transactions
            user_ids = [current_user['user_id']]
            users = await db.users.find({'created_by': current_user['user_id']}).to_list(1000)
            user_ids.extend([u['id'] for u in users])
            
            filter_query['$or'] = [
                {'from_user_id': {'$in': user_ids}},
                {'to_user_id': {'$in': user_ids}}
            ]
        # Admins and master admins see all
        
        if transaction_type:
            filter_query['transaction_type'] = transaction_type
        
        # Get transactions
        transactions = await db.transactions.find(filter_query).sort('created_at', -1).skip(skip).limit(limit).to_list(limit)
        
        return [Transaction(**txn) for txn in transactions]
    
    except Exception as e:
        logger.error(f'Get transactions error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get transactions'
        )

@router.get('/transactions/{transaction_id}', response_model=Transaction)
async def get_transaction(
    transaction_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get transaction details (role-based access)"""
    try:
        transaction = await db.transactions.find_one({'id': transaction_id})
        
        if not transaction:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail='Transaction not found'
            )
        
        # Check access permissions
        if current_user['role'] == 'user':
            if transaction.get('from_user_id') != current_user['user_id'] and transaction.get('to_user_id') != current_user['user_id']:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail='Access denied'
                )
        
        return Transaction(**transaction)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get transaction error: {str(e)}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail='Failed to get transaction'
        )
