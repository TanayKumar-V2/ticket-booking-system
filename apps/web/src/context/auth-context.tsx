'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '@/lib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'ORGANIZER' | 'USER';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore session from cookie
  useEffect(() => {
    const storedToken = Cookies.get('access_token');
    const storedUser = Cookies.get('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        Cookies.remove('access_token');
        Cookies.remove('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    setToken(response.accessToken);
    setUser(response.user);
    Cookies.set('access_token', response.accessToken, { expires: 1 / 96 }); // 15 min
    Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
  }, []);

  const register = useCallback(async (email: string, password: string, role?: string) => {
    const response = await authApi.register({ email, password, role });
    setToken(response.accessToken);
    setUser(response.user);
    Cookies.set('access_token', response.accessToken, { expires: 1 / 96 });
    Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout(token);
    } catch {
      // Ignore logout errors
    }
    setToken(null);
    setUser(null);
    Cookies.remove('access_token');
    Cookies.remove('user');
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
