import type { ReactNode } from "react";

import type { Block, RichText as RichTextValue, Span } from "@/content/types";

import { Txt } from "./Txt";

/** Renders the Portable Text subset in src/content/types.ts. */
export function RichText({ value }: { value: RichTextValue }) {
  return <>{value.map((block) => renderBlock(block))}</>;
}

function renderBlock(block: Block) {
  const children = block.children.map((span) => renderSpan(span, block));
  switch (block.style) {
    case "h2":
      return (
        <h2 key={block._key} className="mt-12 text-h2">
          {children}
        </h2>
      );
    case "h3":
      return (
        <h3 key={block._key} className="mt-10 text-h3">
          {children}
        </h3>
      );
    case "blockquote":
      return (
        <blockquote
          key={block._key}
          className="my-8 border-l-2 border-paper-edge pl-6 font-serif-italic text-lede"
        >
          {children}
        </blockquote>
      );
    default:
      return (
        <p key={block._key} className="mt-6 first:mt-0">
          {children}
        </p>
      );
  }
}

function renderSpan(span: Span, block: Block): ReactNode {
  let node: ReactNode = <Txt>{span.text}</Txt>;
  for (const mark of span.marks) {
    if (mark === "em") node = <em>{node}</em>;
    else if (mark === "strong") node = <strong>{node}</strong>;
    else {
      const link = block.markDefs.find((def) => def._key === mark);
      if (link) node = <a href={link.href}>{node}</a>;
    }
  }
  return <span key={span._key}>{node}</span>;
}
