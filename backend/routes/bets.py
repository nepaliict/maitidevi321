from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.bet import Bet, BetCreate
from middleware.auth import get_current_user, require_admin
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/bets', tags=['Betting'])

async def update_wallet_balance(user_id: str, wallet_type: str, amount: float, operation: str):
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

@router.post('', response_model=Bet, status_code=status.HTTP_201_CREATED)
async def place_bet(
    bet_data: BetCreate,
    current_user: dict = Depends(get_current_user)
):
    """Place a bet (user)"""
    try:
        # Verify game exists and is active
        game = await db.games.find_one({'id': bet_data.game_id, 'is_active': True})
        if not game:
            raise HTTPException(status_code=404, detail='Game not found or inactive')
        
        # Check bet amount within limits
        if bet_data.amount < game['min_bet']:
            raise HTTPException(
                status_code=400,
                detail=f'Bet amount below minimum: {game["min_bet"]}'
            )
        if bet_data.amount > game['max_bet']:
            raise HTTPException(
                status_code=400,
                detail=f'Bet amount exceeds maximum: {game["max_bet"]}'
            )
        
        # Check user balance
        wallet = await db.wallets.find_one({
            'user_id': current_user['user_id'],
            'wallet_type': 'main_coin'
        })
        
        if not wallet or wallet.get('balance', 0) < bet_data.amount:
            raise HTTPException(status_code=400, detail='Insufficient balance')
        
        # Create bet
        bet = Bet(**bet_data.dict(), user_id=current_user['user_id'])
        
        # Lock coins from main_coin to locked wallet
        await update_wallet_balance(current_user['user_id'], 'main_coin', bet_data.amount, 'subtract')
        await update_wallet_balance(current_user['user_id'], 'locked', bet_data.amount, 'add')
        
        # Save bet
        await db.bets.insert_one(bet.dict())
        
        # Create transaction record
        from models.wallet import Transaction
        txn = Transaction(
            from_user_id=current_user['user_id'],
            to_user_id=current_user['user_id'],
            amount=bet_data.amount,
            transaction_type='bet',
            wallet_type='locked',
            description=f'Bet placed on game {game["name"]}',
            metadata={'bet_id': bet.id, 'game_id': bet_data.game_id}
        )
        await db.transactions.insert_one(txn.dict())
        
        logger.info(f'Bet placed: {bet.id} by user {current_user["user_id"]}, amount: {bet_data.amount}')
        
        return bet
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Place bet error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Failed to place bet: {str(e)}')

@router.get('', response_model=List[Bet])
async def get_bets(
    status: Optional[str] = Query(None),
    game_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get user's bets"""
    try:
        filter_query = {}
        
        # Role-based filtering
        if current_user['role'] == 'user':
            filter_query['user_id'] = current_user['user_id']
        elif current_user['role'] == 'agent':
            # Get users created by this agent
            users = await db.users.find({'created_by': current_user['user_id']}).to_list(1000)
            user_ids = [u['id'] for u in users] + [current_user['user_id']]
            filter_query['user_id'] = {'$in': user_ids}
        # Admins and master admins see all bets
        
        if status:
            filter_query['status'] = status
        if game_id:
            filter_query['game_id'] = game_id
        
        bets = await db.bets.find(filter_query).sort('created_at', -1).skip(skip).limit(limit).to_list(limit)
        
        return [Bet(**b) for b in bets]
    except Exception as e:
        logger.error(f'Get bets error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get bets')

@router.get('/{bet_id}', response_model=Bet)
async def get_bet(
    bet_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get bet details"""
    try:
        bet = await db.bets.find_one({'id': bet_id})
        
        if not bet:
            raise HTTPException(status_code=404, detail='Bet not found')
        
        # Check access permissions
        if current_user['role'] == 'user' and bet['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail='Access denied')
        
        return Bet(**bet)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get bet error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get bet')

@router.post('/{bet_id}/settle')
async def settle_bet(
    bet_id: str,
    result: str,  # 'won' or 'lost'
    actual_win: float = 0.0,
    current_user: dict = Depends(require_admin())
):
    """Settle bet (Admin only)"""
    try:
        bet = await db.bets.find_one({'id': bet_id})
        
        if not bet:
            raise HTTPException(status_code=404, detail='Bet not found')
        
        if bet['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Bet already settled')
        
        user_id = bet['user_id']
        bet_amount = bet['amount']
        
        if result == 'won':
            # Win: Unlock locked coins + add winnings to main_coin
            await update_wallet_balance(user_id, 'locked', bet_amount, 'subtract')
            await update_wallet_balance(user_id, 'main_coin', bet_amount + actual_win, 'add')
            
            # Create win transaction
            from models.wallet import Transaction
            txn = Transaction(
                from_user_id=None,  # System
                to_user_id=user_id,
                amount=actual_win,
                transaction_type='win',
                wallet_type='main_coin',
                description=f'Bet won: {bet_id}',
                metadata={'bet_id': bet_id}
            )
            await db.transactions.insert_one(txn.dict())
            
        elif result == 'lost':
            # Loss: Remove locked coins (they're lost)
            await update_wallet_balance(user_id, 'locked', bet_amount, 'subtract')
            
        else:
            raise HTTPException(status_code=400, detail='Invalid result. Use "won" or "lost"')
        
        # Update bet status
        await db.bets.update_one(
            {'id': bet_id},
            {'$set': {
                'status': result,
                'actual_win': actual_win,
                'settled_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Bet settled: {bet_id} - Result: {result}, Win: {actual_win}')
        
        return {
            'message': 'Bet settled successfully',
            'bet_id': bet_id,
            'result': result,
            'actual_win': actual_win
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Settle bet error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Failed to settle bet: {str(e)}')

@router.post('/{bet_id}/cancel')
async def cancel_bet(
    bet_id: str,
    reason: str,
    current_user: dict = Depends(require_admin())
):
    """Cancel bet and refund (Admin only)"""
    try:
        bet = await db.bets.find_one({'id': bet_id})
        
        if not bet:
            raise HTTPException(status_code=404, detail='Bet not found')
        
        if bet['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Can only cancel pending bets')
        
        user_id = bet['user_id']
        bet_amount = bet['amount']
        
        # Refund: Unlock coins back to main_coin
        await update_wallet_balance(user_id, 'locked', bet_amount, 'subtract')
        await update_wallet_balance(user_id, 'main_coin', bet_amount, 'add')
        
        # Update bet status
        await db.bets.update_one(
            {'id': bet_id},
            {'$set': {
                'status': 'cancelled',
                'settled_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Bet cancelled: {bet_id} - Reason: {reason}')
        
        return {
            'message': 'Bet cancelled and refunded',
            'bet_id': bet_id,
            'refunded_amount': bet_amount
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Cancel bet error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Failed to cancel bet: {str(e)}')
