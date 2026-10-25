// Copy rules for everything under src/:
//   - no em dashes, anywhere (fails)
//   - none of the banned phrases from the brief (fails)
//   - TODO placeholders are listed so nothing ships by accident (warns)
// Run with `pnpm check:copy`. Pass --strict to fail on TODOs too (for launch).
// The notes src/sanity/map.ts writes for fields left empty in the Studio are
// not listed: they are wording, not missing content. What is missing in
// Sanity shows on the pages themselves, highlighted.

import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const strict = process.argv.includes("--strict");
const extensions = new Set([".ts", ".tsx", ".css", ".md", ".mdx", ".json"]);

const EM_DASH = String.fromCharCode(0x2014);
const banned = [
  "empowering",
  "empower",
  "transforming lives",
  "making a difference",
  "journey",
  "passionate",
];
// todo("...") calls, including ones split over several lines.
const todoCall = /todo\(\s*(["'`])([\s\S]*?)\1\s*,?\s*\)/g;
const todoWording = new Set([join("src", "sanity", "map.ts")]);

async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (extensions.has(extname(entry.name))) yield path;
  }
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;

const errors = [];
const todos = [];

for await (const path of files(join(root, "src"))) {
  const text = await readFile(path, "utf8");
  const file = relative(root, path);

  text.split("\n").forEach((line, index) => {
    const where = `${file}:${index + 1}`;
    if (line.includes(EM_DASH)) errors.push(`${where}  em dash`);
    const lower = line.toLowerCase();
    for (const phrase of banned) {
      if (lower.includes(phrase)) {
        errors.push(`${where}  banned phrase "${phrase}"`);
      }
    }
  });

  if (todoWording.has(file)) continue;
  for (const match of text.matchAll(todoCall)) {
    todos.push(`${file}:${lineOf(text, match.index)}  ${match[2]}`);
  }
}

if (todos.length > 0) {
  console.log(`${todos.length} TODO placeholders still waiting for content:`);
  for (const todo of todos) console.log(`  ${todo}`);
}

if (errors.length > 0) {
  console.error("\nCopy rule violations:");
  for (const error of errors) console.error(`  ${error}`);
  process.exit(1);
}

if (strict && todos.length > 0) {
  console.error(
    "\nStrict mode: TODO placeholders must be resolved before launch.",
  );
  process.exit(1);
}

console.log("\nCopy rules: no em dashes, no banned phrases.");
