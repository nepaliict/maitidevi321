import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    # MongoDB
    MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    DB_NAME = os.environ.get('DB_NAME', 'karnalix_db')
    
    # JWT
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production-2024-karnalix')
    JWT_ALGORITHM = 'HS256'
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS = 30
    
    # CORS
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', '*').split(',')
    
    # Security
    PASSWORD_MIN_LENGTH = 8
    BCRYPT_ROUNDS = 12
    
    # 2FA
    TOTP_ISSUER = 'KarnaliX'
    
    # Roles
    ROLE_MASTER_ADMIN = 'master_admin'
    ROLE_ADMIN = 'admin'
    ROLE_AGENT = 'agent'
    ROLE_USER = 'user'
    
    ROLES_HIERARCHY = {
        'master_admin': 4,
        'admin': 3,
        'agent': 2,
        'user': 1
    }
    
    # Wallet Types
    WALLET_TYPE_MAIN = 'main_coin'
    WALLET_TYPE_BONUS = 'bonus'
    WALLET_TYPE_LOCKED = 'locked'
    
    # Transaction Types
    TXN_TYPE_MINT = 'mint'
    TXN_TYPE_TRANSFER = 'transfer'
    TXN_TYPE_BET = 'bet'
    TXN_TYPE_WIN = 'win'
    TXN_TYPE_DEPOSIT = 'deposit'
    TXN_TYPE_WITHDRAWAL = 'withdrawal'
    TXN_TYPE_BONUS = 'bonus'
    TXN_TYPE_REFERRAL = 'referral'
    TXN_TYPE_COMMISSION = 'commission'

settings = Settings()
