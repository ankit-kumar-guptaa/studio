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
  title: string;
  location: string;
  category: string;
  salary: string;
  description: string;
  requirements: string;
  postDate: Timestamp;
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
