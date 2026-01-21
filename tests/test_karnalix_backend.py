"""
KarnaliX Gaming Platform - Backend API Tests
Tests for: Auth, Dashboard, Users, Games APIs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://gaming-portal-129.preview.emergentagent.com')

# Test credentials
MASTER_ADMIN_EMAIL = "admin@karnalix.com"
MASTER_ADMIN_PASSWORD = "Admin@12345"


class TestHealthCheck:
    """Health check endpoint tests"""
    
    def test_health_endpoint(self):
        """Test health check returns healthy status"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
        print("✅ Health check passed")

    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "online"
        assert "KarnaliX" in data["message"]
        print("✅ Root endpoint passed")


class TestAuthentication:
    """Authentication flow tests"""
    
    def test_login_master_admin_success(self):
        """Test master admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert "user" in data
        
        # Validate user data
        user = data["user"]
        assert user["email"] == MASTER_ADMIN_EMAIL
        assert user["role"] == "master_admin"
        assert user["is_active"] == True
        print(f"✅ Master admin login successful - User: {user['username']}")
        
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid credentials rejected correctly")
    
    def test_login_missing_fields(self):
        """Test login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL
        })
        assert response.status_code == 422  # Validation error
        print("✅ Missing fields validation works")


class TestAdminDashboard:
    """Admin dashboard stats tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_admin_stats_endpoint(self, auth_token):
        """Test admin dashboard stats returns correct structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/admin-stats", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate all required sections exist
        assert "users" in data
        assert "coins" in data
        assert "bets" in data
        assert "deposits" in data
        assert "withdrawals" in data
        assert "kyc" in data
        assert "support" in data
        assert "games" in data
        
        # Validate users section structure
        users = data["users"]
        assert "total" in users
        assert "admins" in users
        assert "agents" in users
        assert "users" in users
        assert "active" in users
        assert "new_today" in users
        assert users["total"] >= 1  # At least master admin exists
        
        # Validate games section
        games = data["games"]
        assert "total" in games
        assert "active" in games
        assert "providers" in games
        assert games["total"] >= 3  # 3 seeded games
        
        print(f"✅ Admin stats returned - Users: {users['total']}, Games: {games['total']}")
    
    def test_admin_stats_unauthorized(self):
        """Test admin stats without auth token"""
        response = requests.get(f"{BASE_URL}/api/dashboard/admin-stats")
        assert response.status_code in [401, 403]  # Either unauthorized or forbidden
        print("✅ Unauthorized access blocked correctly")


class TestUserManagement:
    """User management API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_list_users(self, auth_token):
        """Test listing users"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/users", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1  # At least master admin
        
        # Validate user structure
        user = data[0]
        assert "id" in user
        assert "email" in user
        assert "username" in user
        assert "role" in user
        assert "is_active" in user
        assert "wallet_balance" in user
        
        print(f"✅ Users list returned - Count: {len(data)}")
    
    def test_list_users_unauthorized(self):
        """Test listing users without auth"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code in [401, 403]  # Either unauthorized or forbidden
        print("✅ Unauthorized user list blocked")
    
    def test_create_user_as_admin(self, auth_token):
        """Test creating a new admin user"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        import uuid
        unique_id = str(uuid.uuid4())[:8]
        
        new_user = {
            "email": f"TEST_admin_{unique_id}@karnalix.com",
            "username": f"TEST_admin_{unique_id}",
            "password": "TestPass123!",
            "full_name": "Test Admin User",
            "role": "admin"
        }
        
        response = requests.post(f"{BASE_URL}/api/users", headers=headers, json=new_user)
        
        assert response.status_code == 201
        data = response.json()
        
        assert data["email"] == new_user["email"]
        assert data["username"] == new_user["username"]
        assert data["role"] == "admin"
        assert data["is_active"] == True
        
        print(f"✅ Admin user created - {data['username']}")
        
        # Cleanup - suspend the test user
        user_id = data["id"]
        requests.post(f"{BASE_URL}/api/users/{user_id}/suspend", headers=headers)


class TestGamesManagement:
    """Games API tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_list_games(self, auth_token):
        """Test listing available games"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/games", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 3  # 3 seeded games
        
        # Validate game structure
        game = data[0]
        assert "id" in game
        assert "name" in game
        assert "category" in game
        assert "min_bet" in game
        assert "max_bet" in game
        assert "rtp" in game
        assert "is_active" in game
        
        # Check seeded games exist
        game_names = [g["name"] for g in data]
        assert "Lucky Sevens" in game_names or "Blackjack Classic" in game_names
        
        print(f"✅ Games list returned - Count: {len(data)}")
    
    def test_list_game_providers(self, auth_token):
        """Test listing game providers (master admin only)"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/games/providers", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 1  # At least 1 provider
        
        provider = data[0]
        assert "id" in provider
        assert "name" in provider
        assert "is_active" in provider
        
        print(f"✅ Providers list returned - Count: {len(data)}")
    
    def test_get_all_games_admin(self, auth_token):
        """Test getting all games as admin"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/games/admin/all", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) >= 3
        
        print(f"✅ Admin games list returned - Count: {len(data)}")


class TestFinancials:
    """Financial endpoints tests - Routes under /transactions prefix"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_deposits(self, auth_token):
        """Test getting deposits list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/transactions/deposits", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Deposits list returned - Count: {len(data)}")
    
    def test_get_withdrawals(self, auth_token):
        """Test getting withdrawals list"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/transactions/withdrawals", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Withdrawals list returned - Count: {len(data)}")


class TestKYC:
    """KYC endpoints tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_pending_kyc(self, auth_token):
        """Test getting pending KYC documents"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/kyc/pending", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Pending KYC list returned - Count: {len(data)}")


class TestSupport:
    """Support tickets tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_tickets(self, auth_token):
        """Test getting support tickets"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/support/tickets", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Support tickets list returned - Count: {len(data)}")


class TestBets:
    """Bets management tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": MASTER_ADMIN_EMAIL,
            "password": MASTER_ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_get_all_bets(self, auth_token):
        """Test getting all bets"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/bets", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✅ Bets list returned - Count: {len(data)}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
