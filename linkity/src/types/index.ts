// linkity/src/types/index.ts
// Type definitions for Linkity

/**
 * Supported link types in Linkity.
 */
export type LinkType = "wikilink" | "markdown" | "url" | "custom";

/**
 * Represents a parsed link and its metadata.
 *
 * Extensible for future context fields (e.g., inCode, inHeading, headingLevel, inline).
 * All fields except `type` and `value` are optional for compatibility with current and future parsers.
 *
 * Example usage:
 *   {
 *     type: "markdown",
 *     value: "[Link](https://example.com)",
 *     url: "https://example.com",
 *     position: { start: 10, end: 32 },
 *     context: { inHeading: true, headingLevel: 2 }
 *   }
 */
export interface LinkNode {
  /** Link type (wikilink, markdown, url, custom) */
  type: LinkType;
  /** Raw link text as found in source */
  value: string;
  /** Optional alias or display text */
  alias?: string;
  /** Optional fragment/anchor target */
  fragment?: string;
  /** Parsed URL (if available) */
  url?: string;
  /** Character offsets in original string */
  position?: {
    start: number;
    end: number;
  };
  /** Arbitrary parser-specific data */
  data?: Record<string, any>;
  /**
   * Optional context metadata for richer link info.
   * - inCode: true if link is inside a code block/span
   * - inHeading: true if link is inside a heading
   * - headingLevel: heading level (if inHeading)
   * - inline: true if link is inline (not block)
   */
  context?: {
    inCode?: boolean;
    inHeading?: boolean;
    headingLevel?: number;
    inline?: boolean;
    [key: string]: any;
  };
}

export interface LinkityParseOptions {
  enableWikilink?: boolean;
  enableMarkdown?: boolean;
  enableUrl?: boolean;
  customSchemes?: string[];
}
