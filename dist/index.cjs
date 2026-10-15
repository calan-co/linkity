'use strict';

// src/syntaxes/generated/link-parser.ts
var peg$SyntaxError = class extends SyntaxError {
  constructor(message, expected, found, location) {
    super(message);
    this.expected = expected;
    this.found = found;
    this.location = location;
    this.name = "SyntaxError";
  }
  format(sources) {
    let str = "Error: " + this.message;
    if (this.location) {
      let src = null;
      const st = sources.find((s2) => s2.source === this.location.source);
      if (st) {
        src = st.text.split(/\r\n|\n|\r/g);
      }
      const s = this.location.start;
      const offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
      const loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
      if (src) {
        const e = this.location.end;
        const filler = "".padEnd(offset_s.line.toString().length, " ");
        const line = src[s.line - 1];
        const last = s.line === e.line ? e.column : line.length + 1;
        const hatLen = last - s.column || 1;
        str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + "".padEnd(s.column - 1, " ") + "".padEnd(hatLen, "^");
      } else {
        str += "\n at " + loc;
      }
    }
    return str;
  }
  static buildMessage(expected, found) {
    function hex(ch) {
      return ch.codePointAt(0).toString(16).toUpperCase();
    }
    const nonPrintable = Object.prototype.hasOwnProperty.call(RegExp.prototype, "unicode") ? new RegExp("[\\p{C}\\p{Mn}\\p{Mc}]", "gu") : null;
    function unicodeEscape(s) {
      if (nonPrintable) {
        return s.replace(nonPrintable, (ch) => "\\u{" + hex(ch) + "}");
      }
      return s;
    }
    function literalEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    function classEscape(s) {
      return unicodeEscape(s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, (ch) => "\\x0" + hex(ch)).replace(/[\x10-\x1F\x7F-\x9F]/g, (ch) => "\\x" + hex(ch)));
    }
    const DESCRIBE_EXPECTATION_FNS = {
      literal(expectation) {
        return '"' + literalEscape(expectation.text) + '"';
      },
      class(expectation) {
        const escapedParts = expectation.parts.map(
          (part) => Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part)
        );
        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]" + (expectation.unicode ? "u" : "");
      },
      any() {
        return "any character";
      },
      end() {
        return "end of input";
      },
      other(expectation) {
        return expectation.description;
      }
    };
    function describeExpectation(expectation) {
      return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
    }
    function describeExpected(expected2) {
      const descriptions = expected2.map(describeExpectation);
      descriptions.sort();
      if (descriptions.length > 0) {
        let j = 1;
        for (let i = 1; i < descriptions.length; i++) {
          if (descriptions[i - 1] !== descriptions[i]) {
            descriptions[j] = descriptions[i];
            j++;
          }
        }
        descriptions.length = j;
      }
      switch (descriptions.length) {
        case 1:
          return descriptions[0];
        case 2:
          return descriptions[0] + " or " + descriptions[1];
        default:
          return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
      }
    }
    function describeFound(found2) {
      return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
    }
    return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
  }
};
function peg$parse(input, options) {
  options = options !== void 0 ? options : {};
  const peg$FAILED = {};
  const peg$source = options.grammarSource;
  const peg$startRuleFunctions = {
    start: peg$parsestart,
    GfmLink: peg$parseGfmLink,
    CommonMarkLink: peg$parseCommonMarkLink
  };
  let peg$startRuleFunction = peg$parsestart;
  const peg$c0 = "[";
  const peg$c1 = "]";
  const peg$c2 = "(";
  const peg$c3 = ")";
  const peg$c4 = "<";
  const peg$c5 = ">";
  const peg$c6 = "\\";
  const peg$c7 = '"';
  const peg$c8 = "'";
  const peg$c9 = ":";
  const peg$c10 = "@";
  const peg$c11 = ".";
  const peg$c12 = "https";
  const peg$c13 = "http";
  const peg$c14 = "://";
  const peg$c15 = "www.";
  const peg$r0 = /^[<>\n]/;
  const peg$r1 = /^[() \t\n]/;
  const peg$r2 = /^["\n]/;
  const peg$r3 = /^['\n]/;
  const peg$r4 = /^[)\n]/;
  const peg$r5 = /^[^ <>"'`\\\n]/;
  const peg$r6 = /^[A-Za-z]/;
  const peg$r7 = /^[A-Za-z0-9+.\-]/;
  const peg$r8 = /^[A-Za-z0-9.!#$%&'*+\/=?\^_`{|}~\-]/;
  const peg$r9 = /^[A-Za-z0-9]/;
  const peg$r10 = /^[A-Za-z0-9\-]/;
  const peg$r11 = /^[ \t]/;
  const peg$r12 = /^[A-Za-z0-9_\-]/;
  const peg$r13 = /^[^ \t\n<]/;
  const peg$r14 = /^[A-Za-z0-9._+\-]/;
  const peg$e0 = peg$literalExpectation("[", false);
  const peg$e1 = peg$literalExpectation("]", false);
  const peg$e2 = peg$literalExpectation("(", false);
  const peg$e3 = peg$literalExpectation(")", false);
  const peg$e4 = peg$literalExpectation("<", false);
  const peg$e5 = peg$literalExpectation(">", false);
  const peg$e6 = peg$literalExpectation("\\", false);
  const peg$e7 = peg$anyExpectation();
  const peg$e8 = peg$classExpectation(["<", ">", "\n"], false, false, false);
  const peg$e9 = peg$classExpectation(["(", ")", " ", "	", "\n"], false, false, false);
  const peg$e10 = peg$literalExpectation('"', false);
  const peg$e11 = peg$classExpectation(['"', "\n"], false, false, false);
  const peg$e12 = peg$literalExpectation("'", false);
  const peg$e13 = peg$classExpectation(["'", "\n"], false, false, false);
  const peg$e14 = peg$classExpectation([")", "\n"], false, false, false);
  const peg$e15 = peg$literalExpectation(":", false);
  const peg$e16 = peg$classExpectation([" ", "<", ">", '"', "'", "`", "\\", "\n"], true, false, false);
  const peg$e17 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false, false);
  const peg$e18 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "+", ".", "-"], false, false, false);
  const peg$e19 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], ".", "!", "#", "$", "%", "&", "'", "*", "+", "/", "=", "?", "^", "_", "`", "{", "|", "}", "~", "-"], false, false, false);
  const peg$e20 = peg$literalExpectation("@", false);
  const peg$e21 = peg$literalExpectation(".", false);
  const peg$e22 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"]], false, false, false);
  const peg$e23 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "-"], false, false, false);
  const peg$e24 = peg$classExpectation([" ", "	"], false, false, false);
  const peg$e25 = peg$literalExpectation("https", true);
  const peg$e26 = peg$literalExpectation("http", true);
  const peg$e27 = peg$literalExpectation("://", false);
  const peg$e28 = peg$literalExpectation("www.", false);
  const peg$e29 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "_", "-"], false, false, false);
  const peg$e30 = peg$classExpectation([" ", "	", "\n", "<"], true, false, false);
  const peg$e31 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], ".", "_", "+", "-"], false, false, false);
  function peg$f0(label, destination, title) {
    return { kind: "inline-link", label, destination, title: title ?? void 0 };
  }
  function peg$f1(label, reference) {
    return { kind: reference === "" ? "collapsed-reference-link" : "full-reference-link", label, reference: reference || label };
  }
  function peg$f2(label) {
    return { kind: "shortcut-reference-link", label, reference: label };
  }
  function peg$f3(uri) {
    return { kind: "autolink", label: uri, destination: uri };
  }
  function peg$f4(email) {
    return { kind: "autolink", label: email, destination: `mailto:${email}` };
  }
  function peg$f5(chars) {
    return chars.join("");
  }
  function peg$f6(char) {
    return `\\${char}`;
  }
  function peg$f7(char) {
    return char;
  }
  function peg$f8(chars) {
    return chars.join("");
  }
  function peg$f9(char) {
    return `\\${char}`;
  }
  function peg$f10(char) {
    return char;
  }
  function peg$f11(chars) {
    return chars.join("");
  }
  function peg$f12(chars) {
    return chars.join("");
  }
  function peg$f13(char) {
    return char;
  }
  function peg$f14(char) {
    return char;
  }
  function peg$f15(chars) {
    return `(${chars.join("")})`;
  }
  function peg$f16(title) {
    return title;
  }
  function peg$f17(chars) {
    return chars.map((item) => item[1]).join("");
  }
  function peg$f18(chars) {
    return chars.map((item) => item[1]).join("");
  }
  function peg$f19(chars) {
    return chars.map((item) => item[1]).join("");
  }
  function peg$f20(scheme, rest) {
    return `${scheme}:${rest}`;
  }
  function peg$f21(first, rest) {
    const scheme = `${first}${rest.join("")}`;
    if (scheme.length > 32) expected("scheme of at most 32 characters");
    return scheme;
  }
  function peg$f22(local, domain) {
    return `${local}@${domain}`;
  }
  function peg$f23(first, rest) {
    return [first, ...rest].join(".");
  }
  function peg$f24(first, middle, last) {
    const segment = `${first}${middle.join("")}${last ?? ""}`;
    if (segment.endsWith("-")) expected("email domain segment ending alphanumeric");
    return segment;
  }
  function peg$f25(source) {
    const value = trimGfmSuffix(source);
    return { kind: "extended-autolink", label: value, destination: value };
  }
  function peg$f26(source) {
    const value = trimGfmSuffix(source);
    return { kind: "extended-autolink", label: value, destination: `http://${value}` };
  }
  function peg$f27(email) {
    return { kind: "extended-autolink", label: email, destination: `mailto:${email}` };
  }
  function peg$f28(first, segment) {
    return segment;
  }
  function peg$f29(first, rest) {
    const segments = [first, ...rest];
    if (segments.slice(-2).some((segment) => segment.includes("_"))) expected("domain without underscores in final segments");
    return segments.join(".");
  }
  function peg$f30(local, domain) {
    if (/[-_]$/.test(domain)) expected("email domain not ending in hyphen or underscore");
    return `${local}@${domain}`;
  }
  let peg$currPos = options.peg$currPos | 0;
  let peg$savedPos = peg$currPos;
  const peg$posDetailsCache = [{ line: 1, column: 1 }];
  let peg$maxFailPos = peg$currPos;
  let peg$maxFailExpected = options.peg$maxFailExpected || [];
  let peg$silentFails = options.peg$silentFails | 0;
  let peg$result;
  if (options.startRule) {
    if (!(options.startRule in peg$startRuleFunctions)) {
      throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
    }
    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
  }
  function expected(description, location2) {
    location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
    throw peg$buildStructuredError(
      [peg$otherExpectation(description)],
      input.substring(peg$savedPos, peg$currPos),
      location2
    );
  }
  function peg$getUnicode(pos = peg$currPos) {
    const cp = input.codePointAt(pos);
    if (cp === void 0) {
      return "";
    }
    return String.fromCodePoint(cp);
  }
  function peg$literalExpectation(text2, ignoreCase) {
    return { type: "literal", text: text2, ignoreCase };
  }
  function peg$classExpectation(parts, inverted, ignoreCase, unicode) {
    return { type: "class", parts, inverted, ignoreCase, unicode };
  }
  function peg$anyExpectation() {
    return { type: "any" };
  }
  function peg$endExpectation() {
    return { type: "end" };
  }
  function peg$otherExpectation(description) {
    return { type: "other", description };
  }
  function peg$computePosDetails(pos) {
    let details = peg$posDetailsCache[pos];
    let p;
    if (details) {
      return details;
    } else {
      if (pos >= peg$posDetailsCache.length) {
        p = peg$posDetailsCache.length - 1;
      } else {
        p = pos;
        while (!peg$posDetailsCache[--p]) {
        }
      }
      details = peg$posDetailsCache[p];
      details = {
        line: details.line,
        column: details.column
      };
      while (p < pos) {
        if (input.charCodeAt(p) === 10) {
          details.line++;
          details.column = 1;
        } else {
          details.column++;
        }
        p++;
      }
      peg$posDetailsCache[pos] = details;
      return details;
    }
  }
  function peg$computeLocation(startPos, endPos, offset2) {
    const startPosDetails = peg$computePosDetails(startPos);
    const endPosDetails = peg$computePosDetails(endPos);
    const res = {
      source: peg$source,
      start: {
        offset: startPos,
        line: startPosDetails.line,
        column: startPosDetails.column
      },
      end: {
        offset: endPos,
        line: endPosDetails.line,
        column: endPosDetails.column
      }
    };
    return res;
  }
  function peg$fail(expected2) {
    if (peg$currPos < peg$maxFailPos) {
      return;
    }
    if (peg$currPos > peg$maxFailPos) {
      peg$maxFailPos = peg$currPos;
      peg$maxFailExpected = [];
    }
    peg$maxFailExpected.push(expected2);
  }
  function peg$buildStructuredError(expected2, found, location2) {
    return new peg$SyntaxError(
      peg$SyntaxError.buildMessage(expected2, found),
      expected2,
      found,
      location2
    );
  }
  function peg$parsestart() {
    let s0;
    s0 = peg$parseGfmLink();
    return s0;
  }
  function peg$parseGfmLink() {
    let s0;
    s0 = peg$parseExtendedAutolink();
    if (s0 === peg$FAILED) {
      s0 = peg$parseCommonMarkLink();
    }
    return s0;
  }
  function peg$parseCommonMarkLink() {
    let s0;
    s0 = peg$parseInlineLink();
    if (s0 === peg$FAILED) {
      s0 = peg$parseReferenceLink();
      if (s0 === peg$FAILED) {
        s0 = peg$parseAutoLink();
      }
    }
    return s0;
  }
  function peg$parseInlineLink() {
    let s0, s1, s2, s3, s4, s6, s7, s8;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseLinkText();
      if (input.charCodeAt(peg$currPos) === 93) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s4 = peg$c2;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e2);
          }
        }
        if (s4 !== peg$FAILED) {
          peg$parseSpacing();
          s6 = peg$parseDestination();
          if (s6 !== peg$FAILED) {
            s7 = peg$parseTitle();
            if (s7 === peg$FAILED) {
              s7 = null;
            }
            if (input.charCodeAt(peg$currPos) === 41) {
              s8 = peg$c3;
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e3);
              }
            }
            if (s8 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f0(s2, s6, s7);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseReferenceLink() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 91) {
      s1 = peg$c0;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e0);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseLinkText();
      if (input.charCodeAt(peg$currPos) === 93) {
        s3 = peg$c1;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e1);
        }
      }
      if (s3 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 91) {
          s4 = peg$c0;
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e0);
          }
        }
        if (s4 !== peg$FAILED) {
          s5 = peg$parseReferenceLabel();
          if (input.charCodeAt(peg$currPos) === 93) {
            s6 = peg$c1;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e1);
            }
          }
          if (s6 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f1(s2, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 91) {
        s1 = peg$c0;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseLinkText();
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f2(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseAutoLink() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 60) {
      s1 = peg$c4;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = peg$parseAbsoluteUri();
      if (s2 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 62) {
          s3 = peg$c5;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e5);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f3(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 60) {
        s1 = peg$c4;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseEmail();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 62) {
            s3 = peg$c5;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f4(s2);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseLinkText() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseLinkTextCharacter();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseLinkTextCharacter();
    }
    peg$savedPos = s0;
    s1 = peg$f5(s1);
    s0 = s1;
    return s0;
  }
  function peg$parseLinkTextCharacter() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c6;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f6(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c0;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f7(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseReferenceLabel() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = peg$parseReferenceCharacter();
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = peg$parseReferenceCharacter();
    }
    peg$savedPos = s0;
    s1 = peg$f8(s1);
    s0 = s1;
    return s0;
  }
  function peg$parseReferenceCharacter() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 92) {
      s1 = peg$c6;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e6);
      }
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f9(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      if (input.charCodeAt(peg$currPos) === 91) {
        s2 = peg$c0;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (input.charCodeAt(peg$currPos) === 93) {
          s3 = peg$c1;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f10(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseDestination() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 60) {
      s1 = peg$c4;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e4);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseAngleDestinationCharacter();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseAngleDestinationCharacter();
      }
      if (input.charCodeAt(peg$currPos) === 62) {
        s3 = peg$c5;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e5);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f11(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = [];
      s2 = peg$parseBareDestinationCharacter();
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = peg$parseBareDestinationCharacter();
      }
      peg$savedPos = s0;
      s1 = peg$f12(s1);
      s0 = s1;
    }
    return s0;
  }
  function peg$parseAngleDestinationCharacter() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$currPos;
    peg$silentFails++;
    s2 = input.charAt(peg$currPos);
    if (peg$r0.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e8);
      }
    }
    peg$silentFails--;
    if (s2 === peg$FAILED) {
      s1 = void 0;
    } else {
      peg$currPos = s1;
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      if (input.length > peg$currPos) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e7);
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f13(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseBareDestinationCharacter() {
    let s0, s1, s2;
    s0 = peg$parseParenthesizedDestination();
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = input.charAt(peg$currPos);
      if (peg$r1.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f14(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    }
    return s0;
  }
  function peg$parseParenthesizedDestination() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$parseBareDestinationCharacter();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseBareDestinationCharacter();
      }
      if (input.charCodeAt(peg$currPos) === 41) {
        s3 = peg$c3;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e3);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f15(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseTitle() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = peg$parseSpacing();
    if (s1 !== peg$FAILED) {
      s2 = peg$parseQuotedTitle();
      if (s2 === peg$FAILED) {
        s2 = peg$parseApostropheTitle();
        if (s2 === peg$FAILED) {
          s2 = peg$parseParenthesizedTitle();
        }
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f16(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseQuotedTitle() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 34) {
      s1 = peg$c7;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e10);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = input.charAt(peg$currPos);
      if (peg$r2.test(s5)) {
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e11);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = input.charAt(peg$currPos);
        if (peg$r2.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e11);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (input.charCodeAt(peg$currPos) === 34) {
        s3 = peg$c7;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e10);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f17(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseApostropheTitle() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 39) {
      s1 = peg$c8;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e12);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = input.charAt(peg$currPos);
      if (peg$r3.test(s5)) {
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e13);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = input.charAt(peg$currPos);
        if (peg$r3.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e13);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (input.charCodeAt(peg$currPos) === 39) {
        s3 = peg$c8;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e12);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f18(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseParenthesizedTitle() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    if (input.charCodeAt(peg$currPos) === 40) {
      s1 = peg$c2;
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e2);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      s4 = peg$currPos;
      peg$silentFails++;
      s5 = input.charAt(peg$currPos);
      if (peg$r4.test(s5)) {
        peg$currPos++;
      } else {
        s5 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e14);
        }
      }
      peg$silentFails--;
      if (s5 === peg$FAILED) {
        s4 = void 0;
      } else {
        peg$currPos = s4;
        s4 = peg$FAILED;
      }
      if (s4 !== peg$FAILED) {
        if (input.length > peg$currPos) {
          s5 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s4 = [s4, s5];
          s3 = s4;
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$currPos;
        s4 = peg$currPos;
        peg$silentFails++;
        s5 = input.charAt(peg$currPos);
        if (peg$r4.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e14);
          }
        }
        peg$silentFails--;
        if (s5 === peg$FAILED) {
          s4 = void 0;
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        if (s4 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s5 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s4 = [s4, s5];
            s3 = s4;
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      }
      if (input.charCodeAt(peg$currPos) === 41) {
        s3 = peg$c3;
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e3);
        }
      }
      if (s3 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f19(s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseAbsoluteUri() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseScheme();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 58) {
        s2 = peg$c9;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e15);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$currPos;
        s4 = [];
        s5 = input.charAt(peg$currPos);
        if (peg$r5.test(s5)) {
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e16);
          }
        }
        while (s5 !== peg$FAILED) {
          s4.push(s5);
          s5 = input.charAt(peg$currPos);
          if (peg$r5.test(s5)) {
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e16);
            }
          }
        }
        s3 = input.substring(s3, peg$currPos);
        peg$savedPos = s0;
        s0 = peg$f20(s1, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseScheme() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r6.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e17);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = input.charAt(peg$currPos);
      if (peg$r7.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e18);
        }
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = input.charAt(peg$currPos);
          if (peg$r7.test(s3)) {
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e18);
            }
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f21(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseEmail() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    s3 = input.charAt(peg$currPos);
    if (peg$r8.test(s3)) {
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e19);
      }
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r8.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e19);
          }
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 64) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseEmailDomain();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f22(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseEmailDomain() {
    let s0, s1, s2, s3, s4;
    s0 = peg$currPos;
    s1 = peg$parseEmailDomainSegment();
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 46) {
        s2 = peg$c11;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e21);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = [];
        s4 = peg$parseEmailDomainSegment();
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            s4 = peg$parseEmailDomainSegment();
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f23(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseEmailDomainSegment() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = input.charAt(peg$currPos);
    if (peg$r9.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e22);
      }
    }
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = input.charAt(peg$currPos);
      if (peg$r10.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e23);
        }
      }
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r10.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e23);
          }
        }
      }
      s3 = input.charAt(peg$currPos);
      if (peg$r9.test(s3)) {
        peg$currPos++;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e22);
        }
      }
      if (s3 === peg$FAILED) {
        s3 = null;
      }
      peg$savedPos = s0;
      s0 = peg$f24(s1, s2, s3);
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseSpacing() {
    let s0, s1;
    s0 = [];
    s1 = input.charAt(peg$currPos);
    if (peg$r11.test(s1)) {
      peg$currPos++;
    } else {
      s1 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e24);
      }
    }
    if (s1 !== peg$FAILED) {
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = input.charAt(peg$currPos);
        if (peg$r11.test(s1)) {
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e24);
          }
        }
      }
    } else {
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseExtendedAutolink() {
    let s0, s1, s2, s3, s4, s5, s6;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = peg$currPos;
    s3 = input.substr(peg$currPos, 5);
    if (s3.toLowerCase() === peg$c12) {
      peg$currPos += 5;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e25);
      }
    }
    if (s3 === peg$FAILED) {
      s3 = input.substr(peg$currPos, 4);
      if (s3.toLowerCase() === peg$c13) {
        peg$currPos += 4;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e26);
        }
      }
    }
    if (s3 !== peg$FAILED) {
      if (input.substr(peg$currPos, 3) === peg$c14) {
        s4 = peg$c14;
        peg$currPos += 3;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e27);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseValidDomain();
        if (s5 !== peg$FAILED) {
          s6 = peg$parseExtendedPath();
          s3 = [s3, s4, s5, s6];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
    } else {
      peg$currPos = s2;
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      peg$savedPos = s0;
      s1 = peg$f25(s1);
    }
    s0 = s1;
    if (s0 === peg$FAILED) {
      s0 = peg$currPos;
      s1 = peg$currPos;
      s2 = peg$currPos;
      if (input.substr(peg$currPos, 4) === peg$c15) {
        s3 = peg$c15;
        peg$currPos += 4;
      } else {
        s3 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e28);
        }
      }
      if (s3 !== peg$FAILED) {
        s4 = peg$parseValidDomain();
        if (s4 !== peg$FAILED) {
          s5 = peg$parseExtendedPath();
          s3 = [s3, s4, s5];
          s2 = s3;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
      } else {
        peg$currPos = s2;
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        s1 = input.substring(s1, peg$currPos);
      } else {
        s1 = s2;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f26(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseExtendedEmail();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f27(s1);
        }
        s0 = s1;
      }
    }
    return s0;
  }
  function peg$parseValidDomain() {
    let s0, s1, s2, s3, s4, s5;
    s0 = peg$currPos;
    s1 = peg$parseDomainSegment();
    if (s1 !== peg$FAILED) {
      s2 = [];
      s3 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s4 = peg$c11;
        peg$currPos++;
      } else {
        s4 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e21);
        }
      }
      if (s4 !== peg$FAILED) {
        s5 = peg$parseDomainSegment();
        if (s5 !== peg$FAILED) {
          peg$savedPos = s3;
          s3 = peg$f28(s1, s5);
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
      } else {
        peg$currPos = s3;
        s3 = peg$FAILED;
      }
      if (s3 !== peg$FAILED) {
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          if (input.charCodeAt(peg$currPos) === 46) {
            s4 = peg$c11;
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e21);
            }
          }
          if (s4 !== peg$FAILED) {
            s5 = peg$parseDomainSegment();
            if (s5 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f28(s1, s5);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
      } else {
        s2 = peg$FAILED;
      }
      if (s2 !== peg$FAILED) {
        peg$savedPos = s0;
        s0 = peg$f29(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function peg$parseDomainSegment() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r12.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e29);
      }
    }
    if (s2 !== peg$FAILED) {
      while (s2 !== peg$FAILED) {
        s1.push(s2);
        s2 = input.charAt(peg$currPos);
        if (peg$r12.test(s2)) {
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e29);
          }
        }
      }
    } else {
      s1 = peg$FAILED;
    }
    if (s1 !== peg$FAILED) {
      s0 = input.substring(s0, peg$currPos);
    } else {
      s0 = s1;
    }
    return s0;
  }
  function peg$parseExtendedPath() {
    let s0, s1, s2;
    s0 = peg$currPos;
    s1 = [];
    s2 = input.charAt(peg$currPos);
    if (peg$r13.test(s2)) {
      peg$currPos++;
    } else {
      s2 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e30);
      }
    }
    while (s2 !== peg$FAILED) {
      s1.push(s2);
      s2 = input.charAt(peg$currPos);
      if (peg$r13.test(s2)) {
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e30);
        }
      }
    }
    s0 = input.substring(s0, peg$currPos);
    return s0;
  }
  function peg$parseExtendedEmail() {
    let s0, s1, s2, s3;
    s0 = peg$currPos;
    s1 = peg$currPos;
    s2 = [];
    s3 = input.charAt(peg$currPos);
    if (peg$r14.test(s3)) {
      peg$currPos++;
    } else {
      s3 = peg$FAILED;
      if (peg$silentFails === 0) {
        peg$fail(peg$e31);
      }
    }
    if (s3 !== peg$FAILED) {
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = input.charAt(peg$currPos);
        if (peg$r14.test(s3)) {
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e31);
          }
        }
      }
    } else {
      s2 = peg$FAILED;
    }
    if (s2 !== peg$FAILED) {
      s1 = input.substring(s1, peg$currPos);
    } else {
      s1 = s2;
    }
    if (s1 !== peg$FAILED) {
      if (input.charCodeAt(peg$currPos) === 64) {
        s2 = peg$c10;
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s2 !== peg$FAILED) {
        s3 = peg$parseValidDomain();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f30(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
    } else {
      peg$currPos = s0;
      s0 = peg$FAILED;
    }
    return s0;
  }
  function trimGfmSuffix(value) {
    let trimmed = value.replace(/[?!.,:*_~]+$/, "");
    let opens = 0;
    let closes = 0;
    for (const char of trimmed) {
      if (char === "(") opens++;
      if (char === ")") closes++;
    }
    while (trimmed.endsWith(")") && closes > opens) {
      trimmed = trimmed.slice(0, -1);
      closes--;
    }
    return trimmed;
  }
  peg$result = peg$startRuleFunction();
  const peg$success = peg$result !== peg$FAILED && peg$currPos === input.length;
  function peg$throw() {
    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
      peg$fail(peg$endExpectation());
    }
    throw peg$buildStructuredError(
      peg$maxFailExpected,
      peg$maxFailPos < input.length ? peg$getUnicode(peg$maxFailPos) : null,
      peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
    );
  }
  if (options.peg$library) {
    return (
      /** @type {any} */
      {
        peg$result,
        peg$currPos,
        peg$FAILED,
        peg$maxFailExpected,
        peg$maxFailPos,
        peg$success,
        peg$throw: peg$success ? void 0 : peg$throw
      }
    );
  }
  if (peg$success) {
    return peg$result;
  } else {
    peg$throw();
  }
}

