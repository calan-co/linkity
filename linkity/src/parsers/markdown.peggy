{
  function fragmentOf(url) {
    const hash = url.indexOf("#");
    return hash === -1 ? undefined : url.slice(hash + 1);
  }

  function markdown(value, url, start, end) {
    const fragment = fragmentOf(url);
    return {
      type: "markdown",
      value,
      url,
      ...(fragment ? { fragment } : {}),
      position: { start, end },
    };
  }

  function scanMarkdown(text) {
    const links = [];
    const re = /\[([^\[\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = re.exec(text)) !== null) {
      links.push(markdown(match[1], match[2], match.index, match.index + match[0].length - 1));
    }
    return links;
  }
}

Start
  = text:$(.*) { return scanMarkdown(text); }
