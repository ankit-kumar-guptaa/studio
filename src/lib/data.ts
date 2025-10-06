import type { Job, Company, Testimonial } from './types';

export const featuredJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'InnovateTech',
    companyLogo: 'company-logo-1',
    location: 'Bangalore, KA',
    type: 'Full-time',
    salary: '₹18-25 LPA',
    postedDate: '2 days ago',
    tags: ['React', 'TypeScript', 'Remote'],
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'BharatSolutions',
    companyLogo: 'company-logo-2',
    location: 'Mumbai, MH',
    type: 'Full-time',
    salary: '₹20-30 LPA',
    postedDate: '5 days ago',
    tags: ['SaaS', 'Agile', 'B2B'],
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'DesiDesigns',
    companyLogo: 'company-logo-3',
    location: 'Pune, MH',
    type: 'Contract',
    salary: '₹12-15 LPA',
    postedDate: '1 week ago',
    tags: ['Figma', 'User Research', 'Mobile'],
  },
  {
    id: '4',
    title: 'Backend Engineer (Go)',
    company: 'Digital India Corp',
    companyLogo: 'company-logo-4',
    location: 'Hyderabad, TS',
    type: 'Full-time',
    salary: '₹15-22 LPA',
    postedDate: '3 days ago',
    tags: ['Golang', 'Microservices', 'AWS'],
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
