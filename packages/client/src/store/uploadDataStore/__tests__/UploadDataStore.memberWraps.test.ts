// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestUploadDataStore, installWindowGlobals } from "./testHarness";

vi.mock("@docspace/shared/services/encryption/room-file-access", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  wrapDekForRecipients: vi.fn(
    async ({ recipients }: { recipients: { userId: string; publicKeyId: string }[] }) =>
      recipients.map((r) => ({
        userId: r.userId,
        publicKeyId: r.publicKeyId,
        privateKeyEnc: `wrap-${r.publicKeyId}`,
      })),
  ),
}));

import * as filesApi from "@docspace/shared/api/files";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import { encryptKeysForRoomMembersImpl } from "../encryption.helpers";

const key = (userId: string, id: string, date: string) => ({
  id,
  userId,
  publicKey: `pk-${id}`,
  privateKeyEnc: "",
  date,
});

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("encryptKeysForRoomMembersImpl", () => {
  it("Member with two keys on the server: one wrap per member, for the selected key", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      key("me", "m-1", "2026-01-01T00:00:00"),
      key("alice", "a-old", "2026-01-01T00:00:00"),
      key("alice", "a-new", "2026-10-01T00:00:00"),
      key("bob", "b-1", "2026-03-01T00:00:00"),
    ] as never);
    vi.mocked(filesApi.getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "me", publicKeyId: "m-1", privateKeyEnc: "own" }],
    } as never);

    await encryptKeysForRoomMembersImpl(
      store,
      1,
      "me",
      7,
      new Uint8Array(32),
      {} as IdentityKeyPair,
    );

    const written = vi.mocked(filesApi.setFileEncryptionKeys).mock.calls[0][1] as {
      userId: string;
      publicKeyId: string;
    }[];
    expect(written.map((k) => k.userId)).toEqual(["me", "alice", "bob"]);
    expect(written.find((k) => k.userId === "alice")?.publicKeyId).toBe("a-new");
  });

  it("skips members who already hold an entry", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      key("alice", "a-1", "2026-01-01T00:00:00"),
    ] as never);
    vi.mocked(filesApi.getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "alice", publicKeyId: "a-other", privateKeyEnc: "w" }],
    } as never);

    await encryptKeysForRoomMembersImpl(
      store,
      1,
      "me",
      7,
      new Uint8Array(32),
      {} as IdentityKeyPair,
    );

    expect(filesApi.setFileEncryptionKeys).not.toHaveBeenCalled();
  });
});
