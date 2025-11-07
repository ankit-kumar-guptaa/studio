'use client';

import { Suspense, useEffect } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, BookOpen, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeoBlogManagement } from '@/components/seo-manager/SeoBlogManagement';
import { SeoJobManagement } from '@/components/seo-manager/SeoJobManagement';
import { useAuth } from '@/hooks/useAuth';

function SeoManagerPageContent() {
    const { userRole } = useUserRole();
    const { isSeoManager } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || "blog-seo";

    useEffect(() => {
        // Redirect if not an SEO Manager or a Super Admin
        if (!isSeoManager && userRole !== 'admin') {
            router.push('/seo-manager/login');
        }
    }, [isSeoManager, userRole, router]);

    // Show a loader while authentication state is being determined
    if (!isSeoManager && userRole !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-secondary py-8 sm:py-12">
                <div className="container mx-auto max-w-7xl px-4">
                     <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">SEO Manager Dashboard</h1>
                        <p className="text-muted-foreground">Manage on-page SEO for blog posts and job listings.</p>
                    </div>
                    <Tabs defaultValue={defaultTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="blog-seo"><BookOpen className="mr-2 h-4 w-4" /> Blog Post SEO</TabsTrigger>
                            <TabsTrigger value="job-seo"><Briefcase className="mr-2 h-4 w-4" /> Job Post SEO</TabsTrigger>
                        </TabsList>
                        <TabsContent value="blog-seo">
                            <SeoBlogManagement />
                        </TabsContent>
                        <TabsContent value="job-seo">
                           <SeoJobManagement />
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function SeoManagerPage() {
    return (
        <Suspense>
            <SeoManagerPageContent />
        </Suspense>
    )
}
