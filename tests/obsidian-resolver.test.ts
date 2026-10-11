import { describe, expect, it } from "vitest";
import { obsidianSyntax } from "../src/index.js";
import type { FileIndex } from "../src/index.js";

const fileIndex: FileIndex = {
  files: [
    { path: "docs/README.md", title: "Read Me", aliases: ["Start Here"], headings: ["Intro"], blocks: ["abc123"] },
    { path: "notes/my-note.md" },
    { path: "archive/My Note.md" },
  ],
};

describe("obsidian resolver context", () => {
  it("resolves exact filenames case-insensitively and ignores .md", () => {
    expect(obsidianSyntax.parse("[[readme]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
    });
  });

  it("resolves normalized filenames treating spaces, dashes, and underscores as equivalent", () => {
    expect(obsidianSyntax.parse("[[my_note]]", { fileIndex })).toMatchObject({
      path: { containers: ["notes"], resource: "my-note", extension: "md" },
    });
  });

  it("uses provided paths to disambiguate", () => {
    expect(obsidianSyntax.parse("[[archive/My Note]]", { fileIndex })).toMatchObject({
      path: { containers: ["archive"], resource: "My Note", extension: "md" },
    });
  });

  it("resolves aliases and titles", () => {
    expect(obsidianSyntax.parse("[[Start Here]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
    });
    expect(obsidianSyntax.parse("[[Read Me]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
    });
  });

  it("preserves anchors and blocks after resolving the file path", () => {
    expect(obsidianSyntax.parse("[[README#Intro]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
      anchor: "Intro",
    });
    expect(obsidianSyntax.parse("[[README#^abc123]]", { fileIndex })).toMatchObject({
      path: { containers: ["docs"], resource: "README", extension: "md" },
      block: "abc123",
    });
  });

  it("preserves unresolved input instead of scanning or creating files", () => {
    expect(obsidianSyntax.parse("[[Missing Note]]", { fileIndex })).toMatchObject({
      path: { resource: "Missing Note" },
      provenance: { syntax: "obsidian" },
    });
  });
});
