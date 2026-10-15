import { describe, expect, it } from "vitest";
import { obsidianSyntax } from "../src/index.js";

describe("Obsidian-style wikilinks", () => {
  it.each([
    ["[[Project Plan]]", { path: { resource: "Project Plan" } }],
    ["[[Project Plan|Roadmap]]", { path: { resource: "Project Plan" }, label: { raw: "Roadmap" } }],
    ["[[Project Plan#Milestones#Q1]]", { path: { resource: "Project Plan" }, anchor: "Milestones#Q1" }],
    ["[[Project Plan#^decision-123]]", { path: { resource: "Project Plan" }, block: "decision-123" }],
    ["[[#Current heading]]", { anchor: "Current heading" }],
    ["![[assets/image.png]]", { embed: true, path: { containers: ["assets"], resource: "image", extension: "png" } }],
    ["![[Project Plan#Section|Embedded plan]]", { embed: true, anchor: "Section", label: { raw: "Embedded plan" } }],
  ])("parses documented valid form %s", (input, expected) => {
    expect(obsidianSyntax.parse(input)).toMatchObject(expected);
    expect(obsidianSyntax.match(input)).toEqual({ raw: input, span: { start: 0, end: input.length } });
  });

  it("does not match malformed or nested brackets as a valid wikilink", () => {
    expect(obsidianSyntax.match("[[Project Plan")).toBeNull();
    expect(obsidianSyntax.match("[[[Project Plan]]]")).toBeNull();
    expect(() => obsidianSyntax.parse("[[Project Plan")).toThrow("Invalid obsidian link");
  });

  it("round-trips documented wiki forms without inventing URL query semantics", () => {
    for (const input of [
      "[[Project Plan]]",
      "[[Project Plan|Roadmap]]",
      "[[Project Plan#Milestones#Q1]]",
      "[[Project Plan#^decision-123]]",
      "[[#Current heading]]",
      "![[assets/image.png]]",
    ]) {
      const ast = obsidianSyntax.parse(input);
      expect(ast.query).toBeUndefined();
      expect(obsidianSyntax.render(ast).value).toBe(input);
    }
  });
});

