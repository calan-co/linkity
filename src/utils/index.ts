export { detectLinkType } from "./detect.js";

import type { Ast } from "../types/index.js";

export function visitLinks<T = void>(
  links: Ast[],
  visitor: (link: Ast, index: number, array: Ast[]) => T
): T[] | void {
  if (!Array.isArray(links)) return;
  const results: T[] = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!link) continue;
    const res = visitor(link, i, links);
    if (typeof res !== "undefined") results.push(res);
  }
  return results.length ? results : undefined;
}
