{
  function fragmentOf(url) {
    const hash = url.indexOf("#");
    if (hash === -1) return undefined;
    const fragment = url.slice(hash + 1);
    return fragment || undefined;
  }

  function urlNode(scheme, rawUrl) {
    const loc = location();
    const cleanUrl = rawUrl.replace(/[.,!?;:]+$/, "");
    const fragment = fragmentOf(cleanUrl);
    return {
      scheme,
      value: cleanUrl,
      url: cleanUrl,
      ...(fragment ? { fragment } : {}),
      position: {
        start: loc.start.offset,
        end: loc.start.offset + cleanUrl.length,
      },
    };
  }
}

Start
  = parts:(Url / Char)* {
      return parts.filter(Boolean);
    }

Url
  = scheme:Scheme "://" rest:UrlRest {
      return urlNode(scheme, `${scheme}://${rest}`);
    }

Scheme
  = $([A-Za-z] [A-Za-z0-9+.-]*)

UrlRest
  = $([A-Za-z0-9._~:/?#@!$&'()*+,;=%-]+)

Char
  = . {
      return null;
    }
