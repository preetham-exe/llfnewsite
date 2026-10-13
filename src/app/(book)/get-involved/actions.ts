"use server";

import { redirect } from "next/navigation";

import { contactForm } from "@/content/pages";
import { site } from "@/content/site";
import {
  contactFields,
  contactLimits,
  type ContactField,
  type ContactState,
  type ContactValues,
} from "@/lib/contact";
import { absoluteUrl } from "@/lib/site-url";

/*
 * Sends a message from the contact form on Get Involved to the founder, by
 * email through Resend (resend.com). Its settings come from the environment:
 *
 *   RESEND_API_KEY   required; without it nothing is sent and the form says so
 *   CONTACT_TO       who receives the messages (default: the site's address)
 *   CONTACT_FROM     the sender, on a domain verified with Resend
 *   RESEND_ENDPOINT  only for tests, which point it at a stand-in for Resend
 *                    (e2e/mock-email.mjs)
 *
 * With JavaScript the form shows the outcome in place. Without it (or before
 * the page has loaded), the browser is sent to a page for the outcome.
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "Literate Lives website <onboarding@resend.dev>";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Added by the form once its JavaScript runs.
  const inPlace = formData.get("enhanced") === "1";

  // A field people never see: anything in it was filled in by a bot, which
  // is told the message went.
  if (text(formData, "website")) {
    if (!inPlace) redirect("/get-involved/sent");
    return { status: "sent" };
  }

  const values = Object.fromEntries(
    contactFields.map((field) => [field, text(formData, field)]),
  ) as ContactValues;

  const errors = check(values);
  if (Object.keys(errors).length > 0) {
    if (!inPlace) redirect("/get-involved/unsent");
    return { status: "invalid", values, errors };
  }

  const sent = await email(values);
  if (!inPlace) redirect(sent ? "/get-involved/sent" : "/get-involved/unsent");
  return sent ? { status: "sent" } : { status: "unsent", values };
}

function text(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function check(values: ContactValues): Partial<Record<ContactField, string>> {
  const { errors: messages, topic } = contactForm;
  const errors: Partial<Record<ContactField, string>> = {};

  if (!topic.options.some((option) => option.value === values.topic)) {
    errors.topic = messages.topic;
  }
  if (!values.name) errors.name = messages.name;
  if (!EMAIL.test(values.email)) errors.email = messages.email;
  if (!values.message) errors.message = messages.message;

  for (const field of contactFields) {
    if (!errors[field] && values[field].length > contactLimits[field]) {
      errors[field] = messages.tooLong;
    }
  }
  return errors;
}

/** One line, for the subject: line breaks and tabs become spaces. */
function oneLine(value: string): string {
  return value.replace(/\s+/g, " ");
}

async function email(values: ContactValues): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error(
      "Contact form: RESEND_API_KEY is not set, so nothing was sent.",
    );
    return false;
  }

  const topic =
    contactForm.topic.options.find((option) => option.value === values.topic)
      ?.label ?? values.topic;
  const { fields } = contactForm;
  const body = [
    `${contactForm.topic.legend} ${topic}`,
    "",
    `${fields.name}: ${values.name}`,
    `${fields.email}: ${values.email}`,
    `${fields.phone}: ${values.phone || "(not given)"}`,
    `${fields.city}: ${values.city || "(not given)"}`,
    "",
    values.message,
    "",
    `Sent from the form at ${absoluteUrl("/get-involved")}`,
  ].join("\n");

  try {
    const response = await fetch(
      process.env.RESEND_ENDPOINT || RESEND_ENDPOINT,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.CONTACT_FROM || DEFAULT_FROM,
          to: [process.env.CONTACT_TO || site.email],
          reply_to: values.email,
          subject: oneLine(`${topic}: a message from ${values.name}`),
          text: body,
        }),
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      console.error(
        `Contact form: Resend answered ${response.status}.`,
        await response.text(),
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error("Contact form: could not reach Resend.", error);
    return false;
  }
}
