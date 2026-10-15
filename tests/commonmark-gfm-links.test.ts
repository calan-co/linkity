import { describe, expect, it } from "vitest";
import { commonmarkSyntax, gfmSyntax } from "../src/index.js";

const references = {
  "project plan": { destination: "/plans/project", title: "Project plan" },
  guide: { destination: "/guide" },
};

describe("CommonMark 0.31.2 links", () => {
  it.each([
    ["[link](/uri)", "/uri", "link", "inline-link"],
    ["[]()", "", "", "inline-link"],
    ["[link](</my uri>)", "/my uri", "link", "inline-link"],
    ["[link](/uri \"title\")", "/uri", "link", "inline-link"],
    ["[a](<b)c>)", "b)c", "a", "inline-link"],
    ["[Project][project plan]", "/plans/project", "Project", "full-reference-link"],
    ["[guide][]", "/guide", "guide", "collapsed-reference-link"],
    ["[GUIDE]", "/guide", "GUIDE", "shortcut-reference-link"],
    ["<https://example.com/path?q=1>", "https://example.com/path?q=1", "https://example.com/path?q=1", "autolink"],
    ["<foo@example.com>", "mailto:foo@example.com", "foo@example.com", "autolink"],
  ])("parses documented positive fixture %s", (input, destination, label, rule) => {
    const ast = commonmarkSyntax.parse(input, { referenceDefinitions: references });
    expect(commonmarkSyntax.render(ast).value).toBe(input);
    expect(ast.label?.raw).toBe(label);
    expect(ast.provenance?.rule).toBe(rule);
    expect(commonmarkSyntax.render(ast).value).toBe(input);
  });

  it.each([
    "[link](/my uri)",
    "[link](foo\nbar)",
    "[a](<b>c)",
    "[guide][]",
    "<not a uri>",
    "<foo@bar>",
  ])("rejects documented negative fixture %s", (input) => {
    expect(() => commonmarkSyntax.parse(input)).toThrow();
  });
});

describe("GFM autolinks extension", () => {
  it.each([
    ["www.commonmark.org", "http://www.commonmark.org"],
    ["https://commonmark.org/help", "https://commonmark.org/help"],
    ["foo+tag@bar.baz", "mailto:foo+tag@bar.baz"],
  ])("extends CommonMark with %s", (input, destination) => {
    const ast = gfmSyntax.parse(input);
    expect(gfmSyntax.render(ast).value).toBe(input);
    expect(ast.provenance?.rule).toBe("extended-autolink");
  });

  it.each(["www.foo", "https://foo", "foo@bar", "foo@bar_"])
  ("rejects invalid extended autolink %s", (input) => {
    expect(() => gfmSyntax.parse(input)).toThrow();
  });

  it("does not recognise an extended autolink in the middle of a word", () => {
    expect(gfmSyntax.match("prefixwww.commonmark.org")).toBeNull();
    expect(gfmSyntax.match("Visit www.commonmark.org")).toMatchObject({ raw: "www.commonmark.org" });
  });

  it("inherits CommonMark inline and reference links", () => {
    expect(gfmSyntax.parse("[guide][]", { referenceDefinitions: references })).toMatchObject({
      provenance: { syntax: "gfm", rule: "collapsed-reference-link" },
    });
  });
});

describe("link grammar boundaries", () => {
  it("rejects CommonMark autolink schemes over 32 characters and invalid email segments", () => {
    expect(() => commonmarkSyntax.parse(`<${"a".repeat(33)}:x>`)).toThrow();
    expect(() => commonmarkSyntax.parse("<foo@bar-.com>")).toThrow();
  });

  it("limits GFM extension schemes to HTTP(S) and removes terminal punctuation", () => {
    expect(() => gfmSyntax.parse("ftp://example.com")).toThrow();
    expect(gfmSyntax.match("Visit www.example.com.")).toMatchObject({ raw: "www.example.com" });
    expect(gfmSyntax.match("https://example.com/foo)")).toMatchObject({ raw: "https://example.com/foo" });
  });

  it("allows extended email autolinks in text nodes", () => {
    expect(gfmSyntax.match("[foo@bar.baz")).toMatchObject({ raw: "foo@bar.baz", span: { start: 1, end: 12 } });
  });

  it("scans link-free text in linear time", () => {
    const start = performance.now();
    expect(gfmSyntax.match("x".repeat(2_000))).toBeNull();
    expect(performance.now() - start).toBeLessThan(100);
  });
});

describe("URL query parsing", () => {
  it("keeps malformed escapes literal and preserves equals signs in values", () => {
    expect(gfmSyntax.parse("[search](https://example.com/?q=a=b&bad=%)")).toMatchObject({
      query: { q: "a=b", bad: "%" },
    });
  });
});
