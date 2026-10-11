import { describe, it, expect } from "vitest";
import { visitLinks } from "../src/utils/index.js";
import type { Ast } from "../src/types/index.js";

describe("visitLinks", () => {
  it("calls visitor for each link and returns results", () => {
    const links: Ast[] = [
      { path: { resource: "Page" }, provenance: { syntax: "obsidian" } },
      { scheme: "https", authority: "x.com", provenance: { syntax: "url" } },
    ];
    expect(visitLinks(links, (link) => link.provenance?.syntax)).toEqual(["obsidian", "url"]);
  });

  it("returns undefined if visitor returns nothing", () => {
    expect(visitLinks([{ path: { resource: "Page" } }], () => {})).toBeUndefined();
  });

  it("handles empty and invalid input", () => {
    expect(visitLinks([], (link) => link.raw)).toBeUndefined();
    // @ts-ignore robustness
    expect(visitLinks(null, () => "x")).toBeUndefined();
  });
});
