import { MisplacedBook } from "@/components/site/MisplacedBook";

/**
 * A library or story that does not exist (its page calls notFound()). Shown
 * inside the (site) layout, so the nav and the transition layer stay put.
 */
export default function NotFound() {
  return <MisplacedBook />;
}
