import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-resume-flow.ts';
import '@/ai/flows/generate-job-description-flow.ts';
import '@/ai/flows/recommend-relevant-jobs.ts';
import '@/ai/flows/send-lead-email-flow.ts';