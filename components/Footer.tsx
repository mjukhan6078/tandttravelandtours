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
                  className="object-contain brightness-0 invert h-auto"
                />
              <span className="text-2xl font-bold">T&T Travel</span>
            </div>
            <p className="text-primary-foreground/80">
              Your trusted partner for spiritual journeys and travel adventures.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6">Get Started</h4>
            <ul className="space-y-3">
              <li><Link href="#plan-your-trip" className="text-primary-foreground/80 hover:text-white">Plan Your Trip</Link></li>
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
