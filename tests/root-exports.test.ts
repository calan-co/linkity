import { describe, expect, it } from "vitest";
import { visitLinks } from "../src/index.js";

describe("root exports", () => {
  it("exports visitLinks for the documented visitor API", () => {
    expect(visitLinks([{ raw: "x" }], (link) => link.raw)).toEqual(["x"]);
  });
});
