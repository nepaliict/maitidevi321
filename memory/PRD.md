# KarnaliX - Gaming & Betting Platform

## Original Problem Statement
Build "KarnaliX," a premium online gaming and betting platform with:
- FastAPI (Python) backend, MongoDB database, React frontend
- Gaming API Hub platform with strict Role-Based Access Control (RBAC)
- 4-tier hierarchy: Master Admin → Admin → Agent → User
- Dynamic UI driven entirely by backend APIs
- Hierarchical coin distribution economy

## Tech Stack
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB (karnalix_db)
- **Frontend**: React, TypeScript, Vite, TailwindCSS, Shadcn UI
- **Authentication**: JWT with 4-tier RBAC

## User Personas
1. **Master Admin**: Full platform control, coin minting, system configuration
2. **Admin**: Manages agents/users, approves KYC/deposits/withdrawals
3. **Agent**: Manages their users, earns commissions
4. **User**: End player, places bets, deposits/withdraws

## Core Features

### Authentication & RBAC
- [x] JWT-based authentication
- [x] 4-tier role hierarchy (master_admin, admin, agent, user)
- [x] Role-based API access control
- [x] Login persistence with localStorage

### Wallet & Coin System
- [x] 3 wallet types per user: main_coin, bonus, locked
- [x] Master Admin coin minting
- [x] Hierarchical coin transfers (down only)
- [x] Transaction ledger

### Game API Hub
- [x] Game provider management
- [x] Game configuration (min/max bet, RTP)
- [x] Game session management
- [x] 3 seeded games: Lucky Sevens, Blackjack Classic, Dice Master

### Financial Management
- [x] Manual deposit requests with approval workflow
- [x] Withdrawal requests with KYC requirement
- [x] Deposit/withdrawal approval/rejection

### KYC System
- [x] Document upload
- [x] Admin review workflow
- [x] Status tracking (pending, approved, rejected)

### Support System
- [x] Ticket creation
- [x] Admin reply functionality
- [x] Ticket status management

## What's Been Implemented (as of Jan 21, 2026)

### Phase 1: Core Foundation ✅
- Complete FastAPI backend structure
- MongoDB integration with Motor
- JWT authentication with RBAC
- User management APIs

### Phase 2: Wallet & Coin System ✅
- Wallet models and APIs
- Transaction ledger
- Coin minting (Master Admin only)
- Coin transfers (hierarchical)

### Phase 3-7: Game Hub, Betting, Deposits, Withdrawals, KYC ✅
- All backend models and API endpoints
- Game provider management
- Bet placement and settlement
- Deposit/withdrawal workflows
- KYC document handling

### Phase 8: Master Admin UI ✅ (NEW - Jan 21, 2026)
- **Dashboard**: Real-time stats (users, coins, bets, KYC, games)
- **User Management**: User table with search, filters, create user, suspend, mint coins
- **Games & Providers**: Games list with details, provider management
- **Financials**: Mint coins form, deposits/withdrawals approval, transactions history
- **KYC Management**: Pending KYC approval/rejection
- **Bet Management**: Bet settlement (won/lost/cancelled)
- **Bonuses & Promos**: Bonus rules display
- **Support Tickets**: Ticket management and closure
- **System Settings**: Platform configuration interface

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login with email/password
- GET `/api/auth/me` - Get current user

### Dashboard
- GET `/api/dashboard/overview` - User dashboard data
- GET `/api/dashboard/admin-stats` - Admin statistics (admin+)

### Users
- GET `/api/users` - List users (role-filtered)
- POST `/api/users` - Create user
- GET `/api/users/{id}` - Get user details
- PATCH `/api/users/{id}` - Update user
- POST `/api/users/{id}/suspend` - Toggle user suspension

### Coins
- POST `/api/coins/mint` - Mint coins (master_admin)
- POST `/api/coins/transfer` - Transfer coins
- GET `/api/coins/transactions` - Get transactions

### Games
- GET `/api/games` - List available games
- GET `/api/games/providers` - List providers (admin+)
- GET `/api/games/admin/all` - List all games (admin+)

### Financials
- POST `/api/transactions/deposits` - Create deposit request
- GET `/api/transactions/deposits` - List deposits
- PATCH `/api/transactions/deposits/{id}/approve` - Approve deposit
- POST `/api/transactions/withdrawals` - Create withdrawal
- GET `/api/transactions/withdrawals` - List withdrawals

### KYC
- POST `/api/kyc/upload` - Upload KYC documents
- GET `/api/kyc/pending` - Get pending KYC (admin+)
- PATCH `/api/kyc/{id}/approve` - Approve KYC
- PATCH `/api/kyc/{id}/reject` - Reject KYC

### Bets
- POST `/api/bets` - Place bet
- GET `/api/bets` - List bets
- POST `/api/bets/{id}/settle` - Settle bet (admin+)
- POST `/api/bets/{id}/cancel` - Cancel bet (admin+)

### Support
- POST `/api/support/tickets` - Create ticket
- GET `/api/support/tickets` - List tickets
- POST `/api/support/tickets/{id}/reply` - Reply to ticket
- PATCH `/api/support/tickets/{id}/close` - Close ticket

## Test Credentials
- **Master Admin**: admin@karnalix.com / Admin@12345

## Database Schema Summary
- **users**: id, email, username, hashed_password, role, is_active, kyc_status
- **wallets**: id, user_id, wallet_type, balance
- **transactions**: id, from_user_id, to_user_id, amount, transaction_type
- **games**: id, provider_id, name, category, min_bet, max_bet, rtp
- **game_providers**: id, name, api_base_url, is_active
- **bets**: id, user_id, game_id, amount, status, potential_win
- **deposits**: id, user_id, amount, status, payment_method
- **withdrawals**: id, user_id, amount, status, payment_method
- **kyc_documents**: id, user_id, document_type, status
- **tickets**: id, user_id, subject, status, messages[]

## Prioritized Backlog

### P0 - Completed ✅
- [x] Backend architecture and all APIs
- [x] Master Admin UI panel

### P1 - Next Priority
- [ ] Admin Panel UI (for 'admin' role)
- [ ] Agent Panel UI (for 'agent' role)
- [ ] Make User Dashboard fully dynamic

### P2 - Future
- [ ] Real third-party gaming API integrations
- [ ] Real payment gateway integration
- [ ] Automated withdrawal processing
- [ ] bcrypt password hashing fix

## Known Issues & Technical Debt
1. **Password Hashing**: Using hashlib instead of bcrypt due to version conflict
2. **ObjectId Handling**: Manual removal in routes, needs global solution

## Files Reference
- `/app/backend/server.py` - Main FastAPI application
- `/app/backend/routes/` - All API route handlers
- `/app/backend/models/` - Pydantic models
- `/app/frontend/src/pages/MasterAdminPanel.tsx` - Admin panel UI
- `/app/frontend/src/contexts/AuthContext.tsx` - Auth state management
- `/app/frontend/src/lib/api.ts` - API client
