import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const packages = {
  "umrah-economy": {
    title: "Economy Umrah Package",
    description: "Affordable spiritual journey to Makkah and Madina",
    image: "/packages/up1.jpg",
    price: "$1,500",
    duration: "10 Days",
  },
  "umrah-standard": {
    title: "Standard Umrah Package",
    description: "Comfortable and convenient spiritual journey",
    image: "/packages/up2.jpg",
    price: "$2,500",
    duration: "12 Days",
  },
  "umrah-deluxe": {
    title: "Deluxe Umrah Package",
    description: "Premium Umrah experience",
    image: "/packages/up3.jpg",
    price: "$3,800",
    duration: "14 Days",
  },
  "umrah-vip": {
    title: "VIP Umrah Package",
    description: "Ultimate luxury spiritual experience",
    image: "/packages/up4.jpg",
    price: "$6,500",
    duration: "16 Days",
  },
  "umrah-family": {
    title: "Family Umrah Package",
    description: "Perfect for family spiritual journey",
    image: "/packages/up5.jpg",
    price: "$4,200 (family of 4)",
    duration: "12 Days",
  },
};

export default async function PackageDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = packages[id as keyof typeof packages];

  if (!pkg) {
    notFound();
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/#packages-gallery" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative h-[480px]">
            <Image
              src={pkg.image}
              alt={pkg.title}
              fill
              className="object-contain rounded-lg"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-4">{pkg.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{pkg.description}</p>
            <div className="flex items-baseline gap-4 mb-10">
              <span className="text-4xl font-bold text-primary">{pkg.price}</span>
              <span className="text-muted-foreground">{pkg.duration}</span>
            </div>

            <div className="flex gap-4">
              <Button size="lg" className="flex-1" asChild>
                <a href="/#contact">Book Now</a>
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" asChild>
                <a href="/#contact">Contact Us</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
