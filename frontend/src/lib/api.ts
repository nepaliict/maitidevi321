/**
 * API Client for KarnaliX
 * Handles all backend API communication
 */

const API_BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL || 'https://gaming-portal-129.preview.emergentagent.com';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}/api${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string, totpCode?: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, totp_code: totpCode }),
    });
    this.setToken(data.access_token);
    return data;
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    await this.request('/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Users
  async getUsers(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/users${query ? `?${query}` : ''}`);
  }

  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserById(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async updateUser(userId: string, data: any) {
    return this.request(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async suspendUser(userId: string) {
    return this.request(`/users/${userId}/suspend`, { method: 'POST' });
  }

  // Wallets
  async getMyBalance() {
    return this.request('/wallets/my-balance');
  }

  async getUserBalance(userId: string) {
    return this.request(`/wallets/${userId}`);
  }

  // Coins
  async mintCoins(toUserId: string, amount: number, description?: string) {
    return this.request('/coins/mint', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, description }),
    });
  }

  async transferCoins(toUserId: string, amount: number, walletType = 'main_coin', description?: string) {
    return this.request('/coins/transfer', {
      method: 'POST',
      body: JSON.stringify({ to_user_id: toUserId, amount, wallet_type: walletType, description }),
    });
  }

  async getTransactions(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/coins/transactions${query ? `?${query}` : ''}`);
  }

  // Games
  async getGames(category?: string) {
    return this.request(`/games${category ? `?category=${category}` : ''}`);
  }

  async getGame(gameId: string) {
    return this.request(`/games/${gameId}`);
  }

  async launchGame(gameId: string) {
    return this.request(`/games/${gameId}/launch`, { method: 'POST' });
  }

  async getGameProviders() {
    return this.request('/games/providers');
  }

  async createGameProvider(data: any) {
    return this.request('/games/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bets
  async placeBet(betData: any) {
    return this.request('/bets', {
      method: 'POST',
      body: JSON.stringify(betData),
    });
  }

  async getBets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bets${query ? `?${query}` : ''}`);
  }

  async settleBet(betId: string, result: 'won' | 'lost', actualWin = 0) {
    return this.request(`/bets/${betId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ result, actual_win: actualWin }),
    });
  }

  // Deposits
  async createDeposit(data: any) {
    return this.request('/transactions/deposits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getDeposits(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/deposits${query ? `?${query}` : ''}`);
  }

  async approveDeposit(depositId: string, reviewNotes?: string) {
    return this.request(`/transactions/deposits/${depositId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async rejectDeposit(depositId: string, reviewNotes: string) {
    return this.request(`/transactions/deposits/${depositId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  // Withdrawals
  async createWithdrawal(data: any) {
    return this.request('/transactions/withdrawals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWithdrawals(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/transactions/withdrawals${query ? `?${query}` : ''}`);
  }

  async approveWithdrawal(withdrawalId: string, reviewNotes?: string) {
    return this.request(`/transactions/withdrawals/${withdrawalId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  // KYC
  async uploadKYC(data: any) {
    return this.request('/kyc/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getKYCStatus() {
    return this.request('/kyc/status');
  }

  async getPendingKYC() {
    return this.request('/kyc/pending');
  }

  async approveKYC(kycId: string, reviewNotes?: string) {
    return this.request(`/kyc/${kycId}/approve`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  async rejectKYC(kycId: string, reviewNotes: string) {
    return this.request(`/kyc/${kycId}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ review_notes: reviewNotes }),
    });
  }

  // Support
  async createTicket(data: any) {
    return this.request('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTickets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/support/tickets${query ? `?${query}` : ''}`);
  }

  async replyToTicket(ticketId: string, message: string) {
    return this.request(`/support/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async closeTicket(ticketId: string) {
    return this.request(`/support/tickets/${ticketId}/close`, {
      method: 'PATCH',
    });
  }

  // ============= ADMIN APIs =============
  
  // Dashboard Stats
  async getAdminDashboardStats() {
    return this.request('/dashboard/admin-stats');
  }

  // Game Providers (Master Admin)
  async getGameProviders() {
    return this.request('/games/providers');
  }

  async createGameProvider(data: any) {
    return this.request('/games/providers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGameProvider(providerId: string, data: any) {
    return this.request(`/games/providers/${providerId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // All Games (Admin view)
  async getAllGames(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/games/admin/all${query ? `?${query}` : ''}`);
  }

  async createGame(data: any) {
    return this.request('/games/admin/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGame(gameId: string, data: any) {
    return this.request(`/games/admin/games/${gameId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // KYC Admin
  async getAllKYC(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/kyc/pending${query ? `?${query}` : ''}`);
  }

  // All Bets (Admin)
  async getAllBets(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/bets${query ? `?${query}` : ''}`);
  }

  async settleBet(betId: string, result: 'won' | 'lost', actualWin = 0) {
    return this.request(`/bets/${betId}/settle`, {
      method: 'POST',
      body: JSON.stringify({ result, actual_win: actualWin }),
    });
  }

  async cancelBet(betId: string, reason: string) {
    return this.request(`/bets/${betId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Change User Role (Master Admin)
  async changeUserRole(userId: string, newRole: string) {
    return this.request(`/users/${userId}/change-role?new_role=${newRole}`, {
      method: 'PATCH',
    });
  }

  // System Config
  async getSystemConfig(category?: string) {
    return this.request(`/config/system${category ? `?category=${category}` : ''}`);
  }

  async updateSystemConfig(configKey: string, configValue: any, configType: string, category: string, description?: string) {
    const params = new URLSearchParams({
      config_key: configKey,
      config_value: String(configValue),
      config_type: configType,
      category: category,
    });
    if (description) params.append('description', description);
    return this.request(`/config/system?${params.toString()}`, {
      method: 'POST',
    });
  }

  // Payment Methods
  async getPaymentMethods(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/config/payment-methods${query ? `?${query}` : ''}`);
  }

  async createPaymentMethod(data: any) {
    return this.request('/config/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(methodId: string, data: any) {
    return this.request(`/config/payment-methods/${methodId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Bonus Rules
  async getBonusRules(params?: any) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/config/bonus-rules${query ? `?${query}` : ''}`);
  }

  async createBonusRule(data: any) {
    return this.request('/config/bonus-rules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Banners
  async getBanners(position?: string) {
    return this.request(`/config/banners${position ? `?position=${position}` : ''}`);
  }

  async createBanner(data: any) {
    return this.request('/config/banners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Limits
  async getLimits(limitType?: string) {
    return this.request(`/config/limits${limitType ? `?limit_type=${limitType}` : ''}`);
  }

  async createLimit(data: any) {
    return this.request('/config/limits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
