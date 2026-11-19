// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, it, vi } from "vitest";

import {
  type KeyMismatchResolver,
  TofuStore,
  getTofuStore,
} from "../../encryption/tofu-store";
import { useFreshIndexedDb } from "../../encryption/__tests__/tofu-idb-helpers";
import { onMemberKeyTrusted, verifyMemberKey } from "../member-key-verification";

const KEY_A = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
const KEY_B = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=";

const verify = (
  publicKey: string,
  extra: { resolver?: KeyMismatchResolver; refusals?: Set<string> } = {},
) =>
  verifyMemberKey({ userId: "bob", scopeUserId: "alice", publicKey, ...extra });

describe("verifyMemberKey", () => {
  useFreshIndexedDb();

  it("Pin cannot be read", async () => {
    vi.spyOn(TofuStore.prototype, "checkKey").mockResolvedValue({
      kind: "unavailable",
    });
    const accept = vi.spyOn(TofuStore.prototype, "acceptKey");
    const resolver = vi.fn<KeyMismatchResolver>(async () => "accept");
    const refusals = new Set<string>();

    const result = await verify(KEY_A, { resolver, refusals });

    expect(result).toEqual({ kind: "key-unchecked" });
    expect(resolver).not.toHaveBeenCalled();
    expect(accept).not.toHaveBeenCalled();
    expect(refusals.size).toBe(0);
  });

  it("Unpinned member at upload", async () => {
    expect(await verify(KEY_A)).toEqual({ kind: "ok", publicKey: KEY_A });

    expect(
      (await getTofuStore("alice").readKeys("bob"))?.map((k) => k.publicKey),
    ).toEqual([KEY_A]);
  });

  it("Accepted key cannot be stored", async () => {
    await verify(KEY_A);
    vi.spyOn(TofuStore.prototype, "acceptKey").mockResolvedValue(false);
    const trusted = vi.fn();
    const unsubscribe = onMemberKeyTrusted(trusted);

    const result = await verify(KEY_B, { resolver: async () => "accept" });

    expect(result).toEqual({ kind: "key-unchecked" });
    expect(trusted).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("Next file of the batch checks again", async () => {
    const refusals = new Set<string>();
    vi.spyOn(TofuStore.prototype, "checkKey").mockResolvedValueOnce({
      kind: "unavailable",
    });

    expect(await verify(KEY_A, { refusals })).toEqual({
      kind: "key-unchecked",
    });
    expect(refusals.size).toBe(0);
    expect(await verify(KEY_A, { refusals })).toEqual({
      kind: "ok",
      publicKey: KEY_A,
    });
  });

  it.each([
    ["not base64", "not base64!!"],
    ["16 bytes", "AAAAAAAAAAAAAAAAAAAAAA=="],
  ])("Unusable key is not pinned: %s", async (_, unusable) => {
    const check = vi.spyOn(TofuStore.prototype, "checkKey");

    expect(await verify(unusable)).toEqual({ kind: "key-unusable" });
    expect(check).not.toHaveBeenCalled();
    expect(await getTofuStore("alice").readKeys("bob")).toEqual([]);

    // A well-formed key listed later is seen for the first time.
    check.mockRestore();
    expect(await verify(KEY_A)).toEqual({ kind: "ok", publicKey: KEY_A });
  });
});
