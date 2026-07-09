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

import {
  getActiveUploadCountForRoomImpl,
  getConversationPercentImpl,
  getFilesPercentImpl,
  getNewPercentImpl,
  getUploadedFileImpl,
  getUserEncryptionKeysImpl,
  shouldEncryptCurrentUploadImpl,
  willEncryptItemImpl,
} from "../selectors.helpers";

// Direct unit tests for the extracted Phase 1 selectors (plan §4.1 step 7).
// Unlike UploadDataStore.selectors.test.ts (which exercises the store facades),
// these call the *Impl functions directly: the pure deps-object selectors take
// a plain deps literal (no store required), the encryption selectors take a
// harness store. This proves the safety net bites the NEW helper module, not a
// leftover copy on the store. Behavior — including the characterized unguarded
// divisions by zero — is asserted verbatim.

beforeEach(() => {
  installWindowGlobals();
});

// mutation-checked: the preceding-files filter off-by-one
// (`i < indexOfFile` → `i <= indexOfFile`) in the helper turns the first case
// red (re-run at extraction gate 2026-07-09).
describe("getNewPercentImpl", () => {
  it("sums files preceding indexOfFile plus the current uploaded size", () => {
    const deps = {
      files: [
        makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
        makeUploadFile({ file: makeBrowserFile("b.docx", 1000) }),
        makeUploadFile({ file: makeBrowserFile("c.docx", 2000) }),
      ],
      uploaded: false,
    };

    // total = 4000; preceding (index < 1) = 1000; (500 + 1000) / 4000 * 100
    expect(getNewPercentImpl(500, 1, deps)).toBe(37.5);
    // no preceding files: 500 / 4000 * 100
    expect(getNewPercentImpl(500, 0, deps)).toBe(12.5);
    // preceding (index < 2) = 2000: (2000 + 2000) / 4000 * 100
    expect(getNewPercentImpl(2000, 2, deps)).toBe(100);
  });

  it("counts canceled files' sizes in both the total and the preceding sum", () => {
    const deps = {
      files: [
        makeUploadFile({ file: makeBrowserFile("a.docx", 1000) }),
        makeUploadFile({
          file: makeBrowserFile("b.docx", 1000),
          cancel: true,
        }),
      ],
      uploaded: false,
    };

    // characterized quirk: no cancel filter — the canceled file still
    // contributes 1000 to the 2000 total: 500 / 2000 * 100.
    expect(getNewPercentImpl(500, 0, deps)).toBe(25);
  });

  it("divides by a zero total when the queue is already marked uploaded", () => {
    const deps = {
      files: [makeUploadFile({ file: makeBrowserFile("a.docx", 1000) })],
      uploaded: true,
    };

    // characterized quirk: with uploaded === true every size contributes 0,
    // so newTotalSize is 0 and the division is unguarded.
    expect(getNewPercentImpl(500, 1, deps)).toBe(Infinity);
    expect(Number.isNaN(getNewPercentImpl(0, 0, deps))).toBe(true);
  });
});

// mutation-checked: swapping the numerator/denominator operands
// (`percentCurrentFileHistory / commonPercent` → inverse) turns the average
// case red.
describe("getFilesPercentImpl", () => {
  it("returns the average percent across uploadedFilesHistory", () => {
    // (50 + 100) / (2 * 100) * 100
    expect(
      getFilesPercentImpl({
        uploadedFilesHistory: [
          makeUploadFile({ percent: 50 }),
          makeUploadFile({ percent: 100 }),
        ],
      }),
    ).toBe(75);
  });

  it("returns NaN for an empty history (unguarded 0 / 0)", () => {
    expect(
      Number.isNaN(getFilesPercentImpl({ uploadedFilesHistory: [] })),
    ).toBe(true);
  });
});

// mutation-checked: dropping the `f.needConvert` filter (counting every file)
// turns the ratio case red.
describe("getConversationPercentImpl", () => {
  it("returns the ratio of fileIndex to the number of files needing conversion", () => {
    const deps = {
      files: [
        makeUploadFile({ needConvert: true }),
        makeUploadFile({ needConvert: true }),
        makeUploadFile({ needConvert: false }),
      ],
    };

    expect(getConversationPercentImpl(0, deps)).toBe(0);
    expect(getConversationPercentImpl(1, deps)).toBe(50);
    expect(getConversationPercentImpl(2, deps)).toBe(100);
  });

  it("divides by zero when no file needs conversion", () => {
    const deps = { files: [makeUploadFile({ needConvert: false })] };

    expect(Number.isNaN(getConversationPercentImpl(0, deps))).toBe(true);
    expect(getConversationPercentImpl(1, deps)).toBe(Infinity);
  });
});

