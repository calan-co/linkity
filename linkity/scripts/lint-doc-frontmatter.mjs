import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const required = ["id", "title", "type", "subtype", "lifecycle", "status", "classification"];
const files = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".md")) files.push(path);
  }
}

function hasScalar(frontmatter, field) {
  const match = frontmatter.match(new RegExp(`^${field}:([^\\r\\n]*)`, "m"));
  if (!match) return false;
  return match[1].replace(/#.*/, "").trim().length > 0;
}

function hasMapping(frontmatter, field) {
  return new RegExp(`^${field}:[^\\S\\r\\n]*(?:\\r?\\n[ \\t]+\\S)`, "m").test(frontmatter);
}

walk("docs");
let failures = 0;

for (const file of files) {
  const text = readFileSync(file, "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.error(`${file}: missing YAML frontmatter`);
    failures++;
    continue;
  }

  for (const field of required) {
    const valid = field === "classification"
      ? hasScalar(match[1], field) || hasMapping(match[1], field)
      : hasScalar(match[1], field);
    if (!valid) {
      console.error(`${file}: missing ${field}`);
      failures++;
    }
  }
}

if (failures) process.exit(1);
console.log("document frontmatter ok");
