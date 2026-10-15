import { describe, expect, it } from "vitest";
import {
  anchorSyntax,
  compilePegSyntax,
  convertLink,
  createCustomSyntax,
  syntaxToSource,
  syntaxesById,
  validateLink,
} from "../examples/harness-core.mjs";

describe("harness core", () => {
  it("validates a link against a selected syntax", () => {
    const result = validateLink("[[docs/Page.md|Page]]", syntaxesById.obsidian);

    expect(result.ok).toBe(true);
    expect(result.ast).toMatchObject({ path: { containers: ["docs"], resource: "Page", extension: "md" } });
    expect(result.rendered).toBe("[[docs/Page.md|Page]]");
  });

  it("rejects input that does not match the selected syntax", () => {
    expect(validateLink("not a link", syntaxesById.url)).toEqual({
      ok: false,
      error: "Input does not match url syntax",
    });
  });

  it("converts bidirectionally between syntaxes", () => {
    expect(convertLink("[[docs/Page.md|Page]]", syntaxesById.obsidian, syntaxesById.gfm).value).toBe(
      "[Page](docs/Page.md)"
    );
    expect(convertLink("[Page](docs/Page.md)", syntaxesById.gfm, syntaxesById.obsidian).value).toBe(
      "[[docs/Page.md|Page]]"
    );
  });

  it("supports anchor syntax for html a elements", () => {
    const ast = anchorSyntax.parse('<a href="docs/Page.md#Intro">Page</a>');

    expect(ast).toMatchObject({ path: { containers: ["docs"], resource: "Page", extension: "md" }, anchor: "Intro", label: { raw: "Page" } });
    expect(anchorSyntax.render(ast).value).toBe('<a href="docs/Page.md#Intro">Page</a>');
    expect(convertLink("[[docs/Page.md#Intro|Page]]", syntaxesById.obsidian, syntaxesById.anchor).value).toBe(
      '<a href="docs/Page.md#Intro">Page</a>'
    );
  });

  it("creates a syntax profile from simplified PEG", () => {
    const syntax = compilePegSyntax({
      id: "angle",
      supports: ["alias"],
      pegSource: 'match "<" label ">"\nrender "<" label ">"',
    });

    expect(syntax.match("x <Hello>")).toEqual({ raw: "<Hello>", span: { start: 2, end: 9 } });
    expect(syntax.parse("<Hello>")).toMatchObject({ label: { raw: "Hello" } });
    expect(syntax.render(syntax.parse("<Hello>")).value).toBe("<Hello>");
  });

  it("expresses optional Obsidian aliases and embeds in simplified PEG", () => {
    const syntax = compilePegSyntax({
      id: "obsidian-peg",
      supports: ["alias", "embed"],
      pegSource: 'match embed? "[[" target ("|" label)? "]]"\nrender embed? "[[" target ("|" label)? "]]"',
    });

    expect(syntax.parse("[[Project Plan]]")).toMatchObject({ path: { resource: "Project Plan" } });
    expect(syntax.render(syntax.parse("[[Project Plan]]")).value).toBe("[[Project Plan]]");
    expect(syntax.render(syntax.parse("![[Project Plan|Roadmap]]")).value).toBe("![[Project Plan|Roadmap]]");
  });

  it("keeps createCustomSyntax as a PEG profile factory", () => {
    const syntax = createCustomSyntax({
      id: "angle",
      supports: ["alias"],
      pegSource: 'match "<" label ">"\nrender "<" label ">"',
    });

    expect(syntax.render(syntax.parse("<Hello>")).value).toBe("<Hello>");
  });

  it("serializes existing syntaxes into editable PEG", () => {
    expect(syntaxToSource(syntaxesById.gfm)).toMatchObject({ id: "gfm", supports: expect.arrayContaining(["alias"]) });
    expect(syntaxToSource(syntaxesById.gfm).pegSource).toContain("match");
    expect(syntaxToSource(syntaxesById.anchor).pegSource).toContain('"<a href=\\\""');
  });
});
