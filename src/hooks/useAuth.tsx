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
  isAdmin: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const determineRole = async () => {
      setIsRoleLoading(true);

      if (isFirebaseUserLoading) {
        return; 
      }

      if (!user) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }
      
      if (user.email === ADMIN_EMAIL) {
        setUserRole('admin');
        setIsRoleLoading(false);
        return;
      }

      if (firestore) {
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

            const seoManagerRef = doc(firestore, 'seoManagers', user.uid);
            const seoManagerSnap = await getDoc(seoManagerRef);
            if (seoManagerSnap.exists()) {
              setUserRole('seo-manager');
              setIsRoleLoading(false);
              return;
            }

          } catch (e) {
            console.warn("Error checking user role in Firestore:", e);
          }
      }
      
      setUserRole('none'); // Default if no role found
      setIsRoleLoading(false);
    };

    determineRole();
  }, [user, firestore, isFirebaseUserLoading]);

  const logout = () => {
    setUserRole('none');
  };

  const value = {
    userRole,
    isAuthLoading: isFirebaseUserLoading || isRoleLoading,
    isAdmin: userRole === 'admin',
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
