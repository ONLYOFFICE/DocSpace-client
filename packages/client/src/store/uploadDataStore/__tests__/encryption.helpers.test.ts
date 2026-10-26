// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import "../../filesStore/__tests__/testHarness";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makePrivateUploadTarget,
  makeUploadFile,
} from "./testHarness";

import {
  cancelEncryptedBatchUploadImpl,
  ensureEncryptionUnlockedForBatchImpl,
  reportSkippedMembersImpl,
} from "../encryption.helpers";
import { uploadEncryptedFile } from "@docspace/shared/services/private-room/encrypted-upload-orchestrator";
import i18n from "SRC_DIR/i18n";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";
import { getUserById } from "@docspace/shared/api/people";
import { getRoomEncryptionKeys } from "@docspace/shared/api/privacy";
import {
  getFileEncryptionAccess,
  setFileEncryptionKeys,
  startUploadSession,
  uploadChunkSequential,
} from "@docspace/shared/api/files";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import {
  getTofuStore,
  registerKeyMismatchHandler,
  resetTofuStores,
  unregisterKeyMismatchHandler,
} from "@docspace/shared/services/encryption/tofu-store";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

vi.mock("@docspace/shared/api/people", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getUserById: vi.fn(),
}));

vi.mock("@docspace/shared/api/privacy", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getRoomEncryptionKeys: vi.fn(),
}));

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  getFileEncryptionAccess: vi.fn(),
  setFileEncryptionKeys: vi.fn(),
  startUploadSession: vi.fn(),
  uploadChunkSequential: vi.fn(),
  finalizeUploadSession: vi.fn(),
}));

vi.mock("@docspace/shared/services/encryption/file-keys", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  encryptFile: vi.fn(async () => ({
    encryptedBlob: new Blob([new Uint8Array(64)]),
    dek: new Uint8Array(32),
  })),
  wipeDek: vi.fn(),
}));

vi.mock(
  "@docspace/shared/services/encryption/room-file-access",
  async (io) => ({
    ...((await io()) as Record<string, unknown>),
    wrapDekForRecipients: vi.fn(
      async ({ recipients }: { recipients: { userId: string }[] }) =>
        recipients.map((r) => ({
          userId: r.userId,
          publicKeyId: `${r.userId}-key`,
          privateKeyEnc: `wrap-for-${r.userId}`,
        })),
    ),
  }),
);

const keyed = {
  userStore: { encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }] },
};

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("cancelEncryptedBatchUploadImpl", () => {
  it("Uploader declines to unlock: only pending, encryptable rows fail with Common:EncryptionLockedUpload", () => {
    const { store } = createTestUploadDataStore(keyed);
    const target = makePrivateUploadTarget();
    const enc = makeUploadFile({ uniqueId: "enc", action: "upload", target });
    const already = makeUploadFile({
      uniqueId: "already",
      action: "upload",
      encrypted: true,
      target,
    });
    const errored = makeUploadFile({
      uniqueId: "err",
      action: "upload",
      error: "boom",
      target,
    });
    const plain = makeUploadFile({ uniqueId: "plain", action: "upload" });
    store.files = [enc, already, errored, plain];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "enc" }),
      makeUploadFile({ uniqueId: "already" }),
    ];

    cancelEncryptedBatchUploadImpl(store);

    expect(store.files[0].error).toBe("Common:EncryptionLockedUpload");
    expect(store.files[0].inAction).toBe(true);
    expect(store.files[0].percent).toBe(0);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionLockedUpload",
    );
    expect(store.files[1].error).toBeNull();
    expect(store.uploadedFilesHistory[1].error).toBeNull();
    expect(store.files[2].error).toBe("boom");
    expect(store.files[3].error).toBeNull();
  });

  it("does nothing when the user has no encryption keys", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({
        uniqueId: "a",
        action: "upload",
        target: makePrivateUploadTarget(),
      }),
    ];

    cancelEncryptedBatchUploadImpl(store);

    expect(store.files[0].cancel).toBe(false);
    expect(store.files[0].action).toBe("upload");
  });
});

describe("ensureEncryptionUnlockedForBatchImpl", () => {
  it("returns true immediately when the user has no encryption keys", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "upload" })];

    await expect(ensureEncryptionUnlockedForBatchImpl(store)).resolves.toBe(
      true,
    );
  });

  it("returns true when no queued file needs encryption", async () => {
    const { store } = createTestUploadDataStore({
      ...keyed,
      treeFoldersStore: { isPrivacyFolder: true },
    });
    store.files = [
      makeUploadFile({
        action: "upload",
        file: makeBrowserFile("a.docx", 10, { encrypted: true }),
        encrypted: true,
        target: makePrivateUploadTarget(),
      }),
      makeUploadFile({ action: "converted", target: makePrivateUploadTarget() }),
      makeUploadFile({ action: "upload" }),
    ];

    await expect(ensureEncryptionUnlockedForBatchImpl(store)).resolves.toBe(
      true,
    );
  });
});

