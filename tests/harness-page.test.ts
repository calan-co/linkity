import { describe, expect, it, vi } from "vitest";

describe("harness page", () => {
  it("has one main validation panel with expandable translation and custom syntax workspaces", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const html = readFileSync("examples/harness.html", "utf8");

    expect(html).toContain('id="validate-panel"');
    expect(html).toContain('id="validation-indicator"');
    expect(html).not.toContain('id="validate-run"');
    expect(html).not.toContain('id="translate-panel"');
    expect(html).toContain('id="translate-section"');
    expect(html).toContain('id="translated-link"');
    expect(html).toContain('<details id="translate-section"');
    expect(html).toContain('id="profile-panel"');
  });

  it("defaults to a valid link for the default syntax", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const html = readFileSync("examples/harness.html", "utf8");

    expect(html).toContain('<option selected>obsidian</option>');
    expect(html).toContain('id="validate-input" value="[[docs/Page.md|Page]]"');
  });

  it("loads the harness core module", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    expect(readFileSync("examples/harness.html", "utf8")).toContain("./harness-core.mjs");
  });

  it("wires dynamic validation and automatic translation", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const html = readFileSync("examples/harness.html", "utf8");

    expect(html).toContain("function updateValidation()");
    expect(html).toContain("updateTranslation(result)");
    expect(html).toContain('title = result.ok ? "Valid"');
    expect(html).toContain('$("validate-input").oninput = updateValidation');
  });

  it("allows selecting and editing existing syntax profiles", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const html = readFileSync("examples/harness.html", "utf8");

    expect(html).toContain('id="profile-id"');
    expect(html).toContain('list="profile-options"');
    expect(html).toContain('id="profile-options"');
    expect(html).toContain("loadProfileEditor");
    expect(html).toContain("syntaxToSource");
    expect(html).toContain('id="custom-peg"');
    expect(html).not.toContain('id="custom-match"');
    expect(html).not.toContain('id="custom-parse"');
    expect(html).not.toContain('id="custom-render"');
  });

  it("offers feature multi-select and PEG authoring help", async () => {
    const { readFileSync } = await vi.importActual<typeof import("node:fs")>("node:fs");
    const html = readFileSync("examples/harness.html", "utf8");

    expect(html).toContain('id="custom-supports" multiple');
    expect(html).toContain('id="peg-highlight"');
    expect(html).toContain('id="peg-reference"');
    expect(html).toContain("PEG_KEYWORDS");
    expect(html).toContain("PEG_COMPONENTS");
    expect(html).toContain("highlightPeg");
  });
});
