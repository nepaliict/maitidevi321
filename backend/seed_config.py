#!/usr/bin/env python3
"""
KarnaliX - Dynamic Configuration Seed Script
Populates all dynamic configuration data
"""

import asyncio
import sys
sys.path.append('/app/backend')

from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
import uuid

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'karnalix_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

async def seed_system_config():
    """Seed system configuration"""
    print("📋 Seeding System Configuration...")
    
    configs = [
        # Platform
        {'config_key': 'platform_name', 'config_value': 'KarnaliX', 'config_type': 'text', 'category': 'platform', 'description': 'Platform name'},
        {'config_key': 'platform_tagline', 'config_value': 'Nepal\'s #1 Gaming Platform', 'config_type': 'text', 'category': 'platform'},
        {'config_key': 'support_whatsapp', 'config_value': '+9779800000000', 'config_type': 'text', 'category': 'platform'},
        {'config_key': 'support_email', 'config_value': 'support@karnalix.com', 'config_type': 'text', 'category': 'platform'},
        
        # Limits
        {'config_key': 'min_deposit', 'config_value': 100, 'config_type': 'number', 'category': 'limits'},
        {'config_key': 'max_deposit', 'config_value': 100000, 'config_type': 'number', 'category': 'limits'},
        {'config_key': 'min_withdrawal', 'config_value': 500, 'config_type': 'number', 'category': 'limits'},
        {'config_key': 'max_withdrawal', 'config_value': 50000, 'config_type': 'number', 'category': 'limits'},
        {'config_key': 'min_bet', 'config_value': 10, 'config_type': 'number', 'category': 'limits'},
        
        # Bonuses
        {'config_key': 'welcome_bonus_percentage', 'config_value': 100, 'config_type': 'number', 'category': 'bonuses'},
        {'config_key': 'deposit_bonus_percentage', 'config_value': 10, 'config_type': 'number', 'category': 'bonuses'},
        {'config_key': 'referral_bonus_percentage', 'config_value': 5, 'config_type': 'number', 'category': 'bonuses'},
        
        # UI
        {'config_key': 'total_games', 'config_value': '500+', 'config_type': 'text', 'category': 'ui'},
        {'config_key': 'total_winnings', 'config_value': '₹10Cr+', 'config_type': 'text', 'category': 'ui'},
        {'config_key': 'support_hours', 'config_value': '24/7', 'config_type': 'text', 'category': 'ui'},
    ]
    
    for config in configs:
        existing = await db.system_configs.find_one({'config_key': config['config_key']})
        if not existing:
            config_doc = {
                'id': str(uuid.uuid4()),
                'is_active': True,
                'created_at': datetime.utcnow(),
                'updated_at': datetime.utcnow(),
                **config
            }
            await db.system_configs.insert_one(config_doc)
            print(f"  ✅ {config['config_key']}")
        else:
            print(f"  ⏭️  {config['config_key']} exists")

async def seed_payment_methods():
    """Seed payment methods"""
    print("\n💳 Seeding Payment Methods...")
    
    methods = [
        {
            'id': str(uuid.uuid4()),
            'name': 'eSewa',
            'method_type': 'ewallet',
            'display_name': 'eSewa Digital Wallet',
            'account_details': {'merchant_id': 'ESEWA-12345'},
            'min_amount': 100,
            'max_amount': 100000,
            'processing_time': 'Instant',
            'fees': 0,
            'is_active': True,
            'available_for_deposit': True,
            'available_for_withdrawal': True,
            'sort_order': 1
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Khalti',
            'method_type': 'ewallet',
            'display_name': 'Khalti Digital Wallet',
            'min_amount': 100,
            'max_amount': 100000,
            'processing_time': 'Instant',
            'fees': 0,
            'is_active': True,
            'available_for_deposit': True,
            'available_for_withdrawal': True,
            'sort_order': 2
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Bank Transfer',
            'method_type': 'bank',
            'display_name': 'Bank Transfer (NEFT/IMPS)',
            'account_details': {
                'bank_name': 'Nepal Bank',
                'account_number': '1234567890',
                'ifsc': 'NEPL0001234'
            },
            'min_amount': 500,
            'max_amount': 500000,
            'processing_time': '1-2 hours',
            'fees': 0,
            'is_active': True,
            'available_for_deposit': True,
            'available_for_withdrawal': True,
            'sort_order': 3
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'UPI',
            'method_type': 'upi',
            'display_name': 'UPI Payment',
            'account_details': {'upi_id': 'karnalix@paytm'},
            'min_amount': 100,
            'max_amount': 50000,
            'processing_time': 'Instant',
            'fees': 0,
            'is_active': True,
            'available_for_deposit': True,
            'available_for_withdrawal': False,
            'sort_order': 4
        }
    ]
    
    for method in methods:
        existing = await db.payment_methods.find_one({'name': method['name']})
        if not existing:
            method['created_at'] = datetime.utcnow()
            await db.payment_methods.insert_one(method)
            print(f"  ✅ {method['name']}")
        else:
            print(f"  ⏭️  {method['name']} exists")

