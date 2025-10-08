'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'none';

const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

export function useUserRole() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      // First, check for the session-based super admin flag
      try {
        if (sessionStorage.getItem('isSuperAdmin') === 'true') {
          setUserRole('admin');
          setIsRoleLoading(false);
          return;
        }
      } catch (e) {
        // Session storage might not be available (e.g., in some server contexts or if disabled)
        console.warn("Could not check for admin session.");
      }

      if (isUserLoading) {
        return;
      }
      
      if (!user || !firestore) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);

      // This is for Firebase-authenticated admin users, can be a fallback
      if (user.email === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
          setIsRoleLoading(false);
          return;
      }

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

      setUserRole('none');
      setIsRoleLoading(false);
    };

    fetchUserRole();
  }, [user, firestore, isUserLoading]);

  return { userRole, isRoleLoading };
}