describe("UploadDataStore.queueMemberFanOut", () => {
  const identity = {
    publicKey: new Uint8Array(32).fill(1),
    privateKey: new Uint8Array(32).fill(2),
  } as IdentityKeyPair;
  const memberKey = (userId: string, publicKey: string) => ({
    id: `${userId}-key`,
    userId,
    publicKey,
    privateKeyEnc: "",
    date: "2026-01-01T00:00:00",
  });
  let waiting: Array<(d: "accept" | "refuse") => void>;
  let handler: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    resetTofuStores();
    unregisterKeyMismatchHandler();
    vi.mocked(startUploadSession).mockResolvedValue({ id: "session" } as never);
    vi.mocked(uploadChunkSequential)
      .mockResolvedValueOnce({ id: 555 } as never)
      .mockResolvedValueOnce({ id: 556 } as never);
    vi.mocked(getFileEncryptionAccess).mockResolvedValue({
      fileKeys: [{ userId: "user-1", publicKeyId: "key-1", privateKeyEnc: "own" }],
    } as never);
    vi.mocked(setFileEncryptionKeys).mockResolvedValue(undefined as never);
    // Real base64, so a pinned key compares equal to itself after accept.
    vi.mocked(getRoomEncryptionKeys).mockResolvedValue([
      memberKey("bob", btoa("bob-swapped")),
    ] as never);
    await getTofuStore("user-1").checkKey("bob", btoa("bob-pinned"));
    waiting = [];
    handler = vi.fn(
      () =>
        new Promise<"accept" | "refuse">((resolve) => {
          waiting.push(resolve);
        }),
    );
    registerKeyMismatchHandler(handler as never);
  });

  afterEach(() => {
    unregisterKeyMismatchHandler();
  });

  /** Two encrypted uploads of one batch, their fan-outs through the store's queue. */
  const startTwo = () => {
    const { store } = createTestUploadDataStore();
    const upload = (name: string) =>
      uploadEncryptedFile(
        new File(["x"], name),
        {
          folderId: 7,
          roomId: 7,
          identity,
          userId: "user-1",
          publicKey: "pk-base64-1",
          publicKeyId: "key-1",
          memberKeyRefusals: store.memberKeyRefusals,
          serializeFanOut: store.queueMemberFanOut,
        },
        name,
      );
    return { store, first: upload("a.docx"), second: upload("b.docx") };
  };

  it("Batch meets one changed key: two fan-outs ask once and both files get the wrap on accept", async () => {
    const { first, second } = startTwo();

    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    waiting[0]("accept");
    const results = await Promise.all([first, second]);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(results.map((r) => [r.ok, r.skippedMembers])).toEqual([
      [true, undefined],
      [true, undefined],
    ]);
    const memberWrites = vi
      .mocked(setFileEncryptionKeys)
      .mock.calls.filter(([, keys]) =>
        (keys as { userId: string }[]).some((k) => k.userId === "bob"),
      )
      .map(([fileId]) => fileId);
    expect(memberWrites.sort()).toEqual([555, 556]);
  });

  it("Unanswered request is not a refusal: nothing is remembered while the dialog waits", async () => {
    const { store, first, second } = startTwo();

    await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    expect(store.memberKeyRefusals.size).toBe(0);

    waiting[0]("accept");
    await Promise.all([first, second]);

    expect(store.memberKeyRefusals.size).toBe(0);
  });
});

describe("reportSkippedMembersImpl", () => {
  const skipped = (userId: string) => ({
    userId,
    displayName: undefined,
    reason: "key-mismatch-refused" as const,
  });

  beforeEach(() => {
    vi.mocked(getUserById).mockImplementation(
      async (id: string) =>
        ({ id, displayName: id === "bob" ? "Bob Smith" : "Carol" }) as never,
    );
  });

  it("Member key mismatch on upload: names the left-out members in a warning", async () => {
    const tSpy = vi.spyOn(i18n, "t");
    const { store } = createTestUploadDataStore();

    const named = await reportSkippedMembersImpl(store, [skipped("bob")]);

    expect(named).toEqual([{ ...skipped("bob"), displayName: "Bob Smith" }]);
    expect(tSpy).toHaveBeenCalledWith("Common:EncryptedUploadNotSharedWith", {
      names: "Bob Smith",
    });
    expect(toastr.warning).toHaveBeenCalledTimes(1);
  });

  it("warns once per member in a session, naming only members not reported yet", async () => {
    const tSpy = vi.spyOn(i18n, "t");
    const { store } = createTestUploadDataStore();

    await reportSkippedMembersImpl(store, [skipped("bob")]);
    const second = await reportSkippedMembersImpl(store, [
      skipped("bob"),
      skipped("carol"),
    ]);
    await reportSkippedMembersImpl(store, [skipped("bob"), skipped("carol")]);

    expect(toastr.warning).toHaveBeenCalledTimes(2);
    expect(tSpy).toHaveBeenLastCalledWith("Common:EncryptedUploadNotSharedWith", {
      names: "Carol",
    });
    expect(second.map((m) => m.displayName)).toEqual(["Bob Smith", "Carol"]);
  });

  it("falls back to the user id when the name cannot be read", async () => {
    vi.mocked(getUserById).mockRejectedValue(new Error("404"));
    const { store } = createTestUploadDataStore();

    const named = await reportSkippedMembersImpl(store, [skipped("bob")]);

    expect(named[0].displayName).toBe("bob");
  });
});