// src/syntaxes/index.ts
var PATH_FEATURES = ["anchor", "query", "path-extension", "path-containers"];
function spanFrom(match) {
  return { raw: match[0], span: { start: match.index, end: match.index + match[0].length } };
}
function parseQuery(input) {
  if (!input) return void 0;
  const query = {};
  for (const part of input.split("&").filter(Boolean)) {
    const [rawKey, rawValue] = part.split("=");
    if (!rawKey) continue;
    const key = decodeURIComponent(rawKey);
    const value = rawValue === void 0 ? true : decodeURIComponent(rawValue);
    const existing = query[key];
    if (existing === void 0) query[key] = value;
    else query[key] = Array.isArray(existing) ? [...existing, String(value)] : [String(existing), String(value)];
  }
  return Object.keys(query).length ? query : void 0;
}
function renderQuery(query) {
  if (!query) return "";
  const parts = [];
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(item)}`);
    } else if (value === true) parts.push(encodeURIComponent(key));
    else parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
  }
  return parts.length ? `?${parts.join("&")}` : "";
}
function parsePath(rawPath) {
  if (!rawPath) return void 0;
  const absolute = rawPath.startsWith("/");
  const separator = rawPath.includes("\\") ? "\\" : "/";
  const parts = rawPath.split(/[\\/]/).filter(Boolean);
  const file = parts.pop();
  if (!file) return { absolute, separator };
  const dot = file.lastIndexOf(".");
  const hasExtension = dot > 0 && dot < file.length - 1;
  return {
    ...parts.length ? { containers: parts } : {},
    resource: hasExtension ? file.slice(0, dot) : file,
    ...hasExtension ? { extension: file.slice(dot + 1) } : {},
    separator,
    absolute
  };
}
function renderPath(path) {
  if (!path) return "";
  const separator = path.separator ?? "/";
  const parts = [...path.containers ?? []];
  const resource = `${path.resource ?? ""}${path.extension ? `.${path.extension}` : ""}`;
  if (resource) parts.push(resource);
  return `${path.absolute ? separator : ""}${parts.join(separator)}`;
}
function parseTarget(raw) {
  const url = raw.match(/^([A-Za-z][A-Za-z0-9+.-]*):(\/\/([^/?#]*))?(.*)$/);
  const scheme = url?.[1];
  const authority = url?.[3];
  let rest = url ? url[4] ?? "" : raw;
  let anchor;
  let block;
  const hashIndex = rest.indexOf("#");
  if (hashIndex >= 0) {
    const fragment = rest.slice(hashIndex + 1);
    rest = rest.slice(0, hashIndex);
    if (fragment.startsWith("^")) block = fragment.slice(1);
    else anchor = fragment || void 0;
  }
  let query;
  const queryIndex = rest.indexOf("?");
  if (queryIndex >= 0) {
    query = parseQuery(rest.slice(queryIndex + 1));
    rest = rest.slice(0, queryIndex);
  }
  return {
    ...scheme ? { scheme } : {},
    ...authority ? { authority } : {},
    ...parsePath(rest) ? { path: parsePath(rest) } : {},
    ...anchor ? { anchor } : {},
    ...block ? { block } : {},
    ...query ? { query } : {}
  };
}
function renderTarget(ast) {
  const prefix = ast.scheme ? ast.authority ? `${ast.scheme}://${ast.authority}` : `${ast.scheme}:` : "";
  const fragment = ast.block ? `#^${ast.block}` : ast.anchor ? `#${ast.anchor}` : "";
  return `${prefix}${renderPath(ast.path)}${renderQuery(ast.query)}${fragment}`;
}
function renderSupportedTarget(ast, syntax) {
  return renderTarget({
    ...ast,
    anchor: syntax.supports.includes("anchor") ? ast.anchor : void 0,
    block: syntax.supports.includes("block") ? ast.block : void 0,
    query: syntax.supports.includes("query") ? ast.query : void 0,
    path: ast.path ? {
      ...ast.path,
      containers: syntax.supports.includes("path-containers") ? ast.path.containers : void 0,
      extension: syntax.supports.includes("path-extension") ? ast.path.extension : void 0
    } : void 0
  });
}
function requiredFeatures(ast) {
  const features = /* @__PURE__ */ new Set();
  if (ast.label) features.add("alias");
  if (ast.title) features.add("title");
  if (ast.reference) features.add("reference");
  if (ast.anchor) features.add("anchor");
  if (ast.block) features.add("block");
  if (ast.embed) features.add("embed");
  if (ast.query) features.add("query");
  if (ast.path?.extension) features.add("path-extension");
  if (ast.path?.containers?.length) features.add("path-containers");
  return [...features];
}
function diagnosticsFor(ast, syntax, context) {
  const level = context?.lossy === "warn" ? "warning" : "error";
  return requiredFeatures(ast).filter((feature) => !syntax.supports.includes(feature)).map((feature) => ({ level, feature, message: `Syntax ${syntax.id} cannot render feature ${feature}` }));
}
function result(syntax, ast, value, context) {
  const diagnostics = diagnosticsFor(ast, syntax, context);
  if (diagnostics.some((d) => d.level === "error")) return { diagnostics };
  return { value, diagnostics };
}
function normalizedName(value) {
  return value.toLowerCase().replace(/\.md$/i, "").replace(/[\s_-]+/g, "");
}
function pathWithoutExtension(path) {
  return path.replace(/\.md$/i, "");
}
function basename(path) {
  return pathWithoutExtension(path).split(/[\/]/).filter(Boolean).pop() ?? pathWithoutExtension(path);
}
function splitFragment(raw) {
  const index = raw.indexOf("#");
  if (index < 0) return { path: raw, fragment: "" };
  return { path: raw.slice(0, index), fragment: raw.slice(index) };
}
function dirname(path) {
  return path.split(/[\/]/).slice(0, -1).join("/");
}
function entryMatches(entry, target) {
  const targetNoExt = pathWithoutExtension(target);
  const pathNoExt = pathWithoutExtension(entry.path);
  if (pathNoExt.toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (basename(entry.path).toLowerCase() === targetNoExt.toLowerCase()) return true;
  if (normalizedName(basename(entry.path)) === normalizedName(target)) return true;
  if (entry.title && normalizedName(entry.title) === normalizedName(target)) return true;
  return entry.aliases?.some((alias) => normalizedName(alias) === normalizedName(target)) ?? false;
}
function sourceRelativeMatch(files, target, sourcePath) {
  if (!sourcePath || target.includes("/") || target.includes("\\")) return void 0;
  const base = dirname(sourcePath);
  if (!base) return void 0;
  const wanted = `${base}/${pathWithoutExtension(target)}`.toLowerCase();
  return files.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === wanted);
}
function resolved(raw, context) {
  const { path, fragment } = splitFragment(raw);
  const custom = context?.fileIndex?.resolvePath?.(path, context.sourcePath);
  if (custom) return `${custom}${fragment}`;
  const files = context?.fileIndex?.files ?? [];
  const match = sourceRelativeMatch(files, path, context?.sourcePath) ?? files.find((entry) => entryMatches(entry, path));
  return match ? `${match.path}${fragment}` : raw;
}
function exactEntryForResolvedTarget(target, context) {
  const { path } = splitFragment(target);
  const pathNoExt = pathWithoutExtension(path).toLowerCase();
  return context?.fileIndex?.files?.find((entry) => pathWithoutExtension(entry.path).toLowerCase() === pathNoExt);
}
function validateResolvedFragment(ast, entry) {
  if (!entry) return;
  if (ast.anchor && entry.headings && !entry.headings.includes(ast.anchor)) {
    throw new Error(`Heading ${ast.anchor} not found in ${entry.path}`);
  }
  if (ast.block && entry.blocks && !entry.blocks.includes(ast.block)) {
    throw new Error(`Block ${ast.block} not found in ${entry.path}`);
  }
}
var WIKILINK = /^(!)?\[\[([^|\[\]]+)(?:\|([^\]]*))?\]\]$/;
function findWikilink(input, startIndex = 0) {
  const candidate = /!?\[\[[^\[\]]+\]\]/g;
  candidate.lastIndex = startIndex;
  let match;
  while ((match = candidate.exec(input)) !== null) {
    const before = input[match.index - 1];
    const after = input[match.index + match[0].length];
    if (before !== "[" && before !== "!" && after !== "]") return spanFrom(match);
  }
  return null;
}
var obsidianSyntax = {
  id: "obsidian",
  supports: ["alias", "anchor", "block", "embed", "path-extension", "path-containers"],
  match(input, options) {
    return findWikilink(input, options?.startIndex);
  },
  parse(input, context) {
    const match = input.match(WIKILINK);
    if (!match?.[2]) throw new Error(`Invalid obsidian link: ${input}`);
    const target = resolved(match[2], context);
    const ast = {
      raw: input,
      ...parseTarget(target),
      ...match[3] !== void 0 ? { label: { raw: match[3], semantic: "literal" } } : {},
      ...match[1] ? { embed: true } : {},
      provenance: { syntax: this.id, rule: "wikilink" }
    };
    validateResolvedFragment(ast, exactEntryForResolvedTarget(target, context));
    return ast;
  },
  render(ast, context) {
    const value = `${ast.embed ? "!" : ""}[[${renderTarget(ast)}${ast.label ? `|${ast.label.raw}` : ""}]]`;
    return result(this, ast, value, context);
  }
};
var wikilinkSyntax = { ...obsidianSyntax, id: "wikilink" };
var parseCommonmarkGrammar = (input) => peg$parse(input, { startRule: "CommonMarkLink" });
var parseGfmGrammar = (input) => peg$parse(input, { startRule: "GfmLink" });
function normalizeReferenceLabel(label) {
  return label.trim().replace(/[\t\n ]+/g, " ").toLowerCase();
}
function referenceDefinition(label, context) {
  const expected = normalizeReferenceLabel(label);
  return Object.entries(context?.referenceDefinitions ?? {}).find(([key]) => normalizeReferenceLabel(key) === expected)?.[1];
}
function candidateEnd(input, start) {
  if (input[start] === "<") {
    const close2 = input.indexOf(">", start + 1);
    return close2 < 0 ? void 0 : close2 + 1;
  }
  if (input[start] !== "[") return void 0;
  const close = input.indexOf("]", start + 1);
  if (close < 0) return void 0;
  if (input[close + 1] === "[") {
    const referenceEnd = input.indexOf("]", close + 2);
    return referenceEnd < 0 ? void 0 : referenceEnd + 1;
  }
  if (input[close + 1] !== "(") return close + 1;
  let depth = 0;
  let angleDestination = false;
  for (let index = close + 2; index < input.length; index++) {
    const char = input[index];
    if (char === "\\") {
      index++;
      continue;
    }
    if (char === "<") angleDestination = true;
    if (char === ">") angleDestination = false;
    if (angleDestination) continue;
    if (char === "(") depth++;
    if (char === ")") {
      if (depth === 0) return index + 1;
      depth--;
    }
  }
  return void 0;
}
function gfmBareCandidates(input, startIndex) {
  const candidates = [];
  const expression = /https?:\/\/[^\s<]+|www\.[^\s<]+|[A-Za-z0-9._+-]+@[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+/g;
  expression.lastIndex = startIndex;
  let match;
  while ((match = expression.exec(input)) !== null) {
    let raw = match[0];
    raw = raw.replace(/[?!.,:*_~]+$/, "");
    let opens = 0;
    let closes = 0;
    for (const char of raw) {
      if (char === "(") opens++;
      if (char === ")") closes++;
    }
    while (raw.endsWith(")") && closes > opens) {
      raw = raw.slice(0, -1);
      closes--;
    }
    if (raw) candidates.push({ start: match.index, end: match.index + raw.length });
  }
  return candidates;
}
function findGrammarMatch(input, parser, startIndex = 0, includeGfmExtensions = false) {
  const candidates = gfmBareCandidates(input, startIndex);
  for (let start = startIndex; start < input.length; start++) {
    const end = candidateEnd(input, start);
    if (end) candidates.push({ start, end });
  }
  candidates.sort((left, right) => left.start - right.start || right.end - left.end);
  for (const candidate of candidates) {
    try {
      const raw = input.slice(candidate.start, candidate.end);
      const token = parser(raw);
      if (!includeGfmExtensions && token.kind === "extended-autolink") continue;
      const before = input[candidate.start - 1];
      const isWebAutolink = token.kind === "extended-autolink" && !token.destination?.startsWith("mailto:");
      if (isWebAutolink && before && !/[\s*_~(]/.test(before)) continue;
      return { raw, span: candidate };
    } catch {
    }
  }
  return null;
}
function parseWithGrammar(input, id, parser, context) {
  let token;
  try {
    token = parser(input);
  } catch {
    throw new Error(`Invalid ${id} link: ${input}`);
  }
  const definition = token.reference ? referenceDefinition(token.reference, context) : void 0;
  if (token.reference && !definition) throw new Error(`Unknown CommonMark reference: ${token.reference}`);
  const destination = token.destination ?? definition?.destination;
  if (destination === void 0) throw new Error(`Invalid ${id} link: ${input}`);
  const referenceStyle = token.kind.replace("-reference-link", "");
  return {
    raw: input,
    ...parseTarget(destination),
    label: { raw: token.label, semantic: token.label ? "literal" : "empty" },
    ...token.title ?? definition?.title ? { title: token.title ?? definition?.title } : {},
    ...token.reference ? { reference: { label: token.reference, style: referenceStyle } } : {},
    provenance: { syntax: id, rule: token.kind }
  };
}
function renderMarkdown(ast, syntax, context) {
  const target = renderSupportedTarget(ast, syntax);
  const label = ast.label?.raw ?? target;
  if (ast.reference) {
    const suffix = ast.reference.style === "shortcut" ? "" : ast.reference.style === "collapsed" ? "[]" : `[${ast.reference.label}]`;
    return result(syntax, ast, `[${label}]${suffix}`, context);
  }
  if (ast.provenance?.rule === "autolink") return result(syntax, ast, `<${ast.label?.raw ?? target}>`, context);
  if (ast.provenance?.rule === "extended-autolink") return result(syntax, ast, ast.label?.raw ?? target, context);
  const title = ast.title ? ` "${ast.title}"` : "";
  const destination = /[\s()<>]/.test(target) ? `<${target}>` : target;
  return result(syntax, ast, `[${label}](${destination}${title})`, context);
}
var commonmarkSyntax = {
  id: "commonmark",
  supports: ["alias", "title", "reference", "anchor", "query", "path-extension", "path-containers"],
  match(input, options) {
    return findGrammarMatch(input, parseCommonmarkGrammar, options?.startIndex);
  },
  parse(input, context) {
    return parseWithGrammar(input, "commonmark", parseCommonmarkGrammar, context);
  },
  render(ast, context) {
    return renderMarkdown(ast, this, context);
  }
};
var gfmSyntax = {
  ...commonmarkSyntax,
  id: "gfm",
  match(input, options) {
    return findGrammarMatch(input, parseGfmGrammar, options?.startIndex, true);
  },
  parse(input, context) {
    return parseWithGrammar(input, "gfm", parseGfmGrammar, context);
  }
};
var urlSyntax = {
  id: "url",
  supports: PATH_FEATURES,
  match(input, options) {
    const startIndex = options?.startIndex ?? 0;
    const match = /\b[A-Za-z][A-Za-z0-9+.-]*:\/\/[^\s)\]]+/g.exec(input.slice(startIndex));
    if (!match) return null;
    match[0] = match[0].replace(/[.,!?;:]+$/, "");
    match.index += startIndex;
    return spanFrom(match);
  },
  parse(input) {
    return { raw: input, ...parseTarget(input), provenance: { syntax: "url", rule: "bare" } };
  },
  render(ast, context) {
    return result(this, ast, renderSupportedTarget(ast, this), context);
  }
};
function parseLink(input, syntax, context) {
  return syntax.parse(input, context);
}
function renderLink(ast, syntax, context) {
  return syntax.render(ast, context);
}
function createSyntaxRegistry(initial = []) {
  const byId = /* @__PURE__ */ new Map();
  const registry = {
    register(syntax) {
      if (!syntax.id) throw new Error("Syntax id is required");
      if (byId.has(syntax.id)) throw new Error(`Syntax ${syntax.id} is already registered`);
      byId.set(syntax.id, syntax);
    },
    get(id) {
      return byId.get(id);
    },
    list() {
      return [...byId.values()];
    }
  };
  for (const syntax of initial) registry.register(syntax);
  return registry;
}
var defaultRegistry = createSyntaxRegistry([commonmarkSyntax, gfmSyntax, obsidianSyntax, urlSyntax, wikilinkSyntax]);
function registerSyntax(syntax) {
  defaultRegistry.register(syntax);
}
function getSyntax(id) {
  return defaultRegistry.get(id);
}
function syntaxes() {
  return defaultRegistry.list();
}

