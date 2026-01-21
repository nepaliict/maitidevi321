#!/usr/bin/env python3
import asyncio
import sys
sys.path.append('/app/backend')
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'karnalix_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

async def main():
    print("\n" + "="*60)
    print("🎰 KarnaliX - Seeding Mock Games")
    print("="*60 + "\n")
    
    # Create mock provider
    provider = {
        'id': str(uuid.uuid4()),
        'name': 'Mock Casino Provider',
        'provider_type': 'mock',
        'base_url': 'https://mock-casino.karnalix.com',
        'is_active': True,
        'created_at': datetime.utcnow()
    }
    
    existing_provider = await db.game_providers.find_one({'name': provider['name']})
    if not existing_provider:
        await db.game_providers.insert_one(provider)
        print("✅ Created provider")
        provider_id = provider['id']
    else:
        print("⏭️  Provider exists")
        provider_id = existing_provider['id']
    
    # Create games
    games = [
        {'game_id': 'slots_001', 'name': 'Lucky Sevens', 'category': 'casino', 'min_bet': 10, 'max_bet': 10000, 'rtp': 96.5},
        {'game_id': 'card_001', 'name': 'Blackjack Classic', 'category': 'card', 'min_bet': 50, 'max_bet': 50000, 'rtp': 99.5},
        {'game_id': 'dice_001', 'name': 'Dice Master', 'category': 'dice', 'min_bet': 5, 'max_bet': 5000, 'rtp': 95.5}
    ]
    
    for g in games:
        existing = await db.games.find_one({'game_id': g['game_id']})
        if not existing:
            game = {
                'id': str(uuid.uuid4()),
                'provider_id': provider_id,
                'is_active': True,
                'created_at': datetime.utcnow(),
                **g
            }
            await db.games.insert_one(game)
            print(f"✅ Created: {g['name']}")
        else:
            print(f"⏭️  Exists: {g['name']}")
    
    game_count = await db.games.count_documents({})
    print(f"\n✅ Total Games: {game_count}\n")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
