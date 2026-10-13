// linkity/test/parse.test.ts
// Basic parsing tests

import { describe, it, expect } from "vitest";
import { parseLinks, detectLinkType } from "../src/index.js";

describe("parseLinks", () => {
  it("should return empty array for text with no links", () => {
    const result = parseLinks("Just plain text");
    expect(result).toEqual([]);
  });

  it("should parse wikilinks when enabled", () => {
    const result = parseLinks("Check [[Page]] and [[Other|Alias]]", {
      enableWikilink: true,
      enableMarkdown: false,
      enableUrl: false,
    });
    expect(result).toEqual([
      {
        type: "wikilink",
        value: "Page",
        position: { start: 6, end: 14 },
      },
      {
        type: "wikilink",
        value: "Other",
        alias: "Alias",
        position: { start: 19, end: 33 },
      },
    ]);
  });

  it("should parse wikilink fragments with aliases and source offsets", () => {
    const result = parseLinks("See [[Guide#Intro|read this]]", {
      enableWikilink: true,
      enableMarkdown: false,
      enableUrl: false,
    });
    expect(result).toEqual([
      {
        type: "wikilink",
        value: "Guide",
        fragment: "Intro",
        alias: "read this",
        position: { start: 4, end: 28 },
      },
    ]);
  });

  it("should parse markdown links when enabled", () => {
    const result = parseLinks("Check [link](https://example.com)", {
      enableWikilink: false,
      enableMarkdown: true,
      enableUrl: false,
    });
    expect(result).toEqual([
      {
        type: "markdown",
        value: "link",
        url: "https://example.com",
        position: { start: 6, end: 32 },
      },
    ]);
  });

  it("should parse markdown fragments with source offsets", () => {
    const result = parseLinks("Go [Intro](./guide.md#intro)", {
      enableWikilink: false,
      enableMarkdown: true,
      enableUrl: false,
    });
    expect(result).toEqual([
      {
        type: "markdown",
        value: "Intro",
        url: "./guide.md#intro",
        fragment: "intro",
        position: { start: 3, end: 27 },
      },
    ]);
  });

  it("should parse raw URLs when enabled", () => {
    const result = parseLinks("Visit https://example.com for more", {
      enableWikilink: false,
      enableMarkdown: false,
      enableUrl: true,
    });
    expect(result).toEqual([
      {
        type: "url",
        value: "https://example.com",
        url: "https://example.com",
        position: { start: 6, end: 25 },
      },
    ]);
  });

  it("should parse raw URL fragments and trim trailing punctuation", () => {
    const result = parseLinks("Visit https://example.com/docs#intro.", {
      enableWikilink: false,
      enableMarkdown: false,
      enableUrl: true,
    });
    expect(result).toEqual([
      {
        type: "url",
        value: "https://example.com/docs#intro",
        url: "https://example.com/docs#intro",
        fragment: "intro",
        position: { start: 6, end: 36 },
      },
    ]);
  });

  it("should parse configured custom schemes", () => {
    const result = parseLinks("Open obsidian://open?vault=docs", {
      enableWikilink: false,
      enableMarkdown: false,
      enableUrl: true,
      customSchemes: ["obsidian"],
    });
    expect(result).toEqual([
      {
        type: "custom",
        value: "obsidian://open?vault=docs",
        url: "obsidian://open?vault=docs",
        position: { start: 5, end: 31 },
      },
    ]);
  });
  it("should not parse wikilinks when disabled", () => {
    const result = parseLinks("Check [[Page]]", {
      enableWikilink: false,
      enableMarkdown: true,
      enableUrl: true,
    });
    expect(result.find((n) => n.type === "wikilink")).toBeUndefined();
  });

  it("should not parse markdown links when disabled", () => {
    const result = parseLinks("Check [link](https://example.com)", {
      enableWikilink: true,
      enableMarkdown: false,
      enableUrl: true,
    });
    expect(result.find((n) => n.type === "markdown")).toBeUndefined();
  });

  it("should not parse raw URLs when disabled", () => {
    const result = parseLinks("Visit https://example.com for more", {
      enableWikilink: true,
      enableMarkdown: true,
      enableUrl: false,
    });
    expect(result.find((n) => n.type === "url")).toBeUndefined();
  });

  it("should handle edge cases: escaped brackets", () => {
    const result = parseLinks(
      "Escaped brackets: \\[[Page]] and [notalink](notalink)"
    );
    expect(
      result.find((n) => n.type === "wikilink" && n.value === "Page")
    ).toBeDefined();
    expect(
      result.find((n) => n.type === "markdown" && n.value === "notalink")
    ).toBeDefined();
  });

  it("should handle edge cases: punctuation and mixed content", () => {
    const result = parseLinks("Check [[Page]]. [link](url), https://url.com!");
    expect(
      result.find((n) => n.type === "wikilink" && n.value === "Page")
    ).toBeDefined();
    expect(
      result.find((n) => n.type === "markdown" && n.value === "link")
    ).toBeDefined();
    expect(
      result.find((n) => n.type === "url" && n.value === "https://url.com")
    ).toBeDefined();
  });
});

describe("detectLinkType", () => {
  it("should return null for non-link text", () => {
    const result = detectLinkType("plain text");
    expect(result).toBe(null);
  });

  it("should detect wikilink type", () => {
    expect(detectLinkType("[[Page]]")).toBe("wikilink");
    expect(detectLinkType("[[Page|Alias]]")).toBe("wikilink");
  });

  it("should detect markdown type", () => {
    expect(detectLinkType("[text](url)")).toBe("markdown");
  });

  it("should detect url type", () => {
    expect(detectLinkType("https://foo.com")).toBe("url");
    expect(detectLinkType("http://bar.com")).toBe("url");
  });

  it("should detect custom scheme type", () => {
    expect(detectLinkType("foo://bar")).toBe("custom");
    expect(detectLinkType("my+scheme://baz")).toBe("custom");
  });
});
