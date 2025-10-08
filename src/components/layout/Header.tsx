'use client';

import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, LogOut, User, Briefcase, Star, Shield } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobSeeker, Employer } from '@/lib/types';


const defaultNavLinks = [
  { href: '/find-jobs', label: 'Find Jobs' },
  { href: '/reviews', label: 'Company Reviews' },
  { href: '/blog', label: 'Career Blog' },
];


export function Header() {
  const { user, auth, firestore, isUserLoading } = useFirebase();
  const { userRole, isRoleLoading } = useUserRole();
  const router = useRouter();
  
  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore || !userRole || userRole === 'none' || userRole === 'admin') return null;
    const collectionName = userRole === 'employer' ? 'employers' : 'jobSeekers';
    return doc(firestore, collectionName, user.uid);
  }, [user, firestore, userRole]);

  const { data: userData } = useDoc<JobSeeker | Employer>(userDocRef);

  const profilePictureUrl = (userData as Employer)?.companyLogoUrl || (userData as JobSeeker)?.profilePictureUrl || user?.photoURL;
  
  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name[0];
  };

  const getDashboardLink = () => {
    switch(userRole) {
      case 'admin': return '/admin';
      case 'employer': return '/employer';
      case 'job-seeker': return '/job-seeker';
      default: return '/';
    }
  }

  const navLinks = userRole === 'employer' 
    ? [
        { href: '/employer', label: 'Dashboard' },
        { href: '/employer?tab=search-candidates', label: 'Search Candidates' }
      ] 
    : defaultNavLinks;


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-7xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
             {userRole !== 'employer' && (
               <Link href="/employer" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                  For Employers
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="hidden items-center space-x-2 md:flex">
            {isUserLoading || isRoleLoading ? (
              <div className="h-10 w-24 animate-pulse rounded-md bg-muted"></div>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profilePictureUrl || ''} alt={user.displayName || 'User'} />
                      <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(getDashboardLink())}>
                    {userRole === 'admin' && <Shield className="mr-2 h-4 w-4" />}
                    {userRole === 'employer' && <Briefcase className="mr-2 h-4 w-4" />}
                    {userRole === 'job-seeker' && <User className="mr-2 h-4 w-4" />}
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log In</Link>
                </Button>
                <Button className="gradient-saffron shadow-lg hover:shadow-primary/50" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
               <SheetHeader className="border-b p-4">
                  <Link href="/">
                    <Logo />
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                  </Link>
               </SheetHeader>
              <div className="flex h-full flex-col">
                <nav className="flex flex-col gap-4 p-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                  {userRole !== 'employer' && (
                    <Link href="/employer" className="text-lg font-semibold text-foreground/80 transition-colors hover:text-foreground">
                      For Employers
                    </Link>
                  )}
                </nav>
                <div className="mt-auto flex flex-col gap-2 border-t p-4">
                  {user ? (
                    <>
                      <Button variant="outline" asChild>
                        <Link href={getDashboardLink()}>My Dashboard</Link>
                      </Button>
                      <Button className="gradient-saffron" onClick={handleLogout}>
                        Log Out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login">Log In</Link>
                      </Button>
                      <Button className="gradient-saffron" asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
