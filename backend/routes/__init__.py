from .auth import router as auth_router
from .users import router as users_router
from .wallets import router as wallets_router
from .coins import router as coins_router
from .games import router as games_router
from .bets import router as bets_router
from .deposits import router as deposits_router
from .kyc import router as kyc_router
from .support import router as support_router

__all__ = [
    'auth_router', 'users_router', 'wallets_router', 'coins_router',
    'games_router', 'bets_router', 'deposits_router', 'kyc_router', 'support_router'
]
