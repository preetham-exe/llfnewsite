# Literate Lives Foundation website

The website for Literate Lives Foundation (LLF), which builds libraries for children in Hyderabad.

The concept, pages and build phases are in `BRIEF.md`. The standing rules for working on the code are in `CLAUDE.md`.

## Running it locally

Requires Node 24 and pnpm 10.

```bash
pnpm install
pnpm dev
```

Then open http://localhost:3000.

## Checks

```bash
pnpm check     # lint, types, copy rules and formatting
pnpm build     # production build
pnpm test:e2e  # Playwright tests against a production build
```
