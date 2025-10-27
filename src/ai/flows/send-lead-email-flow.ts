'use server';
/**
 * @fileOverview A Genkit flow to send an email with lead capture data.
 *
 * - sendLeadEmail - A function that takes form data and sends it via email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as nodemailer from 'nodemailer';

// Define the schema for the input data
const jobSeekerSchema = z.object({
    role: z.literal('job-seeker'),
    jobSeekerName: z.string().min(1, 'Name is required.'),
    jobSeekerEmail: z.string().email('Invalid email address.'),
    jobSeekerPhone: z.string().optional(),
    jobSeekerSkills: z.string().optional(),
    resume: z.string().optional(),
    resumeFilename: z.string().optional(),
});

const employerSchema = z.object({
    role: z.literal('employer'),
    companyName: z.string().min(1, 'Company name is required.'),
    contactPerson: z.string().optional(),
    employerEmail: z.string().email('Invalid email address.'),
    employerPhone: z.string().optional(),
    hiringNeeds: z.string().optional(),
});

const LeadDataSchema = z.discriminatedUnion('role', [
    jobSeekerSchema,
    employerSchema
]);


type LeadData = z.infer<typeof LeadDataSchema>;

// Export a wrapper function to be called from the client
export async function sendLeadEmail(data: LeadData): Promise<{ success: boolean }> {
  return sendLeadEmailFlow(data);
}

// Define the Genkit flow
const sendLeadEmailFlow = ai.defineFlow(
  {
    name: 'sendLeadEmailFlow',
    inputSchema: LeadDataSchema,
    outputSchema: z.object({ success: z.boolean() }),
  },
  async (data) => {
    // IMPORTANT: Use environment variables for credentials in a real app
    // For this example, we'll use Gmail with App Password.
    // Ensure you have enabled 2-Step Verification and created an App Password for your Google account.
    // Store them in a .env.local file:
    // GMAIL_USER=your_email@gmail.com
    // GMAIL_APP_PASSWORD=your_16_character_app_password
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('Gmail credentials are not set in environment variables (GMAIL_USER, GMAIL_APP_PASSWORD).');
        throw new Error('Email service is not configured. Please set credentials in .env file.');
    }
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const toEmail = 'theankitkumarg@gmail.com';
    const subject = `New Lead from Hiring Dekho: ${data.role === 'job-seeker' ? 'Job Seeker' : 'Employer'}`;

    let htmlContent = `<h1>New Lead Submission</h1><p>A new lead has been captured from the website popup form.</p>`;
    let attachments: nodemailer.Attachment[] = [];

    if (data.role === 'job-seeker') {
      htmlContent += `
        <h2>Job Seeker Details:</h2>
        <ul>
          <li><strong>Name:</strong> ${data.jobSeekerName || 'N/A'}</li>
          <li><strong>Email:</strong> ${data.jobSeekerEmail || 'N/A'}</li>
          <li><strong>Phone:</strong> ${data.jobSeekerPhone || 'N/A'}</li>
          <li><strong>Skills/Interests:</strong> ${data.jobSeekerSkills || 'N/A'}</li>
        </ul>
      `;
      if (data.resume && data.resumeFilename) {
          attachments.push({
              filename: data.resumeFilename,
              content: data.resume.split('base64,')[1],
              encoding: 'base64',
              contentType: data.resume.substring(data.resume.indexOf(':') + 1, data.resume.indexOf(';')),
          });
      }
    } else {
      htmlContent += `
        <h2>Employer Details:</h2>
        <ul>
          <li><strong>Company Name:</strong> ${data.companyName || 'N/A'}</li>
          <li><strong>Contact Person:</strong> ${data.contactPerson || 'N/A'}</li>
          <li><strong>Email:</strong> ${data.employerEmail || 'N/A'}</li>
          <li><strong>Phone:</strong> ${data.employerPhone || 'N/A'}</li>
          <li><strong>Hiring For:</strong> ${data.hiringNeeds || 'N/A'}</li>
        </ul>
      `;
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Hiring Dekho Leads" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject: subject,
      html: htmlContent,
      attachments: attachments,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      // In a real-world scenario, you might want to throw a more specific error
      throw new Error('Failed to send email.');
    }
  }
);
