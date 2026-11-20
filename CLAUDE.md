# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 (App Router) docs are bundled in `node_modules/next/dist/docs/`; check them before using any Next API.

## Commands

- `npm run dev`: dev server on :3000. `next.config.ts` `allowedDevOrigins` lists the LAN IPs allowed to reach it.
- `npm run build`: `next build` (`output: "standalone"`), then `scripts/copy-standalone-assets.mjs` copies `public/` and `.next/static` into `.next/standalone`.
- `npm start`: runs `node .next/standalone/server.js` (not `next start`), so build first.
- `npm run lint`: ESLint 9 flat config (`eslint-config-next` core-web-vitals + typescript).
- `docker compose up --build`: production container, mapped to host port 3090.

There is no test suite.

## Architecture

A public, marketing-only site for T&T Travel and Tours (Hajj/Umrah travel agency in Karachi). Earlier commits had a dashboard and a packages app; both were removed. The current design spec is `docs/superpowers/specs/2026-09-15-tandt-karwan-ui-rebuild-design.md`, covering routes, palette and scope.

- **Routes** live under the `app/(site)/` route group. Its `layout.tsx` wraps every page in `InquireProvider` and adds `TopBar` (navy strip with clock, location, Hijri date), the sticky `SiteHeader`, `SiteFooter` (includes the CTA band), `FloatingActions` (WhatsApp + back-to-top) and the slide-out `InquirePanel`. The root `app/layout.tsx` only sets up fonts (Plus Jakarta Sans as `--font-jakarta`), metadata and the skip link.
- **Content is data-driven.** Copy, nav and contact details live in `lib/site/` (`content.ts`, `nav.ts`, `contact.ts`). Change text there, not in the components. Use only real T&T content; pages without content yet show "Coming soon" stubs.
- **Inquiry flow:** `components/site/InquiryForm.tsx` (used by contact-us, get-a-quote, inquire-now and the slide-out panel) POSTs JSON to `app/api/inquire/route.ts`. That route applies an in-memory per-IP rate limit (10/min), validates fields, and calls `appendInquiry` in `lib/inquire/store.ts`, which appends to `.data/inquiries.json`. The file is gitignored, and in Docker it sits on the `inquire_data` volume. Inquiry types: `contact | quote | inquire`. There is no email sending and no admin UI yet.
- **Inquire panel state:** `useInquire()` from `components/site/InquireContext.tsx` opens and closes the panel; `openWith({ interest, message })` opens it pre-filled (used by the Book now buttons on the service pages). It throws when called outside the `(site)` layout.
- **Service pages** live under `/services/*` (`umrah`, `flights`, `visa`, `hotels`, `transport`, `ziaraat`), each a server `page.tsx` wrapping a client browser component in `components/site/` (e.g. `HotelBrowser.tsx`) with its data in a matching `lib/site/*.ts` file. Umrah packages come from the real flyers in `public/packages/` (Muharram 1447H season; `SHOW_SEASON_NOTICE` flags past-season prices). The other five use sample rates, and each data file has a `*_PLACEHOLDER` flag that shows a "sample rates" notice until real T&T figures are filled in. A service in `services` (`content.ts`) with a `page` field links to its page from the service cards.
- **Umrah builder** (`/umrah-planner`, `components/planner/`): a one-page journey builder modelled on the holidaysmaker.pk calculator: route presets or a custom city order, start date and nights per stop, adults/children (with ages)/infants and nationality, a named hotel per stop with room counts by type, breakfast or transit-only, full or selective (per-transfer) transport with a car count, and optional visa, ziaraat per city and flights. `lib/site/pricing.ts` holds the state shape and quote maths and pulls hotels from `hotels.ts`, vehicle and route rates from `transport.ts` and the visa fee from `visa.ts`, so the builder matches the service pages. `PRICING_IS_PLACEHOLDER` shows the "sample rates" notice. Requests go to `/api/inquire` as type `quote`.
- **WhatsApp:** use `waLink(text)` from `lib/site/contact.ts` for prefilled chat links. Icons in content are string keys (`IconKey`) mapped to lucide icons in `components/site/icons.tsx`.
- **UI:** shadcn (`radix-nova` style, lucide icons). Primitives are in `components/ui/`; add new ones with the shadcn CLI. Tailwind v4 is configured CSS-first in `app/globals.css`; there is no `tailwind.config`. Animation uses framer-motion (`components/AnimatedSection.tsx`). Path alias is `@/*`, which maps to the repo root.
- **Design tokens** (in `app/globals.css`, matched to the logo): `primary` royal blue `#1846a3`, `brand-cyan` `#1fa5c9`, `navy` `#0a1f44` for dark bands, `cta` orange `#f7931e` for calls to action, `surface` `#f4f7fc` for alternate sections. Custom utilities: `container-site` (max 1240px + gutters), `eyebrow` (section kicker), `no-scrollbar`. The 2026-09-15 spec's green palette is superseded.
- **Images:** `next/image` in Next 16 uses `preload` (not the deprecated `priority`), and only quality 75 is allowed by default. Package flyers live in `public/packages/` and are listed in `packageFlyers` in `content.ts`.

## Notes

- `.env.example` still lists dashboard/MinIO variables from the removed apps. The current app code reads no environment variables. `docker-compose.yml` sets `NEXT_PUBLIC_APP_URL`, but nothing uses it yet.
- The Docker entrypoint runs as root only to `su-exec` into the `nextjs` user, so `.data` ownership stays correct on the mounted volume.
