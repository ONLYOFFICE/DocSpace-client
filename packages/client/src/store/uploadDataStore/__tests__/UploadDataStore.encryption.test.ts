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

// ---------------------------------------------------------------------------
// Characterization tests for the DEK lifecycle of encrypted uploads
// (plan §3.4.1 "DEK hygiene"): every issued DEK is either handed over to
// wrapForSelfThenRoom exactly once or wiped, on every path — happy, error
// and missing-keys. Also pins the module-level DEK store in
// uploadDataStore/helpers.ts, which is deliberately outside MobX.
//
// Encryption services are mocked PARTIALLY here (this file only): wipeDek,
// requireUnlock, wrapDekForRecipients and prepareEncryptedUpload become
// vi.fn()s while shouldEncryptUpload / resolveItemRoomContext / the active-key
// selection stay real, so the "should this upload be encrypted" decision is
// exercised for real against the store fakes.
// ---------------------------------------------------------------------------

import { beforeEach, describe, expect, it, vi } from "vitest";

// Import-order matters — see the comment in UploadDataStore.chunks.test.ts.
import "../../filesStore/__tests__/testHarness";

// The harness import must stay ABOVE the API/toast imports: its hoisted
// vi.mock registrations are what make the modules below resolve to mocks.
import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

import * as filesApi from "@docspace/shared/api/files";
import { toastr } from "@docspace/ui-kit/components/toast";
import { rememberEncryptedFilename } from "@docspace/shared/services/encryption/filename-cache";
import { wipeDek } from "@docspace/shared/services/encryption/file-keys";
import { requireUnlock } from "@docspace/shared/services/encryption/secret-storage";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { prepareEncryptedUpload } from "@docspace/shared/services/private-room/encrypted-upload";
import { OPERATIONS_NAME } from "@docspace/shared/constants";

import { hasFileDek, setFileDek, takeFileDek } from "../helpers";

import type { TFile } from "@docspace/shared/api/files/types";
import type { TTranslation } from "@docspace/shared/types";
import type UploadDataStore from "../../UploadDataStore";

vi.mock("@docspace/shared/services/encryption/file-keys", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, wipeDek: vi.fn() };
});

vi.mock("@docspace/shared/services/encryption/secret-storage", async (orig) => {
  const actual = (await orig()) as Record<string, unknown>;
  return { ...actual, requireUnlock: vi.fn() };
});

vi.mock(
  "@docspace/shared/services/encryption/room-file-access",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return { ...actual, wrapDekForRecipients: vi.fn() };
  },
);

vi.mock(
  "@docspace/shared/services/private-room/encrypted-upload",
  async (orig) => {
    const actual = (await orig()) as Record<string, unknown>;
    return { ...actual, prepareEncryptedUpload: vi.fn() };
  },
);

const t = ((key: string) => key) as unknown as TTranslation;

/** userStore override with one active encryption key (no stored preference
 * needed for a single key — pinned by UploadDataStore.selectors.test.ts). */
const userWithKeys = () => ({
  user: { id: "user-1", isAdmin: false },
  encryptionKeys: [{ id: "key-1", publicKey: "pub-b64" }],
});

/** Wraps the non-exported TCheckChunkUpload argument object. */
const callCheckChunkUpload = (
  store: UploadDataStore,
  args: {
    res: { uploaded: boolean; id: number | string | null; file: TFile | null };
    index: number;
    indexOfFile: number;
    chunksLength: number;
    resolve: (value?: unknown) => void;
  },
) =>
  store.checkChunkUpload({
    t,
    path: [],
    ...args,
  } as unknown as Parameters<UploadDataStore["checkChunkUpload"]>[0]);

// makeAutoObservable defines actions as non-configurable accessors, so tests
// swap methods by plain assignment (same convention as the chunk tests).
const replaceAction = (store: UploadDataStore, key: string) => {
  const fn = vi.fn().mockResolvedValue(undefined);
  (store as unknown as Record<string, unknown>)[key] = fn;
  return fn;
};

