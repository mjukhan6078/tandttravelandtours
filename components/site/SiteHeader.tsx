"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, ChevronDown, Menu, Phone, Send, X } from "lucide-react";
import { mainNav } from "@/lib/site/nav";
import { PHONE_TEL, SITE_NAME, WHATSAPP_DISPLAY } from "@/lib/site/contact";
import { useInquire } from "./InquireContext";
import { cn } from "@/lib/utils";

export default function SiteHeader() {
  const pathname = usePathname();
  const { setOpen } = useInquire();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [subOpen, setSubOpen] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setSubOpen(null);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-border/70 bg-white/85 shadow-[0_8px_30px_-12px_rgba(10,31,68,0.25)] backdrop-blur-xl"
          : "border-transparent bg-white"
      )}
    >
      <div
        className={cn(
          "container-site flex items-center justify-between gap-4 transition-all duration-300",
          scrolled ? "h-16" : "h-20"
        )}
      >
        <Link href="/" className="flex shrink-0 items-center" aria-label={SITE_NAME}>
          <Image
            src="/images/logo.png"
            alt={SITE_NAME}
            width={758}
            height={329}
            className={cn("w-auto object-contain transition-all duration-300", scrolled ? "h-11" : "h-14")}
            preload
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {mainNav.map((item) =>
            item.children ? (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-primary",
                    isActive(item.href) && "text-primary"
                  )}
                >
                  {item.label}
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-1/2 top-full z-50 w-[420px] -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <ul className="grid gap-1 rounded-2xl border border-border bg-white p-2 shadow-2xl shadow-navy/10">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="group/item flex items-center justify-between gap-3 rounded-xl px-4 py-3 transition hover:bg-secondary"
                        >
                          <span>
                            <span className="block text-sm font-semibold text-foreground group-hover/item:text-primary">
                              {child.label}
                            </span>
                            {child.desc && (
                              <span className="block text-xs text-muted-foreground">{child.desc}</span>
                            )}
                          </span>
                          <ArrowUpRight className="size-4 text-muted-foreground opacity-0 transition group-hover/item:translate-x-0.5 group-hover/item:text-primary group-hover/item:opacity-100" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-semibold text-foreground/80 transition hover:bg-secondary hover:text-primary",
                  isActive(item.href) && "text-primary"
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-cta"
                  />
                )}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={PHONE_TEL}
            className="hidden items-center gap-2.5 rounded-full py-1 pl-1 pr-3 transition hover:bg-secondary xl:flex"
          >
            <span className="grid size-9 place-items-center rounded-full bg-cta/10 text-cta">
              <Phone className="size-4" />
            </span>
            <span className="leading-tight">
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Talk to an expert
              </span>
              <span className="block text-sm font-bold text-foreground">{WHATSAPP_DISPLAY}</span>
            </span>
          </a>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="hidden items-center gap-2 rounded-full bg-cta px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-cta/30 transition hover:-translate-y-0.5 hover:bg-cta-hover md:inline-flex"
          >
            <Send className="size-4" />
            Plan my trip
          </button>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full border border-border text-foreground transition hover:bg-secondary lg:hidden"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "calc(100dvh - 4rem)" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-y-auto border-t border-border bg-white lg:hidden"
          >
            <ul className="container-site flex flex-col gap-1 py-4">
              {mainNav.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.03 * i }}
                >
                  {item.children ? (
                    <div>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-base font-semibold text-foreground hover:bg-secondary"
                        onClick={() => setSubOpen((v) => (v === item.href ? null : item.href))}
                        aria-expanded={subOpen === item.href}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn("size-4 transition-transform", subOpen === item.href && "rotate-180")}
                        />
                      </button>
                      {subOpen === item.href && (
                        <ul className="mb-2 ml-4 border-l-2 border-secondary pl-3">
                          <li>
                            <Link href={item.href} className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-primary">
                              All {item.label.toLowerCase()}
                            </Link>
                          </li>
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
                                className="block rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-primary"
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
                      className={cn(
                        "block rounded-xl px-4 py-3 text-base font-semibold text-foreground hover:bg-secondary",
                        isActive(item.href) && "bg-secondary text-primary"
                      )}
                    >
                      {item.label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
            <div className="container-site grid gap-3 pb-8">
              <button
                type="button"
                onClick={() => {
                  setMobileOpen(false);
                  setOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-cta px-5 py-3 font-bold text-white"
              >
                <Send className="size-4" /> Plan my trip
              </button>
              <a
                href={PHONE_TEL}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-5 py-3 font-semibold text-foreground"
              >
                <Phone className="size-4" /> {WHATSAPP_DISPLAY}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