// src/parsers/wikilink.ts
function parseWikilink(text) {
  const results = [];
  let index = 0;
  while (index < text.length) {
    const match = obsidianSyntax.match(text, { startIndex: index });
    if (!match) break;
    results.push({ ...obsidianSyntax.parse(match.raw), span: match.span });
    index = match.span.end;
  }
  return results;
}

// src/parsers/markdown.ts
function parseMarkdownLink(text, context) {
  const results = [];
  let index = 0;
  while (index < text.length) {
    const match = gfmSyntax.match(text, { startIndex: index });
    if (!match) break;
    if (!match.raw.startsWith("[")) {
      index = match.span.end;
      continue;
    }
    try {
      results.push({ ...gfmSyntax.parse(match.raw, context), span: match.span });
      index = match.span.end;
    } catch {
      index = match.span.start + 1;
    }
  }
  return results;
}

// src/parsers/url.ts
function parseRawUrl(text, customSchemes = []) {
  const results = [];
  let index = 0;
  while (index < text.length) {
    const match = urlSyntax.match(text, { startIndex: index });
    if (!match) break;
    const ast = urlSyntax.parse(match.raw);
    if (["http", "https", ...customSchemes].includes(ast.scheme ?? "")) {
      results.push({ ...ast, span: match.span });
    }
    index = match.span.end;
  }
  return results;
}

