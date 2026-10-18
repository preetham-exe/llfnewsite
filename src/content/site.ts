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

/** Donations happen on Milaap. Nothing is paid on this site. */
export const MILAAP_URL: string = todo(
  "Milaap campaign link (the old site's fundraiser now shows Not found on Milaap)",
);

export const stats = {
  childrenReached: "300+",
  booksPlaced: "1,500+",
} as const;
