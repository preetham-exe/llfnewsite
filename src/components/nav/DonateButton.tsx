import { TransitionLink } from "@/components/transition/TransitionLink";

type DonateButtonProps = {
  current?: boolean;
  className?: string;
  children?: string;
};

/** The Donate control. Always visible in the nav, on every page. */
export function DonateButton({
  current = false,
  className = "",
  children = "Donate",
}: DonateButtonProps) {
  return (
    <TransitionLink
      href="/donate"
      aria-current={current ? "page" : undefined}
      className={`inline-flex min-h-11 items-center rounded-[3px] bg-navy px-4 font-sans text-ui font-semibold text-cream no-underline hover:bg-ink ${className}`}
    >
      {children}
    </TransitionLink>
  );
}
