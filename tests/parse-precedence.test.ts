import { describe, it, expect } from "vitest";
import { parseLinks } from "../src/index.js";

describe("parser switches and ignore-in-code policy", () => {
  it("ignores links inside fenced code blocks", () => {
    const text = "```\nhttps://example.com\n[[Nope]]\n[txt](https://x)\n```";
    expect(parseLinks(text)).toEqual([]);
  });

  it("off switch isolates a single parser", () => {
    const text = "[L](https://x) and https://y and [[Z]]";
    expect(parseLinks(text, { enableWikilink: false, enableMarkdown: false, enableUrl: true }).every((n) => n.provenance?.syntax === "url")).toBe(true);
    expect(parseLinks(text, { enableWikilink: true, enableMarkdown: false, enableUrl: false }).every((n) => n.provenance?.syntax === "obsidian")).toBe(true);
  });
});
