import { describe, expect, it } from "vitest";

import { isChatCapableProfile, toProfileRefs } from "./profiles";

describe("isChatCapableProfile", () => {
  it("accepts profiles with the Chat bit or no bitmask at all", () => {
    expect(isChatCapableProfile({ capabilities: 1 })).toBe(true);
    expect(isChatCapableProfile({ capabilities: 0b1011 })).toBe(true);
    expect(isChatCapableProfile({})).toBe(true);
    expect(isChatCapableProfile({ capabilities: null })).toBe(true);
  });

  it("rejects profiles whose bitmask lacks Chat", () => {
    expect(isChatCapableProfile({ capabilities: 0 })).toBe(false);
    expect(isChatCapableProfile({ capabilities: 0b0110 })).toBe(false);
  });
});

describe("toProfileRefs", () => {
  it("keeps only chat-capable profiles, in order", () => {
    expect(
      toProfileRefs([
        { id: "a", name: "A", capabilities: 1 },
        { id: "b", name: "B", capabilities: 2 },
        { id: "c", name: "C" },
      ]),
    ).toEqual([
      { profileId: "a", name: "A" },
      { profileId: "c", name: "C" },
    ]);
  });
});
