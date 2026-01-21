# KarnaliX - Gaming API Hub & Admin System

## 🎯 Project Overview

KarnaliX is a premium online gaming & betting platform with a hierarchical role-based access control (RBAC) system and a centralized Game API Hub. The platform manages coin-based economy distributed top-down from Master Admin → Admin → Agent → User.

## 🏗️ Architecture

### Tech Stack
- **Backend**: FastAPI (Python) + MongoDB
- **Frontend**: React + TypeScript + Tailwind CSS
- **Authentication**: JWT with 2FA support for admins
- **Security**: PBKDF2-SHA256 password hashing, role-based middleware

### System Hierarchy
```
Master Admin (God Mode)
    ↓ mints & distributes coins
Admin (Manages Agents & Users)
    ↓ allocates coins
Agent (Manages Users)
    ↓ distributes coins
User (Plays Games)
```

## ✅ Completed Features (Phase 1 & 2)

### 1. Authentication System (/api/auth/*)
- ✅ User registration with role assignment
- ✅ JWT-based login/logout
- ✅ 2FA setup (TOTP) for admin roles
- ✅ Password hashing with PBKDF2-SHA256
- ✅ Session management

**Endpoints:**
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login with email/password (+ optional 2FA)
- `POST /api/auth/logout` - Logout current session
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/2fa/setup` - Setup 2FA (admin roles only)
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA

### 2. Role-Based Access Control (RBAC)
- ✅ 4 roles with strict hierarchy
- ✅ Permission middleware for all endpoints
- ✅ Role-based data filtering

**Roles:**
- `master_admin` - Full system control, coin minting
- `admin` - Manage agents & users, approve transactions
- `agent` - Create users, distribute coins
- `user` - Play games, manage own account

### 3. User Management (/api/users/*)
- ✅ Create users (respects hierarchy)
- ✅ List users (role-based filtering)
- ✅ Update user details
- ✅ Suspend/activate users
- ✅ Change user roles (master admin only)

### 4. Wallet System (/api/wallets/*)
- ✅ 3 wallet types per user
- ✅ Real-time balance queries
- ✅ Role-based access to user wallets

### 5. Coin Management (/api/coins/*)
- ✅ Coin minting (Master Admin only)
- ✅ Hierarchical coin transfer with validation
- ✅ Transaction ledger
- ✅ Atomic transactions

## 🚀 Running the Application

### Backend:
```bash
cd /app/backend
pip install -r requirements.txt
# Server runs via supervisorctl (auto-start)
```

### Access:
- API: `http://localhost:8001/api/`
- Health Check: `http://localhost:8001/api/health`

## 📝 Test Credentials

**Master Admin:**
- Email: `admin@karnalix.com`
- Password: `Admin123`

## 📊 Current Status

✅ Phase 1: Authentication & RBAC - **COMPLETE**
✅ Phase 2: Wallet & Coin System - **COMPLETE**
🚧 Phase 3-9: Game Hub, Betting, KYC, Bonuses, Admin Panels - **PENDING**

See `test_result.md` for detailed status.
