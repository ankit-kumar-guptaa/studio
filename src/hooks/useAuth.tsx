'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { SEOManager } from '@/lib/types';

const ADMIN_AUTH_KEY = 'admin_auth_token';
const SEO_MANAGER_AUTH_KEY = 'seo_manager_auth_token';

interface AuthContextType {
  isAdmin: boolean;
  isSeoManager: boolean;
  loginAsAdmin: () => void;
  loginAsSeoManager: (manager: SEOManager) => void;
  logout: () => void;
  seoManager: SEOManager | null;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSeoManager, setIsSeoManager] = useState(false);
  const [seoManager, setSeoManager] = useState<SEOManager | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    try {
        const adminToken = localStorage.getItem(ADMIN_AUTH_KEY);
        if (adminToken === 'true') {
            setIsAdmin(true);
        }

        const seoManagerToken = localStorage.getItem(SEO_MANAGER_AUTH_KEY);
        if (seoManagerToken) {
            const managerData = JSON.parse(seoManagerToken);
            setSeoManager(managerData);
            setIsSeoManager(true);
        }
    } catch (e) {
        console.error("Error reading auth state from localStorage", e);
    } finally {
        setIsAuthLoading(false);
    }
  }, []);

  const loginAsAdmin = () => {
    localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    setIsAdmin(true);
  };

  const loginAsSeoManager = (manager: SEOManager) => {
    localStorage.setItem(SEO_MANAGER_AUTH_KEY, JSON.stringify(manager));
    setSeoManager(manager);
    setIsSeoManager(true);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
    setIsAdmin(false);
    setSeoManager(null);
    setIsSeoManager(false);
  };

  return (
    <AuthContext.Provider value={{ isAdmin, isSeoManager, loginAsAdmin, loginAsSeoManager, logout, seoManager, isAuthLoading }}>
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
