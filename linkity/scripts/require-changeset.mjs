import { existsSync, readdirSync, readFileSync } from "node:fs";

if (!existsSync(".changeset")) {
  console.error("missing .changeset directory");
  process.exit(1);
}

const changesets = readdirSync(".changeset").filter((file) => file.endsWith(".md") && file !== "README.md");
if (changesets.length === 0) {
  console.error("missing changeset markdown file");
  process.exit(1);
}

for (const file of changesets) {
  const text = readFileSync(`.changeset/${file}`, "utf8");
  if (!/^---\n[\s\S]*\n---\n\s*\S/m.test(text)) {
    console.error(`${file}: invalid changeset format`);
    process.exit(1);
  }
}

console.log(`changeset ok: ${changesets.join(", ")}`);
