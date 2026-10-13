import { existsSync, readFileSync } from "node:fs";

const docs = [
  ["parseLinks", "docs/reference/parseLinks.md"],
  ["detectLinkType", "docs/reference/detectLinkType.md"],
  ["visitLinks", "docs/reference/visitLinks.md"],
  ["LinkNode", "docs/reference/types.md"],
];
const source =
  readFileSync("src/index.ts", "utf8") +
  readFileSync("src/types/index.ts", "utf8") +
  readFileSync("src/utils/index.ts", "utf8");
let failures = 0;

for (const [name, path] of docs) {
  if (!source.includes(name)) {
    console.error(`${name}: not exported by source`);
    failures++;
  }
  if (!existsSync(path)) {
    console.error(`${name}: missing ${path}`);
    failures++;
    continue;
  }
  const text = readFileSync(path, "utf8");
  if (!text.includes(name) || /TODO|TBD/.test(text)) {
    console.error(`${path}: missing ${name} docs or contains TODO/TBD`);
    failures++;
  }
}

if (failures) process.exit(1);
console.log("docs api guard ok");
