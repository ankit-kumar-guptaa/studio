import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { findImage } from '@/lib/placeholder-images';

const teamMembers = [
  { name: 'Aditya Verma', role: 'CEO & Founder', avatarId: 'testimonial-avatar-2' },
  { name: 'Neha Singh', role: 'Chief Technology Officer', avatarId: 'testimonial-avatar-1' },
  { name: 'Rajat Kumar', role: 'Head of Product', avatarId: 'testimonial-avatar-2' },
  { name: 'Priya Desai', role: 'Marketing Director', avatarId: 'testimonial-avatar-3' },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="About Hiring Dekho"
          description="Connecting India's talent with the right opportunities."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold text-primary">Our Mission</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                To empower every Indian professional by providing a transparent, efficient, and accessible platform to find their desired career path. We aim to bridge the gap between talent and opportunity, fostering economic growth and individual success.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-primary">Our Vision</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                To become India's most trusted and widely used job portal, renowned for our commitment to user success, technological innovation, and deep understanding of the local job market. We envision a future where finding a job is a hopeful and empowering journey.
              </p>
            </div>
          </div>
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Meet the Team
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The passionate individuals behind Hiring Dekho.
            </p>
            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {teamMembers.map((member) => {
                const avatar = findImage(member.avatarId);
                return (
                  <Card key={member.name} className="text-center">
                    <CardContent className="p-6">
                      {avatar && (
                        <Image
                          src={avatar.imageUrl}
                          alt={member.name}
                          width={128}
                          height={128}
                          className="mx-auto h-32 w-32 rounded-full object-cover"
                          data-ai-hint={avatar.imageHint}
                        />
                      )}
                      <h3 className="mt-4 text-xl font-semibold">{member.name}</h3>
                      <p className="text-primary">{member.role}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
