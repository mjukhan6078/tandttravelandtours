import Image from "next/image";
import Link from "next/link";

const WHATSAPP_URL = "https://wa.me/923002062324";
const WHATSAPP_DISPLAY = "+92 300 2062324";

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12 md:py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Link href="#home" className="inline-flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.png"
                alt="T&T Travel and Tours"
                width={44}
                height={44}
                className="object-contain brightness-0 invert h-11 w-11"
              />
              <span className="text-xl font-heading font-semibold">
                T&T Travel and Tours
              </span>
            </Link>
            <p className="text-sm text-primary-foreground/70 max-w-sm leading-relaxed">
              Trusted Umrah planning — flights, hotels, visa, ziaraat, and transport.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-secondary mb-4">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="#services" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="#plan-your-trip" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Plan Your Trip
                </Link>
              </li>
              <li>
                <Link href="#contact" className="text-primary-foreground/75 hover:text-primary-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wide uppercase text-secondary mb-4">
              WhatsApp
            </h4>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary-foreground hover:text-secondary transition-colors"
            >
              {WHATSAPP_DISPLAY}
            </a>
            <p className="mt-2 text-sm text-primary-foreground/65">
              Tap to chat for trip queries
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-primary-foreground/55">
          <p>&copy; {new Date().getFullYear()} T&T Travel and Tours</p>
          <p>Umrah · Hotels · Visa · Ziaraat · Transport</p>
        </div>
      </div>
    </footer>
  );
}
