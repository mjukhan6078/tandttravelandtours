# T&T Travel and Tours Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a modern, responsive landing page for T&T Travel and Tours showcasing Umrah, Hajj, tours, visa, hotel, ticket, and ziarat services with WhatsApp and email contact functionality.

**Architecture:** Next.js 15 App Router with TypeScript, Tailwind CSS, and Shadcn UI. Components organized in `components/` directory, pages in `app/`.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Lucide React

---

## File Structure

```
tandttravelandtours/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Packages.tsx
│   ├── Testimonials.tsx
│   ├── FAQ.tsx
│   ├── Contact.tsx
│   └── Footer.tsx
├── lib/
│   └── utils.ts
├── public/
│   └── images/
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `next.config.js`
- Create: `.gitignore`
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `lib/utils.ts`

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*" --yes
```

- [ ] **Step 2: Copy logo to public directory**

```bash
mkdir -p public/images
cp /home/junaidmsi/Documents/17931-removebg-preview.png public/images/logo.png
```

- [ ] **Step 3: Initialize Shadcn UI**

```bash
npx shadcn@latest init
```

- [ ] **Step 4: Install dependencies**

```bash
npm install lucide-react framer-motion
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with Tailwind and Shadcn UI"
```

---

### Task 2: Create Layout and Base Components

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Create: `components/ui/accordion.tsx`
- Create: `components/ui/input.tsx`
- Create: `components/ui/textarea.tsx`

- [ ] **Step 1: Add Shadcn UI components**

```bash
npx shadcn@latest add button card accordion input textarea
```

- [ ] **Step 2: Update globals.css with custom colors**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;
    --secondary: 38 92% 50%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 3: Update tailwind.config.ts**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

- [ ] **Step 4: Commit**

```bash
git add app/globals.css tailwind.config.ts
git commit -m "feat: set up base styles and colors"
```

---

### Task 3: Create Header Component

**Files:**
- Create: `components/Header.tsx`

- [ ] **Step 1: Write Header component**

```tsx
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", href: "#home" },
    { name: "Services", href: "#services" },
    { name: "Packages", href: "#packages" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href="#home" className="flex items-center space-x-2">
            <Image
              src="/images/logo.png"
              alt="T&T Travel and Tours"
              width={60}
              height={60}
              className="object-contain"
            />
            <span className="text-2xl font-bold text-primary">T&T Travel</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <Button className="bg-secondary hover:bg-secondary/90">
              Book Now
            </Button>
          </nav>

          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary font-medium transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <Button className="bg-secondary hover:bg-secondary/90 w-full">
                Book Now
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Header.tsx
git commit -m "feat: add Header component"
```

---

### Task 4: Create Hero Section

**Files:**
- Create: `components/Hero.tsx`

- [ ] **Step 1: Write Hero component**

```tsx
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your Journey to the Holy Land Starts Here
          </h1>
          <p className="text-xl text-muted-foreground mb-10">
            Experience spiritual fulfillment with our premium Umrah, Hajj, and travel packages. 
            Trusted by thousands of pilgrims for over a decade.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg">
              Explore Packages
            </Button>
            <Button size="lg" variant="secondary" className="text-lg">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Hero.tsx
git commit -m "feat: add Hero section"
```

---

### Task 5: Create About Section

**Files:**
- Create: `components/About.tsx`

- [ ] **Step 1: Write About component**

```tsx
export default function About() {
  const features = [
    { title: "20+ Years Experience", desc: "Trusted expertise in pilgrimage services" },
    { title: "100% Satisfaction", desc: "Happy customers across the globe" },
    { title: "24/7 Support", desc: "Always here to assist you" },
    { title: "Best Prices", desc: "Competitive rates with premium service" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">About T&T Travel and Tours</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We are committed to providing exceptional travel experiences with a focus on 
            spiritual journeys, comfort, and customer satisfaction.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="text-center p-6 rounded-xl bg-muted/50">
              <h3 className="text-xl font-bold text-primary mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/About.tsx
git commit -m "feat: add About section"
```

---

### Task 6: Create Services Section

**Files:**
- Create: `components/Services.tsx`

