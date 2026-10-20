// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@docspace/shared/services/encryption/secret-storage", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  requireUnlock: vi.fn(async () => ({ publicKey: "pk", privateKey: "sk" })),
}));

vi.mock("@docspace/shared/services/private-room/encrypted-copy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  decryptEncryptedItemToFile: vi.fn(async (item: { id: number; title: string }) => {
    if (item.id === 2) throw new Error("bad key");
    return new File(["plain"], item.title, { type: "text/plain" });
  }),
}));

import { createTestFilesActionsStore } from "./testHarness";

import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";

declare function allowConsoleError(matcher: RegExp | string): void;

type TTagged = File & {
  parentFolderId?: number | string;
  uploadContext?: { isPrivate: boolean; moveSource?: unknown };
};

const ok = { id: 1, title: "ok.docx", fileExst: ".docx", encrypted: true };
const broken = { id: 2, title: "broken.docx", fileExst: ".docx", encrypted: true };

const setup = () => {
  const startUpload = vi.fn();
  const store = createTestFilesActionsStore({
    userStore: { user: { id: "user-1" }, encryptionKeys: [{ id: "k1" }] },
    selectedFolderStore: {
      rootFolderId: 10,
      navigationPath: [{ id: 7, isRoom: true }],
    },
    uploadDataStore: { startUpload },
  });
  const uploaded = () =>
    (startUpload.mock.calls[0]?.[0] ?? []) as TTagged[];
  return { store, startUpload, uploaded };
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("FilesActionsStore - encrypted files moved out of a private room", () => {
  it("Move out of the room: each decrypted copy carries its source for deletion", async () => {
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok] as never, 5, {
      private: false,
      rootFolderId: 20,
      deleteSourceOnSuccess: true,
    });

    expect(uploaded()).toHaveLength(1);
    expect(uploaded()[0].parentFolderId).toBe(5);
    expect(uploaded()[0].uploadContext?.moveSource).toEqual({
      fileId: 1,
      title: "ok.docx",
    });
  });

  it("Move with a failed copy: the failed source is not tagged and is named", async () => {
    allowConsoleError(/client copy failed/);
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok, broken] as never, 5, {
      private: false,
      rootFolderId: 20,
      deleteSourceOnSuccess: true,
    });

    expect(uploaded().map((f) => f.name)).toEqual(["ok.docx"]);
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedMovePartialFailure",
    );
  });

  it("Copy to My documents: decrypted copies carry no source to delete", async () => {
    allowConsoleError(/client copy failed/);
    const { store, uploaded } = setup();

    await store.copyEncryptedFilesToFolder([ok, broken] as never, 5, {
      private: false,
      rootFolderId: 20,
    });

    expect(uploaded()[0].uploadContext?.moveSource).toBeUndefined();
    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedCopyFailed");
  });

  it("Identity locked: nothing is transferred and no source is tagged", async () => {
    vi.mocked(requireUnlock).mockResolvedValueOnce(null as never);
    const { store, startUpload } = setup();

    await store.copyEncryptedFilesToFolder([ok] as never, 5, {
      private: false,
      rootFolderId: 20,
      deleteSourceOnSuccess: true,
    });

    expect(startUpload).not.toHaveBeenCalled();
  });
});
