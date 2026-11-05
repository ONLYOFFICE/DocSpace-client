// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  type KeyMismatchResolver,
  TofuStore,
} from "../../encryption/tofu-store";
import { verifyMemberKey } from "../member-key-verification";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("verifyMemberKey", () => {
  it("Pin cannot be read", async () => {
    vi.spyOn(TofuStore.prototype, "checkKey").mockResolvedValue({
      kind: "unreadable",
    });
    const accept = vi.spyOn(TofuStore.prototype, "acceptKey");
    const resolver = vi.fn<KeyMismatchResolver>(async () => "accept");
    const refusals = new Set<string>();

    const result = await verifyMemberKey({
      userId: "bob",
      scopeUserId: "alice",
      publicKey: "PKBOBABCDEFGHIJK",
      resolver,
      refusals,
    });

    expect(result).toEqual({ kind: "key-mismatch-refused" });
    expect(resolver).not.toHaveBeenCalled();
    expect(accept).not.toHaveBeenCalled();
    expect(refusals.size).toBe(0);
  });
});
