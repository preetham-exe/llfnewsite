/**
 * The LLF monogram, drawn in the current text colour. Decorative wherever it
 * appears (the name is always written out nearby), so it is hidden from
 * assistive technology. Relies on <MonogramSymbol /> in the site's shell.
 */
export function Monogram({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 152 88"
      className={`aspect-[152/88] ${className}`}
    >
      <use href="#llf-monogram" />
    </svg>
  );
}
