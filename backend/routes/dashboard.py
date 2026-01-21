from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from middleware.auth import get_current_user, require_admin, require_master_admin
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/dashboard', tags=['Dashboard'])

@router.get('/admin-stats')
async def get_admin_dashboard_stats(
    current_user: dict = Depends(require_admin())
):
    """Get admin dashboard statistics - MASTER ADMIN / ADMIN"""
    try:
        # Today's date
        today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
        week_ago = today_start - timedelta(days=7)
        month_ago = today_start - timedelta(days=30)
        
        # User counts by role
        total_users = await db.users.count_documents({})
        admins_count = await db.users.count_documents({'role': 'admin'})
        agents_count = await db.users.count_documents({'role': 'agent'})
        users_count = await db.users.count_documents({'role': 'user'})
        active_users = await db.users.count_documents({'is_active': True})
        new_users_today = await db.users.count_documents({'created_at': {'$gte': today_start}})
        new_users_week = await db.users.count_documents({'created_at': {'$gte': week_ago}})
        
        # Total coin supply (sum of all main wallets)
        wallets = await db.wallets.find({'wallet_type': 'main_coin'}).to_list(10000)
        total_coin_supply = sum([w.get('balance', 0) for w in wallets])
        
        bonus_wallets = await db.wallets.find({'wallet_type': 'bonus'}).to_list(10000)
        total_bonus_coins = sum([w.get('balance', 0) for w in bonus_wallets])
        
        locked_wallets = await db.wallets.find({'wallet_type': 'locked'}).to_list(10000)
        total_locked_coins = sum([w.get('balance', 0) for w in locked_wallets])
        
        # Mint stats
        mints = await db.transactions.find({'transaction_type': 'mint'}).to_list(10000)
        total_minted = sum([m.get('amount', 0) for m in mints])
        
        # Bet statistics
        total_bets = await db.bets.count_documents({})
        pending_bets = await db.bets.count_documents({'status': 'pending'})
        won_bets = await db.bets.count_documents({'status': 'won'})
        lost_bets = await db.bets.count_documents({'status': 'lost'})
        
        all_bets = await db.bets.find({}).to_list(100000)
        total_bet_volume = sum([b.get('amount', 0) for b in all_bets])
        
        todays_bets = await db.bets.find({'created_at': {'$gte': today_start}}).to_list(10000)
        todays_bet_volume = sum([b.get('amount', 0) for b in todays_bets])
        
        # Deposit stats
        total_deposits = await db.deposits.count_documents({})
        pending_deposits = await db.deposits.count_documents({'status': 'pending'})
        approved_deposits = await db.deposits.find({'status': 'approved'}).to_list(100000)
        total_deposit_amount = sum([d.get('amount', 0) for d in approved_deposits])
        
        # Withdrawal stats  
        total_withdrawals = await db.withdrawals.count_documents({})
        pending_withdrawals = await db.withdrawals.count_documents({'status': 'pending'})
        approved_withdrawals = await db.withdrawals.find({'status': 'approved'}).to_list(100000)
        total_withdrawal_amount = sum([w.get('amount', 0) for w in approved_withdrawals])
        
        # KYC stats
        total_kyc = await db.kyc_documents.count_documents({})
        pending_kyc = await db.kyc_documents.count_documents({'status': 'pending'})
        approved_kyc = await db.kyc_documents.count_documents({'status': 'approved'})
        rejected_kyc = await db.kyc_documents.count_documents({'status': 'rejected'})
        
        # Support stats
        total_tickets = await db.tickets.count_documents({})
        open_tickets = await db.tickets.count_documents({'status': 'open'})
        in_progress_tickets = await db.tickets.count_documents({'status': 'in_progress'})
        
        # Game stats
        total_games = await db.games.count_documents({})
        active_games = await db.games.count_documents({'is_active': True})
        total_providers = await db.game_providers.count_documents({})
        active_providers = await db.game_providers.count_documents({'is_active': True})
        
        # Recent activity
        recent_transactions = await db.transactions.find({}).sort('created_at', -1).limit(10).to_list(10)
        recent_bets = await db.bets.find({}).sort('created_at', -1).limit(10).to_list(10)
        
        return {
            'users': {
                'total': total_users,
                'admins': admins_count,
                'agents': agents_count,
                'users': users_count,
                'active': active_users,
                'new_today': new_users_today,
                'new_this_week': new_users_week
            },
            'coins': {
                'total_supply': total_coin_supply,
                'bonus_pool': total_bonus_coins,
                'locked': total_locked_coins,
                'total_minted': total_minted
            },
            'bets': {
                'total': total_bets,
                'pending': pending_bets,
                'won': won_bets,
                'lost': lost_bets,
                'total_volume': total_bet_volume,
                'today_volume': todays_bet_volume
            },
            'deposits': {
                'total': total_deposits,
                'pending': pending_deposits,
                'total_amount': total_deposit_amount
            },
            'withdrawals': {
                'total': total_withdrawals,
                'pending': pending_withdrawals,
                'total_amount': total_withdrawal_amount
            },
            'kyc': {
                'total': total_kyc,
                'pending': pending_kyc,
                'approved': approved_kyc,
                'rejected': rejected_kyc
            },
            'support': {
                'total': total_tickets,
                'open': open_tickets,
                'in_progress': in_progress_tickets
            },
            'games': {
                'total': total_games,
                'active': active_games,
                'providers': total_providers,
                'active_providers': active_providers
            },
            'recent_transactions': [{
                'id': t['id'],
                'type': t.get('transaction_type'),
                'amount': t.get('amount'),
                'from': t.get('from_user_id'),
                'to': t.get('to_user_id'),
                'created_at': t.get('created_at')
            } for t in recent_transactions],
            'recent_bets': [{
                'id': b['id'],
                'user_id': b.get('user_id'),
                'amount': b.get('amount'),
                'status': b.get('status'),
                'created_at': b.get('created_at')
            } for b in recent_bets]
        }
    except Exception as e:
        logger.error(f'Get admin stats error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get admin stats')

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
