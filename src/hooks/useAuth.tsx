'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { SEOManager } from '@/lib/types';

// This file now ONLY handles the non-Firebase, local storage-based authentication for the SEO Manager role.

const SEO_MANAGER_AUTH_KEY = 'seo_manager_auth_token';

interface AuthContextType {
  isSeoManager: boolean;
  loginAsSeoManager: (manager: SEOManager) => void;
  logout: () => void; // A single logout function for simplicity
  seoManager: SEOManager | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isSeoManager, setIsSeoManager] = useState(false);
  const [seoManager, setSeoManager] = useState<SEOManager | null>(null);

  useEffect(() => {
    // Check localStorage for SEO manager role on client side
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

  const loginAsSeoManager = (manager: SEOManager) => {
    localStorage.setItem(SEO_MANAGER_AUTH_KEY, JSON.stringify(manager));
    setSeoManager(manager);
    setIsSeoManager(true);
  };

  const logout = () => {
    // This function will be used for logging out the SEO Manager.
    // Firebase logout is handled separately in the Header component.
    localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
    setSeoManager(null);
    setIsSeoManager(false);
  };

  return (
    <AuthContext.Provider value={{ isSeoManager, loginAsSeoManager, logout, seoManager }}>
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
