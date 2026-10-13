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
    const hasValue = new RegExp(`^${field}:[^\\S\\r\\n]*\\S`, "m").test(match[1]);
    const hasMapping = new RegExp(`^${field}:[^\\S\\r\\n]*(?:\\r?\\n[ \\t]+\\S)`, "m").test(match[1]);
    if (!hasValue && !hasMapping) {
      console.error(`${file}: missing ${field}`);
      failures++;
    }
  }
}

if (failures) process.exit(1);
console.log("document frontmatter ok");
