'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';

type UserRole = 'admin' | 'employer' | 'job-seeker' | 'seo-manager' | 'none';

// Define the super admin email address
const SUPER_ADMIN_EMAIL = 'theankitkumarg@gmail.com';

export function useUserRole() {
  const { user, firestore, isUserLoading } = useFirebase();
  const [userRole, setUserRole] = useState<UserRole>('none');
  const [isRoleLoading, setIsRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
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
      
      // Check 1: Is the logged-in user the designated super admin?
      if (user.email === SUPER_ADMIN_EMAIL) {
          setUserRole('admin');
          setIsRoleLoading(false);
          return;
      }

      // Start the role checking process for other roles.
      setIsRoleLoading(true);

      // Check 2: Is the user in the 'employers' collection?
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


      // Check 3: Is the user in the 'jobSeekers' collection?
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
  }, [user, firestore, isUserLoading]);

  return { userRole, isRoleLoading };
}
