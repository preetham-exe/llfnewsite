import { todo } from "./helpers";

/** Facts about the foundation. Only what the founder has confirmed. */
export const site = {
  name: "Literate Lives Foundation",
  shortName: "LLF",
  tagline: "Turning pages, changing lives.",
  description:
    "Literate Lives Foundation builds libraries in children's homes and community spaces in Hyderabad, with shelves, storybooks in English and Telugu, and a read-aloud on the day each one opens.",
  city: "Hyderabad",
  region: "Telangana",
  country: "IN",
  email: "founder@literatelives.org",
  foundedYear: 2024,
  firstLibraryOpened: "2025-01",
  trustRegistered: "2025-03",
  /** Statements the founder has confirmed. Numbers below are still TODO. */
  registrationSummary:
    "Registered as a trust in March 2025. Registered under sections 12A and 80G, and on NGO DARPAN.",
  registrations: {
    trust: todo(
      "Trust registration number (the old site showed 76/IV/2025: confirm)",
    ),
    section12A: todo("12A registration number"),
    section80G: todo("80G registration number"),
    darpan: todo("NGO DARPAN ID"),
    pan: todo("PAN of the Trust, if you are happy to publish it"),
  },
  social: todo("Social media links (Instagram, LinkedIn, others)"),
} as const;

/**
 * Donations happen on Milaap. Nothing is paid on this site. The live
 * campaign, "100 Children. 1,000 Books. 1 Library." (from the founder,
 * 2026-10-24). If no campaign is live, set this back to a todo() and Check
 * out stamps the card and says so.
 */
export const MILAAP_URL: string =
  "https://milaap.org/fundraisers/support-build-libraries-for-the-underpriviledged";

export const stats = {
  childrenReached: "300+",
  booksPlaced: "1,500+",
} as const;
