// --- tests/helper/setupTest.ts
import { beforeEach, vi } from "vitest";
import { vol } from "memfs";

vi.mock("node:fs/promises", async () => {
  const memfs = await vi.importActual("memfs");
  return memfs.promises;
});

vi.mock("node:fs", async () => {
  const memfs = await vi.importActual("memfs");
  return memfs.fs;
});

// reset the state of in-memory file system on each test
beforeEach(() => {
  vol.reset();
});
