/** The first focusable element on every page. */
export function SkipLink() {
  return (
    <a
      href="#main"
      className="fixed top-2 left-4 z-(--z-skip) -translate-y-[200%] bg-navy px-4 py-2 font-sans text-ui text-cream focus:translate-y-0"
    >
      Skip to content
    </a>
  );
}
