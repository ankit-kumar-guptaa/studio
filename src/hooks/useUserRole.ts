
'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'employer' | 'job-seeker' | 'none';

export function useUserRole() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (isUserLoading) {
        return;
      }
      
      if (!user || !firestore) {
        setUserRole('none');
        setIsRoleLoading(false);
        return;
      }

      setIsRoleLoading(true);
      // Check if the user is an employer
      const employerRef = doc(firestore, 'employers', user.uid);
      const employerSnap = await getDoc(employerRef);
      if (employerSnap.exists()) {
        setUserRole('employer');
        setIsRoleLoading(false);
        return;
      }

      // Check if the user is a job seeker
      const jobSeekerRef = doc(firestore, 'jobSeekers', user.uid);
      const jobSeekerSnap = await getDoc(jobSeekerRef);
      if (jobSeekerSnap.exists()) {
        setUserRole('job-seeker');
        setIsRoleLoading(false);
        return;
      }

      // User exists but has no role document yet (e.g., during signup)
      setUserRole('none');
      setIsRoleLoading(false);
    };

    fetchUserRole();
  }, [user, firestore, isUserLoading]);

  return { userRole, isRoleLoading };
}
