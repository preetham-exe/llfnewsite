# LLF website brief

## 1. The idea

LLF builds bookshelves for children. So the website is a bookshelf. The metaphor is the mission, which is why it works, and also why it has to be executed with restraint. The shelf is the homepage and the navigation. Each book is a section. Pulling a book off the shelf opens it into that page. Once open, the page is a calm, readable, scrolling page framed as an open book. Visitors never have to flip pages to read.

Feeling: a quiet reading room on a warm afternoon. Careful, generous, honest. Closer to a well-made printed annual report than to a theme park.

Audiences, in priority order:
1. Donors (individuals, often arriving from Instagram, WhatsApp or a Milaap link, mostly on phones)
2. Institutions and partners (children's homes, NGOs, publishers, corporates) checking credibility
3. Volunteers and students who want to join or start a chapter

## 2. The shelf (homepage, route "/")

Seven books, left to right:

| # | Spine title | Route | Purpose |
|---|---|---|---|
| 1 | Our Story | /our-story | Why LLF exists, the mission, the founder, the team |
| 2 | The Libraries | /libraries | Impact. Each library is a chapter with photos, partner, date, book count, children served |
| 3 | How We Build | /how-we-build | The model: screening, sizing tiers, book selection, the build and launch day |
| 4 | Partners | /partners | Partner organizations and what each partnership produced |
| 5 | Stories | /stories | The rolling publication: writing from the team and from children at partner libraries |
| 6 | Get Involved | /get-involved | Volunteer, start a chapter, request a library for your institution, contact |
| 7 | Donate | /donate | The checkout card, what money buys, transparency, tax benefit |

### Full site map (multipage)

Every page below is its own URL with its own statically generated HTML, so each one can be shared, indexed and loaded directly.

- / (the shelf plus the short homepage story)
- /our-story
- /libraries, plus /libraries/[slug] for each library (photos, partner, date, books, children served, a short account of launch day)
- /how-we-build
- /partners
- /stories, plus /stories/[slug] for each piece of writing
- /get-involved
- /donate
- /not-found (the misplaced book)

Library and story detail pages use the same open-book template. Moving from /libraries to a single library is a page turn inside the open book (a quick, flat page-flip of about 0.5 s), not a new book coming off the shelf.

Why this set: the old "Who we are" and "Our mission" are merged into Our Story because a mission page alone is thin. How We Build is new and is the strongest credibility page for institutions and serious donors, because it shows LLF has a real, repeatable model. Transparency (registrations, 80G, where money goes) lives inside Donate, because that is exactly where a donor needs it. Contact lives in Get Involved and the footer, not on its own book.

### Visual

- A real-feeling wooden shelf, warm, softly lit from above, with a subtle shadow under each book. Background is a quiet wall, not a full room scene.
- Books vary in height (within about 15 percent), thickness and cloth colour. Cloth palette: navy #23314B, deep oxblood, muted forest green, slate, warm ochre, faded teal, one undyed linen. Donate is the only navy book, with gold foil, so it is the most "special" book without being loud. Spine lettering on dark cloth is cream or a light foil tint (#C9A96E), because the brand gold #8B6F47 is too dark to read on navy.
- Spine titles in the editorial serif, gold foil or cream, set vertically or horizontally depending on thickness. Small LLF monogram at the base of each spine.
- Optional small objects on the shelf: one bookend, a small plant, a folded library card. Two or three objects, not more.
- Above the shelf: a plain one-line headline that says what LLF does ("We build libraries for children in Hyderabad."), with the tagline "Turning pages, changing lives." beneath it, set small and confident. The Donate button also sits in the top bar on the homepage. A one-line instruction is not needed if the books are clearly labelled.

### Shelf interactions

- Hover or keyboard focus: the book slides out about 12 to 16 px toward the viewer and tilts a few degrees, its shadow lifts, neighbours shift 1 to 2 px. A small label card appears beneath with a one-line description of the section.
- Load: books settle onto the shelf in a short stagger (under 0.8 s total). Only on the first visit of a session.
- Optional, off by default: a soft paper or wood sound on pull, with a visible sound toggle.

### Below the shelf

Scrolling down from the shelf reveals a short, quiet homepage story for people who do not want to explore:
1. One-sentence mission
2. Three impact numbers that count up when in view: 300+ children, 1,500+ books, number of libraries
3. One full-bleed real photograph from a library
4. A short line plus the Donate call to action
5. Footer

## 3. The book-opening transition

This is the signature moment. It must feel physical and be fast.

Choreography (desktop, total 1.4 s or less):
1. 0.00 to 0.20 s: the clicked book pulls fully out of the shelf.
2. 0.20 to 0.75 s: using GSAP Flip, a clone of the book moves from its shelf position to the centre of the viewport, rotating from spine-facing to cover-facing (rotateY), scaling up. The shelf behind dims and blurs slightly.
3. 0.75 to 1.15 s: the front cover swings open on its left hinge (rotateY 0 to about -170 degrees, CSS 3D with perspective). A thin fan of 2 or 3 pages follows with a slight delay to suggest paper.
4. 1.15 to 1.40 s: the open spread expands to fill the page frame and the real page content fades and rises in. The clone is removed. Scroll position is at the top of the new page.

Closing (back to shelf, via the persistent nav, browser back, or Escape): reverse in about 0.9 s. The page content fades, the spread closes, the book returns to its slot.

Rules:
- Built with CSS 3D transforms driven by GSAP. No WebGL.
- The cover face of each book is designed (title, small illustration or monogram), because it is visible during the transition.
- Any click or keypress during the transition jumps to the end state.
- Direct loads of a route skip the transition entirely.
- Reduced motion: 200 ms crossfade.

## 4. The page template (inside an open book)

Every section page uses one template:

- The page is framed as an open spread on desktop: a faint centre gutter, paper texture, subtle page-edge thickness at the sides. Content flows as a single readable column (or a two-column spread for specific moments like a library chapter), and scrolls normally with Lenis.
- Persistent nav: a small "Back to the shelf" control top left, a compact text nav of all seven sections, and a Donate button top right that is always visible.
- Running header in small caps (like a printed book): section name on the left, "Literate Lives Foundation" on the right.
- Chapter-style headlines, revealed with SplitText line reveals as they enter view. Restrained.
- Page numbers or folios as a quiet design detail.

### Marginalia and the academia background

Decorative objects live in the margins outside the content column and never behind text. Each page has its own small set that relates to its content, 3 to 6 objects per screen at most:

- Our Story: a polaroid of Library #1, a handwritten note, a pencil
- The Libraries: due-date cards with stamped dates of each library launch, a paper clip, a pressed leaf
- How We Build: a pencil sketch of a shelf with measurements, a ruler, a checklist
- Partners: a stack of letters with wax-seal style marks (no partner logos used decoratively)
- Stories: children's drawings, a torn notebook page, an ink pen
- Get Involved: a sign-up sheet, sticky notes
- Donate: the checkout card itself (see section 5)

Motion on marginalia: very slight parallax with ScrollTrigger and Lenis (10 to 40 px). Pencil underlines and circles animate in with DrawSVG under key stats and phrases as they scroll into view. This is the main "cute" detail and should be used sparingly, roughly once or twice per page.

Handwriting: use real scanned handwriting from the LLF team converted to SVG wherever possible. A handwriting font is a fallback only.

Assets: build objects as SVG or optimized PNG/WebP cut-outs with soft shadows. Keep them slightly imperfect: small rotations, uneven edges.

On mobile, marginalia reduce to one or two objects per section placed between content blocks, not around them.

## 5. Donate: the checkout card

The donate page centres on a library checkout card, the kind tucked into a pocket inside a library book's cover.

- The card has ruled lines with columns like "Date due", "Borrower's name". The rows are donation options instead, for example: "One book", "A shelf of books", "A whole library for 50 children" with their amounts. Real amounts come from CONTENT. One known anchor: a library for about 50 to 60 children costs roughly ₹20,000 to ₹40,000.
- Selecting a row highlights it in pencil. Pressing "Check out" brings a rubber stamp down onto the card (GSAP: stamp lifts, drops with a quick ease, slight squash, ink impression appears with today's date and "THANK YOU"). Then the visitor is taken to the Milaap campaign in the same tab (new tabs are unreliable in the Instagram and WhatsApp in-app browsers most donors arrive from), with a clear note that payment happens on Milaap. "Check out" is a real link, so it works without JavaScript.
- The stamp animation is short (under 0.8 s) and never blocks the redirect.
- Below the card: where the money goes (simple breakdown), the 80G tax benefit for Indian donors, registration details (Trust registration, 12A/80G, DARPAN, PAN), and a contact for larger or corporate gifts.
- The Donate button in the persistent nav goes straight to this page.

Do not build any payment form on the site. Payments happen on Milaap.

## 6. Mobile (390 px)

Design mobile as its own composition, not a shrunk desktop.

- The shelf becomes a vertical stack of books lying flat, spines facing the viewer, like a pile on a desk. Each spine is a full-width tap target at least 56 px tall. Donate sits on top.
- Tap: the book lifts, rotates to face the viewer and opens. Same choreography, simplified, 1.1 s or less.
- Pages are a single column of paper. No spread gutter.
- Persistent compact header with Back, a menu, and Donate.

## 7. Typography and colour tokens

Fonts (self-hosted, subset):
- Headlines, spines and body: Literata, an editorial serif designed for reading books on screens, with optical sizes from 7 to 72, real italics, true small caps, old-style and lining figures, and a ₹ sign. (Newsreader was considered but has no small caps or figure styles.)
- UI, captions and small text: Source Sans 3, a humanist sans with a ₹ sign. (Instrument Sans has no ₹.)
- Handwriting: real scanned SVG. Fallback font only if needed.

Colour tokens:
- --ink: near-black with a warm tint
- --navy: #23314B
- --gold: #8B6F47 (rare)
- --paper: warm off-white
- --paper-shade: slightly darker paper for edges and gutters
- --wood: warm mid-brown for the shelf
- --pencil: soft graphite grey
- --stamp: muted red for the checkout stamp
- Spine cloth colours as listed in section 2

## 8. The small details

- Custom cursor is optional and must be subtle if used (a small dot that grows over books). Default cursor on text and form fields.
- Loader: only if needed. If used, it is a single book spine filling with gold foil, under 1.5 s.
- 404 page: "This book has been misplaced." with a gap on a small shelf and a link back.
- Favicon: the LLF monogram.
- Open Graph image: the shelf.
- Footer: tagline, registration line, email founder@literatelives.org, social links.

## 9. Content

Before Phase 8, all copy and image references live in src/content/ as typed data shaped like the future Sanity schemas. From Phase 8, Libraries, Stories and Partners are edited in Sanity Studio. Real photographs will be provided by the founder. Until then, use neutral placeholder blocks with the correct aspect ratio and a label, never stock photos.

Known facts to use:
- Founded in 2024 in Hyderabad, by a student. Library #1 opened January 2025. Registered as a Trust in March 2025. Registered under 12A and 80G, and on NGO DARPAN.
- 300+ children, 1,500+ books, three libraries so far.
- Library #3: QCity Community Library with Robinhood Army, April 2026.
- Partners include Robinhood Army, MANA Foundation, Chavadi Child Welfare Society, AARA Initiative, Macmillan Education.
- Expanding to Bangalore with a local Chapter Lead.
- Library sizing: Small 150 to 200 books on 1 to 2 shelves, Medium 300 to 400 books on 3 to 4 shelves, Large 600+ books on 5+ shelves.
- Books are mostly fiction and storybooks, in English and the local language (Telugu, Kannada).
- LLF sources and pays for the shelving. Every library opens with a launch day read-aloud led by an LLF volunteer.
- A library for about 50 to 60 children costs roughly ₹20,000 to ₹40,000, including shelving.
- Screening: there must be a local volunteer or mentor on the ground. Any child-serving institution qualifies. The process is a conversation, then a site visit and written agreement, then the build.
- Donations are processed on Milaap. Contact: founder@literatelives.org.
- Tagline: "Turning pages, changing lives."

Anything not listed here is a placeholder marked TODO in the content files. Never invent statistics, quotes, names or testimonials.

## 10. Build phases

Each phase ends with a check in the browser at 1440 px and 390 px and a stop for review.

**Phase 0: Foundation**
Next.js App Router project, strict TypeScript, Tailwind, folder structure, next/font, colour and motion tokens, GSAP plugin registration, Lenis plus ScrollTrigger wiring in the root layout, the transition overlay layer (empty for now), all routes from the site map with placeholder content and per-page metadata (library and story pages generated from local data), basic sitemap, robots and default share image, Vercel project connected to the repo with preview deployments.
Done when: every route loads directly and via client navigation, view-source shows real HTML for each page, Lenis scrolls smoothly, a Vercel preview deploy works.

**Phase 1: The shelf, static**
Shelf, books, spines, cover faces, typography. No motion yet.
Done when: it looks good as a still image at both widths, and spine text passes contrast.

**Phase 2: Shelf interactions**
Hover and focus pull-out, label cards, first-load settle, keyboard navigation, the below-the-shelf homepage story.
Done when: it feels physical and calm, and keyboard-only use works.

**Phase 3: The transition, one book only**
Full open and close choreography for Our Story only. Skip-on-click, reduced motion, direct load, browser back.
Done when: it runs at 60 fps on a mid-range laptop, completes in 1.4 s or less, and has no flash between shelf and page. Do not proceed until this feels excellent.

**Phase 4: Page template and Our Story**
Spread frame, running header, persistent nav, SplitText reveals, marginalia system with parallax and DrawSVG pencil marks. Build Our Story fully.
Done when: Our Story reads beautifully and the decoration never competes with the text.

**Phase 5: Remaining pages**
The Libraries, How We Build, Partners, Stories, Get Involved, each with its own marginalia set. Wire the transition to all books. Get Involved has a real form (volunteer, start a chapter, request a library) that emails the founder; this needs an email-sending service.

**Phase 6: Donate**
Checkout card, stamp animation, Milaap redirect, transparency section.

**Phase 7: Mobile pass**
Stacked-pile shelf, mobile transition, mobile page layout, touch targets.

**Phase 8: CMS**
Sanity project and embedded Studio at /studio (protected), schemas for Library, Story and Partner matching the local content types, migrate local content, on-demand revalidation via a Sanity webhook so publishing updates the live site in seconds. Switch generateStaticParams for /libraries/[slug] and /stories/[slug] to Sanity.
Done when: the founder can add a new library with photos in Studio and see its page live without a redeploy.

**Phase 9: Polish and launch**
404, loader if needed, dynamic OG images per page (next/og), sitemap and robots, JSON-LD, Lighthouse targets, Vercel Analytics and Speed Insights, custom domain on Vercel, cross-browser check (Chrome, Safari, Firefox, iOS Safari, Android Chrome), image optimization, final copy check for em dashes and placeholders.
