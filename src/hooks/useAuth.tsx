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
  isAdmin: boolean;
  isSeoManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [seoManager, setSeoManager] = useState<SEOManager | null>(null);

  // This effect determines the user's role.
  useEffect(() => {
    const determineRole = async () => {
      // Wait until Firebase auth state is resolved.
      if (isFirebaseUserLoading) {
        return;
      }

      setIsAuthLoading(true);

      // Check 1: Is the user the hardcoded Super Admin via Firebase Auth?
      if (user?.email === ADMIN_EMAIL) {
        setUserRole('admin');
        setSeoManager(null); // Ensure SEO manager state is cleared
        setIsAuthLoading(false);
        return;
      }

      // Check 2: Is there an SEO manager session in localStorage?
      try {
        const seoManagerToken = localStorage.getItem(SEO_MANAGER_AUTH_KEY);
        if (seoManagerToken) {
          const managerData = JSON.parse(seoManagerToken);
          setSeoManager(managerData);
          setUserRole('seo-manager');
          setIsAuthLoading(false);
          return;
        }
      } catch (e) {
        console.error("Error reading SEO manager state from localStorage", e);
        localStorage.removeItem(SEO_MANAGER_AUTH_KEY); // Clear corrupted token
      }

      // If not admin or SEO manager, check Firestore for regular user roles.
      if (!user || !firestore) {
        setUserRole('none');
        setIsAuthLoading(false);
        return;
      }

      // Check 3: Is the user an employer?
      try {
        const employerRef = doc(firestore, 'employers', user.uid);
        const employerSnap = await getDoc(employerRef);
        if (employerSnap.exists()) {
          setUserRole('employer');
          setIsAuthLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Could not check employer role:", e);
      }

      // Check 4: Is the user a job seeker?
      try {
        const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
        const jobSeekerSnap = await getDoc(jobSeekerRef);
        if (jobSeekerSnap.exists()) {
          setUserRole('job-seeker');
          setIsAuthLoading(false);
          return;
        }
      } catch (e) {
         console.warn("Could not check job seeker role:", e);
      }

      // If none of the above, the user has no specific role.
      setUserRole('none');
      setIsAuthLoading(false);
    };

    determineRole();
  }, [user, firestore, isFirebaseUserLoading]);

  const loginAsSeoManager = (manager: SEOManager) => {
    try {
      localStorage.setItem(SEO_MANAGER_AUTH_KEY, JSON.stringify(manager));
      setSeoManager(manager);
      setUserRole('seo-manager');
    } catch (e) {
      console.error("Failed to save SEO manager session", e);
    }
  };

  const logout = () => {
    // This clears the custom SEO manager session.
    // Firebase sign-out is handled separately in the Header component.
    try {
      localStorage.removeItem(SEO_MANAGER_AUTH_KEY);
    } catch (e) {
      console.error("Failed to clear SEO manager session", e);
    }
    setSeoManager(null);
    setUserRole('none');
  };

  const value = {
    userRole,
    isAuthLoading,
    logout,
    seoManager,
    loginAsSeoManager, // Expose this for the SEO login page
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
