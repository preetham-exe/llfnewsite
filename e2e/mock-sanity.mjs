// A stand-in for Sanity's Content Lake, for the tests. Playwright starts it
// before the site is built (see playwright.config.ts), and the site reads its
// libraries, stories and partners from it (SANITY_API_HOST). It answers every
// query with e2e/sanity-content.json, already in the shape the site's one
// query returns (src/sanity/queries.ts), so the pages match the seed. A test
// stands in for the Studio with PUT /content (what is published now) and
// DELETE /content (back to the start), then calls the publish webhook.
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.MOCK_SANITY_PORT ?? 3298);
const start = readFileSync(
  new URL("./sanity-content.json", import.meta.url),
  "utf8",
);
let content = JSON.parse(start);
let queries = 0;

createServer(async (request, response) => {
  const json = (status, body) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  };
  const { pathname } = new URL(request.url ?? "/", "http://localhost");

  if (pathname.includes("/data/query/")) {
    queries += 1;
    json(200, { ms: 1, result: content });
    return;
  }
  if (pathname === "/content" && request.method === "PUT") {
    let body = "";
    for await (const chunk of request) body += chunk;
    content = JSON.parse(body);
    json(200, { ok: true });
    return;
  }
  if (pathname === "/content" && request.method === "DELETE") {
    content = JSON.parse(start);
    json(200, { ok: true });
    return;
  }
  if (pathname === "/content") {
    json(200, { content, queries });
    return;
  }
  json(200, { ok: true });
}).listen(port, "127.0.0.1");
