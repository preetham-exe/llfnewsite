import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { home } from "@/content/pages";
import { site } from "@/content/site";

/*
 * The default share image for every page. Phase 9 replaces it with per-page
 * images and a photograph of the real shelf.
 */

export const alt = `${site.name}. ${home.headline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const fontDir = join(process.cwd(), "src/assets/og");
const [literata, literataItalic, sourceSans] = await Promise.all([
  readFile(join(fontDir, "literata-display-regular.ttf")),
  readFile(join(fontDir, "literata-display-italic.ttf")),
  readFile(join(fontDir, "source-sans-3-semibold.ttf")),
]);

/* Cloth colours and heights for the row of spines, in shelf order. */
const spines = [
  { color: "#5e2129", height: 150 },
  { color: "#2f4a3a", height: 168 },
  { color: "#b8893a", height: 142 },
  { color: "#4a5560", height: 160 },
  { color: "#d9cdb4", height: 146 },
  { color: "#2f5b5a", height: 164 },
  { color: "#23314b", height: 172 },
];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: "#f6f1e7",
        color: "#1f1a15",
        padding: "64px 72px 0",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: "Source Sans",
            fontSize: 24,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#4a4239",
          }}
        >
          {site.name}
        </div>
        <div
          style={{
            fontFamily: "Literata",
            fontSize: 68,
            lineHeight: 1.08,
            marginTop: 28,
            maxWidth: 900,
          }}
        >
          {home.headline}
        </div>
        <div
          style={{
            fontFamily: "Literata",
            fontStyle: "italic",
            fontSize: 36,
            marginTop: 20,
            color: "#4a4239",
          }}
        >
          {site.tagline}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
          {spines.map((spine) => (
            <div
              key={spine.color}
              style={{
                width: 46,
                height: spine.height,
                backgroundColor: spine.color,
              }}
            />
          ))}
        </div>
        <div style={{ height: 22, backgroundColor: "#8a5a3b" }} />
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Literata", data: literata, style: "normal", weight: 400 },
        {
          name: "Literata",
          data: literataItalic,
          style: "italic",
          weight: 400,
        },
        { name: "Source Sans", data: sourceSans, style: "normal", weight: 600 },
      ],
    },
  );
}
