{
  function fragmentOf(url) {
    const hash = url.indexOf("#");
    return hash === -1 ? undefined : url.slice(hash + 1);
  }

  function markdown(value, url) {
    const loc = location();
    const fragment = fragmentOf(url);
    return {
      type: "markdown",
      value,
      url,
      ...(fragment ? { fragment } : {}),
      position: {
        start: loc.start.offset,
        end: loc.end.offset - 1,
      },
    };
  }
}

Start
  = parts:(MarkdownLink / Char)* {
      return parts.filter(Boolean);
    }

MarkdownLink
  = "[" value:Label "]" "(" url:Destination ")" {
      return markdown(value, url);
    }

Label
  = $((!"]" .)+)

Destination
  = $((!")" .)+)

Char
  = . {
      return null;
    }
