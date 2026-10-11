import { describe, expect, it } from "vitest";
import { obsidianSyntax, parseLinks } from "../src/index.js";
import type { FileIndex } from "../src/index.js";

describe("review finding regressions", () => {
  it("prefers source-relative Obsidian targets before basename fallback", () => {
    const fileIndex: FileIndex = {
      files: [{ path: "README.md" }, { path: "docs/README.md" }],
    };

    expect(obsidianSyntax.parse("[[README]]", { sourcePath: "docs/guide.md", fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
    });
  });

  it("passes fragmentless targets to custom resolvers and restores the fragment", () => {
    const fileIndex: FileIndex = {
      resolvePath: (target) => (target === "README" ? "docs/README.md" : undefined),
    };

    expect(obsidianSyntax.parse("[[README#Intro]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
      anchor: "Intro",
    });
  });

  it("does not double-parse raw URLs inside markdown links", () => {
    const links = parseLinks("See [Example](https://example.com) and https://standalone.test");

    expect(links.map((link) => link.provenance?.syntax)).toEqual(["gfm", "url"]);
  });

  it("honors custom raw URL schemes", () => {
    expect(parseLinks("See foo://bar", { enableMarkdown: false, enableWikilink: false })).toEqual([]);
    expect(
      parseLinks("See foo://bar", {
        enableMarkdown: false,
        enableWikilink: false,
        customSchemes: ["foo"],
      })
    ).toHaveLength(1);
  });
});

it("exposes direct wikilink syntax with a wikilink id", async () => {
  const { getSyntax, wikilinkSyntax } = await import("../src/index.js");
  expect(wikilinkSyntax.id).toBe("wikilink");
  expect(getSyntax("wikilink")?.id).toBe("wikilink");
});

it("rejects missing Obsidian headings and blocks when context lists them", () => {
  const fileIndex: FileIndex = {
    files: [{ path: "docs/README.md", headings: ["Intro"], blocks: ["abc123"] }],
  };

  expect(() => obsidianSyntax.parse("[[README#Missing]]", { fileIndex })).toThrow(/Heading Missing/);
  expect(() => obsidianSyntax.parse("[[README#^missing]]", { fileIndex })).toThrow(/Block missing/);
});
