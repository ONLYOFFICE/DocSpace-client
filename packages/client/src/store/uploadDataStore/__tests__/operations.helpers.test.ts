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

import {
  createTestUploadDataStore,
  installWindowGlobals,
} from "./testHarness";
// eslint-disable-next-line import/order
import * as filesApi from "@docspace/shared/api/files";
// eslint-disable-next-line import/order
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
// eslint-disable-next-line import/order
import { ConflictResolveType, FileOperationStatus } from "@docspace/shared/enums";
import type { TOperation } from "@docspace/shared/api/files/types";

import {
  clearActiveOperationsImpl,
  itemOperationToFolderImpl,
  loopFilesOperationsImpl,
  moveToCopyToImpl,
} from "../operations.helpers";

const makeOperation = (overrides: Partial<TOperation> = {}): TOperation => ({
  Operation: 0,
  error: "",
  finished: false,
  id: "srv-op-1",
  processed: "0",
  progress: 0,
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("itemOperationToFolderImpl — routing", () => {
  it("routes isCopy=true to copyToFolder and never touches moveToFolder", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(filesApi.copyToFolder).mockResolvedValue([
      makeOperation({ finished: true, progress: 100 }),
    ] as never);

    await itemOperationToFolderImpl(store, {
      destFolderId: 99,
      folderIds: [7],
      fileIds: [5],
      deleteAfter: false,
      isCopy: true,
      content: true,
      toFillOut: false,
    });

    expect(filesApi.copyToFolder).toHaveBeenCalledWith(
      99,
      [7],
      [5],
      ConflictResolveType.Duplicate,
      false,
      true,
      false,
    );
    expect(filesApi.moveToFolder).not.toHaveBeenCalled();
  });

  it("routes isCopy=false to moveToFolder and never touches copyToFolder", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(filesApi.moveToFolder).mockResolvedValue([
      makeOperation({ finished: true, progress: 100 }),
    ] as never);

    await itemOperationToFolderImpl(store, {
      destFolderId: 99,
      folderIds: [7],
      fileIds: [5],
      deleteAfter: true,
      isCopy: false,
      toFillOut: true,
    });

    expect(filesApi.moveToFolder).toHaveBeenCalledWith(
      99,
      [7],
      [5],
      ConflictResolveType.Duplicate,
      true,
      true,
    );
    expect(filesApi.copyToFolder).not.toHaveBeenCalled();
  });
});

describe("clearActiveOperationsImpl", () => {
  it("drops only the passed ids from the real FilesStore active arrays", () => {
    const { store, filesStore } = createTestUploadDataStore();
    filesStore.setActiveFiles([5, 6]);
    filesStore.setActiveFolders([7, 8]);

    clearActiveOperationsImpl(store, [5], [7]);

    expect(filesStore.activeFiles.map((f) => f.id)).toEqual([6]);
    expect(filesStore.activeFolders.map((f) => f.id)).toEqual([8]);
  });
});

describe("moveToCopyToImpl", () => {
  it("move branch removes items, clears the dialog flag and completes the bar", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    const removeFiles = vi.fn();
    filesStore.removeFiles = removeFiles;

    moveToCopyToImpl(
      store,
      99,
      { operation: "move", operationId: "op-1" },
      false,
      [5],
      [7],
    );

    expect(removeFiles).toHaveBeenCalledWith([5], [7], null, 99);
    expect(fakes.dialogsStore.setIsFolderActions).toHaveBeenCalledWith(false);
    const calls = (
      fakes.secondaryProgressDataStore
        .setSecondaryProgressBarData as ReturnType<typeof vi.fn>
    ).mock.calls;
    expect(calls[calls.length - 1][0]).toEqual({
      operation: "move",
      percent: 100,
      completed: true,
      operationId: "op-1",
    });
  });

  it("copy into a foreign folder skips removeFiles and the dialog flag", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    const removeFiles = vi.fn();
    filesStore.removeFiles = removeFiles;

    moveToCopyToImpl(
      store,
      99,
      { operation: "copy", operationId: "op-2" },
      true,
      [5],
      [7],
    );

    expect(removeFiles).not.toHaveBeenCalled();
    expect(fakes.dialogsStore.setIsFolderActions).not.toHaveBeenCalled();
  });
});

describe("loopFilesOperationsImpl", () => {
  it("completes the bar and returns undefined when data is null (no polling)", async () => {
    const { store, fakes } = createTestUploadDataStore();

    const result = await loopFilesOperationsImpl(store, null, {
      operation: "copy",
      operationId: "op-3",
    });

    expect(result).toBeUndefined();
    expect(getOperationProgress).not.toHaveBeenCalled();
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "copy",
      alert: false,
      completed: true,
      operationId: "op-3",
    });
  });

  it("returns a finished snapshot when the poller reports Canceled", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(getOperationProgress).mockResolvedValue({
      id: "srv-op-1",
      status: FileOperationStatus.Canceled,
      finished: false,
      progress: 40,
    } as never);

    const result = await loopFilesOperationsImpl(
      store,
      makeOperation({ finished: false }),
      { operation: "move", operationId: "op-4" },
    );

    expect(result).toMatchObject({ finished: true, error: "" });
  });
});
