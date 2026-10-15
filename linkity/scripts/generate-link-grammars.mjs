import { readFile, rm, writeFile } from "node:fs/promises";
import peggy from "peggy";

const rules = await readFile(new URL("../grammars/commonmark-link-rules.peggy", import.meta.url), "utf8");
const extension = await readFile(new URL("../grammars/gfm-link-extension.peggy", import.meta.url), "utf8");
const grammar = `{
  // Grammar output is deliberately a small token object. AST mapping belongs in Syntax.
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
}
start = GfmLink
GfmLink = ExtendedAutolink / CommonMarkLink
${rules}
${extension}`;
const output = peggy.generate(grammar, {
  allowedStartRules: ["start", "GfmLink", "CommonMarkLink"],
  format: "es",
  output: "source",
});
const generated = new URL("../src/syntaxes/generated/link-parser.ts", import.meta.url);
await writeFile(generated, `// @ts-nocheck\n${output}`);
await Promise.all([
  rm(new URL("../src/syntaxes/generated/commonmark-link-parser.ts", import.meta.url), { force: true }),
  rm(new URL("../src/syntaxes/generated/gfm-link-parser.ts", import.meta.url), { force: true }),
]);
