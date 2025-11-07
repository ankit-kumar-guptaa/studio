'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { SEOManager } from '@/lib/types';

const ADMIN_AUTH_KEY = 'super_admin_auth_token';
const ADMIN_AUTH_TOKEN = 'SUPER_ADMIN_LOGGED_IN';

const SEO_MANAGER_AUTH_KEY = 'seo_manager_auth_token';

interface AuthContextType {
  isAdmin: boolean;
  login: () => void;
  logout: () => void;
  isSeoManager: boolean;
  loginAsSeoManager: (manager: SEOManager) => void;
  logoutSeoManager: () => void;
  seoManager: SEOManager | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeoManager, setIsSeoManager] = useState(false);
  const [seoManager, setSeoManager] = useState<SEOManager | null>(null);

  useEffect(() => {
    // Check localStorage for both roles on client side
    const adminToken = localStorage.getItem(ADMIN_AUTH_KEY);
    if (adminToken === ADMIN_AUTH_TOKEN) {
      setIsAdmin(true);
    }
    
    const seoManagerToken = localStorage.getItem(SEO_MANAGER_AUTH_KEY);
    if (seoManagerToken) {
        try {
            const managerData = JSON.parse(seoManagerToken);
            setSeoManager(managerData);
            setIsSeoManager(true);
        } catch (e) {
            console.error("Failed to parse SEO manager data from localStorage", e);
            localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
        }
    }
  }, []);

  const login = () => {
    localStorage.setItem(ADMIN_AUTH_KEY, ADMIN_AUTH_TOKEN);
    setIsAdmin(true);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAdmin(false);
  };

  const loginAsSeoManager = (manager: SEOManager) => {
    localStorage.setItem(SEO_MANAGER_AUTH_KEY, JSON.stringify(manager));
    setSeoManager(manager);
    setIsSeoManager(true);
  };

  const logoutSeoManager = () => {
    localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
    setSeoManager(null);
    setIsSeoManager(false);
  };

  const handleFullLogout = () => {
    logout();
    logoutSeoManager();
  }

  return (
    <AuthContext.Provider value={{ isAdmin, login, logout: handleFullLogout, isSeoManager, loginAsSeoManager, logoutSeoManager, seoManager }}>
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
