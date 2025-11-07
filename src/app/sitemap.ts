import { MetadataRoute } from 'next';
import type { JobPost, Blog } from '@/lib/types';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';


const BASE_URL = 'https://www.hiringdekho.com';

async function initializeAdminApp() {
    if (getApps().length > 0) {
        return getFirestore();
    }
    
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
        : undefined;

    if (serviceAccount) {
        initializeApp({
            credential: cert(serviceAccount)
        });
    } else {
        // Fallback for environments where service account is auto-detected
        initializeApp();
    }
    
    return getFirestore();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    '/',
    '/about',
    '/blog',
    '/contact',
    '/find-jobs',
    '/privacy',
    '/reviews',
    '/terms',
    '/login',
    '/signup',
    '/forgot-password',
    '/employer',
    '/job-seeker',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: route === '/' ? 'daily' : 'weekly' as 'daily' | 'weekly',
    priority: route === '/' ? 1 : 0.8,
  }));

  let dynamicRoutes: MetadataRoute.Sitemap = [];

  try {
    const adminDb = await initializeAdminApp();
    if (!adminDb) {
        throw new Error('Firestore Admin DB not initialized');
    }
    // Dynamic routes for job posts
    const jobsSnapshot = await adminDb.collection('jobPosts').get();
    const jobRoutes = jobsSnapshot.docs.map((doc) => {
      const data = doc.data() as JobPost;
      return {
        url: `${BASE_URL}/job/${data.id}`,
        lastModified: data.postDate ? new Date((data.postDate as any)._seconds * 1000).toISOString() : lastModified,
        changeFrequency: 'daily' as const,
        priority: 0.9,
      };
    });

    // Dynamic routes for blog posts
    const blogsSnapshot = await adminDb.collection('blogs').get();
    const blogRoutes = blogsSnapshot.docs.map((doc) => {
      const data = doc.data() as Blog;
      return {
        url: `${BASE_URL}/blog/${data.slug || data.id}`,
        lastModified: data.publicationDate ? new Date((data.publicationDate as any)._seconds * 1000).toISOString() : lastModified,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
    
    dynamicRoutes = [...jobRoutes, ...blogRoutes];

  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // In case of an error (e.g., DB connection issue during build),
    // we still return the static routes so the build doesn't fail.
  }


  return [...staticRoutes, ...dynamicRoutes];
}
