// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../api/privacy", () => ({
  getRoomEncryptionKeys: vi.fn(),
  getFilePublicKeys: vi.fn(),
}));

import { getRoomEncryptionKeys } from "../../../api/privacy";
import { loadRoomMemberKeys, selectMemberKeys } from "../room-member-keys";

const entry = (userId: string, id: string, date: string) => ({
  id,
  userId,
  publicKey: `pk-${id}`,
  privateKeyEnc: "",
  date,
});

const listed = [
  entry("alice", "a-new", "2026-10-01T00:00:00"),
  entry("alice", "a-old", "2026-01-01T00:00:00"),
  entry("bob", "b-1", "2026-03-01T00:00:00"),
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("selectMemberKeys", () => {
  it("Member listed with two keys: the newer key is the member's key", () => {
    const keys = selectMemberKeys(listed);
    expect(keys.size).toBe(2);
    expect(keys.get("alice")).toEqual({
      userId: "alice",
      publicKey: "pk-a-new",
      publicKeyId: "a-new",
    });
    expect(keys.get("bob")?.publicKeyId).toBe("b-1");
  });

  it("skips entries without a user or a public key and tolerates no list", () => {
    expect(
      selectMemberKeys([{ ...entry("carol", "c", "2026-01-01"), publicKey: "" }]).size,
    ).toBe(0);
    expect(selectMemberKeys(undefined).size).toBe(0);
  });
});

describe("loadRoomMemberKeys", () => {
  it("returns one selected key per member and keeps every key in the list", async () => {
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue(listed as never);

    const { keyByUserId, list } = await loadRoomMemberKeys(7);

    expect(keyByUserId.get("alice")?.publicKeyId).toBe("a-new");
    expect(list.map((k) => k.publicKeyId)).toEqual(["a-new", "a-old", "b-1"]);
  });
});
