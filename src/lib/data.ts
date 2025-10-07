import type { Job, Company, Testimonial, JobPost } from './types';
import { Timestamp } from 'firebase/firestore';


// This data is now used for the FeaturedJobs component on the home page.
export const featuredJobs: JobPost[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    companyName: 'InnovateTech',
    companyLogo: 'company-logo-1',
    location: 'Bangalore, KA',
    category: 'Technology',
    salary: '₹18-25 LPA',
    description: 'Developing and maintaining user-facing features for our web applications.',
    requirements: '5+ years of experience with React, TypeScript, and modern frontend frameworks.',
    postDate: Timestamp.fromDate(new Date('2024-07-28T10:00:00Z')),
  },
  {
    id: 'job-2',
    title: 'Product Manager',
    companyName: 'BharatSolutions',
    companyLogo: 'company-logo-2',
    location: 'Mumbai, MH',
    category: 'Product',
    salary: '₹20-30 LPA',
    description: 'Define product vision, strategy, and roadmap. Work with cross-functional teams.',
    requirements: 'Proven experience in product management for a B2B SaaS product. Strong analytical skills.',
    postDate: Timestamp.fromDate(new Date('2024-07-27T14:30:00Z')),
  },
  {
    id: 'job-3',
    title: 'UX/UI Designer',
    companyName: 'DesiDesigns',
    companyLogo: 'company-logo-3',
    location: 'Pune, MH (Remote)',
    category: 'Design',
    salary: '₹12-15 LPA',
    description: 'Create compelling and user-friendly designs for our mobile and web platforms.',
    requirements: 'A strong portfolio showcasing your design skills. Proficiency in Figma, Sketch, or Adobe XD.',
    postDate: Timestamp.fromDate(new Date('2024-07-26T11:00:00Z')),
  },
   {
    id: 'job-4',
    title: 'Backend Engineer (Go)',
    companyName: 'Digital India Corp',
    companyLogo: 'company-logo-4',
    location: 'Hyderabad, TS',
    category: 'Technology',
    salary: '₹15-22 LPA',
    description: 'Design, build, and maintain scalable and reliable backend services and APIs.',
    requirements: 'Strong proficiency in Golang, experience with microservices architecture and AWS.',
    postDate: Timestamp.fromDate(new Date('2024-07-25T09:00:00Z')),
  },
   {
    id: 'job-5',
    title: 'Digital Marketing Lead',
    companyName: 'AgriFuture',
    companyLogo: 'company-logo-5',
    location: 'Noida, UP',
    category: 'Marketing',
    salary: '₹10-14 LPA',
    description: 'Lead our digital marketing campaigns across all channels to drive growth.',
    requirements: '5+ years in digital marketing, with expertise in SEO, SEM, and social media marketing.',
    postDate: Timestamp.fromDate(new Date('2024-07-24T16:00:00Z')),
  },
  {
    id: 'job-6',
    title: 'HR Business Partner',
    companyName: 'InfraConnect',
    companyLogo: 'company-logo-6',
    location: 'Gurgaon, HR',
    category: 'Human Resources',
    salary: '₹12-18 LPA',
    description: 'Partner with business leaders to develop and implement HR strategies.',
    requirements: 'Experience as an HRBP in a fast-paced environment. Strong understanding of HR policies.',
    postDate: Timestamp.fromDate(new Date('2024-07-23T12:00:00Z')),
  },
];


export const topCompanies: Company[] = [
  { id: '1', name: 'InnovateTech', logo: 'company-logo-1', jobCount: 12 },
  { id: '2', name: 'BharatSolutions', logo: 'company-logo-2', jobCount: 8 },
  { id: '3', name: 'DesiDesigns', logo: 'company-logo-3', jobCount: 5 },
  { id: '4', name: 'Digital India Corp', logo: 'company-logo-4', jobCount: 20 },
  { id: '5', name: 'AgriFuture', logo: 'company-logo-5', jobCount: 7 },
  { id: '6', name: 'InfraConnect', logo: 'company-logo-6', jobCount: 15 },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Priya Sharma',
    role: 'Software Engineer',
    avatar: 'testimonial-avatar-1',
    quote: 'Hiring Dekho helped me find my dream job in just two weeks! The AI recommendations were spot on and saved me so much time.',
  },
  {
    id: '2',
    name: 'Rohan Gupta',
    role: 'HR Manager, TechStartups',
    avatar: 'testimonial-avatar-2',
    quote: 'We found three excellent candidates through Hiring Dekho. The platform is intuitive and reaches a wide pool of talent in India.',
  },
  {
    id: '3',
    name: 'Anjali Mehta',
    role: 'Marketing Specialist',
    avatar: 'testimonial-avatar-3',
    quote: 'As a recent graduate, I was overwhelmed. The resume builder and blog articles on Hiring Dekho were incredibly helpful in my job search.',
  },
];
