import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const required = ["id", "title", "type", "subtype", "lifecycle", "status", "priority"];
const dir = "backlog/tasks";
let failures = 0;

for (const file of readdirSync(dir).filter((name) => name.endsWith(".md"))) {
  const text = readFileSync(join(dir, file), "utf8");
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    console.error(`${file}: missing YAML frontmatter`);
    failures++;
    continue;
  }

  for (const field of required) {
    if (!new RegExp(`^${field}:\\s*\\S`, "m").test(match[1])) {
      console.error(`${file}: missing ${field}`);
      failures++;
    }
  }
}

if (failures) process.exit(1);
console.log("work item frontmatter ok");