const makeDek = (fill = 1) => new Uint8Array([fill, fill + 1, fill + 2]);

// Registered by shared/vitest/setupTests.ts (silent-failure guard): tests
// that intentionally exercise [ENCRYPTION] error paths must allow them.
declare function allowConsoleError(matcher: RegExp | string): void;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

// mutation-checked: replacing takeFileDek's `delete` with a plain `get` keeps
// the DEK in the store — the hasFileDek/second-take asserts go red.
describe("uploadDataStore/helpers — module-level DEK store", () => {
  it("stores, reports and takes a DEK exactly once per entry", () => {
    const entry = makeUploadFile();
    const dek = makeDek();

    expect(hasFileDek(entry)).toBe(false);

    setFileDek(entry, dek);
    expect(hasFileDek(entry)).toBe(true);

    // take() hands the DEK over exactly once and empties the slot.
    expect(takeFileDek(entry)).toBe(dek);
    expect(hasFileDek(entry)).toBe(false);
    expect(takeFileDek(entry)).toBeNull();
    // Storing and taking never destroys the key material itself.
    expect(wipeDek).not.toHaveBeenCalled();
  });

  // mutation-checked: dropping the `previous !== dek` guard wipes the DEK on
  // every re-set — the "same reference" assert goes red.
  it("wipes the previous DEK when an entry is re-keyed, but not on a same-reference re-set", () => {
    const entry = makeUploadFile();
    const first = makeDek(1);
    const second = makeDek(10);

    setFileDek(entry, first);
    setFileDek(entry, first); // same reference — nothing to wipe
    expect(wipeDek).not.toHaveBeenCalled();

    setFileDek(entry, second); // re-key — the displaced DEK must be destroyed
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[first]]);
    expect(takeFileDek(entry)).toBe(second);
  });

  it("treats null/undefined entries as no-ops", () => {
    expect(() => setFileDek(null, makeDek())).not.toThrow();
    expect(hasFileDek(null)).toBe(false);
    expect(hasFileDek(undefined)).toBe(false);
    expect(takeFileDek(null)).toBeNull();
    expect(takeFileDek(undefined)).toBeNull();
    expect(wipeDek).not.toHaveBeenCalled();
  });
});

// mutation-checked: removing `wipeDek(dek)` from the finally block leaves all
// three "wiped exactly once" asserts red (§3.4.2 "Удалить wipeDek из
// catch/finally").
describe("UploadDataStore.wrapForSelfThenRoom — DEK hygiene (§3.4.1)", () => {
  it("wraps for self, stores the keys, delegates to room members and wipes the DEK last", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    const identity = { publicKey: "id-pub" };
    const ownWraps = [
      { userId: "user-1", publicKeyId: "key-1", privateKeyEnc: "enc" },
    ];
    vi.mocked(requireUnlock).mockResolvedValue(identity as never);
    vi.mocked(wrapDekForRecipients).mockResolvedValue(ownWraps as never);
    vi.mocked(filesApi.setFileEncryptionKeys).mockResolvedValue(
      undefined as never,
    );
    const encryptForRoom = replaceAction(store, "encryptKeysForRoomMembers");

    await store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, 7);

    // The self-wrap targets exactly the current user's active key.
    expect(vi.mocked(wrapDekForRecipients).mock.calls).toEqual([
      [
        {
          dek,
          senderIdentity: identity,
          senderUserId: "user-1",
          recipients: [
            { userId: "user-1", publicKey: "pub-b64", publicKeyId: "key-1" },
          ],
          fileId: 555,
        },
      ],
    ]);
    expect(vi.mocked(filesApi.setFileEncryptionKeys).mock.calls).toEqual([
      [555, ownWraps],
    ]);
    expect(encryptForRoom.mock.calls).toEqual([
      [555, "user-1", 7, dek, identity],
    ]);

    // DEK hygiene: wiped exactly once, and only AFTER the keys are stored —
    // the wipe lives in `finally`, ordering is part of the contract.
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(vi.mocked(wipeDek).mock.invocationCallOrder[0]).toBeGreaterThan(
      vi.mocked(filesApi.setFileEncryptionKeys).mock.invocationCallOrder[0],
    );
  });

  it("wipes the DEK even when the identity is locked", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    vi.mocked(requireUnlock).mockResolvedValue(null as never);

    await expect(
      store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, null),
    ).rejects.toThrow("Encryption identity is locked");

    expect(filesApi.setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
  });

  it("wipes the DEK when wrapping itself fails", async () => {
    const { store } = createTestUploadDataStore();
    const dek = makeDek();
    vi.mocked(requireUnlock).mockResolvedValue(
      { publicKey: "id-pub" } as never,
    );
    vi.mocked(wrapDekForRecipients).mockRejectedValue(
      new Error("wrap failed"),
    );

    await expect(
      store.wrapForSelfThenRoom(555, "user-1", "pub-b64", "key-1", dek, null),
    ).rejects.toThrow("wrap failed");

    expect(filesApi.setFileEncryptionKeys).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
  });
});

