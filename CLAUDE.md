# Literate Lives Foundation website

Read BRIEF.md before writing any code. It is the source of truth for the concept, pages, motion and build order. This file holds the standing rules.

## What we are building

A nonprofit website for Literate Lives Foundation (LLF), which builds libraries for underprivileged children in Hyderabad and Bangalore. The homepage is a single bookshelf. Each book is a section of the site. Opening a book transitions into that page. The tone is quiet, warm, editorial and trustworthy. It must never feel like a gimmick or a toy.

The test for every decision: would a first-time donor on a phone understand what LLF does and find the donate button within 10 seconds? If a visual idea makes that harder, cut it.

## Stack

- Next.js, latest stable, App Router, TypeScript (strict)
- Tailwind CSS for layout and tokens
- GSAP (core, ScrollTrigger, Flip, SplitText, DrawSVGPlugin) with @gsap/react (useGSAP). All plugins are free.
- Lenis for smooth scroll, driven by gsap.ticker, with ScrollTrigger synced to Lenis
- next/font for self-hosted fonts, next/image for all photographs
- Sanity as the CMS for Libraries, Stories and Partners (added in Phase 8; until then content lives in typed local files shaped exactly like the future Sanity schemas)
- Deployed on Vercel, with Vercel Analytics and Speed Insights

Do not install Framer Motion, three.js or any other animation library. GSAP owns every transform. Do not add UI kits.

## Architecture rules

1. It is a real multipage site. Every section is its own route with its own statically generated HTML, title, meta description, Open Graph image and structured data. Each library and each story also gets its own page (/libraries/[slug], /stories/[slug]). Every page must be fully readable with JavaScript disabled.
2. Persistent layout for the transition. The root layout holds the persistent nav, the Lenis instance and a transition overlay layer, and these never unmount between client navigations. Book links use a custom transition link: on click it runs the open animation in the overlay, calls router.push partway through, and finishes the animation once the new page has mounted. Direct loads, refreshes and links from outside the site get no transition.
3. Server Components by default. Anything with GSAP, Lenis, hover state or the transition is a small client component. Keep client JavaScript lean.
4. All GSAP code uses useGSAP or gsap.context() with cleanup. No ScrollTriggers leak between routes. Call ScrollTrigger.refresh() after route content and images settle. Register plugins once in a client-side module.
5. Motion values come from src/motion/tokens.ts (durations, eases, distances). No magic numbers in components.
6. Content is never hardcoded in JSX. Before Phase 8 it lives in src/content/ as typed data. After Phase 8, Libraries, Stories and Partners come from Sanity with on-demand revalidation (publish in Sanity, page updates without a redeploy). Static page copy can stay in local files.
7. Generate sitemap.xml and robots.txt through the App Router metadata routes. Add Organization / NGO structured data (JSON-LD) on the homepage.

## Design rules

- Typography carries the site. Editorial serif for headlines and spines, a clean humanist sans for UI and body where needed. Real typographic care: optical sizing, measured line length (60 to 72 characters), generous margins.
- Brand colours: navy #23314B is the primary ink and cloth colour. Gold #8B6F47 is used rarely, as foil on spines and small accents only.
- Paper is warm off-white, never pure white. Text sits on clean paper. Decorative objects never sit behind text.
- Decoration is specific to LLF (library due-date cards, pencils, children's drawings, polaroids of real libraries, handwritten notes in English and Telugu), never generic dark academia (skulls, candles, coffee rings, ravens).
- Real photographs only. No stock photos, no AI-generated people.
- No em dashes in any copy.

## Motion rules

- Motion has weight. Things are pulled, tilted, hinged and settled. Nothing bounces, spins or slides in for no reason.
- The book-opening transition must complete in 1.4 seconds or less, and a click or keypress during it skips to the end.
- Parallax on decorative objects stays between 10 and 40 px.
- prefers-reduced-motion: replace the book transition with a 200 ms crossfade, disable parallax, disable Lenis smoothing, keep content reveals as instant or simple fades.
- Never animate layout properties (width, height, top, left). Transforms and opacity only.

## Accessibility and performance (non-negotiable)

- The shelf is a nav landmark containing a list of real links with real text. Spine text is live text, not baked into images.
- Full keyboard support. Focusing a book gives the same pulled-out state as hover. Visible focus styles.
- WCAG AA contrast on all text, including spine titles.
- Alt text on every meaningful image. Decorative objects get empty alt and aria-hidden.
- Lighthouse targets on mobile: Performance 90+, Accessibility 100, Best Practices 100, SEO 100.
- Images as AVIF/WebP with responsive srcset, lazy loaded below the fold. Self-hosted, subset fonts with font-display swap and preload of the headline face. Textures are small tileable files.
- No layout shift when fonts or images load.

## How to work

- Build in the phases listed in BRIEF.md, in order. Do not start a phase until the previous one meets its acceptance criteria.
- At the end of each phase, run the dev server, check the result in the browser at desktop (1440 px) and mobile (390 px) widths, and summarize what was built and what is not yet right. Then stop for review.
- Keep a short log at the bottom of this file: date, phase, what changed, open issues. Keep it short.
- When something in BRIEF.md is unclear or seems wrong, ask rather than guess.
- If an effect cannot be made to feel good, propose a simpler version rather than shipping a mediocre complex one.

## Log

(empty)
