import type { Metadata } from 'next';
import Script from 'next/script';
import { PT_Sans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { PageTransition } from '@/components/layout/PageTransition';
import { AuthProvider } from '@/hooks/useAuth.tsx';

const ptSans = PT_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-pt-sans',
});

export const metadata: Metadata = {
  title: 'Hiring Dekho - Rozgaar ka Sahi Rasta',
  description: 'A full-featured job portal for the Indian market.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
       <head>
        {/* Google tag (gtag.js) */}
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-Z1L2HSJDPD"></Script>
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-Z1L2HSJDPD');
          `}
        </Script>
      </head>
      <body className={cn('min-h-screen bg-background font-sans antialiased', ptSans.variable)}>
        <FirebaseClientProvider>
          <AuthProvider>
            <PageTransition>
              {children}
            </PageTransition>
          </AuthProvider>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