// mutation-checked: removing the orphan `takeFileDek`+`wipeDek` pair in the
// missing-keys branch turned that test red; the handover test additionally
// pins hasFileDek === false after the final chunk.
describe("UploadDataStore.checkChunkUpload — encrypted final chunk", () => {
  const setupEncryptedFinalChunk = (
    overrides: Parameters<typeof createTestUploadDataStore>[0] = {},
  ) => {
    const harness = createTestUploadDataStore(overrides);
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "enc-done",
      encrypted: true,
      inAction: true,
      toFolderId: 7,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry, percent: 50 }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    replaceAction(store, "refreshFiles");
    // The DEK is keyed by the OBSERVABLE proxy (store.files[0]), exactly as
    // production does inside startSessionFunc.
    const dek = makeDek();
    setFileDek(store.files[0], dek);
    const serverFile = makeFileInfo({ id: 555, folderId: 7, version: 1 });
    return { ...harness, entry, dek, serverFile };
  };

  it("remembers the plaintext filename and hands the DEK to wrapForSelfThenRoom exactly once", () => {
    const { store, entry, dek, serverFile } = setupEncryptedFinalChunk({
      userStore: userWithKeys(),
    });
    const wrap = replaceAction(store, "wrapForSelfThenRoom");

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    // The obfuscated server-side name maps back to the plaintext title.
    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, entry.file.name],
    ]);

    // Handover: the DEK left the store and went to the wrapper — and only
    // there; nothing wiped it (wrapForSelfThenRoom owns it from here).
    expect(wrap.mock.calls).toEqual([
      [555, "user-1", "pub-b64", "key-1", dek, null],
    ]);
    expect(hasFileDek(store.files[0])).toBe(false);
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("wipes the orphan DEK and skips wrapping when the user has no encryption keys", () => {
    allowConsoleError("[ENCRYPTION] Cannot wrap DEK");
    // Default userStore: encryptionKeys = [] — keys are missing.
    const { store, entry, dek, serverFile } = setupEncryptedFinalChunk();
    const wrap = replaceAction(store, "wrapForSelfThenRoom");

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    // characterized quirk: the filename is remembered even though the wrap
    // is about to be aborted — the name branch precedes the keys check.
    expect(vi.mocked(rememberEncryptedFilename).mock.calls).toEqual([
      [555, entry.file.name],
    ]);

    expect(wrap).not.toHaveBeenCalled();
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(hasFileDek(store.files[0])).toBe(false);
  });

  it("marks the file and its history entry when wrapping rejects after upload", async () => {
    allowConsoleError("[ENCRYPTION] Failed to set file encryption keys");
    const { store, serverFile } = setupEncryptedFinalChunk({
      userStore: userWithKeys(),
    });
    const wrap = replaceAction(store, "wrapForSelfThenRoom");
    wrap.mockRejectedValue({
      response: { status: 500 },
      message: "wrap exploded",
    });

    callCheckChunkUpload(store, {
      res: { uploaded: true, id: 555, file: serverFile },
      index: 1,
      indexOfFile: 0,
      chunksLength: 1,
      resolve: vi.fn(),
    });

    await vi.waitFor(() =>
      expect(store.files[0].error).toBe("Common:EncryptionUploadWrapFailed"),
    );
    // The upload itself already succeeded — only the error text is stamped.
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].fileId).toBe(555);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionUploadWrapFailed",
    );
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionUploadWrapFailed",
    );
  });
});

