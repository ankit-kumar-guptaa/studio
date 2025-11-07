'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { SEOManager } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'support@itsahayata.com';
const SEO_MANAGER_AUTH_KEY = 'seo_manager_auth_token';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'seo-manager' | 'none';

interface AuthContextType {
  userRole: UserRole;
  isAuthLoading: boolean;
  logout: () => void;
  seoManager: SEOManager | null;
  loginAsSeoManager: (manager: SEOManager) => void;
  isAdmin: boolean;
  isSeoManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [seoManager, setSeoManager] = useState<SEOManager | null>(null);

  useEffect(() => {
    const determineRole = async () => {
      setIsAuthLoading(true);

      if (isFirebaseUserLoading) {
        return; 
      }

      // Check 1: Super Admin via Firebase Auth email
      if (user?.email === ADMIN_EMAIL) {
        setUserRole('admin');
        setIsAuthLoading(false);
        return;
      }
      
      // Check 2: SEO Manager via localStorage 
      const seoManagerToken = localStorage.getItem(SEO_MANAGER_AUTH_KEY);
      if (seoManagerToken) {
        try {
          const managerData = JSON.parse(seoManagerToken);
          setSeoManager(managerData);
          setUserRole('seo-manager');
          setIsAuthLoading(false);
          return;
        } catch (e) {
          console.error("Clearing corrupted SEO manager token", e);
          localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
        }
      }

      if (!user || !firestore) {
        setUserRole('none');
        setIsAuthLoading(false);
        return;
      }
      
      try {
        const employerRef = doc(firestore, 'employers', user.uid);
        const employerSnap = await getDoc(employerRef);
        if (employerSnap.exists()) {
          setUserRole('employer');
          setIsAuthLoading(false);
          return;
        }

        const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
        const jobSeekerSnap = await getDoc(jobSeekerRef);
        if (jobSeekerSnap.exists()) {
          setUserRole('job-seeker');
          setIsAuthLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Error checking user role in Firestore:", e);
      }
      
      setUserRole('none');
      setIsAuthLoading(false);
    };

    determineRole();
  }, [user, firestore, isFirebaseUserLoading]);

  const loginAsSeoManager = (manager: SEOManager) => {
    localStorage.setItem(SEO_MANAGER_AUTH_KEY, JSON.stringify(manager));
    setSeoManager(manager);
    setUserRole('seo-manager');
  };

  const logout = () => {
    localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
    setSeoManager(null);
    setUserRole('none');
  };

  const value = {
    userRole,
    isAuthLoading,
    logout,
    seoManager,
    loginAsSeoManager,
    isAdmin: userRole === 'admin',
    isSeoManager: userRole === 'seo-manager',
  };

  return (
    <AuthContext.Provider value={value}>
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
