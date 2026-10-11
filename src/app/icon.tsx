import { ImageResponse } from "next/og";

import { MONOGRAM } from "@/components/brand/paths";

/* The favicon: the LLF monogram in navy on paper, drawn from the vector. */

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
      <svg width="58" height="34" viewBox={MONOGRAM.viewBox}>
        <path fill="#23314b" fillRule="evenodd" d={MONOGRAM.d} />
      </svg>
    </div>,
    size,
  );
}
