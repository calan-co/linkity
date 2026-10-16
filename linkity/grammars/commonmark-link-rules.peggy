CommonMarkLink
  = InlineLink
  / ReferenceLink
  / AutoLink

InlineLink
  = "[" label:LinkText "]" "(" Spacing? destination:Destination title:Title? ")" {
      return { kind: "inline-link", label, destination, title: title ?? undefined };
    }

ReferenceLink
  = "[" label:LinkText "]" "[" reference:ReferenceLabel "]" {
      return { kind: reference === "" ? "collapsed-reference-link" : "full-reference-link", label, reference: reference || label };
    }
  / "[" label:LinkText "]" { return { kind: "shortcut-reference-link", label, reference: label }; }

AutoLink
  = "<" uri:AbsoluteUri ">" { return { kind: "autolink", label: uri, destination: uri }; }
  / "<" email:Email ">" { return { kind: "autolink", label: email, destination: `mailto:${email}` }; }

LinkText = chars:LinkTextCharacter* { return chars.join(""); }
LinkTextCharacter
  = "\\" char:. { return `\\${char}`; }
  / BalancedLinkText
  / !"[" !"]" char:. { return char; }
BalancedLinkText = "[" chars:LinkTextCharacter* "]" !"(" { return `[${chars.join("")}]`; }

ReferenceLabel = chars:ReferenceCharacter* { return chars.join(""); }
ReferenceCharacter
  = "\\" char:. { return `\\${char}`; }
  / !"[" !"]" char:. { return char; }

Destination
  = "<" chars:AngleDestinationCharacter* ">" { return chars.join(""); }
  / chars:BareDestinationCharacter* { return chars.join(""); }
AngleDestinationCharacter = ![<>\n] char:. { return char; }
BareDestinationCharacter = ParenthesizedDestination / ![() \t\n] char:. { return char; }
ParenthesizedDestination = "(" chars:BareDestinationCharacter* ")" { return `(${chars.join("")})`; }

Title
  = Spacing title:(QuotedTitle / ApostropheTitle / ParenthesizedTitle) { return title; }
QuotedTitle = "\"" chars:QuotedTitleCharacter* "\"" { return chars.join(""); }
QuotedTitleCharacter = "\\" char:. { return char; } / ![\"\n] char:. { return char; }
ApostropheTitle = "'" chars:(!['\n] char:.)* "'" { return chars.map((item) => item[1]).join(""); }
ParenthesizedTitle = "(" chars:(![)\n] char:.)* ")" { return chars.map((item) => item[1]).join(""); }

AbsoluteUri = scheme:Scheme ":" rest:$([^ <>\"'`\\\n]*) { return `${scheme}:${rest}`; }
Scheme = first:[A-Za-z] rest:[A-Za-z0-9+.-]+ {
  const scheme = `${first}${rest.join("")}`;
  if (scheme.length > 32) expected("scheme of at most 32 characters");
  return scheme;
}
Email = local:$([A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+) "@" domain:EmailDomain { return `${local}@${domain}`; }
EmailDomain = first:EmailDomainSegment rest:("." segment:EmailDomainSegment { return segment; })+ { return [first, ...rest].join("."); }
EmailDomainSegment = first:[A-Za-z0-9] middle:[A-Za-z0-9-]* last:([A-Za-z0-9]?) {
  const segment = `${first}${middle.join("")}${last ?? ""}`;
  if (segment.endsWith("-")) expected("email domain segment ending alphanumeric");
  return segment;
}
Spacing = [ \t]+ 