describe("getActiveUploadCountForRoomImpl", () => {
  it("counts only in-flight, non-canceled, non-errored uploads for the room", () => {
    const deps = {
      files: [
        makeUploadFile({ toFolderId: 42, action: "upload" }), // counts
        makeUploadFile({ toFolderId: 42, action: "upload", cancel: true }),
        makeUploadFile({ toFolderId: 42, action: "upload", error: "x" }),
        makeUploadFile({ toFolderId: 42, action: "uploaded" }),
        makeUploadFile({ toFolderId: 43, action: "upload" }), // other room
      ],
    };

    expect(getActiveUploadCountForRoomImpl(42, deps)).toBe(1);
    expect(getActiveUploadCountForRoomImpl(43, deps)).toBe(1);
    expect(getActiveUploadCountForRoomImpl(999, deps)).toBe(0);
  });

  it("matches room ids across string/number forms and returns 0 for null", () => {
    const deps = {
      files: [
        makeUploadFile({ toFolderId: 42, action: "upload" }),
        makeUploadFile({ toFolderId: "42", action: "upload" }),
      ],
    };

    expect(getActiveUploadCountForRoomImpl(42, deps)).toBe(2);
    expect(getActiveUploadCountForRoomImpl("42", deps)).toBe(2);
    expect(getActiveUploadCountForRoomImpl(null, deps)).toBe(0);
    expect(getActiveUploadCountForRoomImpl(undefined, deps)).toBe(0);
  });
});

describe("getUploadedFileImpl", () => {
  it("returns every file whose uniqueId matches, and [] when nothing matches", () => {
    const fileA = makeUploadFile({ uniqueId: "dup" });
    const fileB = makeUploadFile({ uniqueId: "dup" });
    const fileC = makeUploadFile({ uniqueId: "other" });
    const deps = { files: [fileA, fileB, fileC] };

    expect(getUploadedFileImpl("dup", deps)).toEqual([fileA, fileB]);
    expect(getUploadedFileImpl("missing", deps)).toEqual([]);
  });
});

// mutation-checked: dropping `activeKey.id || null` (returning null) turns the
// single-key case red — proves the encryption selector bites the new module.
describe("getUserEncryptionKeysImpl", () => {
  it("returns all-null when the user has no encryption keys", () => {
    const { store } = createTestUploadDataStore();

    expect(getUserEncryptionKeysImpl(store)).toEqual({
      publicKey: null,
      userId: null,
      publicKeyId: null,
    });
  });

  it("resolves the single active key without a stored device preference", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(getUserEncryptionKeysImpl(store)).toEqual({
      publicKey: "pk-base64-1",
      userId: "user-1",
      publicKeyId: "key-1",
    });
  });

  it("refuses to auto-pick among multiple keys without a preference", () => {
    const { store } = createTestUploadDataStore({
      userStore: {
        encryptionKeys: [
          { id: "key-1", publicKey: "pk-base64-1" },
          { id: "key-2", publicKey: "pk-base64-2" },
        ],
      },
    });

    expect(getUserEncryptionKeysImpl(store)).toEqual({
      publicKey: null,
      userId: null,
      publicKeyId: null,
    });
  });
});

describe("shouldEncryptCurrentUploadImpl", () => {
  it("is false by default (no room type, no privacy folder, no keys)", () => {
    const { store } = createTestUploadDataStore();

    expect(shouldEncryptCurrentUploadImpl(store)).toBe(false);
  });

  it("is true in a privacy folder once the user has an active key", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(shouldEncryptCurrentUploadImpl(store)).toBe(true);
  });

  it("is false for an encryptable room type when the folder is not private", () => {
    const { store } = createTestUploadDataStore({
      selectedFolderStore: { roomType: RoomsType.CustomRoom },
      userStore: {
        encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
      },
    });

    expect(shouldEncryptCurrentUploadImpl(store)).toBe(false);
  });
});

describe("willEncryptItemImpl", () => {
  const keyedUserStore = {
    encryptionKeys: [{ id: "key-1", publicKey: "pk-base64-1" }],
  };

  it("is false for null/undefined items", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(willEncryptItemImpl(store, null)).toBe(false);
    expect(willEncryptItemImpl(store, undefined)).toBe(false);
  });

  it("is true for a plain item in a privacy folder with keys available", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(willEncryptItemImpl(store, makeUploadFile())).toBe(true);
  });

  it("is false when the item is already encrypted", () => {
    const { store } = createTestUploadDataStore({
      treeFoldersStore: { isPrivacyFolder: true },
      userStore: keyedUserStore,
    });

    expect(willEncryptItemImpl(store, makeUploadFile({ encrypted: true }))).toBe(
      false,
    );
  });

  it("honors a per-file uploadContext override in a non-private folder", () => {
    const { store } = createTestUploadDataStore({ userStore: keyedUserStore });
    const item = makeUploadFile({
      file: makeBrowserFile("a.docx", 1024, {
        uploadContext: { roomType: RoomsType.CustomRoom, isPrivate: true },
      }),
    });

    expect(willEncryptItemImpl(store, item)).toBe(true);
  });
});