// mutation-checked: removing the orphan `takeFileDek`+`wipeDek` pair from the
// startUploadSession catch (§3.4.2 "Удалить wipeDek из catch") leaves the
// session-failure test red on both wipeDek.mock.calls and hasFileDek.
describe("UploadDataStore.startSessionFunc — encrypted upload preparation", () => {
  const setupEncryptedPendingFile = () => {
    const harness = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    const { store } = harness;
    const entry = makeUploadFile({
      uniqueId: "enc-pending",
      file: makeBrowserFile("secret.docx", 3000),
      toFolderId: 7,
    });
    store.files = [entry];
    store.uploadedFilesHistory = [{ ...entry }];
    store.uploaded = false;
    store.currentUploadNumber = 1;
    return { ...harness, entry };
  };

  const preparedUpload = (dek: Uint8Array) => ({
    data: new Blob([new Uint8Array(3100)]),
    encrypted: true,
    dek,
    uploadFileName: "0b5c72a8-0000-4000-8000-000000000000.docx",
    originalFileType: "application/octet-stream",
    originalFileSize: 3000,
    originalFileName: "secret.docx",
  });

  it("stores the DEK, marks the entry encrypted and starts the session with the obfuscated name", async () => {
    const { store, fakes } = setupEncryptedPendingFile();
    const dek = makeDek();
    vi.mocked(prepareEncryptedUpload).mockImplementation(async (config) => {
      // Drive the encryption progress callback the way encryptFile would.
      config.onProgress?.(0.5);
      return preparedUpload(dek) as never;
    });
    // The session never answers — freezing the flow right after the
    // encryption preparation so its effects can be asserted in isolation.
    vi.mocked(filesApi.startUploadSession).mockReturnValue(
      new Promise(() => {}) as never,
    );

    store.startSessionFunc(0, t);
    await vi.waitFor(() =>
      expect(filesApi.startUploadSession).toHaveBeenCalledTimes(1),
    );

    // The DEK is parked on the observable entry until the final chunk.
    expect(hasFileDek(store.files[0])).toBe(true);
    expect(store.files[0].encrypted).toBe(true);

    // Encryption progress maps to the 0–20% band of the history entry and
    // is labeled on the progress bar.
    expect(store.uploadedFilesHistory[0].percent).toBe(10);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: OPERATIONS_NAME.upload,
      percent: 10,
      label: "Files:Encrypting",
    });

    // The session is opened under the obfuscated name, encrypted size and
    // the encrypted flag — never the plaintext name.
    const sessionArgs = vi.mocked(filesApi.startUploadSession).mock.calls[0];
    expect(sessionArgs[0]).toBe(7);
    expect(sessionArgs[1]).toBe("0b5c72a8-0000-4000-8000-000000000000.docx");
    expect(sessionArgs[2]).toBe(3100);
    expect(sessionArgs[4]).toBe(true);
    expect(wipeDek).not.toHaveBeenCalled();
  });

  it("wipes the orphan DEK when the upload session fails after encryption", async () => {
    const { store } = setupEncryptedPendingFile();
    const dek = makeDek();
    vi.mocked(prepareEncryptedUpload).mockResolvedValue(
      preparedUpload(dek) as never,
    );
    vi.mocked(filesApi.startUploadSession).mockRejectedValue(
      new Error("session down"),
    );
    replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    // DEK hygiene on the error path: taken out and destroyed, exactly once.
    expect(vi.mocked(wipeDek).mock.calls).toEqual([[dek]]);
    expect(hasFileDek(store.files[0])).toBe(false);
    expect(store.files[0].error).toBe("session down");
    expect(store.currentUploadNumber).toBe(0);
  });

  it("fails the file and frees the slot when the encryption preparation itself rejects", async () => {
    allowConsoleError("[ENCRYPTION] prepareFileForEncryptedUpload failed");
    const { store, fakes } = setupEncryptedPendingFile();
    vi.mocked(prepareEncryptedUpload).mockRejectedValue(
      new Error("encryptFile blew up"),
    );
    const finishUploadFiles = replaceAction(store, "finishUploadFiles");

    await store.startSessionFunc(0, t);

    // No DEK was ever issued — nothing to wipe, nothing left behind.
    expect(wipeDek).not.toHaveBeenCalled();
    expect(hasFileDek(store.files[0])).toBe(false);

    expect(store.files[0].error).toBe("Common:EncryptionPrepareFailed");
    expect(store.files[0].percent).toBe(0);
    expect(store.uploadedFilesHistory[0].error).toBe(
      "Common:EncryptionPrepareFailed",
    );
    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptionPrepareFailed",
    );
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenLastCalledWith({
      operation: OPERATIONS_NAME.upload,
      // characterized quirk: the errored entry keeps percent 0, so the
      // aggregate reported alongside the alert is 0, not 100.
      percent: 0,
      alert: true,
    });

    // The slot is released, no session was ever opened, and the batch is
    // finalized through the caller-side latch.
    expect(store.currentUploadNumber).toBe(0);
    expect(filesApi.startUploadSession).not.toHaveBeenCalled();
    expect(store.finishUploadFilesCalled).toBe(true);
    expect(finishUploadFiles.mock.calls).toEqual([[t, false]]);
  });
});

