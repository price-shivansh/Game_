import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, api } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password_unused: string) => Promise<void>;
  register: (name: string, email: string, phone: string, role?: 'player' | 'admin') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load credentials from localStorage if present
    const savedUser = localStorage.getItem('ignitehoops_auth_user');
    const savedToken = localStorage.getItem('ignitehoops_auth_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password_unused: string) => {
    setLoading(true);
    try {
      const response = await api.login(email, password_unused);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('ignitehoops_auth_user', JSON.stringify(response.user));
      localStorage.setItem('ignitehoops_auth_token', response.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, phone: string, role: 'player' | 'admin' = 'player') => {
    setLoading(true);
    try {
      const response = await api.register(name, email, phone, role);
      setUser(response.user);
      setToken(response.token);
      localStorage.setItem('ignitehoops_auth_user', JSON.stringify(response.user));
      localStorage.setItem('ignitehoops_auth_token', response.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ignitehoops_auth_user');
    localStorage.removeItem('ignitehoops_auth_token');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    const updated = await api.updateProfile(user.id, data);
    setUser(updated);
    localStorage.setItem('ignitehoops_auth_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
