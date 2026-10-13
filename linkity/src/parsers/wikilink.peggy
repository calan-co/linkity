{
  function wikilink(value, fragment, alias) {
    const loc = location();
    return {
      type: "wikilink",
      value,
      ...(fragment ? { fragment } : {}),
      ...(alias ? { alias } : {}),
      position: {
        start: loc.start.offset,
        // Preserve the historical Linkity offset contract: plain wikilinks use
        // an exclusive end, aliased wikilinks use the closing bracket offset.
        end: alias ? loc.end.offset - 1 : loc.end.offset,
      },
    };
  }
}

Start
  = parts:(Wikilink / Char)* {
      return parts.filter(Boolean);
    }

Wikilink
  = "\\"? "[[" value:Target fragment:Fragment? alias:Alias? "]]" {
      return wikilink(value, fragment, alias);
    }
  / "\\"? "[[" fragment:Fragment alias:Alias? "]]" {
      return wikilink("", fragment, alias);
    }

Target
  = $((![#|\]] .)+)

Fragment
  = "#" value:$((![|\]] .)+) {
      return value;
    }

Alias
  = "|" value:$((!"]" .)+) {
      return value;
    }

Char
  = . {
      return null;
    }
