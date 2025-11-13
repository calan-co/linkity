// linkity/examples/basic-usage.mjs
// Basic usage example for Node.js (ESM)

import { parseLinks, detectLinkType } from "linkity";

const text = `
# My Notes

Check out [[Obsidian]] for wikilinks!
Also see [GitHub](https://github.com) for markdown links.
Visit https://example.com directly.
`;

console.log("Example text:");
console.log(text);

console.log("\nParsing all links:");
const links = parseLinks(text);
console.log(links);

console.log("\nParsing only wikilinks:");
const wikilinks = parseLinks(text, {
  enableWikilink: true,
  enableMarkdown: false,
  enableUrl: false,
});
console.log(wikilinks);

console.log("\nDetecting link types:");
console.log("[[Page]] ->", detectLinkType("[[Page]]"));
console.log("[text](url) ->", detectLinkType("[text](url)"));
console.log("https://example.com ->", detectLinkType("https://example.com"));
