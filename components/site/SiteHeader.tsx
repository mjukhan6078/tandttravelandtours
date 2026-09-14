"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mainNav } from "@/lib/site/nav";
import { SITE_NAME } from "@/lib/site/contact";
import { useInquire } from "./InquireContext";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();
  const { setOpen } = useInquire();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setGalleryOpen(false);
  }, [pathname]);

  const linkClass = (href: string) =>
    cn(
      "text-xs font-semibold uppercase tracking-wide text-white/90 hover:text-white hover:underline underline-offset-4 transition-colors",
      pathname === href && "text-white underline"
    );

  return (
    <header
      className={cn(
        "bg-[var(--header)] text-[var(--header-foreground)] transition-shadow",
        scrolled && "shadow-lg"
      )}
    >
      <div className="mx-auto flex max-w-[1170px] items-center justify-between gap-4 px-4 py-2">
        <Link href="/" className="flex shrink-0 items-center" aria-label={SITE_NAME}>
          <Image
            src="/images/logo.png"
            alt={SITE_NAME}
            width={220}
            height={96}
            className="h-12 w-auto object-contain sm:h-14"
            priority
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-3 xl:gap-4" aria-label="Main">
          {mainNav.map((item) =>
            item.children ? (
              <div key={item.href} className="relative group">
                <Link href={item.href} className={cn(linkClass(item.href), "inline-flex items-center gap-1")}>
                  {item.label}
                  <ChevronDown className="size-3.5 opacity-80" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 min-w-[220px] pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="rounded border border-white/10 bg-[var(--header)] py-2 shadow-lg">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="block px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/90 hover:bg-[var(--primary-hover)] hover:text-white"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            className="hidden md:inline-flex bg-secondary text-secondary-foreground hover:bg-secondary/90 font-semibold uppercase text-xs"
          >
            <Link href="/get-a-quote">Get a Quote</Link>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="hidden md:inline-flex border-white/40 bg-transparent text-white hover:bg-white/10 font-semibold uppercase text-xs"
            onClick={() => setOpen(true)}
          >
            Inquire Now
          </Button>
          <button
            type="button"
            className="lg:hidden rounded p-2 text-white hover:bg-white/10"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-white/15 bg-[var(--header)] px-4 pb-4">
          <ul className="flex flex-col gap-1 py-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <div>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between py-2 text-left text-sm font-semibold uppercase tracking-wide text-white"
                      onClick={() => setGalleryOpen((v) => !v)}
                      aria-expanded={galleryOpen}
                    >
                      {item.label}
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          galleryOpen && "rotate-180"
                        )}
                      />
                    </button>
                    {galleryOpen && (
                      <ul className="mb-2 ml-3 border-l border-white/20 pl-3">
                        <li>
                          <Link
                            href={item.href}
                            className="block py-1.5 text-xs uppercase text-white/85"
                          >
                            All galleries
                          </Link>
                        </li>
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className="block py-1.5 text-xs uppercase text-white/85"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <Link
                    href={item.href}
                    className="block py-2 text-sm font-semibold uppercase tracking-wide text-white"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 pt-2">
            <Button asChild className="bg-secondary text-secondary-foreground font-semibold uppercase">
              <Link href="/get-a-quote">Get a Quote</Link>
            </Button>
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10 font-semibold uppercase"
              onClick={() => {
                setMobileOpen(false);
                setOpen(true);
              }}
            >
              Inquire Now
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
