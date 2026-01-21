from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from middleware.auth import get_current_user
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])

@router.get('/overview')
async def get_dashboard_overview(
    current_user: dict = Depends(get_current_user)
):
    """Get complete dashboard overview - FULLY DYNAMIC"""
    try:
        user_id = current_user['user_id']
        
        # Get user details
        user = await db.users.find_one({'id': user_id})
        
        # Wallet balances
        wallets = await db.wallets.find({'user_id': user_id}).to_list(10)
        main_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'main_coin'])
        bonus_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'bonus'])
        locked_balance = sum([w.get('balance', 0) for w in wallets if w.get('wallet_type') == 'locked'])
        
        # Active bets
        active_bets = await db.bets.find({
            'user_id': user_id,
            'status': 'pending'
        }).to_list(10)
        
        # Win/Loss stats
        wins = await db.bets.count_documents({'user_id': user_id, 'status': 'won'})
        losses = await db.bets.count_documents({'user_id': user_id, 'status': 'lost'})
        total_bets = wins + losses
        win_rate = round((wins / total_bets * 100), 2) if total_bets > 0 else 0
        
        # Total winnings
        win_bets = await db.bets.find({'user_id': user_id, 'status': 'won'}).to_list(1000)
        total_winnings = sum([b.get('actual_win', 0) for b in win_bets])
        
        # Recent activity (last 10 transactions)
        recent_transactions = await db.transactions.find({
            '$or': [
                {'from_user_id': user_id},
                {'to_user_id': user_id}
            ]
        }).sort('created_at', -1).limit(10).to_list(10)
        
        # Available bonuses
        available_bonuses = await db.bonus_rules.find({
            'is_active': True,
            'auto_apply': True
        }).to_list(100)
        
        # Get system config for welcome message
        platform_name = await db.system_configs.find_one({'config_key': 'platform_name'})
        
        return {
            'user': {
                'id': user['id'],
                'username': user['username'],
                'full_name': user.get('full_name', user['username']),
                'email': user['email'],
                'role': user['role'],
                'kyc_status': user.get('kyc_status', 'pending'),
                'is_2fa_enabled': user.get('is_2fa_enabled', False)
            },
            'wallet': {
                'main_balance': main_balance,
                'bonus_balance': bonus_balance,
                'locked_balance': locked_balance,
                'total_balance': main_balance + bonus_balance
            },
            'stats': {
                'active_bets': len(active_bets),
                'total_wins': wins,
                'total_losses': losses,
                'win_rate': win_rate,
                'total_winnings': total_winnings
            },
            'active_bets': [{
                'id': bet['id'],
                'game_id': bet.get('game_id'),
                'amount': bet.get('amount', 0),
                'potential_win': bet.get('potential_win', 0),
                'created_at': bet.get('created_at')
            } for bet in active_bets],
            'recent_activity': [{
                'id': txn['id'],
                'type': txn.get('transaction_type'),
                'amount': txn.get('amount', 0),
                'description': txn.get('description', ''),
                'created_at': txn.get('created_at')
            } for txn in recent_transactions],
            'available_bonuses': [{
                'id': bonus['id'],
                'name': bonus['name'],
                'percentage': bonus.get('percentage', 0),
                'max_bonus': bonus.get('max_bonus', 0)
            } for bonus in available_bonuses],
            'welcome_message': f"Welcome back, {user.get('full_name', user['username'])}!",
            'platform_name': platform_name.get('config_value', 'KarnaliX') if platform_name else 'KarnaliX'
        }
    except Exception as e:
        logger.error(f'Get dashboard overview error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get dashboard overview')

