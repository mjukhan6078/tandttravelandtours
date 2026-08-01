"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        hasScrolled
          ? "bg-background/90 shadow-xl border-b border-secondary/20"
          : "bg-background/80 shadow-md"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/10 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between h-14">
          <Link href="/#home" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="T&T Travel and Tours"
              width={60}
              height={60}
              className="object-contain h-18 w-18"
            />
            <span className="text-xl font-bold text-primary font-heading">T&T Travel and Tours</span>
          </Link>

          <nav className="hidden md:flex items-center gap-3">
            <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg hover:shadow-xl transition-shadow">
              <a href="/#plan-your-trip">Plan Your Trip</a>
            </Button>
            <Button asChild variant="outline" className="border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
              <a href="/#contact">Contact</a>
            </Button>
          </nav>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-primary/10">
            <nav className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 w-full shadow-lg"
              >
                <a href="/#plan-your-trip" onClick={() => setIsMenuOpen(false)}>
                  Plan Your Trip
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full border-primary/30 text-primary">
                <a href="/#contact" onClick={() => setIsMenuOpen(false)}>
                  Contact
                </a>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
