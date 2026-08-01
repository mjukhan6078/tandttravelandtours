"use client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const packages = [
  {
    id: "umrah-economy",
    name: "Economy Umrah",
    price: "$1,500",
    duration: "10 Days",
  },
  {
    id: "umrah-standard",
    name: "Standard Umrah",
    price: "$2,500",
    duration: "12 Days",
  },
  {
    id: "umrah-deluxe",
    name: "Deluxe Umrah",
    price: "$3,800",
    duration: "14 Days",
  },
];

export default function Packages() {
  return (
    <section id="packages" className="py-20">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Umrah Packages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our most popular Umrah packages
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <AnimatedSection key={pkg.id} delay={idx * 0.15}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="flex flex-col h-full border-primary/10">
                  <CardHeader>
                    <div className="text-sm text-muted-foreground mb-2">{pkg.duration}</div>
                    <CardTitle className="text-2xl">{pkg.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="text-3xl font-bold text-primary">{pkg.price}</div>
                  </CardContent>
                  <CardFooter className="flex gap-3">
                    <Link href={`/packages/${pkg.id}`} className="flex-1">
                      <Button className="w-full">View Details</Button>
                    </Link>
                    <Button variant="secondary" className="flex-1" asChild>
                      <a href="/#contact">Book Now</a>
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