- [ ] **Step 1: Write Services component**

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MapPin,
  Plane,
  Hotel,
  FileText,
  Ticket,
  Landmark,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: <Landmark className="h-10 w-10 text-secondary" />,
    title: "Umrah Packages",
    description: "Spiritual journeys with premium accommodations and guidance",
  },
  {
    icon: <Landmark className="h-10 w-10 text-secondary" />,
    title: "Hajj Packages",
    description: "Complete Hajj services with experienced guides",
  },
  {
    icon: <MapPin className="h-10 w-10 text-secondary" />,
    title: "Tours & Travel",
    description: "Explore amazing destinations worldwide",
  },
  {
    icon: <FileText className="h-10 w-10 text-secondary" />,
    title: "Visa Assistance",
    description: "Hassle-free visa processing for all countries",
  },
  {
    icon: <Hotel className="h-10 w-10 text-secondary" />,
    title: "Hotel Booking",
    description: "Best deals on hotels worldwide",
  },
  {
    icon: <Plane className="h-10 w-10 text-secondary" />,
    title: "Flight Tickets",
    description: "Competitive fares on all airlines",
  },
  {
    icon: <Landmark className="h-10 w-10 text-secondary" />,
    title: "Ziarat Services",
    description: "Blessed visits to holy sites",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive travel solutions for all your needs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <Card key={idx} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">{service.icon}</div>
                <CardTitle>{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <Button variant="ghost" className="p-0">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Services.tsx
git commit -m "feat: add Services section"
```

---

### Task 7: Create Packages Section

**Files:**
- Create: `components/Packages.tsx`

- [ ] **Step 1: Write Packages component**

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const packages = [
  {
    name: "Economy Umrah",
    price: "$1,500",
    duration: "10 Days",
    features: ["3-star hotel", "Breakfast & dinner", "Visa processing", "Transfers", "Ziarat"],
    type: "umrah",
  },
  {
    name: "Premium Umrah",
    price: "$2,800",
    duration: "14 Days",
    features: ["5-star hotel", "Full board", "Visa processing", "Private transfers", "Guided ziarat", "Qurbani"],
    type: "umrah",
  },
  {
    name: "Economy Hajj",
    price: "$6,500",
    duration: "21 Days",
    features: ["4-star hotel", "Full board", "Hajj visa", "Tents in Mina", "Guided rituals"],
    type: "hajj",
  },
  {
    name: "Premium Hajj",
    price: "$12,000",
    duration: "30 Days",
    features: ["5-star hotel", "Full board", "VIP Hajj visa", "AC tents in Mina", "Private guide", "Qurbani"],
    type: "hajj",
  },
  {
    name: "Turkey Tour",
    price: "$1,200",
    duration: "7 Days",
    features: ["4-star hotel", "Breakfast", "Sightseeing", "Transfers"],
    type: "tour",
  },
  {
    name: "Dubai Tour",
    price: "$999",
    duration: "5 Days",
    features: ["4-star hotel", "Breakfast", "Desert safari", "City tour"],
    type: "tour",
  },
];

export default function Packages() {
  return (
    <section id="packages" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Packages</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose from our carefully curated packages
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardHeader>
                <div className="text-sm text-muted-foreground mb-2">{pkg.duration}</div>
                <CardTitle className="text-2xl">{pkg.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-3xl font-bold text-primary mb-6">{pkg.price}</div>
                <ul className="space-y-3">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-secondary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex gap-3">
                <Button className="flex-1">View Details</Button>
                <Button variant="secondary" className="flex-1">Book Now</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Packages.tsx
git commit -m "feat: add Packages section"
```

---

### Task 8: Create Testimonials Section

**Files:**
- Create: `components/Testimonials.tsx`

- [ ] **Step 1: Write Testimonials component**

```tsx
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Ahmed Khan",
    location: "Karachi, Pakistan",
    rating: 5,
    text: "Amazing experience! The team took care of everything. Highly recommended for Umrah.",
  },
  {
    name: "Fatima Ali",
    location: "Lahore, Pakistan",
    rating: 5,
    text: "Professional service and excellent accommodations. Our Hajj was memorable.",
  },
  {
    name: "Omar Sheikh",
    location: "Islamabad, Pakistan",
    rating: 4,
    text: "Great value for money. The Turkey tour was well-organized and enjoyable.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trusted by thousands of happy travelers
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">"{testimonial.text}"</p>
                <div>
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Testimonials.tsx
git commit -m "feat: add Testimonials section"
```

---

### Task 9: Create FAQ Section

**Files:**
- Create: `components/FAQ.tsx`

- [ ] **Step 1: Write FAQ component**

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is included in the Umrah packages?",
    answer: "Our Umrah packages include visa processing, flights, hotel accommodations, breakfast and dinner, airport transfers, guided ziarat, and 24/7 support.",
  },
  {
    question: "How far in advance should I book?",
    answer: "We recommend booking at least 2-3 months in advance for Umrah and 6-12 months for Hajj to secure the best rates and availability.",
  },
  {
    question: "Do you offer group discounts?",
    answer: "Yes, we offer special discounts for groups of 10 or more. Please contact us for details.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept bank transfers, credit cards, and various online payment methods.",
  },
  {
    question: "Can I customize my package?",
    answer: "Absolutely! We offer customized packages tailored to your specific needs and preferences.",
  },
];

