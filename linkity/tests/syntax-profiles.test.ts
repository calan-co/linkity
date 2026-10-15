import { describe, expect, it } from "vitest";
import { gfmSyntax, obsidianSyntax, parseWikilink } from "../src/index.js";

describe("additive syntax profiles", () => {
  it("keeps legacy LinkNode extraction unchanged", () => {
    expect(parseWikilink("[[Page]]")[0]).toMatchObject({ type: "wikilink", value: "Page", position: { start: 0, end: 8 } });
  });

  it("exposes a canonical Obsidian AST separately", () => {
    expect(obsidianSyntax.parse("![[Page#Heading|Alias]]")).toMatchObject({
      embed: true,
      path: { resource: "Page" },
      anchor: "Heading",
      label: { raw: "Alias" },
      provenance: { syntax: "obsidian" },
    });
  });

  it("adds GFM extended autolinks without changing legacy Markdown parsing", () => {
    expect(gfmSyntax.parse("www.example.com")).toMatchObject({
      scheme: "http",
      authority: "www.example.com",
      provenance: { syntax: "gfm", rule: "extended-autolink" },
    });
  });
});