// src/utils/detect.ts
function detectLinkType(_str) {
  const str = _str;
  if (/^\[\[[^\]|]+(\|[^\]]+)?\]\]$/.test(str)) return "wikilink";
  if (/^\[[^\]]+\]\([^\)]+\)$/.test(str)) return "markdown";
  if (/^https?:\/\/.+/.test(str)) return "url";
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/.+/.test(str)) return "custom";
  return null;
}

// src/utils/index.ts
function visitLinks(links, visitor) {
  if (!Array.isArray(links)) return;
  const results = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (!link) continue;
    const res = visitor(link, i, links);
    if (typeof res !== "undefined") results.push(res);
  }
  return results.length ? results : void 0;
}

// src/index.ts
function getNonCodeRanges(text) {
  const ranges = [];
  const fenceRe = /```[\s\S]*?```/g;
  let lastIndex = 0;
  let m;
  let foundFence = false;
  while ((m = fenceRe.exec(text)) !== null) {
    foundFence = true;
    if (lastIndex < m.index) ranges.push({ start: lastIndex, end: m.index });
    lastIndex = m.index + m[0].length;
  }
  if (!foundFence) return text.length > 0 ? [{ start: 0, end: text.length }] : [];
  if (lastIndex < text.length) ranges.push({ start: lastIndex, end: text.length });
  return ranges;
}
function parseLinks(text, options) {
  const { enableWikilink = true, enableMarkdown = true, enableUrl = true } = options || {};
  const results = [];
  for (const { start, end } of getNonCodeRanges(text)) {
    if (start >= end) continue;
    const slice = text.slice(start, end);
    const offset = (node) => node.span ? { ...node, span: { start: node.span.start + start, end: node.span.end + start } } : node;
    const rangeLinks = [];
    if (enableWikilink) rangeLinks.push(...parseWikilink(slice));
    if (enableMarkdown) rangeLinks.push(...parseMarkdownLink(slice, { referenceDefinitions: options?.referenceDefinitions }));
    if (enableUrl) {
      const occupied = rangeLinks.flatMap((link) => link.span ? [link.span] : []);
      rangeLinks.push(
        ...parseRawUrl(slice, options?.customSchemes).filter(
          (link) => !link.span || !occupied.some((span) => link.span.start >= span.start && link.span.end <= span.end)
        )
      );
    }
    results.push(...rangeLinks.map(offset));
  }
  return results;
}

exports.commonmarkSyntax = commonmarkSyntax;
exports.createSyntaxRegistry = createSyntaxRegistry;
exports.detectLinkType = detectLinkType;
exports.getSyntax = getSyntax;
exports.gfmSyntax = gfmSyntax;
exports.obsidianSyntax = obsidianSyntax;
exports.parseLink = parseLink;
exports.parseLinks = parseLinks;
exports.parseMarkdownLink = parseMarkdownLink;
exports.parseRawUrl = parseRawUrl;
exports.parseWikilink = parseWikilink;
exports.registerSyntax = registerSyntax;
exports.renderLink = renderLink;
exports.syntaxes = syntaxes;
exports.urlSyntax = urlSyntax;
exports.visitLinks = visitLinks;
exports.wikilinkSyntax = wikilinkSyntax;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map