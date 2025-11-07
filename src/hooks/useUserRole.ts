'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'seo-manager' | 'none';

export function useUserRole() {
  const { user, firestore, isUserLoading } = useFirebase();
  const { isAdmin, isSeoManager } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // Check 1: Is the user a super admin via our custom auth hook?
      if (isAdmin) {
          setUserRole('admin');
          setIsRoleLoading(false);
          return;
      }
      
      // Check 2: Is the user an SEO manager?
      if (isSeoManager) {
        setUserRole('seo-manager');
        setIsRoleLoading(false);
        return;
      }
      
      // Don't do anything until Firebase auth state is resolved.
      if (isUserLoading) {
        return;
      }
      
      // If there's no user, the role is 'none'.
      if (!user || !firestore) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }

      // Start the role checking process.
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
  }, [user, firestore, isUserLoading, isAdmin, isSeoManager]);

  return { userRole, isRoleLoading };
}
