import { describe, it, expect } from "vitest";

import { visitLinks } from "../src/utils/index.js";
import type { LinkNode } from "../src/types/index.js";

describe("visitLinks", () => {
  it("calls visitor for each link and returns results", () => {
    const links: LinkNode[] = [
      { type: "wikilink", value: "Page" },
      { type: "markdown", value: "Link", url: "https://x.com" },
      { type: "url", value: "https://y.com", url: "https://y.com" },
    ];
    const result = visitLinks(links, (link, idx) => link.type);
    expect(result).toEqual(["wikilink", "markdown", "url"]);
  });

  it("returns undefined if visitor returns nothing", () => {
    const links: LinkNode[] = [
      { type: "wikilink", value: "Page" },
      { type: "markdown", value: "Link", url: "https://x.com" },
    ];
    const result = visitLinks(links, () => {});
    expect(result).toBeUndefined();
  });

  it("handles empty array", () => {
    const result = visitLinks([], (link) => link.type);
    expect(result).toBeUndefined();
  });

  it("skips undefined entries in array", () => {
    // Should never happen in normal use, but test for robustness
    const links: (LinkNode | undefined)[] = [
      { type: "wikilink", value: "Page" },
      undefined,
      { type: "url", value: "https://y.com", url: "https://y.com" },
    ];
    // @ts-expect-error: purposely testing robustness to undefined
    const result = visitLinks(links as LinkNode[], (link) => link.type);
    expect(result).toEqual(["wikilink", "url"]);
  });

  it("returns undefined for non-array input", () => {
    // @ts-ignore
    expect(visitLinks(null, () => "x")).toBeUndefined();
    // @ts-ignore
    expect(visitLinks(undefined, () => "x")).toBeUndefined();
    // @ts-ignore
    expect(visitLinks({}, () => "x")).toBeUndefined();
  });
});
