import { createHmac } from "node:crypto";

import type { APIRequestContext } from "@playwright/test";

/** Where the stand-in for Sanity listens (e2e/mock-sanity.mjs). */
export const sanityPort = 3298;
export const sanityStandIn = `http://127.0.0.1:${sanityPort}`;

/** The secret the site's publish webhook checks, in the tests. */
export const webhookSecret = "test-webhook-secret";

/**
 * The signature Sanity sends with a webhook: the time in milliseconds and
 * an HMAC-SHA256 of "<time>.<body>" in base64url, keyed with the secret.
 */
export function signature(
  body: string,
  secret = webhookSecret,
  timestamp = Date.now(),
) {
  const digest = createHmac("sha256", secret)
    .update(`${timestamp}.${body}`)
    .digest("base64url");
  return `t=${timestamp},v1=${digest}`;
}

/** Calls the site's webhook as Sanity does when something is published. */
export function publish(
  request: APIRequestContext,
  document: { _type: string; slug?: string },
) {
  const body = JSON.stringify(document);
  return request.post("/api/revalidate", {
    data: body,
    headers: {
      "content-type": "application/json",
      "sanity-webhook-signature": signature(body),
    },
  });
}
