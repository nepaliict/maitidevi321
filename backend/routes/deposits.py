from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.deposit import Deposit, DepositCreate, Withdrawal, WithdrawalCreate
from models.wallet import Transaction
from middleware.auth import get_current_user, require_admin
from typing import List, Optional
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/transactions', tags=['Deposits & Withdrawals'])

# ============= DEPOSITS =============

@router.post('/deposits', response_model=Deposit, status_code=status.HTTP_201_CREATED)
async def create_deposit_request(
    deposit_data: DepositCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create deposit request"""
    try:
        deposit = Deposit(**deposit_data.dict(), user_id=current_user['user_id'])
        await db.deposits.insert_one(deposit.dict())
        
        logger.info(f'Deposit request created: {deposit.id} by {current_user["user_id"]}, amount: {deposit.amount}')
        
        return deposit
    except Exception as e:
        logger.error(f'Create deposit error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create deposit request')

@router.get('/deposits', response_model=List[Deposit])
async def get_deposits(
    status: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get deposits (role-based filtering)"""
    try:
        filter_query = {}
        
        # Role-based filtering
        if current_user['role'] == 'user':
            filter_query['user_id'] = current_user['user_id']
        elif current_user['role'] == 'agent':
            users = await db.users.find({'created_by': current_user['user_id']}).to_list(1000)
            user_ids = [u['id'] for u in users] + [current_user['user_id']]
            filter_query['user_id'] = {'$in': user_ids}
        # Admins see all
        
        if status:
            filter_query['status'] = status
        if user_id and current_user['role'] in ['admin', 'master_admin']:
            filter_query['user_id'] = user_id
        
        deposits = await db.deposits.find(filter_query).sort('created_at', -1).skip(skip).limit(limit).to_list(limit)
        
        return [Deposit(**d) for d in deposits]
    except Exception as e:
        logger.error(f'Get deposits error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get deposits')

@router.get('/deposits/{deposit_id}', response_model=Deposit)
async def get_deposit(
    deposit_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get deposit details"""
    try:
        deposit = await db.deposits.find_one({'id': deposit_id})
        
        if not deposit:
            raise HTTPException(status_code=404, detail='Deposit not found')
        
        # Check access
        if current_user['role'] == 'user' and deposit['user_id'] != current_user['user_id']:
            raise HTTPException(status_code=403, detail='Access denied')
        
        return Deposit(**deposit)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get deposit error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get deposit')

@router.patch('/deposits/{deposit_id}/approve')
async def approve_deposit(
    deposit_id: str,
    review_notes: Optional[str] = None,
    current_user: dict = Depends(require_admin())
):
    """Approve deposit and credit coins (Admin only)"""
    try:
        deposit = await db.deposits.find_one({'id': deposit_id})
        
        if not deposit:
            raise HTTPException(status_code=404, detail='Deposit not found')
        
        if deposit['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Deposit already processed')
        
        user_id = deposit['user_id']
        amount = deposit['amount']
        
        # Credit coins to user's main wallet
        wallet = await db.wallets.find_one({
            'user_id': user_id,
            'wallet_type': 'main_coin'
        })
        
        if not wallet:
            raise HTTPException(status_code=404, detail='User wallet not found')
        
        new_balance = wallet.get('balance', 0) + amount
        await db.wallets.update_one(
            {'user_id': user_id, 'wallet_type': 'main_coin'},
            {'$set': {'balance': new_balance, 'updated_at': datetime.utcnow()}}
        )
        
        # Create transaction
        txn = Transaction(
            from_user_id=None,  # System
            to_user_id=user_id,
            amount=amount,
            transaction_type='deposit',
            wallet_type='main_coin',
            description=f'Deposit approved: {deposit_id}',
            metadata={'deposit_id': deposit_id, 'payment_method': deposit['payment_method']}
        )
        await db.transactions.insert_one(txn.dict())
        
        # Update deposit status
        await db.deposits.update_one(
            {'id': deposit_id},
            {'$set': {
                'status': 'approved',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Deposit approved: {deposit_id}, amount: {amount}, user: {user_id}')
        
        return {
            'message': 'Deposit approved successfully',
            'deposit_id': deposit_id,
            'amount': amount,
            'new_balance': new_balance
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Approve deposit error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Failed to approve deposit: {str(e)}')

@router.patch('/deposits/{deposit_id}/reject')
async def reject_deposit(
    deposit_id: str,
    review_notes: str,
    current_user: dict = Depends(require_admin())
):
    """Reject deposit (Admin only)"""
    try:
        deposit = await db.deposits.find_one({'id': deposit_id})
        
        if not deposit:
            raise HTTPException(status_code=404, detail='Deposit not found')
        
        if deposit['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Deposit already processed')
        
        await db.deposits.update_one(
            {'id': deposit_id},
            {'$set': {
                'status': 'rejected',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Deposit rejected: {deposit_id}')
        
        return {'message': 'Deposit rejected', 'deposit_id': deposit_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Reject deposit error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to reject deposit')

# ============= WITHDRAWALS =============

@router.post('/withdrawals', response_model=Withdrawal, status_code=status.HTTP_201_CREATED)
async def create_withdrawal_request(
    withdrawal_data: WithdrawalCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create withdrawal request (KYC required)"""
    try:
        # Check KYC status
        user = await db.users.find_one({'id': current_user['user_id']})
        if user.get('kyc_status') != 'approved':
            raise HTTPException(
                status_code=403,
                detail='KYC verification required for withdrawals'
            )
        
        # Check balance
        wallet = await db.wallets.find_one({
            'user_id': current_user['user_id'],
            'wallet_type': 'main_coin'
        })
        
        if not wallet or wallet.get('balance', 0) < withdrawal_data.amount:
            raise HTTPException(status_code=400, detail='Insufficient balance')
        
        # Deduct coins immediately (hold in pending)
        new_balance = wallet['balance'] - withdrawal_data.amount
        await db.wallets.update_one(
            {'user_id': current_user['user_id'], 'wallet_type': 'main_coin'},
            {'$set': {'balance': new_balance, 'updated_at': datetime.utcnow()}}
        )
        
        # Create withdrawal
        withdrawal = Withdrawal(**withdrawal_data.dict(), user_id=current_user['user_id'])
        await db.withdrawals.insert_one(withdrawal.dict())
        
        logger.info(f'Withdrawal request created: {withdrawal.id} by {current_user["user_id"]}, amount: {withdrawal.amount}')
        
        return withdrawal
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Create withdrawal error: {str(e)}')
        raise HTTPException(status_code=500, detail=f'Failed to create withdrawal: {str(e)}')

@router.get('/withdrawals', response_model=List[Withdrawal])
async def get_withdrawals(
    status: Optional[str] = Query(None),
    user_id: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: dict = Depends(get_current_user)
):
    """Get withdrawals (role-based filtering)"""
    try:
        filter_query = {}
        
        if current_user['role'] == 'user':
            filter_query['user_id'] = current_user['user_id']
        elif current_user['role'] == 'agent':
            users = await db.users.find({'created_by': current_user['user_id']}).to_list(1000)
            user_ids = [u['id'] for u in users] + [current_user['user_id']]
            filter_query['user_id'] = {'$in': user_ids}
        
        if status:
            filter_query['status'] = status
        if user_id and current_user['role'] in ['admin', 'master_admin']:
            filter_query['user_id'] = user_id
        
        withdrawals = await db.withdrawals.find(filter_query).sort('created_at', -1).skip(skip).limit(limit).to_list(limit)
        
        return [Withdrawal(**w) for w in withdrawals]
    except Exception as e:
        logger.error(f'Get withdrawals error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get withdrawals')

@router.patch('/withdrawals/{withdrawal_id}/approve')
async def approve_withdrawal(
    withdrawal_id: str,
    review_notes: Optional[str] = None,
    current_user: dict = Depends(require_admin())
):
    """Approve withdrawal (Admin only with 2FA)"""
    try:
        withdrawal = await db.withdrawals.find_one({'id': withdrawal_id})
        
        if not withdrawal:
            raise HTTPException(status_code=404, detail='Withdrawal not found')
        
        if withdrawal['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Withdrawal already processed')
        
        # Create transaction record
        txn = Transaction(
            from_user_id=withdrawal['user_id'],
            to_user_id=None,  # External
            amount=withdrawal['amount'],
            transaction_type='withdrawal',
            wallet_type='main_coin',
            description=f'Withdrawal approved: {withdrawal_id}',
            metadata={'withdrawal_id': withdrawal_id, 'payment_method': withdrawal['payment_method']}
        )
        await db.transactions.insert_one(txn.dict())
        
        # Update withdrawal status
        await db.withdrawals.update_one(
            {'id': withdrawal_id},
            {'$set': {
                'status': 'approved',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Withdrawal approved: {withdrawal_id}, amount: {withdrawal["amount"]}')
        
        return {'message': 'Withdrawal approved', 'withdrawal_id': withdrawal_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Approve withdrawal error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to approve withdrawal')

@router.patch('/withdrawals/{withdrawal_id}/reject')
async def reject_withdrawal(
    withdrawal_id: str,
    review_notes: str,
    current_user: dict = Depends(require_admin())
):
    """Reject withdrawal and refund (Admin only)"""
    try:
        withdrawal = await db.withdrawals.find_one({'id': withdrawal_id})
        
        if not withdrawal:
            raise HTTPException(status_code=404, detail='Withdrawal not found')
        
        if withdrawal['status'] != 'pending':
            raise HTTPException(status_code=400, detail='Withdrawal already processed')
        
        # Refund coins
        user_id = withdrawal['user_id']
        amount = withdrawal['amount']
        
        wallet = await db.wallets.find_one({
            'user_id': user_id,
            'wallet_type': 'main_coin'
        })
        
        new_balance = wallet.get('balance', 0) + amount
        await db.wallets.update_one(
            {'user_id': user_id, 'wallet_type': 'main_coin'},
            {'$set': {'balance': new_balance, 'updated_at': datetime.utcnow()}}
        )
        
        # Update withdrawal status
        await db.withdrawals.update_one(
            {'id': withdrawal_id},
            {'$set': {
                'status': 'rejected',
                'reviewed_by': current_user['user_id'],
                'review_notes': review_notes,
                'reviewed_at': datetime.utcnow()
            }}
        )
        
        logger.info(f'Withdrawal rejected and refunded: {withdrawal_id}')
        
        return {'message': 'Withdrawal rejected and refunded', 'withdrawal_id': withdrawal_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Reject withdrawal error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to reject withdrawal')
