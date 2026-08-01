"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center pt-36 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/makka.jpg"
          alt="Kaaba in Makkah"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/60 to-background/90" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground drop-shadow-lg">
              Your Sacred Umrah Journey Awaits
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 drop-shadow-md"
          >
            Experience spiritual fulfillment with our premium Umrah packages.
            Trusted by thousands of pilgrims for over a decade.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90" asChild>
              <a href="#plan-your-trip">Plan Your Trip</a>
            </Button>
            <Button size="lg" variant="outline" className="border-primary/40 bg-background/60 backdrop-blur-sm text-primary hover:bg-primary hover:text-primary-foreground" asChild>
              <a href="#contact">Contact</a>
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
