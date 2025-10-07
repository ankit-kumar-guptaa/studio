'use client';

import { Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePageClient } from '@/components/home/HomePageClient';

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Suspense>
            <HomePageClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
