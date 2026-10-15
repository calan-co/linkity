ExtendedAutolink
  = source:$(("https"i / "http"i) "://" ValidDomain ExtendedPath?) { const value = trimGfmSuffix(source); return { kind: "extended-autolink", label: value, destination: value }; }
  / source:$("www." ValidDomain ExtendedPath?) { const value = trimGfmSuffix(source); return { kind: "extended-autolink", label: value, destination: `http://${value}` }; }
  / email:ExtendedEmail { return { kind: "extended-autolink", label: email, destination: `mailto:${email}` }; }

ValidDomain = first:DomainSegment rest:("." segment:DomainSegment { return segment; })+ {
  const segments = [first, ...rest];
  if (segments.slice(-2).some((segment) => segment.includes("_"))) expected("domain without underscores in final segments");
  return segments.join(".");
}
DomainSegment = $([A-Za-z0-9_-]+)
ExtendedPath = $([^ \t\n<]*)
ExtendedEmail = local:$([A-Za-z0-9._+-]+) "@" domain:ValidDomain {
  if (/[-_]$/.test(domain)) expected("email domain not ending in hyphen or underscore");
  return `${local}@${domain}`;
}
