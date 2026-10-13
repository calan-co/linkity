import { execFileSync } from "node:child_process";

if (process.env.CI) process.exit(0);

try {
  execFileSync("git", ["rev-parse", "--show-toplevel"], { stdio: "ignore" });
  execFileSync(process.platform === "win32" ? "jsonschema-tools.cmd" : "jsonschema-tools", ["install-git-hook"], {
    stdio: "inherit",
  });
} catch {
  // Installing package deps should not fail just because a local git hook cannot be installed.
}
