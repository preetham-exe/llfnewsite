import localFont from "next/font/local";

/*
 * Self-hosted, subset fonts (see scripts/fonts/build_fonts.py).
 *
 * Literata roman is the headline and body face and the only preloaded file.
 * next/font preloads every file in one call, so the italic is its own call
 * with preload off. globals.css maps em, i and cite to it.
 */

export const literata = localFont({
  src: "../assets/fonts/literata-roman.woff2",
  weight: "400",
  style: "normal",
  display: "swap",
  preload: true,
  variable: "--font-literata",
  adjustFontFallback: "Times New Roman",
});

export const literataItalic = localFont({
  src: "../assets/fonts/literata-italic.woff2",
  weight: "400",
  style: "italic",
  display: "swap",
  preload: false,
  variable: "--font-literata-italic",
  adjustFontFallback: "Times New Roman",
});

export const sourceSans = localFont({
  src: "../assets/fonts/source-sans-3.woff2",
  weight: "400 600",
  style: "normal",
  display: "swap",
  preload: false,
  variable: "--font-source-sans",
  adjustFontFallback: "Arial",
});

export const fontVariables = [
  literata.variable,
  literataItalic.variable,
  sourceSans.variable,
].join(" ");
