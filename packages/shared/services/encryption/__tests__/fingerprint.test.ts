import { describe, expect, it } from "vitest";

import { formatFingerprint, splitFingerprint } from "../fingerprint";

const HEX64 = "0123456789ABCDEF".repeat(4);

describe("Key fingerprint is shown in groups", () => {
  it("Grouped fingerprint", () => {
    const groups = splitFingerprint(HEX64);

    expect(groups).toHaveLength(8);
    for (const group of groups) expect(group).toHaveLength(8);
    expect(groups.join("")).toBe(HEX64);
    expect(formatFingerprint(HEX64)).toBe(groups.join(" "));
  });

  it("keeps a short last group", () => {
    expect(splitFingerprint("ABCDEFGH12")).toEqual(["ABCDEFGH", "12"]);
  });

  it("returns no group for an empty value", () => {
    expect(splitFingerprint("")).toEqual([]);
    expect(formatFingerprint("")).toBe("");
  });
});
