import AnimatedSection from "./AnimatedSection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, FileText, Hotel, Landmark, Bus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const services: {
  title: string;
  icon: LucideIcon;
  description: string;
}[] = [
  {
    title: "Book Tickets",
    icon: Plane,
    description: "Secure your flights with the best deals available",
  },
  {
    title: "Apply Visa",
    icon: FileText,
    description: "Hassle-free visa application process",
  },
  {
    title: "Book Hotel",
    icon: Hotel,
    description: "Find the perfect accommodation for your stay",
  },
  {
    title: "Ziaraat",
    icon: Landmark,
    description: "Guided ziyarat tours to sacred sites in Makkah and Madina",
  },
  {
    title: "Transport",
    icon: Bus,
    description: "Airport transfers and comfortable city-to-city transport",
  },
];

export default function Services() {
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <AnimatedSection key={service.title} delay={idx * 0.1}>
                <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                  <CardHeader>
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle>{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{service.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
