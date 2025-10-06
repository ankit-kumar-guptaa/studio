import Image from 'next/image';
import { testimonials } from '@/lib/data';
import { findImage } from '@/lib/placeholder-images';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-background py-16 sm:py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Success Stories from Our Users
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how Hiring Dekho is making a difference in people's careers.
          </p>
        </div>
        <Carousel
          opts={{
            align: 'start',
            loop: true,
          }}
          className="mx-auto mt-12 w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-4xl"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => {
              const avatarImage = findImage(testimonial.avatar);
              return (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex h-full flex-col justify-between p-6">
                        <blockquote className="italic text-muted-foreground">
                          “{testimonial.quote}”
                        </blockquote>
                        <div className="mt-6 flex items-center gap-4">
                          {avatarImage && (
                            <Image
                              src={avatarImage.imageUrl}
                              alt={testimonial.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-full object-cover"
                              data-ai-hint={avatarImage.imageHint}
                            />
                          )}
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-primary">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>
    </section>
  );
}
