"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import AnimatedSection from "./AnimatedSection";
import { motion } from "framer-motion";

const packages = [
  {
    id: "umrah-economy",
    title: "Economy Umrah Package",
    description: "Affordable spiritual journey",
    image: "/packages/up1.jpg",
  },
  {
    id: "umrah-standard",
    title: "Standard Umrah Package",
    description: "Comfortable and convenient",
    image: "/packages/up2.jpg",
  },
  {
    id: "umrah-deluxe",
    title: "Deluxe Umrah Package",
    description: "Premium experience",
    image: "/packages/up3.jpg",
  },
  {
    id: "umrah-vip",
    title: "VIP Umrah Package",
    description: "Ultimate luxury",
    image: "/packages/up4.jpg",
  },
  {
    id: "umrah-family",
    title: "Family Umrah Package",
    description: "Perfect for families",
    image: "/packages/up5.jpg",
  },
];

export default function PackagesGallery() {
  return (
    <section id="packages-gallery" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Umrah Packages</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Choose the perfect package for your spiritual journey
            </p>
          </div>
        </AnimatedSection>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <AnimatedSection key={pkg.id} delay={idx * 0.1}>
              <motion.div
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group h-full">
                  <div className="relative h-96">
                    <Image
                      src={pkg.image}
                      alt={pkg.title}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <div className="w-full">
                        <p className="text-white text-sm mb-3">{pkg.description}</p>
                        <Link href={`/packages/${pkg.id}`}>
                          <Button variant="secondary" className="w-full">
                            See More
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}
