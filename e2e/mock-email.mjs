// A stand-in for Resend's email API (POST /emails), for the contact form
// tests. Playwright starts it next to the site (see playwright.config.ts) and
// points the form at it. It keeps every email it is sent, readable at
// GET /received, and answers as Resend does: 200 with an id, or 500 when the
// message contains "[fail]".
import { createServer } from "node:http";

const port = Number(process.env.MOCK_EMAIL_PORT ?? 3299);
const received = [];

createServer(async (request, response) => {
  const json = (status, body) => {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  };
  if (request.method === "POST" && request.url === "/emails") {
    let body = "";
    for await (const chunk of request) body += chunk;
    const email = JSON.parse(body);
    received.push({ authorization: request.headers.authorization, email });
    if (String(email.text).includes("[fail]")) {
      json(500, { name: "internal_server_error", message: "Test failure" });
    } else {
      json(200, { id: `test-${received.length}` });
    }
    return;
  }
  if (request.method === "GET" && request.url === "/received") {
    json(200, received);
    return;
  }
  json(200, { ok: true });
}).listen(port, "127.0.0.1");
