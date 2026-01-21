from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from config.database import db, close_database

# Import routes
from routes import auth, users, wallets, coins, games, bets, deposits, kyc, support, config

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create the main app without a prefix
app = FastAPI(title='KarnaliX Gaming API Hub', version='1.0.0')

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoint (no prefix)
@api_router.get("/")
async def root():
    return {"message": "KarnaliX Gaming API Hub", "status": "online", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "database": "connected"}

# Include all route modules
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(wallets.router)
api_router.include_router(coins.router)
api_router.include_router(games.router)
api_router.include_router(bets.router)
api_router.include_router(deposits.router)
api_router.include_router(kyc.router)
api_router.include_router(support.router)
api_router.include_router(config.router)

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    logger.info("KarnaliX API Server starting up...")
    logger.info(f"Database: {os.environ.get('DB_NAME', 'karnalix_db')}")
    
    # Create indexes
    try:
        await db.users.create_index("email", unique=True)
        await db.users.create_index("username", unique=True)
        await db.users.create_index("role")
        await db.wallets.create_index([("user_id", 1), ("wallet_type", 1)])
        await db.transactions.create_index("from_user_id")
        await db.transactions.create_index("to_user_id")
        await db.transactions.create_index("created_at")
        await db.game_providers.create_index("name")
        await db.games.create_index("category")
        await db.games.create_index("is_active")
        await db.bets.create_index("user_id")
        await db.bets.create_index("status")
        await db.deposits.create_index("user_id")
        await db.deposits.create_index("status")
        await db.withdrawals.create_index("user_id")
        await db.withdrawals.create_index("status")
        await db.kyc_documents.create_index("user_id")
        await db.tickets.create_index("user_id")
        logger.info("Database indexes created")
    except Exception as e:
        logger.warning(f"Index creation warning: {str(e)}")

@app.on_event("shutdown")
async def shutdown_db_client():
    close_database()
    logger.info("KarnaliX API Server shutting down...")

