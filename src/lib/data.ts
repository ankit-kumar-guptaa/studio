import type { Job, Company, Testimonial, JobPost, Blog } from './types';
import { Timestamp } from 'firebase/firestore';


// This data is now used for the FeaturedJobs component on the home page.
export const featuredJobs: (Omit<JobPost, 'postDate'> & { postDate: Timestamp })[] = [
  {
    id: 'job-1',
    title: 'Senior Frontend Developer',
    companyName: 'InnovateTech',
    companyLogoUrl: 'https://images.unsplash.com/photo-1496200186974-4293800e2c20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    companyLogoUrl: 'https://images.unsplash.com/photo-1687523327554-fa9f50423489?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw4fHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    companyLogoUrl: 'https://images.unsplash.com/photo-1529612700005-e35377bf1415?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    companyLogoUrl: 'https://images.unsplash.com/photo-1496200186974-4293800e2c20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    companyLogoUrl: 'https://images.unsplash.com/photo-1622465911368-72162f8da3e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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
    companyLogoUrl: 'https://images.unsplash.com/photo-1619551734325-81aaf323686c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw3fHxjb21wYW55JTIwbG9nb3xlbnwwfHx8fDE3NTk3MjQ2OTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
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

export const blogPosts: Blog[] = [
  {
    id: '1',
    title: '5 Tips for a Standout Resume',
    author: 'Hiring Dekho Team',
    publicationDate: '2024-07-26',
    imageUrl: 'https://picsum.photos/seed/resume/1200/600',
    imageHint: 'resume document',
    content: `
      <h3>Introduction</h3>
      <p>Your resume is often the first impression you make on a potential employer. A well-crafted resume can open doors to interviews, while a poorly structured one can get lost in the pile. Here are five essential tips to ensure your resume stands out from the competition.</p>

      <h3>1. Tailor It to the Job Description</h3>
      <p>One of the biggest mistakes job seekers make is sending a generic resume to every employer. Instead, take the time to customize your resume for each specific job you apply for. Carefully read the job description, identify the key skills and qualifications the employer is looking for, and highlight how your experience aligns with those requirements. Use the same keywords found in the job description to get past automated Applicant Tracking Systems (ATS).</p>

      <h3>2. Start with a Powerful Summary</h3>
      <p>Forget the outdated "Objective" statement. Replace it with a compelling Professional Summary. This short paragraph (3-4 sentences) at the top of your resume should concisely highlight your most relevant qualifications, experience, and career goals. Think of it as your elevator pitch – it should be engaging and make the recruiter want to read more.</p>

      <h3>3. Quantify Your Achievements</h3>
      <p>Don't just list your responsibilities; showcase your accomplishments. Use numbers and data to quantify your impact. For example, instead of saying "Managed social media accounts," you could say "Grew social media engagement by 40% over six months by implementing a new content strategy." Quantifiable results provide concrete evidence of your abilities and value.</p>

      <h3>4. Keep It Clean and Readable</h3>
      <p>Recruiters spend only a few seconds scanning each resume. Make sure yours is easy to read. Use a clean, professional font (like Calibri, Arial, or Times New Roman), maintain consistent formatting, and use plenty of white space. Stick to a one-page resume if you have less than 10 years of experience. Use bullet points to break up large blocks of text and make your accomplishments easy to scan.</p>

      <h3>5. Proofread Meticulously</h3>
      <p>Typos and grammatical errors are a major red flag for employers. They suggest a lack of attention to detail. Before you send your resume, proofread it multiple times. Read it aloud, have a friend or family member review it, and consider using a grammar-checking tool like Grammarly. A flawless resume demonstrates professionalism and care.</p>
    `,
  },
  {
    id: '2',
    title: 'How to Ace Your Next Remote Interview',
    author: 'Priya Desai',
    publicationDate: '2024-07-24',
    imageUrl: 'https://picsum.photos/seed/interview/1200/600',
    imageHint: 'video conference',
    content: `
      <h3>The New Normal of Hiring</h3>
      <p>Remote interviews have become a standard part of the hiring process for many companies. While they offer convenience, they also present unique challenges. Here’s how you can prepare to ace your next virtual interview.</p>
      
      <h3>1. Test Your Tech</h3>
      <p>Technical glitches can derail an interview before it even starts. A day or two before the interview, test your setup. Check your internet connection, camera, and microphone. Make sure you have the correct software (Zoom, Google Meet, etc.) installed and are familiar with its basic functions. Do a test call with a friend to ensure everything works smoothly.</p>

      <h3>2. Create a Professional Environment</h3>
      <p>Your background matters. Choose a quiet, well-lit space free from distractions. A clean, neutral background is best. A tidy bookshelf or a simple wall is much better than a cluttered room. Ensure that pets, family members, or roommates won't interrupt you during the call. Dress professionally, just as you would for an in-person interview.</p>
      
      <h3>3. Practice Your Non-Verbal Cues</h3>
      <p>It can be harder to convey enthusiasm and engagement through a screen. Practice maintaining eye contact by looking directly into the camera, not at the screen image of yourself or the interviewer. Sit up straight, smile, and use hand gestures naturally. Active listening is key—nod and provide verbal affirmations to show you're paying attention.</p>
      
      <h3>4. Be Prepared for Common Questions</h3>
      <p>Just like any interview, preparation is crucial. Research the company and the role thoroughly. Prepare answers to common interview questions, including behavioral questions that start with "Tell me about a time when...". Also, have a list of thoughtful questions to ask the interviewer. This shows your genuine interest in the role and the company.</p>
    `,
  },
  {
    id: '3',
    title: 'Navigating the Indian Job Market in 2024',
    author: 'Aditya Verma',
    publicationDate: '2024-07-22',
    imageUrl: 'https://picsum.photos/seed/market/1200/600',
    imageHint: 'city skyline',
    content: `
      <h3>Current Trends</h3>
      <p>The Indian job market is dynamic and constantly evolving. In 2024, several sectors are experiencing rapid growth, driven by technological advancements and shifting economic priorities. The IT and tech sectors continue to be major employers, with high demand for professionals in AI/ML, data science, cybersecurity, and cloud computing. The rise of digital infrastructure is also fueling growth in ed-tech, fin-tech, and e-commerce.</p>

      <h3>In-Demand Skills</h3>
      <p>Beyond technical skills, employers are increasingly looking for soft skills. Communication, critical thinking, problem-solving, and adaptability are highly valued. The ability to work in a hybrid or remote setup is also a key competency. Upskilling and continuous learning are more important than ever. Certifications in trending technologies or project management methodologies (like Agile) can give you a significant edge.</p>

      <h3>The Gig Economy</h3>
      <p>The gig economy is no longer a niche segment. Freelancing and contract-based work are becoming mainstream career choices in India. Platforms that connect freelancers with projects are booming. This model offers flexibility but also requires strong self-discipline, financial planning, and networking skills. If you have a specialized skill, exploring the gig economy can be a lucrative and empowering career path.</p>
    `,
  },
];

    