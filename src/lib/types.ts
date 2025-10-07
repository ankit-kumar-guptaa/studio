import { Timestamp } from "firebase/firestore";

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract';
  salary: string;
  postedDate: string;
  tags: string[];
}

export interface JobPost {
  id: string;
  employerId: string;
  title: string;
  location: string;
  category: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string;
  postDate: Timestamp | Date | string; // Allow serializable string
  companyName?: string;
  companyLogoUrl?: string;
}

export interface JobApplication {
    id: string;
    jobSeekerId: string;
    applicationDate: Timestamp;
    status: 'Applied' | 'Reviewed' | 'Interviewing' | 'Offered' | 'Rejected';
    jobTitle: string;
    jobSeekerName: string;
    companyName?: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  jobCount: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  author: string;
  publicationDate: string;
  imageUrl: string;
  imageHint: string;
}


export interface Employer {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    phone?: string;
    companyDescription?: string;
    companyLogoUrl?: string;
}

export interface JobSeeker {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  experienceLevel?: 'fresher' | 'experienced';
  currentSalary?: string;
  currentCompany?: string;
  resumeUrl?: string;
  categoryPreferences?: string[];
  jobAlerts?: {
    keywords: string;
    location: string;
  }[];
  summary?: string;
  skills?: { value: string }[];
  workExperience?: {
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }[];
  education?: {
    degree: string;
    institution: string;
    graduationYear: string;
  }[];
}

export interface SavedJob extends JobPost {
  employerId: string;
  savedDate: Timestamp;
}

export interface CompanyReview {
    id: string;
    employerId: string;
    jobSeekerId: string;
    rating: number;
    comment: string;
    reviewDate: Timestamp;
    companyName: string;
    companyLogo?: string;
    jobSeekerName: string;
}

    
