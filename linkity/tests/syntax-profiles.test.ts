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

it("supports balanced CommonMark labels and escaped title quotes", async () => {
  const { commonmarkSyntax } = await import("../src/index.js");
  expect(commonmarkSyntax.match("[a [b]](/url)")?.raw).toBe("[a [b]](/url)");
  expect(commonmarkSyntax.parse("<a@foo.bar.baz>")).toMatchObject({ scheme: "mailto" });
  expect(commonmarkSyntax.render({ path: { resource: "url", absolute: true }, label: { raw: "a" }, title: 'a "quote' }).value).toBe('[a](/url "a \\"quote")');
});

it("gives an inner CommonMark link precedence over an outer label", async () => {
  const { commonmarkSyntax } = await import("../src/index.js");
  expect(commonmarkSyntax.match("[a [b](inner)](outer)")?.raw).toBe("[b](inner)");
});

it("decodes escaped CommonMark title quotes", async () => {
  const { commonmarkSyntax } = await import("../src/index.js");
  const ast = commonmarkSyntax.parse('[a](/url "a \\"quote")');
  expect(ast.title).toBe('a "quote');
  expect(commonmarkSyntax.render(ast).value).toBe('[a](/url "a \\"quote")');
});
