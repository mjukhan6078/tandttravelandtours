"use client";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden pt-28 pb-16 md:pb-24"
    >
      {/* Full-bleed background */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: "easeOut" }}
        >
          <Image
            src="/makka.jpg"
            alt="Kaaba in Makkah"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </motion.div>
        {/* Keep image dominant; darken only where copy sits */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/45 to-primary/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-transparent to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative z-10 w-full">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="font-heading text-secondary text-2xl sm:text-3xl md:text-4xl font-semibold tracking-wide mb-3 md:mb-4"
          >
            T&T Travel and Tours
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
            className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] text-primary-foreground mb-5 md:mb-6"
          >
            Your sacred Umrah journey awaits
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.24 }}
            className="text-base sm:text-lg md:text-xl text-primary-foreground/85 max-w-xl mb-8 md:mb-10 leading-relaxed"
          >
            Plan Makkah and Madina your way — trusted guidance for a peaceful pilgrimage.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: "easeOut", delay: 0.36 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Button
              size="lg"
              className="h-12 px-8 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-black/20"
              asChild
            >
              <a href="#plan-your-trip">Plan Your Trip</a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 px-8 text-base border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              asChild
            >
              <a href="#contact">Contact</a>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Soft bottom fade into page */}
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-background to-transparent z-[1]" />
    </section>
  );
}
