import AnimatedSection from "./AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Services() {
  const services = [
    {
      title: "Book Tickets",
      icon: "✈️",
      description: "Secure your flights with the best deals available",
    },
    {
      title: "Apply Visa",
      icon: "📋",
      description: "Hassle-free visa application process",
    },
    {
      title: "Book Hotel",
      icon: "🏨",
      description: "Find the perfect accommodation for your stay",
    },
  ];

  return (
    <section id="services" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive services to make your journey smooth
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <AnimatedSection key={idx} delay={idx * 0.15}>
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-5xl mb-4">{service.icon}</div>
                  <CardTitle>{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
