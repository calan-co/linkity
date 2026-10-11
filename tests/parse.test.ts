import { describe, it, expect } from "vitest";
import { parseLinks, detectLinkType } from "../src/index.js";

describe("parseLinks", () => {
  it("returns empty array for text with no links", () => {
    expect(parseLinks("Just plain text")).toEqual([]);
  });

  it("parses wikilinks when enabled", () => {
    const result = parseLinks("Check [[Page]] and [[Other|Alias]]", {
      enableWikilink: true,
      enableMarkdown: false,
      enableUrl: false,
    });
    expect(result).toMatchObject([
      {
        raw: "[[Page]]",
        path: { resource: "Page" },
        span: { start: 6, end: 14 },
        provenance: { syntax: "obsidian" },
      },
      {
        raw: "[[Other|Alias]]",
        path: { resource: "Other" },
        label: { raw: "Alias" },
        span: { start: 19, end: 34 },
      },
    ]);
  });

  it("parses markdown links when enabled", () => {
    const result = parseLinks("Check [link](https://example.com)", {
      enableWikilink: false,
      enableMarkdown: true,
      enableUrl: false,
    });
    expect(result).toMatchObject([
      {
        raw: "[link](https://example.com)",
        scheme: "https",
        authority: "example.com",
        label: { raw: "link" },
        span: { start: 6, end: 33 },
      },
    ]);
  });

  it("parses raw URLs when enabled", () => {
    const result = parseLinks("Visit https://example.com for more", {
      enableWikilink: false,
      enableMarkdown: false,
      enableUrl: true,
    });
    expect(result).toMatchObject([
      {
        raw: "https://example.com",
        scheme: "https",
        authority: "example.com",
        span: { start: 6, end: 25 },
      },
    ]);
  });

  it("respects parser off-switches", () => {
    expect(parseLinks("Check [[Page]]", { enableWikilink: false }).some((n) => n.provenance?.syntax === "obsidian")).toBe(false);
    expect(parseLinks("Check [link](https://example.com)", { enableMarkdown: false }).some((n) => n.provenance?.syntax === "gfm")).toBe(false);
    expect(parseLinks("Visit https://example.com", { enableUrl: false }).some((n) => n.provenance?.syntax === "url")).toBe(false);
  });
});

describe("detectLinkType", () => {
  it("detects legacy link types", () => {
    expect(detectLinkType("plain text")).toBe(null);
    expect(detectLinkType("[[Page]]")).toBe("wikilink");
    expect(detectLinkType("[text](url)")).toBe("markdown");
    expect(detectLinkType("https://foo.com")).toBe("url");
    expect(detectLinkType("foo://bar")).toBe("custom");
  });
});
