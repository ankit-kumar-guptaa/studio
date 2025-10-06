import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfUsePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Terms of Use"
          description="Please read these terms carefully before using our service."
        />
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <Card>
            <CardContent className="prose max-w-none p-8 dark:prose-invert">
              <h2>1. Agreement to Terms</h2>
              <p>
                By using our services, you agree to be bound by these Terms. If you don’t agree to be bound by these Terms, do not use the Services.
              </p>

              <h2>2. Description of Service</h2>
              <p>
                Hiring Dekho provides a platform for job seekers to post their resumes and search for job openings, and for employers to post job openings and search for candidates.
              </p>

              <h2>3. User Accounts</h2>
              <p>
                When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
              </p>
              
              <h2>4. User Responsibilities</h2>
              <p>
                You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password. You agree not to disclose your password to any third party.
              </p>
              
              <h2>5. Intellectual Property</h2>
              <p>
                The Service and its original content, features and functionality are and will remain the exclusive property of Hiring Dekho and its licensors.
              </p>
              
              <h2>6. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
              </p>

              <h2>7. Limitation of Liability</h2>
              <p>
                In no event shall Hiring Dekho, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
              
              <h2>8. Changes to Terms</h2>
              <p>
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