// mutation-checked: inverting the willEncryptItem filter in
// cancelEncryptedBatchUpload cancels the wrong files — both asserts on
// files[].cancel go red.
describe("UploadDataStore — encrypted batch gates (Phase 5 net)", () => {
  it("ensureEncryptionUnlockedForBatch is a pass-through without keys or encryptable files", async () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile()];
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(requireUnlock).not.toHaveBeenCalled();
  });

  it("ensureEncryptionUnlockedForBatch requires an unlocked identity when a pending file will encrypt", async () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    store.files = [makeUploadFile()];

    vi.mocked(requireUnlock).mockResolvedValue({ pub: "x" } as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(true);
    expect(vi.mocked(requireUnlock).mock.calls).toEqual([["user-1"]]);

    vi.mocked(requireUnlock).mockResolvedValue(null as never);
    await expect(store.ensureEncryptionUnlockedForBatch()).resolves.toBe(
      false,
    );
  });

  it("cancelEncryptedBatchUpload cancels only the not-yet-started encryptable files and prunes their history", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: userWithKeys(),
    });
    const pendingEncryptable = makeUploadFile({ uniqueId: "enc-a" });
    const alreadyRunning = makeUploadFile({
      uniqueId: "run-b",
      inAction: true,
    });
    const alreadyEncrypted = makeUploadFile({
      uniqueId: "pre-c",
      encrypted: true, // willEncryptItem => false, stays in the queue
    });
    store.files = [pendingEncryptable, alreadyRunning, alreadyEncrypted];
    store.uploadedFilesHistory = [
      { ...pendingEncryptable },
      { ...alreadyRunning },
      { ...alreadyEncrypted },
    ];

    store.cancelEncryptedBatchUpload();

    expect(store.files.map((f) => !!f.cancel)).toEqual([true, false, false]);
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].percent).toBe(100);
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual([
      "run-b",
      "pre-c",
    ]);
    expect(toastr.info).toHaveBeenCalledWith(
      "Common:EncryptionUploadCancelled",
    );
  });
});
