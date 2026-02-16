// linkity/src/utils/index.ts
// Utility exports

export { detectLinkType } from "./detect.js";

/**
 * Visitor function for traversing or transforming LinkNode records.
 *
 * Usage:
 *   visitLinks(links, (link, idx, arr) => { ... })
 *
 * @param links Array of LinkNode objects
 * @param visitor Function called for each LinkNode (link, index, array)
 * @returns Array of results from visitor, or void if visitor returns void
 */
export function visitLinks<T = void>(
  links: Array<import("../types/index.js").LinkNode>,
  visitor: (
    link: import("../types/index.js").LinkNode,
    index: number,
    array: Array<import("../types/index.js").LinkNode>
  ) => T
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
