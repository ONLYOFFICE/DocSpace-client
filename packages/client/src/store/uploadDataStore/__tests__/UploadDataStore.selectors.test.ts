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

import { describe, it, expect, beforeEach } from "vitest";
import { RoomsType } from "@docspace/shared/enums";

import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeBrowserFile,
  makeUploadFile,
} from "./testHarness";

// Characterization tests for the pure derivation methods of UploadDataStore
// (plan §3.4 row #1 + the encryption selectors of Phase 1). Every expect
// documents CURRENT behavior, including unguarded divisions by zero — those
// are flagged inline as characterized quirks and must not be "fixed" here.

beforeEach(() => {
  installWindowGlobals();
});

// mutation-checked: off-by-one in the preceding-files filter
// (`i < indexOfFile` → `<=`) turned 2 tests red (run 2026-07-09).
describe("UploadDataStore.getNewPercent", () => {
  it("computes cumulative percent from files preceding indexOfFile plus the current uploaded size", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("b.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("c.docx", 2000) }),
    ];
    store.uploaded = false;

    // total = 4000; preceding (index < 1) = 1000; (500 + 1000) / 4000 * 100
    expect(store.getNewPercent(500, 1)).toBe(37.5);
    // no preceding files: 500 / 4000 * 100
    expect(store.getNewPercent(500, 0)).toBe(12.5);
    // preceding (index < 2) = 2000: (2000 + 2000) / 4000 * 100
    expect(store.getNewPercent(2000, 2)).toBe(100);
  });

  it("counts canceled files' sizes in both the total and the preceding sum", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
      makeUploadFile({
        file: makeBrowserFile("b.docx", 1000),
        cancel: true,
      }),
    ];
    store.uploaded = false;

    // characterized quirk: no cancel filter — the canceled file still
    // contributes 1000 to the 2000 total: 500 / 2000 * 100.
    expect(store.getNewPercent(500, 0)).toBe(25);
  });

  it("divides by a zero total when the store is already marked uploaded", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("b.docx", 1000) }),
    ];
    store.uploaded = true;

    // characterized quirk: with uploaded === true every size contributes 0,
    // so newTotalSize is 0 and the division is unguarded.
    expect(store.getNewPercent(500, 1)).toBe(Infinity);
    expect(Number.isNaN(store.getNewPercent(0, 0))).toBe(true);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.getFilesPercent", () => {
  it("returns the average percent across uploadedFilesHistory", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ percent: 50 }),
      makeUploadFile({ percent: 100 }),
    ];

    // (50 + 100) / (2 * 100) * 100
    expect(store.getFilesPercent()).toBe(75);
  });

  it("returns 100 when every history entry is complete", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ percent: 100, action: "uploaded" }),
      makeUploadFile({ percent: 100, action: "uploaded" }),
      makeUploadFile({ percent: 100, action: "uploaded" }),
    ];

    expect(store.getFilesPercent()).toBe(100);
  });

  it("counts canceled history entries in the denominator", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ percent: 100, action: "uploaded" }),
      makeUploadFile({ percent: 0, cancel: true }),
    ];

    // characterized quirk: canceled entries are not filtered out, so the
    // canceled 0% drags the average down: 100 / 200 * 100.
    expect(store.getFilesPercent()).toBe(50);
  });

  it("returns NaN for an empty history", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [];

    // characterized quirk: 0 / (0 * 100) is an unguarded 0/0 division.
    expect(Number.isNaN(store.getFilesPercent())).toBe(true);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.getConversationPercent", () => {
  it("returns the ratio of fileIndex to the number of files needing conversion", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ needConvert: true }),
      makeUploadFile({ needConvert: true }),
      makeUploadFile({ needConvert: false }),
      makeUploadFile({ needConvert: false }),
    ];

    expect(store.getConversationPercent(0)).toBe(0);
    expect(store.getConversationPercent(1)).toBe(50);
    expect(store.getConversationPercent(2)).toBe(100);
  });

  it("divides by zero when no file needs conversion", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ needConvert: false }),
      makeUploadFile({ needConvert: false }),
    ];

    // characterized quirk: the needConvert count is an unguarded denominator.
    expect(Number.isNaN(store.getConversationPercent(0))).toBe(true);
    expect(store.getConversationPercent(1)).toBe(Infinity);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.getActiveUploadCountForRoom", () => {
  it("counts only in-flight, non-canceled, non-errored uploads targeting the room", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ toFolderId: 42, action: "upload" }), // counts
      makeUploadFile({ toFolderId: 42, action: "upload", cancel: true }),
      makeUploadFile({ toFolderId: 42, action: "upload", error: "failed" }),
      makeUploadFile({ toFolderId: 42, action: "uploaded" }),
      makeUploadFile({ toFolderId: 42, action: "convert" }),
      makeUploadFile({ toFolderId: 42, action: "converted" }),
      makeUploadFile({ toFolderId: 43, action: "upload" }), // other room
    ];

    expect(store.getActiveUploadCountForRoom(42)).toBe(1);
    expect(store.getActiveUploadCountForRoom(43)).toBe(1);
    expect(store.getActiveUploadCountForRoom(999)).toBe(0);
  });

  it("matches room ids across string/number representations", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ toFolderId: 42, action: "upload" }),
      makeUploadFile({ toFolderId: "42", action: "upload" }),
    ];

    // both String(42) and String("42") equal the stringified target
    expect(store.getActiveUploadCountForRoom(42)).toBe(2);
    expect(store.getActiveUploadCountForRoom("42")).toBe(2);
  });

  it("returns 0 for null/undefined room ids regardless of active uploads", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ toFolderId: 42, action: "upload" })];

    expect(store.getActiveUploadCountForRoom(null)).toBe(0);
    expect(store.getActiveUploadCountForRoom(undefined)).toBe(0);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.getUploadedFile", () => {
  it("returns every file whose uniqueId matches, and [] when nothing matches", () => {
    const { store } = createTestUploadDataStore();
    const fileA = makeUploadFile({ uniqueId: "dup" });
    const fileB = makeUploadFile({ uniqueId: "dup" });
    const fileC = makeUploadFile({ uniqueId: "other" });
    store.files = [fileA, fileB, fileC];

    const matches = store.getUploadedFile("dup");
    expect(matches).toHaveLength(2);
    expect(matches).toEqual([fileA, fileB]);
    expect(store.getUploadedFile("missing")).toEqual([]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.getUserEncryptionKeys", () => {
  it("returns all-null result when the user has no encryption keys", () => {
    // harness default: userStore.encryptionKeys = []
    const { store } = createTestUploadDataStore();

    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: null,
      userId: null,
      publicKeyId: null,
    });
  });

  it("returns the single key without needing a stored device preference", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: "pk-base64-1",
      userId: "user-1",
      publicKeyId: "key-1",
    });
  });

  it("nullifies only publicKey when the active key has an empty publicKey", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "" }],
      },
    });

    // characterized quirk: partial result — userId/publicKeyId are still
    // returned even though publicKey degraded to null via `|| null`.
    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: null,
      userId: "user-1",
      publicKeyId: "key-1",
    });
  });

  it("returns all-null result when keys exist but there is no user", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        user: null,
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: null,
      userId: null,
      publicKeyId: null,
    });
  });

  it("returns all-null result for multiple keys without a stored preference", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        encryptionKeys: [
          { id: "key-1", publicKey: "pk-base64-1" },
          { id: "key-2", publicKey: "pk-base64-2" },
        ],
      },
    });

    // selectActiveKey refuses to auto-pick among 2+ keys: the user must
    // choose one on the keys-management page first.
    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: null,
      userId: null,
      publicKeyId: null,
    });
  });

  it("resolves the preferred key among multiple keys via the stored preference", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        user: { id: "user-pref" },
        encryptionKeys: [
          { id: "key-1", publicKey: "pk-base64-1" },
          { id: "key-2", publicKey: "pk-base64-2" },
        ],
      },
    });
    window.localStorage.setItem("encryption-active-key-id:user-pref", "key-2");

    expect(store.getUserEncryptionKeys()).toEqual({
      publicKey: "pk-base64-2",
      userId: "user-pref",
      publicKeyId: "key-2",
    });

    window.localStorage.removeItem("encryption-active-key-id:user-pref");
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.shouldEncryptCurrentUpload", () => {
  it("is false by default (no room type, no privacy folder, no keys)", () => {
    const { store } = createTestUploadDataStore();

    expect(store.shouldEncryptCurrentUpload()).toBe(false);
  });

  it("is false in a privacy folder when the user has no encryption keys", () => {
    // the real shouldEncryptUpload is NOT mocked: with no keys the
    // `!!publicKey && !!userId` guard short-circuits the result to false.
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });

    expect(store.shouldEncryptCurrentUpload()).toBe(false);
  });

  it("is true in a privacy folder when the user has an active encryption key", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(store.shouldEncryptCurrentUpload()).toBe(true);
  });

  it("is false for an encryptable room type when the folder is not private", () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { roomType: RoomsType.CustomRoom },
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    // shouldEncryptUpload requires isPrivate === true on top of the room type
    expect(store.shouldEncryptCurrentUpload()).toBe(false);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.willEncryptItem", () => {
  const keyedUserStore = {
    encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
  };

  it("is false for null and undefined items", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(store.willEncryptItem(null)).toBe(false);
    expect(store.willEncryptItem(undefined)).toBe(false);
  });

  it("is true for a plain item in a privacy folder when keys are available", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(store.willEncryptItem(makeUploadFile())).toBe(true);
  });

  it("is false when the item is already encrypted", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(store.willEncryptItem(makeUploadFile({ encrypted: true }))).toBe(
      false,
    );
  });

  it("is false without encryption keys even in a privacy folder", () => {
    // real willEncryptUploadItem is NOT mocked: it early-returns false when
    // publicKey/userId are null (harness default: empty encryptionKeys).
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });

    expect(store.willEncryptItem(makeUploadFile())).toBe(false);
  });

  it("honors a per-file uploadContext override in a non-private folder", () => {
    const { store } = createTestUploadDataStore({ userStore: keyedUserStore });
    const item = makeUploadFile({
      file: makeBrowserFile("a.docx", 1024, {
        uploadContext: { roomType: RoomsType.CustomRoom, isPrivate: true },
      }),
    });

    expect(store.willEncryptItem(item)).toBe(true);
  });

  it("lets uploadContext.isPrivate=false override the privacy folder", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });
    const item = makeUploadFile({
      file: makeBrowserFile("a.docx", 1024, {
        uploadContext: { isPrivate: false },
      }),
    });

    expect(store.willEncryptItem(item)).toBe(false);
  });
});
