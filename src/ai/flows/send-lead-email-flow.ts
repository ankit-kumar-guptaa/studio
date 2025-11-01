'use server';
/**
 * @fileOverview A Genkit flow to send an email with lead capture data.
 *
 * - sendLeadEmail - A function that takes form data and sends it via email.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
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
    // Use environment variables for SMTP credentials.
    // In production, these must be set in your hosting environment (e.g., Firebase App Hosting secrets).
    // The .env file is only for local development.
    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP credentials are not set in environment variables (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS).');
        // This clear error message will help debug production issues.
        throw new Error('Email service is not configured. Please set SMTP credentials in your hosting environment.');
    }
    
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: Number(process.env.SMTP_PORT) === 465, // Use true for port 465, false for all other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const toEmail = 'theankitkumarg@gmail.com';
    const subject = `New Lead from Hiring Dekho: ${data.role === 'job-seeker' ? data.jobSeekerName : data.companyName}`;

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
      from: process.env.SMTP_FROM_EMAIL || `"Hiring Dekho Leads" <${process.env.SMTP_USER}>`,
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
      throw new Error('Failed to send email. Check your SMTP credentials and server connection.');
    }
  }
);
