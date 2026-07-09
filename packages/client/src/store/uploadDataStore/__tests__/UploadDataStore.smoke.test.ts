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

import { describe, it, expect } from "vitest";
import { isObservableProp } from "mobx";

import { createTestUploadDataStore, makeUploadFile } from "./testHarness";

// Proves the harness constructs a working store before any characterization
// test is written (§3.3 of the plan). If this file is red, fix the harness —
// do not write more tests.
describe("UploadDataStore — harness smoke", () => {
  it("constructs with pristine defaults", () => {
    const { store } = createTestUploadDataStore();

    expect(store.files).toEqual([]);
    expect(store.uploadedFilesHistory).toEqual([]);
    expect(store.uploaded).toBe(true);
    expect(store.converted).toBe(true);
    expect(store.percent).toBe(0);
    expect(store.currentUploadNumber).toBe(0);
    expect(store.uploadPanelVisible).toBe(false);
    expect(store.asyncUploadObj).toEqual({});
  });

  it("wires the injected stores it was constructed with", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();

    // Class instances pass through makeAutoObservable untouched...
    expect(store.filesStore).toBe(filesStore);
    // ...while plain-object fakes get wrapped in observable proxies, so
    // identity is NOT preserved for them. What tests rely on instead: calls
    // made through the store land on the very vi.fn()s the harness returned.
    store.primaryProgressDataStore.setPrimaryProgressBarData({
      operation: "upload",
      percent: 42,
    } as never);
    expect(
      fakes.primaryProgressDataStore.setPrimaryProgressBarData,
    ).toHaveBeenCalledWith({ operation: "upload", percent: 42 });
    // The real FilesStore from the filesStore harness is fully constructed.
    expect(Array.isArray(filesStore.files)).toBe(true);
  });

  it("makeAutoObservable made the state fields observable", () => {
    const { store } = createTestUploadDataStore();

    expect(isObservableProp(store, "files")).toBe(true);
    expect(isObservableProp(store, "uploadedFilesHistory")).toBe(true);
    expect(isObservableProp(store, "percent")).toBe(true);
    expect(isObservableProp(store, "uploaded")).toBe(true);
  });

  it("trivial state methods behave against fixtures", () => {
    const { store } = createTestUploadDataStore();
    const fileA = makeUploadFile({ uniqueId: "u1" });
    const fileB = makeUploadFile({ uniqueId: "u2" });
    store.files = [fileA, fileB];

    expect(store.getUploadedFile("u1")).toEqual([fileA]);
    expect(store.getUploadedFile("missing")).toEqual([]);

    store.setUploadPanelVisible(true);
    expect(store.uploadPanelVisible).toBe(true);
  });
});
