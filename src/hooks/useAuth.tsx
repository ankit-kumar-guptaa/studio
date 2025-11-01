'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

const AUTH_KEY = 'super_admin_auth_token';
const AUTH_TOKEN = 'SUPER_ADMIN_LOGGED_IN';

interface AuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check localStorage only on the client side
    const token = localStorage.getItem(AUTH_KEY);
    if (token === AUTH_TOKEN) {
      setIsAdmin(true);
    }
  }, []);

  const login = () => {
    localStorage.setItem(AUTH_KEY, AUTH_TOKEN);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout }}>
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
