'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import type { SEOManager } from '@/lib/types';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

const ADMIN_EMAIL = 'support@itsahayata.com';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'seo-manager' | 'none';

interface AuthContextType {
  userRole: UserRole;
  isAuthLoading: boolean;
  seoManager: SEOManager | null;
  setSeoManager: (manager: SEOManager | null) => void;
  isAdmin: boolean;
  isSeoManager: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);
  const [seoManager, setSeoManagerState] = useState<SEOManager | null>(null);

  useEffect(() => {
    const determineRole = async () => {
      setIsRoleLoading(true);

      // SEO Manager is handled by session storage on its specific pages, so we don't check for it here.

      if (isFirebaseUserLoading) {
        return; 
      }

      if (user?.email === ADMIN_EMAIL) {
        setUserRole('admin');
        setIsRoleLoading(false);
        return;
      }

      if (!user || !firestore) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }
      
      try {
        const employerRef = doc(firestore, 'employers', user.uid);
        const employerSnap = await getDoc(employerRef);
        if (employerSnap.exists()) {
          setUserRole('employer');
          setIsRoleLoading(false);
          return;
        }

        const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
        const jobSeekerSnap = await getDoc(jobSeekerRef);
        if (jobSeekerSnap.exists()) {
          setUserRole('job-seeker');
          setIsRoleLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Error checking user role in Firestore:", e);
      }
      
      setUserRole('none');
      setIsRoleLoading(false);
    };

    determineRole();
  }, [user, firestore, isFirebaseUserLoading]);

  const logout = () => {
    // This will be called by the header to sign out from Firebase
    // SEO manager logout is handled by clearing session storage on its page
    setUserRole('none');
    setSeoManagerState(null);
    sessionStorage.removeItem('seo-manager');
  };

  const value = {
    userRole,
    isAuthLoading: isFirebaseUserLoading || isRoleLoading,
    seoManager,
    setSeoManager: setSeoManagerState,
    isAdmin: userRole === 'admin',
    isSeoManager: !!seoManager,
    logout,
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