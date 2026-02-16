import { describe, it, expect } from "vitest";
import { parseLinks } from "../src/index.js";

describe("parser precedence and ignore-in-code policy (stubs)", () => {
  it.skip("does not double-parse nested patterns (wikilink over markdown)", () => {
    const text = "[[Page (not a markdown link)]]";
    const links = parseLinks(text, {
      enableWikilink: true,
      enableMarkdown: true,
      enableUrl: true,
    });
    // Expectation once implemented:
    // expect(links.filter(l => l.type === 'wikilink').length).toBe(1);
    // expect(links.filter(l => l.type === 'markdown').length).toBe(0);
    expect(Array.isArray(links)).toBe(true);
  });

  it.skip("ignores links inside fenced code blocks", () => {
    const text = String.raw`\n\`\`\`\nhttps://example.com\n[[Nope]]\n[txt](https://x)\n\`\`\`\n`; // backticks escaped for TS template
    const links = parseLinks(text);
    // Expectation once implemented: expect(links.length).toBe(0);
    expect(Array.isArray(links)).toBe(true);
  });

  it("off switch isolates a single parser", () => {
    const text = "[L](https://x) and https://y and [[Z]]";
    const onlyUrl = parseLinks(text, {
      enableWikilink: false,
      enableMarkdown: false,
      enableUrl: true,
    });
    expect(onlyUrl.every((n) => n.type === "url")).toBe(true);
    const onlyWl = parseLinks(text, {
      enableWikilink: true,
      enableMarkdown: false,
      enableUrl: false,
    });
    expect(onlyWl.every((n) => n.type === "wikilink")).toBe(true);
  });
});
