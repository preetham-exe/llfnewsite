/*
 * The contact form on Get Involved: its fields, how long each may be, and
 * what the form shows after it is sent. Shared by the form (ContactForm) and
 * the server action that emails it (app/(site)/(book)/get-involved/actions.ts).
 */

export const contactFields = [
  "topic",
  "name",
  "email",
  "phone",
  "city",
  "message",
] as const;

export type ContactField = (typeof contactFields)[number];

export type ContactValues = Record<ContactField, string>;

/** The longest each field may be, in characters. */
export const contactLimits: Record<ContactField, number> = {
  topic: 20,
  name: 120,
  email: 254,
  phone: 40,
  city: 80,
  message: 4000,
};

export type ContactState = {
  status: "idle" | "invalid" | "sent" | "unsent";
  /** What was written, so the form keeps it when it was not sent. */
  values?: ContactValues;
  /** A message for each field that needs another look. */
  errors?: Partial<Record<ContactField, string>>;
};
