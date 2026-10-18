import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CheckoutCard } from "@/components/donate/CheckoutCard";
import { donate } from "@/content/pages";

/*
 * A test bench for the checkout card with a Milaap link in place, so the
 * stamp and the redirect can be checked (and tested) before the real
 * campaign link is in the content. Not linked from the site, not indexed,
 * and absent from production.
 */

export const metadata: Metadata = {
  title: "Checkout test bench",
  robots: { index: false, follow: false },
};

/** Stands in for the Milaap campaign; tests catch requests to it. */
const STAND_IN = "https://milaap.org/fundraisers/checkout-test-bench";

export default function CheckoutTestPage() {
  if (process.env.VERCEL_ENV === "production") notFound();

  return (
    <div className="pt-(--nav-height)">
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6">
        <h1 className="text-h2">Checkout test bench</h1>
        <p className="mt-2 font-sans text-ui text-ink-soft">
          The checkout card with a stand-in Milaap link. Not linked from the
          site.
        </p>
        <div className="mt-12">
          <CheckoutCard copy={donate.checkout} destination={STAND_IN} />
        </div>
      </div>
    </div>
  );
}
