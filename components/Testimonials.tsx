import AnimatedSection from "./AnimatedSection";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Ahmed Khan",
      location: "Karachi, Pakistan",
      text: "Amazing experience! The team took care of everything. Highly recommended for anyone planning Umrah.",
      rating: 5,
    },
    {
      name: "Fatima Ali",
      location: "Lahore, Pakistan",
      text: "Best service ever! Everything was perfectly organized. Will definitely book again.",
      rating: 5,
    },
    {
      name: "Muhammad Hassan",
      location: "Islamabad, Pakistan",
      text: "Professional and reliable. Made our spiritual journey truly memorable.",
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Pilgrims Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Real experiences from real people
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.15}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-500">⭐</span>
                    ))}
                  </div>
                  <p className="text-muted-foreground italic">"{testimonial.text}"</p>
                </CardContent>
                <CardFooter>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${testimonial.name}`} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
