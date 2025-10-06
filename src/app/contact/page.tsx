import Image from 'next/image';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Contact Us"
          description="We're here to help. Reach out to us with your questions or feedback."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
            <Card>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold">Send us a message</h3>
                <form className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Your Email" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Subject" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea id="message" placeholder="Your message..." rows={5} />
                  </div>
                  <Button type="submit" className="w-full gradient-saffron">Send Message</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold">Contact Information</h3>
                <div className="mt-4 space-y-4 text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <MapPin className="h-6 w-6 text-primary" />
                    <span>123 Tech Park, Bangalore, KA, India</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-primary" />
                    <span>contact@hiringdekho.com</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-primary" />
                    <span>+91 98765 43210</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <MessageCircle className="h-6 w-6 text-primary" />
                    <span className='flex items-center gap-2'>Chat on WhatsApp <Button size="sm" variant="link" className="p-0 h-auto">Click here</Button></span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Our Location</h3>
                <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border">
                  <Image src="https://picsum.photos/seed/map/600/400" alt="Map" width={600} height={400} className="h-full w-full object-cover" data-ai-hint="city map" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