@router.get('/activity')
async def get_recent_activity(
    limit: int = Query(20, ge=1, le=100),
    activity_type: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get recent activity feed - FULLY DYNAMIC"""
    try:
        user_id = current_user['user_id']
        
        # Build filter
        filter_query = {
            '$or': [
                {'from_user_id': user_id},
                {'to_user_id': user_id}
            ]
        }
        
        if activity_type:
            filter_query['transaction_type'] = activity_type
        
        activities = await db.transactions.find(filter_query).sort('created_at', -1).limit(limit).to_list(limit)
        
        # Enrich with game/user details
        enriched_activities = []
        for activity in activities:
            enriched = {
                'id': activity['id'],
                'type': activity.get('transaction_type'),
                'amount': activity.get('amount', 0),
                'wallet_type': activity.get('wallet_type'),
                'description': activity.get('description', ''),
                'status': activity.get('status', 'completed'),
                'created_at': activity.get('created_at'),
                'metadata': activity.get('metadata', {})
            }
            
            # Add directional info
            if activity.get('from_user_id') == user_id:
                enriched['direction'] = 'outgoing'
            else:
                enriched['direction'] = 'incoming'
            
            enriched_activities.append(enriched)
        
        return {
            'activities': enriched_activities,
            'total': len(enriched_activities)
        }
    except Exception as e:
        logger.error(f'Get activity error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get activity')

@router.get('/quick-stats')
async def get_quick_stats(
    current_user: dict = Depends(get_current_user)
):
    """Get quick stats for dashboard cards - FULLY DYNAMIC"""
    try:
        user_id = current_user['user_id']
        
        # Today's stats
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Today's bets
        todays_bets = await db.bets.count_documents({
            'user_id': user_id,
            'created_at': {'$gte': today_start}
        })
        
        # Today's wins
        todays_wins = await db.bets.count_documents({
            'user_id': user_id,
            'status': 'won',
            'created_at': {'$gte': today_start}
        })
        
        # Today's deposits
        todays_deposits = await db.deposits.find({
            'user_id': user_id,
            'created_at': {'$gte': today_start}
        }).to_list(100)
        total_deposited_today = sum([d.get('amount', 0) for d in todays_deposits if d.get('status') == 'approved'])
        
        # Pending withdrawals
        pending_withdrawals = await db.withdrawals.count_documents({
            'user_id': user_id,
            'status': 'pending'
        })
        
        # Available bonuses count
        available_bonuses = await db.bonus_rules.count_documents({
            'is_active': True
        })
        
        # Referral stats
        referrals = await db.referrals.count_documents({
            'referrer_id': user_id
        })
        
        return {
            'today': {
                'bets': todays_bets,
                'wins': todays_wins,
                'deposits': total_deposited_today
            },
            'pending': {
                'withdrawals': pending_withdrawals
            },
            'available': {
                'bonuses': available_bonuses
            },
            'referrals': {
                'total': referrals
            }
        }
    except Exception as e:
        logger.error(f'Get quick stats error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get quick stats')

@router.get('/notifications')
async def get_notifications(
    unread_only: bool = Query(False),
    limit: int = Query(10, ge=1, le=50),
    current_user: dict = Depends(get_current_user)
):
    """Get user notifications - FULLY DYNAMIC"""
    try:
        user_id = current_user['user_id']
        
        # Check for various notification triggers
        notifications = []
        
        # Pending deposits
        pending_deposits = await db.deposits.count_documents({
            'user_id': user_id,
            'status': 'pending'
        })
        if pending_deposits > 0:
            notifications.append({
                'type': 'deposit_pending',
                'title': 'Deposit Pending',
                'message': f'You have {pending_deposits} deposit(s) awaiting approval',
                'icon': 'clock',
                'link': '/transactions',
                'priority': 'medium'
            })
        
        # Approved withdrawals
        approved_withdrawals = await db.withdrawals.find({
            'user_id': user_id,
            'status': 'approved',
            'reviewed_at': {'$gte': datetime.utcnow() - timedelta(hours=24)}
        }).to_list(10)
        if approved_withdrawals:
            notifications.append({
                'type': 'withdrawal_approved',
                'title': 'Withdrawal Approved',
                'message': f'Your withdrawal request has been approved!',
                'icon': 'check-circle',
                'link': '/transactions',
                'priority': 'high'
            })
        
        # KYC pending
        user = await db.users.find_one({'id': user_id})
        if user.get('kyc_status') == 'pending':
            notifications.append({
                'type': 'kyc_pending',
                'title': 'Complete KYC',
                'message': 'Complete your KYC verification to unlock withdrawals',
                'icon': 'alert-circle',
                'link': '/profile/kyc',
                'priority': 'high'
            })
        
        # Available bonuses
        active_bonuses = await db.bonus_rules.count_documents({
            'is_active': True,
            'auto_apply': False
        })
        if active_bonuses > 0:
            notifications.append({
                'type': 'bonus_available',
                'title': 'Bonuses Available',
                'message': f'{active_bonuses} bonus offer(s) waiting for you!',
                'icon': 'gift',
                'link': '/bonuses',
                'priority': 'low'
            })
        
        return {
            'notifications': notifications[:limit],
            'unread_count': len(notifications),
            'total': len(notifications)
        }
    except Exception as e:
        logger.error(f'Get notifications error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get notifications')

@router.get('/game-categories')
async def get_game_categories(
    current_user: dict = Depends(get_current_user)
):
    """Get dynamic game categories with counts - FULLY DYNAMIC"""
    try:
        # Aggregate games by category
        pipeline = [
            {'$match': {'is_active': True}},
            {'$group': {
                '_id': '$category',
                'count': {'$sum': 1},
                'games': {'$push': {
                    'id': '$id',
                    'name': '$name',
                    'thumbnail': '$thumbnail'
                }}
            }},
            {'$project': {
                'category': '$_id',
                'count': 1,
                'sample_games': {'$slice': ['$games', 3]},
                '_id': 0
            }}
        ]
        
        categories = await db.games.aggregate(pipeline).to_list(100)
        
        # Add category metadata
        category_meta = {
            'casino': {'icon': 'dice', 'color': 'red', 'order': 1},
            'sports': {'icon': 'trophy', 'color': 'blue', 'order': 2},
            'card': {'icon': 'spade', 'color': 'green', 'order': 3},
            'dice': {'icon': 'hexagon', 'color': 'purple', 'order': 4},
            'skill': {'icon': 'target', 'color': 'orange', 'order': 5}
        }
        
        enriched_categories = []
        for cat in categories:
            cat_name = cat['category']
            meta = category_meta.get(cat_name, {'icon': 'gamepad', 'color': 'gray', 'order': 99})
            enriched_categories.append({
                'name': cat_name,
                'display_name': cat_name.title(),
                'count': cat['count'],
                'icon': meta['icon'],
                'color': meta['color'],
                'sample_games': cat['sample_games'],
                'order': meta['order']
            })
        
        # Sort by order
        enriched_categories.sort(key=lambda x: x['order'])
        
        return {
            'categories': enriched_categories,
            'total_categories': len(enriched_categories)
        }
    except Exception as e:
        logger.error(f'Get game categories error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get game categories')
