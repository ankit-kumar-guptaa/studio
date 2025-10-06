import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Privacy Policy"
          description="Your privacy is important to us. Last updated: July 26, 2024"
        />
        <div className="container mx-auto max-w-4xl px-4 py-16">
          <Card>
            <CardContent className="prose max-w-none p-8 dark:prose-invert">
              <p>
                Welcome to Hiring Dekho. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at privacy@hiringdekho.com.
              </p>
              
              <h2>1. Information We Collect</h2>
              <p>
                We collect personal information that you voluntarily provide to us when you register on the website, express an interest in obtaining information about us or our products and services, when you participate in activities on the website or otherwise when you contact us.
              </p>
              <p>The personal information that we collect depends on the context of your interactions with us and the website, the choices you make and the products and features you use. The personal information we collect may include the following:</p>
              <ul>
                <li><strong>Personal Information Provided by You.</strong> We collect names; phone numbers; email addresses; passwords; job titles; contact preferences; contact or authentication data; billing addresses; and other similar information.</li>
                <li><strong>Resume Data.</strong> We collect data you provide in your resume, including professional experience, skills, education, and accomplishments.</li>
              </ul>
              
              <h2>2. How We Use Your Information</h2>
              <p>
                We use personal information collected via our website for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
              </p>
              <ul>
                  <li>To facilitate account creation and logon process.</li>
                  <li>To post testimonials on our website.</li>
                  <li>To manage user accounts.</li>
                  <li>To send administrative information to you.</li>
                  <li>To protect our Services.</li>
                  <li>To respond to user inquiries/offer support to users.</li>
              </ul>

              <h2>3. Will Your Information Be Shared With Anyone?</h2>
              <p>
                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Specifically, we may share your profile and resume data with potential employers when you apply for a job.
              </p>

              <h2>4. How We Keep Your Information Safe</h2>
              <p>
                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
              </p>

              <h2>5. Your Privacy Rights</h2>
              <p>
                In some regions, you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
