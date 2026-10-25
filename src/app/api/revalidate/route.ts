import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

import { CONTENT_TAG } from "@/lib/content";

/*
 * Sanity calls this when a library, story or partner is published, changed
 * or deleted (the webhook is set up in sanity.io/manage). The request is
 * signed with SANITY_REVALIDATE_SECRET; anything unsigned is turned away.
 * It clears the content's cache, so the next visit to any page that shows
 * it gets the new version, with no redeploy. parseBody first waits a few
 * seconds, so Sanity has the change everywhere before pages read it again.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { message: "SANITY_REVALIDATE_SECRET is not set" },
      { status: 500 },
    );
  }

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(
    request,
    secret,
    true,
  );
  if (!isValidSignature) {
    return Response.json({ message: "Invalid signature" }, { status: 401 });
  }

  // Stale pages are never shown again: the next visit waits for fresh ones.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return Response.json({ revalidated: true, type: body?._type ?? null });
}
