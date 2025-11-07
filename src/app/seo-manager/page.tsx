'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, BookOpen, Briefcase } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SeoBlogManagement } from '@/components/seo-manager/SeoBlogManagement';
import { SeoJobManagement } from '@/components/seo-manager/SeoJobManagement';
import type { SEOManager } from '@/lib/types';

function SeoManagerPageContent() {
    const [seoManager, setSeoManager] = useState<SEOManager | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultTab = searchParams.get('tab') || "blog-seo";

    useEffect(() => {
        try {
            const seoManagerData = sessionStorage.getItem('seo-manager');
            if (seoManagerData) {
                const manager = JSON.parse(seoManagerData);
                setSeoManager(manager);
            } else {
                router.push('/seo-manager/login');
            }
        } catch (error) {
            console.error("Failed to parse SEO manager data from session storage", error);
            router.push('/seo-manager/login');
        } finally {
            setIsLoading(false);
        }
    }, [router]);

    if (isLoading || !seoManager) {
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
                        <p className="text-muted-foreground">Manage on-page SEO for blog posts and job listings. Welcome, {seoManager.firstName}!</p>
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
