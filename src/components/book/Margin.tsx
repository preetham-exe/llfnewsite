import type { ReactNode } from "react";

type MarginProps = {
  children: ReactNode;
  /**
   * How far it drifts against the scroll (px): marginalia in the motion
   * tokens. Leave it out for anything to be read, which stays still.
   */
  drift?: number;
  /** Narrower than the page's margin, or set in from its edge. */
  variant?: "narrow" | "inset";
  /**
   * Only on the open spread, where the left page has room for it. Phones
   * keep one or two objects a page.
   */
  wideOnly?: boolean;
};

/**
 * An object in the page's margin (see Marginalia.tsx). Place it among a
 * page's children just before the text it belongs beside: on wide screens
 * it sits on the left page level with that text, on narrower ones between
 * the blocks of text.
 */
export function Margin({ children, drift, variant, wideOnly }: MarginProps) {
  return (
    <div
      data-drift={drift}
      className={[
        "spread__left spread__margin",
        variant && `spread__margin--${variant}`,
        wideOnly && "spread__margin--wide-only",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
