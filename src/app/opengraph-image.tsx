import { ImageResponse } from "next/og";

import { WORDMARK } from "@/components/brand/paths";
import { home } from "@/content/pages";
import { site } from "@/content/site";
import {
  shareFonts,
  shareSize,
  shareType,
  shelfSpines,
} from "@/lib/share-image";

/*
 * The homepage's share image, and any page's without its own: the headline
 * over the shelf's eight books. Each section shares its own book's cover
 * (src/lib/share-image.tsx).
 */

export const alt = `${site.name}. ${home.headline}`;
export const size = shareSize;
export const contentType = shareType;

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
        <svg width="236" height="116" viewBox={WORDMARK.viewBox}>
          <path fill="#23314b" fillRule="evenodd" d={WORDMARK.d} />
        </svg>
        <div
          style={{
            fontFamily: "Literata",
            fontSize: 68,
            lineHeight: 1.08,
            marginTop: 22,
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
          {shelfSpines.map((spine) => (
            <div
              key={spine.id}
              style={{
                width: spine.width,
                height: spine.height,
                backgroundColor: spine.color,
              }}
            />
          ))}
        </div>
        <div style={{ height: 22, backgroundColor: "#8a5a3b" }} />
      </div>
    </div>,
    { ...size, fonts: shareFonts },
  );
}
