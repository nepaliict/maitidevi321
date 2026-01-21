from .auth import router as auth_router
from .users import router as users_router
from .wallets import router as wallets_router
from .coins import router as coins_router

__all__ = ['auth_router', 'users_router', 'wallets_router', 'coins_router']
