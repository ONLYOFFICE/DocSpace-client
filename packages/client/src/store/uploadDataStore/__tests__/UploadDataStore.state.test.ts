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

import type UploadDataStore from "../../UploadDataStore";
import {
  createTestUploadDataStore,
  installWindowGlobals,
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";

// Characterization tests for the setter/mutator methods of UploadDataStore
// (plan §3.4 row #2 plus the trivial visibility setters). Every expect pins
// CURRENT behavior: which fields a method writes, which it leaves alone, and
// whether arrays are mutated in place or replaced (§3.4.1).

beforeEach(() => {
  installWindowGlobals();
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.setUploadData", () => {
  it("writes every provided key onto the store via reflection", () => {
    const { store } = createTestUploadDataStore();
    const fileA = makeUploadFile({ uniqueId: "u1" });

    store.setUploadData({
      files: [fileA],
      percent: 55,
      uploaded: false,
    });

    expect(store.files).toEqual([fileA]);
    expect(store.percent).toBe(55);
    expect(store.uploaded).toBe(false);
  });

  it("leaves fields that were not passed untouched", () => {
    const { store } = createTestUploadDataStore();
    store.filesSize = 12345;
    store.converted = false;
    store.currentUploadNumber = 3;

    store.setUploadData({ percent: 77, uploadedFiles: 2 });

    expect(store.percent).toBe(77);
    expect(store.uploadedFiles).toBe(2);
    // not part of the payload — must stay as prepared above
    expect(store.filesSize).toBe(12345);
    expect(store.converted).toBe(false);
    expect(store.currentUploadNumber).toBe(3);
  });

  it("silently drops keys that do not exist on the store instance", () => {
    const { store } = createTestUploadDataStore();

    // characterized quirk: the reflection setter guards with `key in this`,
    // so TUploadData keys without a backing field (newFilesWithoutConversion,
    // allNewFiles, conversionFiles) and arbitrary junk are ignored — no field
    // is created and no error is thrown.
    store.setUploadData({
      percent: 10,
      newFilesWithoutConversion: [makeUploadFile()],
      bogus: "ignored",
    } as unknown as Parameters<UploadDataStore["setUploadData"]>[0]);

    expect(store.percent).toBe(10);
    expect("newFilesWithoutConversion" in store).toBe(false);
    expect("bogus" in store).toBe(false);
  });
});

// mutation-checked: dropping the `filesSize = 0` reset went red
// (run 2026-07-09).
describe("UploadDataStore.clearUploadData", () => {
  const dirtyStore = () => {
    const harness = createTestUploadDataStore();
    const { store } = harness;
    store.files = [makeUploadFile()];
    store.filesToConversion = [makeUploadFile()];
    store.uploadedFilesHistory = [makeUploadFile({ percent: 100 })];
    store.filesSize = 999;
    store.uploadedFiles = 3;
    store.percent = 42;
    store.conversionPercent = 7;
    store.uploaded = false;
    store.converted = false;
    store.errors = 2;
    store.uploadedFilesSize = 555;
    store.isUploadingAndConversion = true;
    store.isUploading = true;
    store.asyncUploadObj = { temp_1: { chunksArray: [] } };
    store.quotaErrorRaised = true;
    return harness;
  };

  it("resets every field it covers back to its default", () => {
    const { store } = dirtyStore();

    store.clearUploadData();

    expect(store.files).toEqual([]);
    expect(store.filesToConversion).toEqual([]);
    expect(store.uploadedFilesHistory).toEqual([]);
    expect(store.filesSize).toBe(0);
    expect(store.uploadedFiles).toBe(0);
    expect(store.percent).toBe(0);
    expect(store.conversionPercent).toBe(0);
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.errors).toBe(0);
    expect(store.uploadedFilesSize).toBe(0);
    expect(store.isUploadingAndConversion).toBe(false);
    expect(store.isUploading).toBe(false);
    expect(store.asyncUploadObj).toEqual({});
    expect(store.quotaErrorRaised).toBe(false);
  });

  it("does not touch fields outside its reset list", () => {
    const { store } = dirtyStore();
    const tempConversion = makeUploadFile();
    store.tempConversionFiles = [tempConversion];
    store.displayedConversionFiles = [
      { fileId: 501, fileInfo: makeFileInfo({ id: 501 }), action: "convert" },
    ];
    store.currentUploadNumber = 3;
    store.finishUploadFilesCalled = true;
    store.uploadPanelVisible = true;
    store.conversionVisible = true;

    store.clearUploadData();

    // characterized quirk: "clear" is partial — the conversion-panel state,
    // the semaphore and the finish latch survive a clearUploadData call.
    expect(store.tempConversionFiles).toEqual([tempConversion]);
    expect(store.displayedConversionFiles).toHaveLength(1);
    expect(store.displayedConversionFiles[0].fileId).toBe(501);
    expect(store.currentUploadNumber).toBe(3);
    expect(store.finishUploadFilesCalled).toBe(true);
    expect(store.uploadPanelVisible).toBe(true);
    expect(store.conversionVisible).toBe(true);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.clearUploadedFiles", () => {
  it("drops only 'uploaded' files and resets the upload counters", () => {
    const { store } = createTestUploadDataStore();
    const uploading = makeUploadFile({ action: "upload" });
    const done = makeUploadFile({ action: "uploaded" });
    const converting = makeUploadFile({ action: "convert" });
    const converted = makeUploadFile({ action: "converted" });
    store.files = [uploading, done, converting, converted];
    store.filesSize = 4096;
    store.uploadedFiles = 1;
    store.percent = 80;
    store.isUploading = true;
    store.isUploadingAndConversion = true;

    store.clearUploadedFiles();

    // only action === "uploaded" is filtered out; "converted" survives
    expect(store.files).toEqual([uploading, converting, converted]);
    expect(store.filesSize).toBe(0);
    expect(store.uploadedFiles).toBe(0);
    expect(store.percent).toBe(0);
    expect(store.isUploading).toBe(false);
    expect(store.isUploadingAndConversion).toBe(false);
  });

  it("does not flip the uploaded/converted flags", () => {
    const { store } = createTestUploadDataStore();
    store.files = [makeUploadFile({ action: "uploaded" })];
    store.uploaded = false;
    store.converted = false;

    store.clearUploadedFiles();

    expect(store.files).toEqual([]);
    expect(store.uploaded).toBe(false);
    expect(store.converted).toBe(false);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.removeFiles", () => {
  it("removes only 'converted' files whose fileInfo.id matches", () => {
    const { store } = createTestUploadDataStore();
    const convertedTen = makeUploadFile({
      action: "converted",
      fileInfo: makeFileInfo({ id: 10 }),
    });
    const uploadedTen = makeUploadFile({
      action: "uploaded",
      fileInfo: makeFileInfo({ id: 10 }),
    });
    const convertedEleven = makeUploadFile({
      action: "converted",
      fileInfo: makeFileInfo({ id: 11 }),
    });
    const convertedNoInfo = makeUploadFile({
      action: "converted",
      fileInfo: null,
    });
    store.files = [convertedTen, uploadedTen, convertedEleven, convertedNoInfo];

    store.removeFiles([10]);

    // characterized quirk: an "uploaded" file with the very same fileInfo.id
    // is NOT removed — only action === "converted" entries qualify.
    expect(store.files).toEqual([uploadedTen, convertedEleven, convertedNoInfo]);
  });

  it("removes converted files for every id in the batch", () => {
    const { store } = createTestUploadDataStore();
    const keep = makeUploadFile({ action: "upload" });
    store.files = [
      makeUploadFile({ action: "converted", fileInfo: makeFileInfo({ id: 10 }) }),
      makeUploadFile({ action: "converted", fileInfo: makeFileInfo({ id: 11 }) }),
      keep,
    ];

    store.removeFiles([10, 11]);

    expect(store.files).toEqual([keep]);
  });

  it("leaves files untouched when no id matches", () => {
    const { store } = createTestUploadDataStore();
    const fileA = makeUploadFile({
      action: "converted",
      fileInfo: makeFileInfo({ id: 10 }),
    });
    store.files = [fileA];

    store.removeFiles([999]);

    expect(store.files).toEqual([fileA]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.updateUploadedFile", () => {
  it("sets fileInfo on the matching file and leaves the others alone", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "u1", fileId: 100 }),
      makeUploadFile({ uniqueId: "u2", fileId: 200 }),
    ];
    const info = makeFileInfo({ id: 900, title: "updated.docx" });

    store.updateUploadedFile(100, info);

    expect(store.files[0].fileId).toBe(100);
    expect(store.files[0].fileInfo).toEqual(info);
    expect(store.files[1].fileInfo).toBeNull();
  });

  it("replaces the files array (map), keeping identity only for unmatched elements", () => {
    const { store } = createTestUploadDataStore();
    store.files = [
      makeUploadFile({ uniqueId: "u1", fileId: 100 }),
      makeUploadFile({ uniqueId: "u2", fileId: 200 }),
    ];
    const arrayBefore = store.files;
    const matchedBefore = store.files[0];
    const unmatchedBefore = store.files[1];

    store.updateUploadedFile(100, makeFileInfo({ id: 900 }));

    // characterized quirk (§3.4.1 in-place question answered): this mutator
    // is NOT in-place — `map` produces a NEW array that replaces this.files,
    // and the matched element is a NEW spread copy. Only unmatched elements
    // keep their identity.
    expect(store.files).not.toBe(arrayBefore);
    expect(store.files[0]).not.toBe(matchedBefore);
    expect(store.files[1]).toBe(unmatchedBefore);
  });

  it("still replaces the array even when no file matches the id", () => {
    const { store } = createTestUploadDataStore();
    const fileA = makeUploadFile({ fileId: 100 });
    store.files = [fileA];
    const arrayBefore = store.files;
    const elementBefore = store.files[0];

    store.updateUploadedFile(999, makeFileInfo({ id: 900 }));

    // characterized quirk: the unconditional map/assign swaps the array
    // reference even for a no-op update; the element itself is untouched.
    expect(store.files).not.toBe(arrayBefore);
    expect(store.files[0]).toBe(elementBefore);
    expect(store.files[0].fileInfo).toBeNull();
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.clearConversionData", () => {
  it("empties the conversion-panel state and marks conversion-from-files done", () => {
    const { store } = createTestUploadDataStore();
    store.displayedConversionFiles = [
      { fileId: 501, fileInfo: makeFileInfo({ id: 501 }), action: "convert" },
    ];
    store.activeConversionQueue = [
      { fileId: 501, fileInfo: makeFileInfo({ id: 501 }) },
    ];
    store.convertedFromFiles = false;

    store.clearConversionData();

    expect(store.displayedConversionFiles).toEqual([]);
    expect(store.activeConversionQueue).toEqual([]);
    expect(store.convertedFromFiles).toBe(true);
  });

  it("does not touch the upload-side conversion queue", () => {
    const { store } = createTestUploadDataStore();
    const pending = makeUploadFile({ action: "convert" });
    store.filesToConversion = [pending];
    store.displayedConversionFiles = [{ fileId: 1, fileInfo: null }];

    store.clearConversionData();

    // filesToConversion belongs to the upload-conversion subsystem and is
    // deliberately outside clearConversionData's scope.
    expect(store.filesToConversion).toEqual([pending]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore.selectUploadedFile", () => {
  it("stores the passed selection array", () => {
    const { store } = createTestUploadDataStore();
    const selection = [makeUploadFile({ uniqueId: "sel-1" })];

    store.selectUploadedFile(selection);
    expect(store.selectedUploadFile).toEqual(selection);

    store.selectUploadedFile([]);
    expect(store.selectedUploadFile).toEqual([]);
  });
});

// mutation-checked: via the full §3.4.2 catalog pass (file-level); a
// direct mutation of this method re-runs at its extraction-phase gate
// (§4.1 step 2) before the code is moved.
describe("UploadDataStore visibility and flag setters", () => {
  it("setUploadPanelVisible writes uploadPanelVisible only", () => {
    const { store } = createTestUploadDataStore();

    store.setUploadPanelVisible(true);
    expect(store.uploadPanelVisible).toBe(true);
    expect(store.conversionVisible).toBe(false);

    store.setUploadPanelVisible(false);
    expect(store.uploadPanelVisible).toBe(false);
  });

  it("setConversionPanelVisible writes conversionVisible only", () => {
    const { store } = createTestUploadDataStore();

    store.setConversionPanelVisible(true);
    expect(store.conversionVisible).toBe(true);
    expect(store.uploadPanelVisible).toBe(false);

    store.setConversionPanelVisible(false);
    expect(store.conversionVisible).toBe(false);
  });

  it("setEncryptionEnabled writes encryptionEnabled", () => {
    const { store } = createTestUploadDataStore();

    store.setEncryptionEnabled(true);
    expect(store.encryptionEnabled).toBe(true);

    store.setEncryptionEnabled(false);
    expect(store.encryptionEnabled).toBe(false);
  });
});
