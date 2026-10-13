# Literate Lives Foundation website

Read BRIEF.md before writing any code. It is the source of truth for the concept, pages, motion and build order. This file holds the standing rules.

## What we are building

A nonprofit website for Literate Lives Foundation (LLF), which builds libraries for underprivileged children in Hyderabad, and is expanding to Bangalore. The homepage is a single bookshelf. Each book is a section of the site. Opening a book transitions into that page. The tone is quiet, warm, editorial and trustworthy. It must never feel like a gimmick or a toy.

The test for every decision: would a first-time donor on a phone understand what LLF does and find the donate button within 10 seconds? If a visual idea makes that harder, cut it.

## Stack

- Next.js 16.4, App Router, TypeScript 6.0 (strict). Cache Components and Partial Prefetching are on, and the root layout sets `ensureStatic = "navigation"`, so the build fails if any page stops being static. TypeScript stays below 6.1 until typescript-eslint supports 7.
- Tailwind CSS 4.3 through the Turbopack loader. There is no tailwind.config: tokens live in `@theme` in src/styles/globals.css and are both CSS variables and utilities.
- GSAP 3.15 (core, ScrollTrigger, Flip, SplitText, DrawSVGPlugin, CustomEase) with @gsap/react (useGSAP). All plugins are free.
- Lenis 1.3 through `lenis/react` (one `ReactLenis root` in the root layout), driven by gsap.ticker, with ScrollTrigger synced to Lenis. Lenis turns smoothing off by itself under prefers-reduced-motion.
- next/font/local for the self-hosted fonts in src/assets/fonts (built by scripts/fonts/build_fonts.py), next/image for all photographs.
- Sanity as the CMS for Libraries, Stories and Partners (added in Phase 8; until then content lives in typed local files shaped exactly like the future Sanity query results)
- Deployed on Vercel, with Vercel Analytics and Speed Insights
- pnpm 10 (Vercel detects pnpm only up to 10), ESLint 9 (Next's plugins do not support 10 yet), Prettier, Playwright
- The docs for the installed Next.js version are in node_modules/next/dist/docs/. Read them before using a Next.js API.

Do not install Framer Motion, three.js or any other animation library. GSAP owns every transform. Do not add UI kits.

## Architecture rules

1. It is a real multipage site. Every section is its own route with its own statically generated HTML, title, meta description, Open Graph image and structured data. Each library and each story also gets its own page (/libraries/[slug], /stories/[slug]). Every page must be fully readable with JavaScript disabled.
2. Persistent layout for the transition. The root layout holds the persistent nav, the Lenis instance and a transition overlay layer, and these never unmount between client navigations. Section pages share the `app/(book)` layout, which holds the book frame. Every internal link uses `TransitionLink` (src/components/transition), which renders a real `<a>`. Direct loads, refreshes and links from outside the site get no transition.
3. How the transition works (src/components/transition). Inside the event that starts a navigation (a click, Escape, back or forward), engine.ts copies the screen into the overlay, so Next can render the new page underneath while the copy stays on screen. choreography.ts, loaded when the browser is idle, builds the 3D book on the spine and animates it. Every page template renders `<PageReady />`, which tells the transition the page is on screen; the content that rises in as a book opens carries `data-transition-content`; spines carry `data-book`, and the shelf holds hidden cover faces for the transition to copy. Every book opens from the shelf, but only a click on its spine starts it; other links to a section (the nav's Donate, the footer) go straight there.
4. Server Components by default. Anything with GSAP, Lenis, hover state or the transition is a small client component. Keep client JavaScript lean.
5. All GSAP code uses useGSAP or gsap.context() with cleanup. No ScrollTriggers leak between routes. Call ScrollTrigger.refresh() after route content and images settle. Each plugin is registered once, in the module that owns it: src/lib/gsap.ts (ScrollTrigger, CustomEase, useGSAP), gsap-flip.ts, gsap-split.ts, gsap-draw.ts. Import from those, never from "gsap/..." directly.
6. Motion values come from src/motion/tokens.ts (durations, eases, distances). No magic numbers in components.
7. Content is never hardcoded in JSX. Before Phase 8 it lives in src/content/ as typed data. After Phase 8, Libraries, Stories and Partners come from Sanity with on-demand revalidation (publish in Sanity, page updates without a redeploy). Static page copy can stay in local files. Anything unknown is a `todo("...")` value, which renders highlighted.
8. Generate sitemap.xml and robots.txt through the App Router metadata routes. Add Organization / NGO structured data (JSON-LD) on the homepage. Search engines are kept out until launch (SITE_INDEXABLE=true on Production).
9. With Cache Components, Next keeps up to three recently visited pages mounted but hidden. Prefer refs or registration to DOM queries; a global query must skip the hidden copies (the transition's `isDisplayed`). Never put ids inside pages except where they are unique to that page.
10. Library and story pages read their slug from the URL, so they set `instant = false`, and every link to them uses `prefetch` so those navigations stay instant.
11. The site URL comes only from src/lib/site-url.ts (NEXT_PUBLIC_SITE_URL, then the Vercel production URL).

## Design rules

- Typography carries the site. Literata for headlines, spines and body (one weight, 400, with optical sizes from 7 to 72; emphasis is italic, never bold). Source Sans 3 for UI, labels and captions. Real typographic care: optical sizing, real small caps (`smallcaps`), old-style figures in text and lining figures in stats (`figures-lining`), measured line length (60 to 72 characters, `max-w-measure`), generous margins.
- Italic serif text uses `em`, `i`, `cite` or the `font-serif-italic` utility, because the italic is a separate file. Never fake italics or small caps.
- Brand colours: navy #23314B is the primary ink and cloth colour. Gold #8B6F47 is used rarely, as foil and small accents only, and never for small text (2.8:1 on navy, 4.2:1 on paper). Text on navy uses cream (#EFE6D2) or foil (#C9A96E).
- Paper is warm off-white, never pure white. Text sits on clean paper. Decorative objects never sit behind text.
- Links are underlined unless they sit in a navigation list.
- Decoration is specific to LLF (library due-date cards, pencils, children's drawings, polaroids of real libraries, handwritten notes in English and Telugu), never generic dark academia (skulls, candles, coffee rings, ravens).
- Section pages are the open book they came from (BookPage, src/styles/book.css): the book's cloth round the pages, the chapter opening on the left page and the text on the right from 80rem up, one page below that, paper to the edges on phones. Objects in the margins are `<Margin>` blocks placed just before the text they sit beside (floats pulled into the left page, like printed sidenotes); they never overlap text. Their artwork lives in public/marginalia. A phrase written `[[like this]]` in page copy gets a pencil underline: once or twice a page at most.
- The cloth margins round the pages come from the book's proportions in the motion tokens (`book.squares`, `book.aspect`), the same numbers the opening transition builds its 3D book from, so the book lands exactly on the frame. Change them together.
- Real photographs only. No stock photos, no AI-generated people. Photos of children in care need the partner's consent; prefer shots where faces are not identifiable. Strip all metadata (including location) from photos before they go in public/.
- No em dashes in any copy. `pnpm check:copy` enforces this and the banned phrases.

## Motion rules

- Motion has weight. Things are pulled, tilted, hinged and settled. Nothing bounces, spins or slides in for no reason.
- The book-opening transition takes 1.7 seconds on desktop and 1.33 seconds on phones, and closing takes 1.1 seconds (the founder slowed it from the brief's 1.4 s on 2026-10-12). A click or keypress during it skips to the end.
- Parallax on decorative objects stays between 10 and 40 px.
- prefers-reduced-motion: replace the book transition with a 200 ms crossfade, disable parallax, disable Lenis smoothing, keep content reveals as instant or simple fades.
- Never animate layout properties (width, height, top, left). Transforms and opacity only.
- Blur only what stands still. A live `backdrop-filter` behind moving things is redrawn every frame (it cost 14 dropped frames per opening in testing); blur a still copy once and fade it in instead.
- Never hide above-the-fold content until JavaScript runs. Starting states for animations apply only under `html.js`.

## Accessibility and performance (non-negotiable)

- The shelf is a nav landmark containing a list of real links with real text. Spine text is live text, not baked into images.
- Full keyboard support. Focusing a book gives the same pulled-out state as hover. Visible focus styles.
- WCAG AA contrast on all text, including spine titles.
- Alt text on every meaningful image. Decorative objects get empty alt and aria-hidden.
- Lighthouse targets on mobile: Performance 90+, Accessibility 100, Best Practices 100, SEO 100.
- Images as AVIF/WebP with responsive srcset, lazy loaded below the fold. Self-hosted, subset fonts with font-display swap and preload of the headline face (only Literata roman is preloaded). Textures are small tileable files.
- No layout shift when fonts or images load.
- No errors in the console on any page (e2e/console.spec.ts).

## How to work

- Build in the phases listed in BRIEF.md, in order. Do not start a phase until the previous one meets its acceptance criteria and the founder has approved it.
- Each phase is built on its own branch (phase-1, phase-2...) and reviewed on its Vercel preview before it is merged.
- At the end of each phase:
  1. `pnpm check` (lint, types, copy rules, formatting) and `pnpm build`, and fix everything.
  2. `pnpm test:e2e`, which builds, runs the acceptance tests in Chromium and WebKit at 1440 x 900 and 390 x 844, and saves screenshots to screenshots/<phase>/ (set PHASE=phase-n). Look at the screenshots critically. Playwright's WebKit cannot render CSS 3D (it flattens even a plain cube), so anything 3D is checked in Chromium here and in real Safari (Mac, iPhone or the iOS simulator) by hand. /dev/book is the test bench for that.
  3. Test keyboard navigation and reduced motion for anything built in the phase.
  4. Report: what was built, the screenshots, what does not feel right yet, decisions to know about, and what is needed from the founder.
  5. Add a short entry to the log below.
  6. Commit in small, logical commits.
- Ask before adding any dependency.
- When something in BRIEF.md is unclear or seems wrong, ask rather than guess.
- If an effect cannot be made to feel good, propose a simpler version rather than shipping a mediocre complex one.

## Log

- 2026-10-11, Phase 0. Next.js 16.4 foundation: tokens, self-hosted Literata and Source Sans 3 (subset with ₹ and small caps), motion tokens, GSAP registration, Lenis on the GSAP ticker, empty transition overlay, persistent nav with Donate on every page, all routes with placeholder content and metadata, sitemap, robots, default share image, NGO JSON-LD, Playwright acceptance tests (216 passing). Open: GitHub push needs the founder's credentials; Vercel import pending; logo needs vector files; the in-app browser could not open the dev server, so the visual check used Playwright screenshots.
- 2026-10-11, Phase 1. Static shelf: seven cloth-bound spines on a wall shelf with a bronze bookend and a date-due card stamped with real opening months; on phones a pile with Donate on top (separate markup, so reading order matches). Series covers and the CSS 3D book on the /dev/book bench. Generated 1 KB cloth and wood textures. Teal cloth deepened to #2F5B5A for contrast under the spine highlight. Shelf tests for real links, title fit and AA contrast (232 passing). Open: 3D not yet seen in real Safari.
- 2026-10-11, Phase 1 follow-up. The founder has no vector logo, so the monogram and wordmark were traced from the 500 px PNGs (scripts/brand/trace_logo.py; the hands drawing is left out). The monogram is defined once per page (MonogramSymbol) and used on spines, covers and the nav; the wordmark is in the footer and share image; favicons are generated from the vector. Code is on GitHub (PRs 1 and 2) and Vercel previews build. The founder has consent for the photos.
- 2026-10-11, Phase 1 redesign (founder's direction). The shelf is now a framed wooden bookcase spanning the full width below the headline and filling the rest of the first screen (26 to 46 rem). The seven books stand upright and share the row by thickness, with titles across the spine (container units scale them) and a foil label on Donate. Phones keep the flat stack, now inside the same frame. Bookend removed; the date-due card is kept for The Libraries' margins. 232 tests passing. Open: hover and focus states and label cards need a new home in Phase 2 now that the books fill the row.
- 2026-10-11, Phase 2. Hover or keyboard focus pulls a book toward the reader (14 px of z, 4 deg forward tilt, deeper shadow, neighbours ease 2 px aside) and shows a paper label card on the lower spine with the section in one line; the label is each link's accessible description. Arrow keys, Home and End move between books. On a session's first visit the books settle (0.8 s; the boot script lifts them before paint and drops them anyway after 3 s). Homepage story: mission, numbers that count up once in view (final values in the HTML), the first real photo (children at the new shelves, metadata stripped by scripts/photos/prepare_photo.py), and the Donate prompt, each fading up once. Reduced motion: no pull, settle or count; labels still appear. 260 tests passing. Open: whether the label card should also appear on phones (no hover there).
- 2026-10-12, Phase 3. The book transition, for Our Story. A click on its spine (or Enter, or forward from the shelf) copies the screen into the overlay and the page renders underneath; a CSS 3D book built exactly on the spine pulls out, turns to its cover as it travels to the centre while the room dims and softens, opens on its hinge with three leaves following, and fills the screen as paper while the page's text rises in. 1.36 s on desktop; 1.06 s on phones, where the book lifts off the pile and rolls upright. Back to the shelf, Escape and the back button reverse it in 0.9 s, landing on the spine to the pixel. Any click or key skips to the end in 0.15 s; reduced motion is a 0.2 s crossfade; direct loads get nothing; if the page has not arrived in 3 s a normal page load takes over. The nav changes with the page (not the URL) and dims with the room; Escape closes the menu first. Focus goes to the page heading, and back to the book on return (pulled out only after keyboard use). In Chromium at 4x CPU slowdown: 0 or 1 dropped frames per run. 311 tests passing. Open: the 3D needs a look in real Safari (Mac and iPhone); the other six books get the transition in Phase 5.
- 2026-10-12, Phase 3 follow-up. At the founder's request the transition is about a quarter slower (open 1.7 s, phones 1.33 s, close 1.1 s) and every book now opens from the shelf, not only Our Story. The live site had been serving only public/ (the Vercel project was created as "Other" while the repo was empty); vercel.json now names Next.js, and the site is public at llfnewsite.vercel.app.
- 2026-10-12, Phase 4. Section pages are now the open book they came from: the book's cloth showing round the pages (oxblood for Our Story, forest for The Libraries, and so on), paper with a faint grain (public/textures/paper.webp, 3 KB), a fold down the middle, stacked page edges, a running header in small caps and page numbers. From 80rem the chapter opening sits on the left page and the text on the right (55 to 72 characters a line; body 18 to 19 px with the page); one page below that; paper to the edges on phones. Our Story: a polaroid of real shelves from the founder's photos (caption a TODO until the library is named), an index card waiting for a handwritten note (TODO), a pencil, and pencil underlines drawn under "a student" and "three libraries". Headings below the first screen rise in line by line (SplitText); margin objects drift 18 to 34 px. The opening transition now lands its book exactly on the page's frame and dissolves into it (and closing starts from it). Open: the founder's story and team, a handwritten note, which library the photo shows, and a real Safari check.
