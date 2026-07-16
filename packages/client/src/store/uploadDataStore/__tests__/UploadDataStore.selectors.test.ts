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

beforeEach(() => {
  installWindowGlobals();
});

describe("UploadDataStore.getNewPercent", () => {
  it("computes cumulative percent from files preceding indexOfFile plus the current uploaded size", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("b.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("c.docx", 2000) }),
    ];
    store.uploaded = false;

    expect(store.getNewPercent(500, 1)).toBe(37.5);
    expect(store.getNewPercent(500, 0)).toBe(12.5);
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

    expect(store.getNewPercent(500, 0)).toBe(25);
  });

  it("divides by a zero total when the store is already marked uploaded", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
      makeUploadFile({ file: makeBrowserFile("b.docx", 1000) }),
    ];
    store.uploaded = true;

    expect(store.getNewPercent(500, 1)).toBe(Infinity);
    expect(Number.isNaN(store.getNewPercent(0, 0))).toBe(true);
  });
});

describe("UploadDataStore.getFilesPercent", () => {
  it("returns the average percent across uploadedFilesHistory", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [
      makeUploadFile({ percent: 50 }),
      makeUploadFile({ percent: 100 }),
    ];

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

    expect(store.getFilesPercent()).toBe(50);
  });

  it("returns NaN for an empty history", () => {
    const { store } = createTestUploadDataStore();
    store.uploadedFilesHistory = [];

    expect(Number.isNaN(store.getFilesPercent())).toBe(true);
  });
});

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

    expect(Number.isNaN(store.getConversationPercent(0))).toBe(true);
    expect(store.getConversationPercent(1)).toBe(Infinity);
  });
});

describe("UploadDataStore.getActiveUploadCountForRoom", () => {
  it("counts only in-flight, non-canceled, non-errored uploads targeting the room", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ toFolderId: 42, action: "upload" }),
      makeUploadFile({ toFolderId: 42, action: "upload", cancel: true }),
      makeUploadFile({ toFolderId: 42, action: "upload", error: "failed" }),
      makeUploadFile({ toFolderId: 42, action: "uploaded" }),
      makeUploadFile({ toFolderId: 42, action: "convert" }),
      makeUploadFile({ toFolderId: 42, action: "converted" }),
      makeUploadFile({ toFolderId: 43, action: "upload" }),
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

describe("UploadDataStore.getUserEncryptionKeys", () => {
  it("returns all-null result when the user has no encryption keys", () => {
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

describe("UploadDataStore.shouldEncryptCurrentUpload", () => {
  it("is false by default (no room type, no privacy folder, no keys)", () => {
    const { store } = createTestUploadDataStore();

    expect(store.shouldEncryptCurrentUpload()).toBe(false);
  });

  it("is false in a privacy folder when the user has no encryption keys", () => {
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

    expect(store.shouldEncryptCurrentUpload()).toBe(false);
  });
});

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
