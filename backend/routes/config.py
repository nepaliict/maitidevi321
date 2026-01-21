from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.config import (
    SystemConfig, PaymentMethod, BonusRule, FAQ, Banner, Limit
)
from middleware.auth import get_current_user, require_master_admin, require_admin
from typing import List, Optional, Dict, Any
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/config', tags=['Configuration'])

# ============= SYSTEM CONFIGURATION =============

@router.get('/system')
async def get_system_config(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all system configurations as key-value pairs"""
    try:
        filter_query = {'is_active': True}
        if category:
            filter_query['category'] = category
        
        configs = await db.system_configs.find(filter_query).to_list(1000)
        
        # Convert to key-value dict
        result = {}
        for config in configs:
            config.pop('_id', None)  # Remove MongoDB _id
            result[config['config_key']] = config['config_value']
        
        return result
    except Exception as e:
        logger.error(f'Get system config error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get configuration')

@router.post('/system', status_code=status.HTTP_201_CREATED)
async def create_or_update_config(
    config_key: str,
    config_value: Any,
    config_type: str,
    category: str,
    description: Optional[str] = None,
    current_user: dict = Depends(require_master_admin())
):
    """Create or update system configuration"""
    try:
        existing = await db.system_configs.find_one({'config_key': config_key})
        
        if existing:
            await db.system_configs.update_one(
                {'config_key': config_key},
                {'$set': {
                    'config_value': config_value,
                    'config_type': config_type,
                    'category': category,
                    'description': description,
                    'updated_at': datetime.utcnow(),
                    'updated_by': current_user['user_id']
                }}
            )
            return {'message': 'Configuration updated', 'key': config_key}
        else:
            config = SystemConfig(
                config_key=config_key,
                config_value=config_value,
                config_type=config_type,
                category=category,
                description=description,
                updated_by=current_user['user_id']
            )
            await db.system_configs.insert_one(config.dict())
            return {'message': 'Configuration created', 'key': config_key}
    except Exception as e:
        logger.error(f'Create/update config error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to save configuration')

# ============= PAYMENT METHODS =============

@router.get('/payment-methods', response_model=List[PaymentMethod])
async def get_payment_methods(
    method_type: Optional[str] = Query(None),
    for_deposit: Optional[bool] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all active payment methods"""
    try:
        filter_query = {'is_active': True}
        if method_type:
            filter_query['method_type'] = method_type
        if for_deposit is not None:
            filter_query['available_for_deposit' if for_deposit else 'available_for_withdrawal'] = True
        
        methods = await db.payment_methods.find(filter_query).sort('sort_order', 1).to_list(100)
        return [PaymentMethod(**m) for m in methods]
    except Exception as e:
        logger.error(f'Get payment methods error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get payment methods')

@router.post('/payment-methods', status_code=status.HTTP_201_CREATED)
async def create_payment_method(
    method: PaymentMethod,
    current_user: dict = Depends(require_master_admin())
):
    """Create new payment method"""
    try:
        await db.payment_methods.insert_one(method.dict())
        logger.info(f'Payment method created: {method.name}')
        return {'message': 'Payment method created', 'id': method.id}
    except Exception as e:
        logger.error(f'Create payment method error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create payment method')

@router.patch('/payment-methods/{method_id}')
async def update_payment_method(
    method_id: str,
    update_data: dict,
    current_user: dict = Depends(require_master_admin())
):
    """Update payment method"""
    try:
        await db.payment_methods.update_one(
            {'id': method_id},
            {'$set': update_data}
        )
        return {'message': 'Payment method updated'}
    except Exception as e:
        logger.error(f'Update payment method error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to update payment method')

# ============= BONUS RULES =============

@router.get('/bonus-rules', response_model=List[BonusRule])
async def get_bonus_rules(
    bonus_type: Optional[str] = Query(None),
    active_only: bool = Query(True),
    current_user: dict = Depends(get_current_user)
):
    """Get all bonus rules"""
    try:
        filter_query = {}
        if active_only:
            filter_query['is_active'] = True
        if bonus_type:
            filter_query['bonus_type'] = bonus_type
        
        rules = await db.bonus_rules.find(filter_query).to_list(100)
        return [BonusRule(**r) for r in rules]
    except Exception as e:
        logger.error(f'Get bonus rules error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get bonus rules')

@router.post('/bonus-rules', status_code=status.HTTP_201_CREATED)
async def create_bonus_rule(
    rule: BonusRule,
    current_user: dict = Depends(require_admin())
):
    """Create bonus rule"""
    try:
        await db.bonus_rules.insert_one(rule.dict())
        logger.info(f'Bonus rule created: {rule.name}')
        return {'message': 'Bonus rule created', 'id': rule.id}
    except Exception as e:
        logger.error(f'Create bonus rule error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create bonus rule')

# ============= FAQ =============

@router.get('/faq', response_model=List[FAQ])
async def get_faqs(
    category: Optional[str] = Query(None)
):
    """Get all FAQs (public endpoint)"""
    try:
        filter_query = {'is_active': True}
        if category:
            filter_query['category'] = category
        
        faqs = await db.faqs.find(filter_query).sort('sort_order', 1).to_list(100)
        return [FAQ(**f) for f in faqs]
    except Exception as e:
        logger.error(f'Get FAQs error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get FAQs')

@router.post('/faq', status_code=status.HTTP_201_CREATED)
async def create_faq(
    faq: FAQ,
    current_user: dict = Depends(require_admin())
):
    """Create FAQ"""
    try:
        await db.faqs.insert_one(faq.dict())
        return {'message': 'FAQ created', 'id': faq.id}
    except Exception as e:
        logger.error(f'Create FAQ error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create FAQ')

# ============= BANNERS =============

@router.get('/banners', response_model=List[Banner])
async def get_banners(
    position: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get active banners"""
    try:
        now = datetime.utcnow()
        filter_query = {
            'is_active': True,
            '$or': [
                {'start_date': None, 'end_date': None},
                {'start_date': {'$lte': now}, 'end_date': {'$gte': now}},
                {'start_date': {'$lte': now}, 'end_date': None}
            ]
        }
        if position:
            filter_query['position'] = {'$in': [position, 'all']}
        
        banners = await db.banners.find(filter_query).sort('priority', -1).to_list(100)
        return [Banner(**b) for b in banners]
    except Exception as e:
        logger.error(f'Get banners error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get banners')

@router.post('/banners', status_code=status.HTTP_201_CREATED)
async def create_banner(
    banner: Banner,
    current_user: dict = Depends(require_admin())
):
    """Create banner"""
    try:
        await db.banners.insert_one(banner.dict())
        logger.info(f'Banner created: {banner.title}')
        return {'message': 'Banner created', 'id': banner.id}
    except Exception as e:
        logger.error(f'Create banner error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create banner')

# ============= LIMITS =============

@router.get('/limits', response_model=List[Limit])
async def get_limits(
    limit_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get all limits"""
    try:
        filter_query = {'is_active': True}
        if limit_type:
            filter_query['limit_type'] = limit_type
        
        # Apply role-based filtering
        if current_user['role'] != 'master_admin':
            filter_query['$or'] = [
                {'role': None},
                {'role': current_user['role']}
            ]
        
        limits = await db.limits.find(filter_query).to_list(100)
        return [Limit(**l) for l in limits]
    except Exception as e:
        logger.error(f'Get limits error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get limits')

@router.post('/limits', status_code=status.HTTP_201_CREATED)
async def create_limit(
    limit: Limit,
    current_user: dict = Depends(require_master_admin())
):
    """Create limit"""
    try:
        await db.limits.insert_one(limit.dict())
        return {'message': 'Limit created', 'id': limit.id}
    except Exception as e:
        logger.error(f'Create limit error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create limit')

# ============= DASHBOARD STATS (DYNAMIC) =============

@router.get('/dashboard/stats')
async def get_dashboard_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get dynamic dashboard statistics"""
    try:
        user_id = current_user['user_id']
        
        # Get wallet balance
        wallets = await db.wallets.find({'user_id': user_id}).to_list(10)
        wallet_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
        bonus_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'bonus'])
        
        # Get active bets count
        active_bets = await db.bets.count_documents({
            'user_id': user_id,
            'status': 'pending'
        })
        
        # Get wins/losses
        wins = await db.bets.count_documents({
            'user_id': user_id,
            'status': 'won'
        })
        losses = await db.bets.count_documents({
            'user_id': user_id,
            'status': 'lost'
        })
        
        # Get total winnings
        win_bets = await db.bets.find({
            'user_id': user_id,
            'status': 'won'
        }).to_list(1000)
        total_winnings = sum([b.get('actual_win', 0) for b in win_bets])
        
        # Get available bonuses
        bonus_rules = await db.bonus_rules.find({
            'is_active': True,
            'auto_apply': True
        }).to_list(100)
        
        return {
            'wallet_balance': wallet_balance,
            'bonus_balance': bonus_balance,
            'active_bets': active_bets,
            'total_wins': wins,
            'total_losses': losses,
            'total_winnings': total_winnings,
            'win_rate': round((wins / (wins + losses) * 100), 2) if (wins + losses) > 0 else 0,
            'available_bonuses': len(bonus_rules)
        }
    except Exception as e:
        logger.error(f'Get dashboard stats error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get dashboard stats')
