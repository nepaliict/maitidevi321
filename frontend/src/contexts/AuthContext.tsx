import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '@/lib/api';

interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  role: 'master_admin' | 'admin' | 'agent' | 'user';
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
  isAdmin: boolean;
  isMasterAdmin: boolean;
  isAgent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = apiClient.getToken();
      if (!token) {
        setUser(null);
        return;
      }

      const userData = await apiClient.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      apiClient.setToken(null);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await refreshUser();
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string, totpCode?: string) => {
    try {
      const response = await apiClient.login(email, password, totpCode);
      setUser(response.user);
      // Store user in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(response.user));
    } catch (error) {
      throw error;
    }
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
    const response = await apiClient.register(userData);
    return response;
  };

  const isAuthenticated = !!user;
  const isMasterAdmin = user?.role === 'master_admin';
  const isAdmin = user?.role === 'admin' || isMasterAdmin;
  const isAgent = user?.role === 'agent' || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        refreshUser,
        isAuthenticated,
        isAdmin,
        isMasterAdmin,
        isAgent,
      }}
    >
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
