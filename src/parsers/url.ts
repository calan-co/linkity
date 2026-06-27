// linkity/src/parsers/url.ts
// Raw URL parser

// TODO: perform extensive testing and validation of this URI regex
// ^(?:(?:\[(?<text>.+?)\])?\((?:(?<protocol>(?:[^:]+)s?)?:\/\/)?(?:(?<user>[^:\n\r]+):(?<pass>[^@\n\r]+)@)?(?<host>(?:www\.)?(?:[^:\/\n\r]+))(?::(?<port>\d+))?\/?(?<resource>[^?#\n\r]+)?\??(?<query>[^#\n\r]*)?\#?(?<anchor>[^\n\r]*)?\))$
import type { LinkNode } from "../types/index.js";

export function parseRawUrl(_text: string): LinkNode[] {
  const text = _text;
  // Default schemes: http, https
  const defaultSchemes = ["http", "https"];
  // Accept custom schemes via second argument
  const customSchemes = arguments.length > 1 ? arguments[1] : [];
  const allSchemes = [
    ...defaultSchemes,
    ...(Array.isArray(customSchemes) ? customSchemes : []),
  ];
  const schemePattern = allSchemes
    .map((s) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|");
  // Match until whitespace or punctuation (but allow . and /)
  const regex = new RegExp(
    `\\b(?:${schemePattern}):\\/\\/[a-zA-Z0-9._~:/?#@!$&'()*+,;=%-]+`,
    "g"
  );
  const results: LinkNode[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    const [full] = match;
    const scheme = full.split(":")[0];
    if (typeof scheme === "string") {
      // Remove trailing punctuation from URL
      const cleanUrl = full.replace(/[.,!?;:]+$/, "");
      results.push({
        type: allSchemes.includes(scheme)
          ? defaultSchemes.includes(scheme)
            ? "url"
            : "custom"
          : "url",
        value: cleanUrl,
        url: cleanUrl,
        position: {
          start: match.index,
          end: match.index + cleanUrl.length,
        },
      });
    }
  }
  return results;
}
