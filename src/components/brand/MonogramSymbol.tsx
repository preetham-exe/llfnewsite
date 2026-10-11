import { MONOGRAM } from "./paths";

/**
 * Defines the LLF monogram once per page, in the root layout. Every spine,
 * cover and the nav reuse it through <Monogram />, so the path is sent once.
 */
export function MonogramSymbol() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="absolute"
    >
      <symbol id="llf-monogram" viewBox={MONOGRAM.viewBox}>
        <path fill="currentColor" fillRule="evenodd" d={MONOGRAM.d} />
      </symbol>
    </svg>
  );
}
