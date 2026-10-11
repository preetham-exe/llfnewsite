import type { RichText, Todo } from "./types";

/** Mark something the founder still has to supply. */
export function todo(note: string): Todo {
  return `TODO: ${note}`;
}

export function isTodo(value: unknown): value is Todo {
  return typeof value === "string" && value.startsWith("TODO:");
}

/** Plain paragraphs as Portable Text blocks, for local content. */
export function paragraphs(prefix: string, ...texts: string[]): RichText {
  return texts.map((text, index) => ({
    _type: "block",
    _key: `${prefix}-${index}`,
    style: "normal",
    markDefs: [],
    children: [
      { _type: "span", _key: `${prefix}-${index}-0`, text, marks: [] },
    ],
  }));
}