async def seed_bonus_rules():
    """Seed bonus rules"""
    print("\n🎁 Seeding Bonus Rules...")
    
    rules = [
        {
            'id': str(uuid.uuid4()),
            'name': 'Welcome Bonus',
            'bonus_type': 'welcome',
            'percentage': 100,
            'fixed_amount': 0,
            'min_deposit': 500,
            'max_bonus': 5000,
            'wagering_requirement': 1,
            'valid_days': 7,
            'terms_conditions': 'First deposit only. Wager 1x before withdrawal.',
            'is_active': True,
            'auto_apply': True
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Deposit Bonus',
            'bonus_type': 'deposit',
            'percentage': 10,
            'fixed_amount': 0,
            'min_deposit': 1000,
            'max_bonus': 2000,
            'wagering_requirement': 1,
            'valid_days': 30,
            'terms_conditions': '10% on every deposit. Wager 1x.',
            'is_active': True,
            'auto_apply': True
        },
        {
            'id': str(uuid.uuid4()),
            'name': 'Referral Bonus',
            'bonus_type': 'referral',
            'percentage': 5,
            'fixed_amount': 500,
            'min_deposit': 0,
            'max_bonus': 1000,
            'wagering_requirement': 1,
            'valid_days': 90,
            'terms_conditions': 'Earn 5% of friend\'s first deposit + ₹500 bonus.',
            'is_active': True,
            'auto_apply': False
        }
    ]
    
    for rule in rules:
        existing = await db.bonus_rules.find_one({'name': rule['name']})
        if not existing:
            rule['created_at'] = datetime.utcnow()
            await db.bonus_rules.insert_one(rule)
            print(f"  ✅ {rule['name']}")
        else:
            print(f"  ⏭️  {rule['name']} exists")

async def seed_faqs():
    """Seed FAQs"""
    print("\n❓ Seeding FAQs...")
    
    faqs = [
        {
            'id': str(uuid.uuid4()),
            'question': 'How do I deposit money?',
            'answer': 'Go to Deposit page, select payment method, enter amount, and follow instructions.',
            'category': 'deposit',
            'sort_order': 1,
            'is_active': True,
            'views': 0,
            'helpful_count': 0
        },
        {
            'id': str(uuid.uuid4()),
            'question': 'How long does withdrawal take?',
            'answer': 'Withdrawals are processed within 24 hours after admin approval.',
            'category': 'withdrawal',
            'sort_order': 2,
            'is_active': True,
            'views': 0,
            'helpful_count': 0
        },
        {
            'id': str(uuid.uuid4()),
            'question': 'What is KYC verification?',
            'answer': 'KYC is identity verification required for withdrawals. Upload your ID and selfie.',
            'category': 'account',
            'sort_order': 3,
            'is_active': True,
            'views': 0,
            'helpful_count': 0
        },
        {
            'id': str(uuid.uuid4()),
            'question': 'How do bonuses work?',
            'answer': 'Bonuses are credited automatically or with promo codes. Check wagering requirements.',
            'category': 'bonus',
            'sort_order': 4,
            'is_active': True,
            'views': 0,
            'helpful_count': 0
        }
    ]
    
    for faq in faqs:
        existing = await db.faqs.find_one({'question': faq['question']})
        if not existing:
            faq['created_at'] = datetime.utcnow()
            await db.faqs.insert_one(faq)
            print(f"  ✅ {faq['question'][:50]}...")
        else:
            print(f"  ⏭️  FAQ exists")

async def seed_banners():
    """Seed banners"""
    print("\n🎨 Seeding Banners...")
    
    banners = [
        {
            'id': str(uuid.uuid4()),
            'title': 'Welcome to KarnaliX!',
            'subtitle': 'Start your winning journey today',
            'description': 'Get 100% welcome bonus on your first deposit',
            'cta_text': 'Deposit Now',
            'cta_link': '/deposit',
            'banner_type': 'hero',
            'position': 'dashboard',
            'priority': 100,
            'is_active': True
        },
        {
            'id': str(uuid.uuid4()),
            'title': '10% Deposit Bonus',
            'subtitle': 'On every deposit!',
            'description': 'Boost your balance with automatic 10% bonus',
            'cta_text': 'Learn More',
            'cta_link': '/promotions',
            'banner_type': 'promotion',
            'position': 'all',
            'priority': 90,
            'is_active': True
        }
    ]
    
    for banner in banners:
        existing = await db.banners.find_one({'title': banner['title']})
        if not existing:
            banner['created_at'] = datetime.utcnow()
            await db.banners.insert_one(banner)
            print(f"  ✅ {banner['title']}")
        else:
            print(f"  ⏭️  {banner['title']} exists")

async def seed_limits():
    """Seed limits"""
    print("\n⚖️  Seeding Limits...")
    
    limits = [
        {
            'id': str(uuid.uuid4()),
            'limit_type': 'deposit',
            'period': 'daily',
            'min_amount': 100,
            'max_amount': 100000,
            'default_limit': 50000,
            'user_configurable': True,
            'is_active': True
        },
        {
            'id': str(uuid.uuid4()),
            'limit_type': 'withdrawal',
            'period': 'daily',
            'min_amount': 500,
            'max_amount': 50000,
            'default_limit': 25000,
            'user_configurable': True,
            'is_active': True
        },
        {
            'id': str(uuid.uuid4()),
            'limit_type': 'bet',
            'period': 'daily',
            'min_amount': 10,
            'max_amount': 100000,
            'default_limit': 100000,
            'user_configurable': False,
            'is_active': True
        }
    ]
    
    for limit in limits:
        existing = await db.limits.find_one({
            'limit_type': limit['limit_type'],
            'period': limit['period']
        })
        if not existing:
            limit['created_at'] = datetime.utcnow()
            await db.limits.insert_one(limit)
            print(f"  ✅ {limit['limit_type']} - {limit['period']}")
        else:
            print(f"  ⏭️  Limit exists")

async def main():
    print("\n" + "="*60)
    print("🎰 KarnaliX - Dynamic Configuration Seed")
    print("="*60 + "\n")
    
    try:
        await seed_system_config()
        await seed_payment_methods()
        await seed_bonus_rules()
        await seed_faqs()
        await seed_banners()
        await seed_limits()
        
        print("\n" + "="*60)
        print("✅ All Dynamic Configuration Seeded!")
        print("="*60 + "\n")
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(main())