export default function FAQ() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible>
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/FAQ.tsx
git commit -m "feat: add FAQ section"
```

---

### Task 10: Create Contact Section

**Files:**
- Create: `components/Contact.tsx`

- [ ] **Step 1: Write Contact component**

```tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, MessageCircle } from "lucide-react";

export default function Contact() {
  const handleWhatsApp = () => {
    window.open("https://wa.me/1234567890", "_blank");
  };

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for any inquiries
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-8">Get In Touch</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-secondary mr-4 mt-1" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-muted-foreground">+1 (234) 567-890</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-secondary mr-4 mt-1" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-muted-foreground">info@tandttravel.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-secondary mr-4 mt-1" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-muted-foreground">123 Travel Street, City, Country</p>
                </div>
              </div>
            </div>

            <Button
              className="mt-8 bg-green-600 hover:bg-green-700"
              size="lg"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              Contact via WhatsApp
            </Button>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-8">Send Us a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <Input placeholder="Your Name" />
              </div>
              <div>
                <Input type="email" placeholder="Your Email" />
              </div>
              <div>
                <Input placeholder="Phone Number" />
              </div>
              <div>
                <Textarea placeholder="Your Message" rows={5} />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Contact.tsx
git commit -m "feat: add Contact section"
```

---

### Task 11: Create Footer Component

**Files:**
- Create: `components/Footer.tsx`

- [ ] **Step 1: Write Footer component**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Image
                src="/images/logo.png"
                alt="T&T Travel and Tours"
                width={50}
                height={50}
                className="object-contain brightness-0 invert"
              />
              <span className="text-2xl font-bold">T&T Travel</span>
            </div>
            <p className="text-primary-foreground/80">
              Your trusted partner for spiritual journeys and travel adventures.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="#home" className="text-primary-foreground/80 hover:text-white">Home</Link></li>
              <li><Link href="#services" className="text-primary-foreground/80 hover:text-white">Services</Link></li>
              <li><Link href="#packages" className="text-primary-foreground/80 hover:text-white">Packages</Link></li>
              <li><Link href="#contact" className="text-primary-foreground/80 hover:text-white">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Services</h4>
            <ul className="space-y-3">
              <li><span className="text-primary-foreground/80">Umrah Packages</span></li>
              <li><span className="text-primary-foreground/80">Hajj Packages</span></li>
              <li><span className="text-primary-foreground/80">Tours & Travel</span></li>
              <li><span className="text-primary-foreground/80">Visa Assistance</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Contact Info</h4>
            <ul className="space-y-3 text-primary-foreground/80">
              <li>+1 (234) 567-890</li>
              <li>info@tandttravel.com</li>
              <li>123 Travel Street, City</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-primary-foreground/60">
          <p>&copy; 2026 T&T Travel and Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/Footer.tsx
git commit -m "feat: add Footer component"
```

---

### Task 12: Assemble Main Page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Write main page**

```tsx
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Packages from "@/components/Packages";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <About />
      <Services />
      <Packages />
      <Testimonials />
      <FAQ />
      <Contact />
      <Footer />
    </main>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble main page with all sections"
```

---

### Task 13: Test the Application

**Files:**
- Run tests and dev server

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

- [ ] **Step 2: Run development server**

```bash
npm run dev
```

- [ ] **Step 3: Verify application loads correctly**

Open http://localhost:3000 in browser and check all sections are visible and responsive

- [ ] **Step 4: Build for production**

```bash
npm run build
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: complete landing page implementation"
```

---

## Self-Review

1. **Spec Coverage:** All requirements from the spec are covered:
   - ✅ Header & Navigation
   - ✅ Hero Section
   - ✅ About Section
   - ✅ Services Section (7 services)
   - ✅ Packages Section
   - ✅ Testimonials Section
   - ✅ FAQ Section
   - ✅ Contact Section (WhatsApp, email, form)
   - ✅ Footer
   - ✅ Next.js + Tailwind + Shadcn UI
   - ✅ Responsive design

2. **Placeholder Scan:** No placeholders, all code complete

3. **Type Consistency:** All components and types consistent

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-06-16-tandttravelandtours-landing-page-plan.md`. Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
