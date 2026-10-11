import { describe, expect, it } from "vitest";
import {
  createSyntaxRegistry,
  getSyntax,
  gfmSyntax,
  registerSyntax,
  syntaxes,
} from "../src/index.js";
import type { Syntax } from "../src/index.js";

const customSyntax: Syntax = {
  id: "custom-test",
  supports: [],
  match: () => null,
  parse: (input) => ({ raw: input, provenance: { syntax: "custom-test" } }),
  render: (ast) => ({ value: ast.raw ?? "", diagnostics: [] }),
};

describe("syntax registry", () => {
  it("exposes built-in syntaxes by id", () => {
    expect(getSyntax("gfm")).toBe(gfmSyntax);
    expect(syntaxes().map((syntax) => syntax.id)).toEqual(
      expect.arrayContaining(["gfm", "obsidian", "url", "wikilink"])
    );
  });

  it("registers extension syntaxes without mutating caller-owned registries", () => {
    const registry = createSyntaxRegistry([gfmSyntax]);
    registry.register(customSyntax);

    expect(registry.get("custom-test")).toBe(customSyntax);
    expect(getSyntax("custom-test")).toBeUndefined();
  });

  it("rejects duplicate or blank syntax ids", () => {
    const registry = createSyntaxRegistry([gfmSyntax]);
    expect(() => registry.register({ ...customSyntax, id: "gfm" })).toThrow(/already registered/);
    expect(() => registry.register({ ...customSyntax, id: "" })).toThrow(/id is required/);
  });

  it("allows registering extensions in the default registry", () => {
    registerSyntax(customSyntax);
    expect(getSyntax("custom-test")).toBe(customSyntax);
  });
});
