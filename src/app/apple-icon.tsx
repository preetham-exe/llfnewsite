import { ImageResponse } from "next/og";

import { MONOGRAM } from "@/components/brand/paths";

/* The home-screen icon on iPhones and iPads. */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f6f1e7",
      }}
    >
      <svg width="140" height="81" viewBox={MONOGRAM.viewBox}>
        <path fill="#23314b" fillRule="evenodd" d={MONOGRAM.d} />
      </svg>
    </div>,
    size,
  );
}
