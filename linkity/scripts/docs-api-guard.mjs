import { existsSync, readFileSync } from "node:fs";

const docs = [
  ["parseLinks", "docs/reference/parseLinks.md"],
  ["detectLinkType", "docs/reference/detectLinkType.md"],
  ["visitLinks", "docs/reference/visitLinks.md"],
  ["LinkNode", "docs/reference/types.md"],
];
const entry = readFileSync("src/index.ts", "utf8");
let failures = 0;

function isPublicExport(name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    new RegExp(`export\\s+(async\\s+)?function\\s+${escaped}\\b`).test(entry) ||
    new RegExp(`export\\s+(interface|type|class|const|let|var)\\s+${escaped}\\b`).test(entry) ||
    new RegExp(`export\\s+type\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`).test(entry) ||
    new RegExp(`export\\s*\\{[^}]*\\b${escaped}\\b[^}]*\\}`).test(entry)
  );
}

for (const [name, path] of docs) {
  if (!isPublicExport(name)) {
    console.error(`${name}: not exported by src/index.ts`);
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
