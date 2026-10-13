// linkity/src/parsers/url.ts
// Raw URL and configured custom scheme parser

import type { LinkNode } from "../types/index.js";
import { parse } from "./url.generated.js";

const defaultSchemes = ["http", "https"];

type ParsedUrlNode = Omit<LinkNode, "type"> & { scheme?: string };

export function parseRawUrl(text: string, customSchemes: string[] = []): LinkNode[] {
  const allSchemes = new Set([...defaultSchemes, ...customSchemes]);
  return (parse(text) as ParsedUrlNode[])
    .filter((node) => typeof node.scheme === "string" && allSchemes.has(node.scheme))
    .map(({ scheme, ...node }) => ({
      ...node,
      type: defaultSchemes.includes(scheme!) ? "url" : "custom",
    }));
}
