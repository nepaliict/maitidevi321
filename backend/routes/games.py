from fastapi import APIRouter, HTTPException, Depends, status, Query
from config.database import db
from models.game import GameProvider, Game, GameSession
from middleware.auth import get_current_user, require_master_admin
from typing import List, Optional
from datetime import datetime, timedelta
import logging
import secrets

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/games', tags=['Game Management'])

# ============= GAME PROVIDER MANAGEMENT (MASTER ADMIN) =============

@router.get('/providers', response_model=List[GameProvider])
async def list_game_providers(
    is_active: Optional[bool] = Query(None),
    current_user: dict = Depends(require_master_admin())
):
    """List all game providers (Master Admin only)"""
    try:
        filter_query = {}
        if is_active is not None:
            filter_query['is_active'] = is_active
        
        providers = await db.game_providers.find(filter_query).to_list(100)
        return [GameProvider(**p) for p in providers]
    except Exception as e:
        logger.error(f'List providers error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to list providers')

@router.post('/providers', response_model=GameProvider, status_code=status.HTTP_201_CREATED)
async def create_game_provider(
    provider: GameProvider,
    current_user: dict = Depends(require_master_admin())
):
    """Create new game provider (Master Admin only)"""
    try:
        provider.created_by = current_user['user_id']
        await db.game_providers.insert_one(provider.dict())
        logger.info(f'Game provider created: {provider.name} by {current_user["user_id"]}')
        return provider
    except Exception as e:
        logger.error(f'Create provider error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create provider')

@router.patch('/providers/{provider_id}')
async def update_game_provider(
    provider_id: str,
    update_data: dict,
    current_user: dict = Depends(require_master_admin())
):
    """Update game provider (Master Admin only)"""
    try:
        provider = await db.game_providers.find_one({'id': provider_id})
        if not provider:
            raise HTTPException(status_code=404, detail='Provider not found')
        
        update_data['updated_at'] = datetime.utcnow()
        await db.game_providers.update_one(
            {'id': provider_id},
            {'$set': update_data}
        )
        logger.info(f'Provider updated: {provider_id} by {current_user["user_id"]}')
        return {'message': 'Provider updated successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Update provider error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to update provider')

# ============= GAME MANAGEMENT (MASTER ADMIN) =============

@router.get('/admin/all', response_model=List[Game])
async def list_all_games(
    category: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: dict = Depends(require_master_admin())
):
    """List all games (Master Admin only)"""
    try:
        filter_query = {}
        if category:
            filter_query['category'] = category
        if is_active is not None:
            filter_query['is_active'] = is_active
        
        games = await db.games.find(filter_query).to_list(1000)
        return [Game(**g) for g in games]
    except Exception as e:
        logger.error(f'List games error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to list games')

@router.post('/admin/games', response_model=Game, status_code=status.HTTP_201_CREATED)
async def create_game(
    game: Game,
    current_user: dict = Depends(require_master_admin())
):
    """Create new game (Master Admin only)"""
    try:
        # Verify provider exists
        provider = await db.game_providers.find_one({'id': game.provider_id})
        if not provider:
            raise HTTPException(status_code=404, detail='Provider not found')
        
        await db.games.insert_one(game.dict())
        logger.info(f'Game created: {game.name} by {current_user["user_id"]}')
        return game
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Create game error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to create game')

@router.patch('/admin/games/{game_id}')
async def update_game(
    game_id: str,
    update_data: dict,
    current_user: dict = Depends(require_master_admin())
):
    """Update game (Master Admin only)"""
    try:
        game = await db.games.find_one({'id': game_id})
        if not game:
            raise HTTPException(status_code=404, detail='Game not found')
        
        update_data['updated_at'] = datetime.utcnow()
        await db.games.update_one(
            {'id': game_id},
            {'$set': update_data}
        )
        logger.info(f'Game updated: {game_id} by {current_user["user_id"]}')
        return {'message': 'Game updated successfully'}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Update game error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to update game')

# ============= USER GAME ACCESS =============

@router.get('', response_model=List[Game])
async def list_available_games(
    category: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """List available games for users (only active games)"""
    try:
        filter_query = {'is_active': True}
        if category:
            filter_query['category'] = category
        
        games = await db.games.find(filter_query).to_list(1000)
        games_list = []
        for g in games:
            g.pop('_id', None)
            games_list.append(Game(**g))
        return games_list
    except Exception as e:
        logger.error(f'List available games error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to list games')

@router.get('/{game_id}', response_model=Game)
async def get_game_details(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get game details"""
    try:
        game = await db.games.find_one({'id': game_id, 'is_active': True})
        if not game:
            raise HTTPException(status_code=404, detail='Game not found')
        
        game.pop('_id', None)
        return Game(**game)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Get game error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get game')

@router.post('/{game_id}/launch', response_model=GameSession)
async def launch_game(
    game_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Launch game session"""
    try:
        # Verify game exists and is active
        game = await db.games.find_one({'id': game_id, 'is_active': True})
        if not game:
            raise HTTPException(status_code=404, detail='Game not found or inactive')
        
        # Verify provider is active
        provider = await db.game_providers.find_one({'id': game['provider_id'], 'is_active': True})
        if not provider:
            raise HTTPException(status_code=400, detail='Game provider is inactive')
        
        # Check user has sufficient balance
        wallet = await db.wallets.find_one({
            'user_id': current_user['user_id'],
            'wallet_type': 'main_coin'
        })
        if not wallet or wallet.get('balance', 0) < game['min_bet']:
            raise HTTPException(status_code=400, detail='Insufficient balance')
        
        # Create game session
        session_token = secrets.token_urlsafe(32)
        session = GameSession(
            user_id=current_user['user_id'],
            game_id=game_id,
            provider_id=game['provider_id'],
            session_token=session_token,
            game_url=f"/play/{game_id}?token={session_token}",  # Mock URL
            status='active',
            expires_at=datetime.utcnow() + timedelta(hours=4)
        )
        
        await db.game_sessions.insert_one(session.dict())
        logger.info(f'Game session created: {session.id} for user {current_user["user_id"]}')
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Launch game error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to launch game')

@router.get('/sessions/my-sessions', response_model=List[GameSession])
async def get_my_game_sessions(
    status: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user)
):
    """Get user's game sessions"""
    try:
        filter_query = {'user_id': current_user['user_id']}
        if status:
            filter_query['status'] = status
        
        sessions = await db.game_sessions.find(filter_query).sort('created_at', -1).limit(50).to_list(50)
        return [GameSession(**s) for s in sessions]
    except Exception as e:
        logger.error(f'Get sessions error: {str(e)}')
        raise HTTPException(status_code=500, detail='Failed to get sessions')
