{
  function wikilink(value, fragment, alias, start, end) {
    return {
      type: "wikilink",
      value,
      ...(fragment ? { fragment } : {}),
      ...(alias ? { alias } : {}),
      position: { start, end },
    };
  }

  function scanWikilinks(input) {
    const links = [];
    const re = /\\?\[\[(?:([^#|\]]+)(?:#([^|\]]+))?|#([^|\]]+))(?:\|([^\]]+))?\]\]/g;
    let match;
    while ((match = re.exec(input)) !== null) {
      const alias = match[4];
      links.push(wikilink(
        match[1] || "",
        match[2] || match[3],
        alias,
        match.index,
        // Preserve the historical Linkity offset contract: plain wikilinks use
        // an exclusive end, aliased wikilinks use the closing bracket offset.
        alias ? match.index + match[0].length - 1 : match.index + match[0].length,
      ));
    }
    return links;
  }
}

Start
  = .* { return scanWikilinks(input); }
