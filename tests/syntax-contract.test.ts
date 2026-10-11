import { describe, expect, it } from "vitest";
import {
  gfmSyntax,
  obsidianSyntax,
  urlSyntax,
  parseLink,
  renderLink,
} from "../src/index.js";

const fileIndex = {
  resolvePath: (target: string, sourcePath?: string) =>
    target === "README.md" && sourcePath === "docs/guide.md" ? "docs/README.md" : target,
};

describe("Syntax contract", () => {
  it("matches cheap link candidates", () => {
    expect(obsidianSyntax.match("before [[README.md|Read me]] after")).toEqual({
      raw: "[[README.md|Read me]]",
      span: { start: 7, end: 28 },
    });
    expect(gfmSyntax.match("before [Read me](README.md) after")).toEqual({
      raw: "[Read me](README.md)",
      span: { start: 7, end: 27 },
    });
  });

  it("parses one link into canonical Ast with structured path, query, label, and provenance", () => {
    expect(obsidianSyntax.parse("[[docs/Page.md?draft&x=1#Intro|Read me]]")).toEqual({
      raw: "[[docs/Page.md?draft&x=1#Intro|Read me]]",
      path: {
        containers: ["docs"],
        resource: "Page",
        extension: "md",
        separator: "/",
        absolute: false,
      },
      anchor: "Intro",
      query: { draft: true, x: "1" },
      label: { raw: "Read me", semantic: "literal" },
      provenance: { syntax: "obsidian", rule: "wikilink" },
    });
  });

  it("uses caller-provided context for relative path resolution", () => {
    expect(obsidianSyntax.parse("[[README.md]]", { sourcePath: "docs/guide.md", fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
    });
  });

  it("renders between syntaxes through Ast", () => {
    const ast = obsidianSyntax.parse("[[docs/Page.md?draft#Intro|Read me]]");
    expect(gfmSyntax.render(ast).value).toBe("[Read me](docs/Page.md?draft#Intro)");
    expect(renderLink(parseLink("[[docs/Page.md|Read me]]", obsidianSyntax), gfmSyntax).value).toBe(
      "[Read me](docs/Page.md)"
    );
  });

  it("defaults lossy rendering to errors and permits warning opt-in", () => {
    const ast = obsidianSyntax.parse("![[docs/Page.md#^block|Read me]]");
    expect(gfmSyntax.render(ast)).toEqual({
      diagnostics: [
        {
          level: "error",
          feature: "block",
          message: "Syntax gfm cannot render feature block",
        },
        {
          level: "error",
          feature: "embed",
          message: "Syntax gfm cannot render feature embed",
        },
      ],
    });
    expect(gfmSyntax.render(ast, { lossy: "warn" })).toEqual({
      value: "[Read me](docs/Page.md)",
      diagnostics: [
        {
          level: "warning",
          feature: "block",
          message: "Syntax gfm cannot render feature block",
        },
        {
          level: "warning",
          feature: "embed",
          message: "Syntax gfm cannot render feature embed",
        },
      ],
    });
  });

  it("treats URL as syntax projection, not an Ast property", () => {
    const ast = urlSyntax.parse("https://example.com/docs/Page.md?x=1#Intro");
    expect(ast).toMatchObject({
      scheme: "https",
      authority: "example.com",
      path: { containers: ["docs"], resource: "Page", extension: "md" },
      query: { x: "1" },
      anchor: "Intro",
    });
    expect(ast).not.toHaveProperty("url");
    expect(urlSyntax.render(ast).value).toBe("https://example.com/docs/Page.md?x=1#Intro");
  });
});
