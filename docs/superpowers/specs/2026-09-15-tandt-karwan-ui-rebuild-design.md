# T&T Public Site Rebuild — Design Spec

**Date:** 2026-09-15  
**Status:** Approved  

## Overview

Rebuild [tandttravelandtours](.) as a **public-only** Next.js marketing site for **T&T Travel and Tours**, adopting the Karwan-e-Hira crawl’s information architecture and green UI system while keeping T&T branding and real content only.

## Decisions

| Topic | Choice |
|-------|--------|
| Branding | Keep T&T name, logo, contacts |
| UI / IA | Karwan-style multi-page nav, green palette, forms, inquire slide-out |
| Scope | Full public site map; stubs where content is missing |
| Content | Real T&T copy only; “Coming soon” for thin pages |
| Forms | `POST /api/inquire` → append-only JSON store (email later) |
| Dashboard | Removed |
| Packages app | Removed; `/hajj-packages-2026` is a stub |

## Architecture

- `app/(site)/` — all public routes; shared layout with header, footer, inquire panel
- `components/site/` — marketing UI
- `lib/site/` — nav, contact constants, content strings
- `lib/inquire/` + `app/api/inquire` — validation + JSON persistence (`.data/inquiries.json`, gitignored)
- No admin UI for reading inquiries in this pass

## Routes

| Route | Content |
|-------|---------|
| `/` | Full home (hero, about, journeys, services, gallery preview, testimonials, FAQ teaser, contact CTA) |
| `/about-us` | Full — existing About copy |
| `/services` | Full — tickets, visa, hotel, ziaraat, transport |
| `/faq` | Full — existing FAQ |
| `/contact-us`, `/get-a-quote`, `/inquire-now` | Full forms → API |
| `/hajj-packages-2026`, `/facilities`, `/our-ceo`, `/our-team` | Coming soon |
| `/gallery` + children (`hajj`, `hajj-tarbiati`, `makkah-madinah`, `guest-house`) | Coming soon / index links |
| Hotel detail URLs | Omitted |

## Design system

- Primary `#357A38`, secondary `#88B341`, hover `#2e6630`, text `#333`, white backgrounds
- Typography: Montserrat (headings + body); nav/section titles often uppercase
- Container ~1170px; breakpoints 768 / 1024
- Motion: inquire slide (~0.3s), FAQ accordion, section fade-in
- Assets: T&T logo only; no Karwan/IATA/HOAP proprietary assets

## Contact (existing)

- WhatsApp: +92 300 2062324 (Muhammad Irfanullah Khan)
- Email: info@tandttravelandtours.com
- Address: Office# 18, Sohni Shopping Mall, 2nd Floor, Main Karimabad, Karachi, Pakistan

## Out of scope

- Email/CRM provider wiring
- Admin UI for inquiries
- Scraped Karwan images
- Pixel-perfect clone of karwanehira.com
