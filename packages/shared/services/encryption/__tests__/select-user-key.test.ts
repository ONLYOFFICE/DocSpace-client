// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it } from "vitest";

import { selectUserKey } from "../select-user-key";

const key = (id: string, date?: string | null) => ({ id, date });

describe("selectUserKey", () => {
  it("returns null for no keys", () => {
    expect(selectUserKey([])).toBeNull();
    expect(selectUserKey(null)).toBeNull();
    expect(selectUserKey(undefined)).toBeNull();
  });

  it("returns the only key", () => {
    expect(selectUserKey([key("a", "2026-01-01T00:00:00")])?.id).toBe("a");
  });

  it("Own key with leftover envelopes: the newest date wins whatever the order", () => {
    expect(
      selectUserKey([
        key("new", "2026-10-20T12:00:00.1234567"),
        key("old", "2026-01-01T00:00:00"),
      ])?.id,
    ).toBe("new");
    expect(
      selectUserKey([
        key("old", "2026-01-01T00:00:00"),
        key("new", "2026-10-20T12:00:00"),
      ])?.id,
    ).toBe("new");
  });

  it("gives equal dates to the last one listed", () => {
    expect(
      selectUserKey([
        key("first", "2026-05-05T10:00:00"),
        key("second", "2026-05-05T10:00:00"),
      ])?.id,
    ).toBe("second");
  });

  it("ranks the legacy envelope dated 0001-01-01 below a real key", () => {
    expect(
      selectUserKey([
        key("real", "2026-05-05T10:00:00"),
        key("legacy", "0001-01-01T00:00:00"),
      ])?.id,
    ).toBe("real");
  });

  it("ranks missing or unparsable dates below real ones and falls back to the last listed", () => {
    expect(
      selectUserKey([key("dated", "2026-05-05T10:00:00"), key("none", null)])?.id,
    ).toBe("dated");
    expect(selectUserKey([key("a", "nope"), key("b", undefined)])?.id).toBe("b");
  });
});
