import { execFileSync } from "node:child_process";

const generated = ["src/parsers/*.generated.js", "src/parsers/*.generated.d.ts"];

execFileSync("npm", ["run", "generate:parsers"], { stdio: "inherit", shell: process.platform === "win32" });
execFileSync("git", ["diff", "--exit-code", "--", ...generated], { stdio: "inherit" });

const status = execFileSync("git", ["status", "--porcelain", "--", ...generated], {
  encoding: "utf8",
});
if (status.trim()) {
  console.error(status.trim());
  process.exit(1);
}
