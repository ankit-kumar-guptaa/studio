'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'seo-manager' | 'none';

export function useUserRole() {
  const { user, firestore, isUserLoading: isFirebaseUserLoading } = useFirebase();
  const { isSeoManager, isAuthLoading } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Don't do anything until both Firebase auth and custom auth state are resolved.
      if (isFirebaseUserLoading || isAuthLoading) {
        return;
      }
      
      // Check 1: Is the user the hardcoded Super Admin via Firebase Auth?
      if (user?.email === 'support@algoweb.in') {
        setUserRole('admin');
        setIsRoleLoading(false);
        return;
      }
      
      // Check 2: Is the user a custom-authenticated SEO manager?
      if (isSeoManager) {
        setUserRole('seo-manager');
        setIsRoleLoading(false);
        return;
      }
      
      // If there's no Firebase user, the role is 'none'.
      if (!user || !firestore) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }
      
      // Start checking Firestore roles for the authenticated Firebase user.
      setIsRoleLoading(true);

      // Check 3: Is the user in the 'employers' collection?
      try {
        const employerRef = doc(firestore, 'employers', user.uid);
        const employerSnap = await getDoc(employerRef);
        if (employerSnap.exists()) {
          setUserRole('employer');
          setIsRoleLoading(false);
          return;
        }
      } catch (e) {
        console.warn("Could not check employer role:", e);
      }

      // Check 4: Is the user in the 'jobSeekers' collection?
      try {
        const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
        const jobSeekerSnap = await getDoc(jobSeekerRef);
        if (jobSeekerSnap.exists()) {
          setUserRole('job-seeker');
          setIsRoleLoading(false);
          return;
        }
      } catch (e) {
         console.warn("Could not check job seeker role:", e);
      }

      // If none of the above, the user has no specific role yet.
      setUserRole('none');
      setIsRoleLoading(false);
    };

    fetchUserRole();
  }, [user, firestore, isFirebaseUserLoading, isSeoManager, isAuthLoading]);

  return { userRole, isRoleLoading };
}
