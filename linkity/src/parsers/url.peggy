{
  function fragmentOf(url) {
    const hash = url.indexOf("#");
    if (hash === -1) return undefined;
    const fragment = url.slice(hash + 1);
    return fragment || undefined;
  }

  function bracketDelta(url) {
    return (url.match(/\[/g) || []).length - (url.match(/\]/g) || []).length;
  }

  function cleanUrl(rawUrl) {
    let url = rawUrl.replace(/[.,!?;:]+$/, "");
    const parenDelta = (value) => (value.match(/\(/g) || []).length - (value.match(/\)/g) || []).length;
    let changed = true;
    while (changed) {
      changed = false;
      if (url.endsWith("]") && bracketDelta(url) < 0) {
        url = url.slice(0, -1);
        changed = true;
      } else if (url.endsWith(")") && parenDelta(url) < 0) {
        url = url.slice(0, -1);
        changed = true;
      }
      const trimmed = url.replace(/[.,!?;:]+$/, "");
      if (trimmed !== url) {
        url = trimmed;
        changed = true;
      }
    }
    return url;
  }

  function urlNode(scheme, rawUrl) {
    const loc = location();
    const url = cleanUrl(rawUrl);
    const fragment = fragmentOf(url);
    return {
      scheme,
      value: url,
      url,
      ...(bracketDelta(url) !== 0 ? { invalid: true } : {}),
      ...(fragment ? { fragment } : {}),
      position: {
        start: loc.start.offset,
        end: loc.start.offset + url.length,
      },
    };
  }
}

Start
  = Url

Url
  = scheme:Scheme "://" rest:UrlRest {
      return urlNode(scheme, `${scheme}://${rest}`);
    }

Scheme
  = $([A-Za-z] [A-Za-z0-9+.-]*)

UrlRest
  = $([A-Za-z0-9._~:/?#@!$&'()*+,;=%\-[\]]+)
