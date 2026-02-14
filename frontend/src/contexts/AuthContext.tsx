import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  kyc_status: string;
  wallet_balance?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, totpCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setUser(null);
        return;
      }
      // Always fetch user from server - never trust localStorage for role/permissions
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      apiClient.setToken(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = apiClient.getToken();
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string, totpCode?: string) => {
    const response = await apiClient.login(email, password, totpCode);
    // Set user from server response only - no localStorage role storage
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      apiClient.setToken(null);
    }
  };

  const register = async (userData: any) => {
    return await apiClient.register(userData);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, refreshUser, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
