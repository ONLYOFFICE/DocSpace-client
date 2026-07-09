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

import { describe, it, expect, vi, beforeEach } from "vitest";

// The harness must be imported before the modules it mocks (see its header).
import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makeUploadFile,
} from "./testHarness";

import {
  cancelEncryptedBatchUploadImpl,
  ensureEncryptionUnlockedForBatchImpl,
} from "../encryption.helpers";

// Direct unit tests for the extracted Phase 5 encrypted-batch gates (plan
// §4.1 step 7). These two methods gate a batch on the encryption identity and
// take no crypto-service dependencies beyond the willEncryptItem selector, so
// they run against the harness store without per-file crypto mocks. The
// DEK-wrapping methods (wrapForSelfThenRoom/encryptKeysForRoomMembers) and
// their DEK-hygiene invariant are covered — with the required partial mocks —
// by UploadDataStore.encryption.test.ts; the extraction-phase control mutation
// (§4.1 step 8) confirmed that net bites this module.

const keyedPrivacy = {
  treeFoldersStore: { isPrivacyFolder: true },
  userStore: { encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }] },
};

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("cancelEncryptedBatchUploadImpl", () => {
  it("cancels only pending, encryptable upload rows and drops them from history", () => {
    const { store } = createTestUploadDataStore(keyedPrivacy);
    const enc = makeUploadFile({ uniqueId: "enc", action: "upload" });
    const already = makeUploadFile({
      uniqueId: "already",
      action: "upload",
      encrypted: true, // willEncryptItem -> false, so it is left alone
    });
    const errored = makeUploadFile({
      uniqueId: "err",
      action: "upload",
      error: "boom",
    });
    store.files = [enc, already, errored];
    store.uploadedFilesHistory = [
      makeUploadFile({ uniqueId: "enc" }),
      makeUploadFile({ uniqueId: "already" }),
    ];

    cancelEncryptedBatchUploadImpl(store);

    // the encryptable pending row is force-completed as canceled
    expect(store.files[0].cancel).toBe(true);
    expect(store.files[0].action).toBe("uploaded");
    expect(store.files[0].percent).toBe(100);
    // already-encrypted and errored rows are untouched
    expect(store.files[1].cancel).toBe(false);
    expect(store.files[2].cancel).toBe(false);
    // only the canceled row is pruned from the history
    expect(store.uploadedFilesHistory.map((f) => f.uniqueId)).toEqual([
      "already",
    ]);
  });

  it("does nothing when the user has no encryption keys", () => {
    // harness default userStore has empty encryptionKeys -> willEncryptItem false
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });
    store.files = [makeUploadFile({ uniqueId: "a", action: "upload" })];

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
    const { store } = createTestUploadDataStore(keyedPrivacy);
    // an already-encrypted upload plus a non-upload row -> nothing to unlock
    store.files = [
      makeUploadFile({
        action: "upload",
        file: makeBrowserFile("a.docx", 10, { encrypted: true }),
        encrypted: true,
      }),
      makeUploadFile({ action: "converted" }),
    ];

    await expect(ensureEncryptionUnlockedForBatchImpl(store)).resolves.toBe(
      true,
    );
  });
});
