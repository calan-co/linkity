import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

if (!existsSync(".changeset")) {
  console.error("missing .changeset directory");
  process.exit(1);
}

function lines(command) {
  return execSync(command, { encoding: "utf8" })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean);
}

function changedFiles() {
  const base = process.env.GITHUB_BASE_REF || "main";
  for (const command of [
    `git diff --name-only --diff-filter=ACMRTUXB origin/${base}...HEAD`,
    "git diff --name-only --diff-filter=ACMRTUXB HEAD^1...HEAD",
    "git ls-files .changeset",
  ]) {
    try {
      const result = lines(command);
      if (result.length) return result;
    } catch {
      // Try the next strategy.
    }
  }
  return [];
}

const changesets = changedFiles().filter((file) => {
  if (!/(^|\/)\.changeset\/.+\.md$/.test(file) || file.endsWith("/README.md")) return false;
  const localPath = file.replace(/^linkity\//, "");
  return existsSync(localPath);
});
if (changesets.length === 0) {
  console.error("missing changeset markdown file in this pull request");
  process.exit(1);
}

for (const file of changesets) {
  const localPath = file.replace(/^linkity\//, "");
  const text = readFileSync(localPath, "utf8");
  if (!/^---\r?\n(?:[\s\S]*?\r?\n)?---(?:\r?\n[\s\S]*)?$/m.test(text)) {
    console.error(`${file}: invalid changeset format`);
    process.exit(1);
  }
}

console.log(`changeset ok: ${changesets.join(", ")}`);
