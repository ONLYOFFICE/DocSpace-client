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
  makeFileInfo,
  makeUploadFile,
} from "./testHarness";
// eslint-disable-next-line import/order
import { createTestFilesStore } from "../../filesStore/__tests__/testHarness";
// eslint-disable-next-line import/order
import * as filesApi from "@docspace/shared/api/files";
// eslint-disable-next-line import/order
import { getOperationProgress } from "@docspace/shared/utils/getOperationProgress";
// eslint-disable-next-line import/order
import {
  ConflictResolveType,
  FileOperationStatus,
  FileType,
  FolderType,
} from "@docspace/shared/enums";
import type { TFolder, TOperation } from "@docspace/shared/api/files/types";

type AnyMock = ReturnType<typeof vi.fn>;
const asMock = (fn: unknown) => fn as AnyMock;

const getNavigateMock = () =>
  (window as unknown as { DocSpace: { navigate: AnyMock } }).DocSpace.navigate;

const makeOperation = (overrides: Partial<TOperation> = {}): TOperation => ({
  Operation: 0,
  error: "",
  finished: false,
  id: "srv-op-1",
  processed: "0",
  progress: 0,
  ...overrides,
});

const listFile = (id: number) =>
  ({
    id,
    parentId: 10,
    title: `f${id}.docx`,
    fileExst: ".docx",
    fileType: FileType.Document,
    viewAccessibility: {},
  }) as never;

const listFolder = (id: number) =>
  ({ id, parentId: 10, title: `folder${id}`, isFolder: true }) as never;

const CTX = ["ctx"] as unknown as ReturnType<
  ReturnType<typeof createTestFilesStore>["getFilesContextOptions"]
>;

beforeEach(() => {
  vi.clearAllMocks();
  installWindowGlobals();
});

describe("UploadDataStore.itemOperationToFolder — copy/move routing", () => {
  it("isCopy=true routes to copyToFolder with exact arguments and reports progress start/end", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    const finishedOp = makeOperation({ finished: true, progress: 100 });
    vi.mocked(filesApi.copyToFolder).mockResolvedValue([finishedOp] as never);

    filesStore.setActiveFiles([5], 99);
    filesStore.setActiveFolders([7], 99);

    const destFolderInfo = { id: 99, title: "Dest" } as unknown as TFolder;
    const result = await store.itemOperationToFolder({
      destFolderId: 99,
      destFolderInfo,
      folderIds: [7],
      fileIds: [5],
      deleteAfter: false,
      isCopy: true,
      content: true,
      toFillOut: false,
      title: "Copying",
      itemsCount: 2,
      isFolder: false,
    });

    expect(filesApi.copyToFolder).toHaveBeenCalledTimes(1);
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

    const progressCalls = asMock(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).mock.calls;

    expect(progressCalls[0][0]).toEqual({
      operation: "copy",
      percent: 0,
      operationId: expect.stringMatching(/^operation_\d+$/),
      title: "Copying",
      itemsCount: 2,
      operationIds: [7],
      destFolderInfo,
      isFolder: false,
    });
    const operationId = progressCalls[0][0].operationId as string;

    expect(progressCalls[1][0]).toEqual({
      operation: "copy",
      alert: false,
      operationId,
      serverOperationId: "srv-op-1",
    });

    expect(progressCalls[progressCalls.length - 1][0]).toEqual({
      operation: "copy",
      percent: 100,
      completed: true,
      operationId,
    });

    expect(result).toBe(finishedOp);

    expect(filesStore.activeFiles).toEqual([]);
    expect(filesStore.activeFolders).toEqual([]);
    expect(fakes.dialogsStore.setIsFolderActions).not.toHaveBeenCalled();
  });

  it("isCopy=false routes to moveToFolder and the move pipeline removes items from the real FilesStore", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    vi.mocked(filesApi.moveToFolder).mockResolvedValue([
      makeOperation({ finished: true, progress: 100 }),
    ] as never);

    filesStore.getFilesContextOptions = () => CTX;
    filesStore.files = [listFile(5), listFile(6)] as never;
    filesStore.folders = [listFolder(7)] as never;
    filesStore.filter.total = 3;
    filesStore.setActiveFiles([5], 99);
    filesStore.setActiveFolders([7], 99);

    await store.itemOperationToFolder({
      destFolderId: 99,
      folderIds: [7],
      fileIds: [5],
      deleteAfter: true,
      isCopy: false,
      toFillOut: true,
      conflictResolveType: ConflictResolveType.Overwrite,
      title: "Moving",
      itemsCount: 2,
      isFolder: false,
    });

    expect(filesApi.moveToFolder).toHaveBeenCalledTimes(1);
    expect(filesApi.moveToFolder).toHaveBeenCalledWith(
      99,
      [7],
      [5],
      ConflictResolveType.Overwrite,
      true,
      true,
    );
    expect(filesApi.copyToFolder).not.toHaveBeenCalled();

    const progressCalls = asMock(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).mock.calls;
    expect(progressCalls[0][0]).toEqual({
      operation: "move",
      percent: 0,
      operationId: expect.stringMatching(/^operation_\d+$/),
      title: "Moving",
      itemsCount: 2,
      operationIds: [7],
      destFolderInfo: undefined,
      isFolder: false,
    });

    expect(filesStore.files.map((f) => f.id)).toEqual([6]);
    expect(filesStore.folders).toHaveLength(0);
    expect(filesStore.filter.total).toBe(1);
    expect(filesStore.activeFiles).toEqual([]);
    expect(filesStore.activeFolders).toEqual([]);
    expect(fakes.dialogsStore.setIsFolderActions).toHaveBeenCalledWith(false);
    expect(getNavigateMock()).not.toHaveBeenCalled();
  });
});

describe("UploadDataStore.copyToAction / moveToAction — error paths", () => {
  it("copyToAction: API rejection reports an alert, clears active operations and re-rejects", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    const boom = new Error("network down");
    vi.mocked(filesApi.copyToFolder).mockRejectedValue(boom);

    filesStore.setActiveFiles([5]);
    filesStore.setActiveFolders([7]);
    const clearSpy = vi.fn(store.clearActiveOperations);
    store.clearActiveOperations = clearSpy;

    await expect(
      store.copyToAction(
        99,
        [7],
        [5],
        ConflictResolveType.Duplicate,
        false,
        "op-err",
      ),
    ).rejects.toBe(boom);

    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      completed: true,
      alert: true,
      operationId: "op-err",
      operation: "copy",
      error: boom,
    });
    expect(clearSpy).toHaveBeenCalledWith([5], [7]);
    expect(filesStore.activeFiles).toEqual([]);
    expect(filesStore.activeFolders).toEqual([]);
  });

  it("moveToAction: an operation-level error in the response rejects with the operation object", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const failedOp = makeOperation({ error: "Operation failed on server" });
    vi.mocked(filesApi.moveToFolder).mockResolvedValue([failedOp] as never);

    await expect(
      store.moveToAction(
        99,
        [],
        [5],
        ConflictResolveType.Duplicate,
        false,
        "op-err-2",
      ),
    ).rejects.toBe(failedOp);

    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      completed: true,
      alert: true,
      operationId: "op-err-2",
      operation: "move",
      error: failedOp,
    });
    expect(getOperationProgress).not.toHaveBeenCalled();
  });

  it("copyToAction: an empty operations response rejects with undefined", async () => {
    const { store, fakes } = createTestUploadDataStore();
    vi.mocked(filesApi.copyToFolder).mockResolvedValue([] as never);

    await expect(
      store.copyToAction(
        99,
        [],
        [5],
        ConflictResolveType.Duplicate,
        false,
        "op-err-3",
      ),
    ).rejects.toBeUndefined();

    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      completed: true,
      alert: true,
      operationId: "op-err-3",
      operation: "copy",
      error: undefined,
    });
  });
});

describe("UploadDataStore.loopFilesOperations — polling", () => {
  it("polls getOperationProgress until finished and mirrors each snapshot into the progress bar", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const data = makeOperation({ id: "srv-1" });
    const mid = makeOperation({ id: "srv-1", progress: 50 });
    const done = makeOperation({ id: "srv-1", progress: 100, finished: true });
    vi.mocked(getOperationProgress)
      .mockResolvedValueOnce(mid)
      .mockResolvedValueOnce(done);

    const result = await store.loopFilesOperations(data, {
      operation: "move",
      operationId: "cli-1",
    });

    expect(getOperationProgress).toHaveBeenCalledTimes(2);
    expect(getOperationProgress).toHaveBeenNthCalledWith(
      1,
      "srv-1",
      "Common:UnexpectedError",
      true,
    );
    expect(result).toBe(done);

    const calls = asMock(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).mock.calls.map((c) => c[0]);
    expect(calls).toHaveLength(3);
    expect(calls[0]).toEqual({
      operation: "move",
      alert: false,
      operationId: "cli-1",
      serverOperationId: "srv-1",
    });
    expect(calls[1]).toEqual({
      operation: "move",
      alert: false,
      currentFile: mid,
      operationId: "cli-1",
      serverOperationId: "srv-1",
    });
    expect(calls[2]).toEqual({
      operation: "move",
      alert: false,
      currentFile: done,
      operationId: "cli-1",
      serverOperationId: "srv-1",
    });
    expect(calls.map((c) => c.currentFile?.progress)).toEqual([
      undefined,
      50,
      100,
    ]);
  });

  it("null data exits early with a completed no-alert progress call and returns undefined", async () => {
    const { store, fakes } = createTestUploadDataStore();

    const result = await store.loopFilesOperations(null, {
      operation: "copy",
      operationId: "cli-2",
    });

    expect(result).toBeUndefined();
    expect(getOperationProgress).not.toHaveBeenCalled();
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledTimes(1);
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "copy",
      alert: false,
      completed: true,
      operationId: "cli-2",
    });
  });

  it("exits before polling when secondaryOperationsArray marks the operation item completed (user cancel)", async () => {
    const { store, fakes } = createTestUploadDataStore({
      secondaryProgressDataStore: {
        secondaryOperationsArray: [
          {
            operation: "move",
            items: [{ operationId: "cli-3", completed: true }],
          },
        ],
      },
    });
    const data = makeOperation({ id: "srv-3" });

    const result = await store.loopFilesOperations(data, {
      operation: "move",
      operationId: "cli-3",
    });

    expect(result).toBe(data);
    expect(getOperationProgress).not.toHaveBeenCalled();
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledTimes(1);
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "move",
      alert: false,
      operationId: "cli-3",
      serverOperationId: "srv-3",
    });
  });

  it("a Canceled status from the poller completes the bar and returns a finished copy of the snapshot", async () => {
    const { store, fakes } = createTestUploadDataStore();
    const canceled = makeOperation({
      id: "srv-4",
      progress: 10,
      status: FileOperationStatus.Canceled,
    });
    vi.mocked(getOperationProgress).mockResolvedValueOnce(canceled);

    const result = await store.loopFilesOperations(
      makeOperation({ id: "srv-4" }),
      { operation: "copy", operationId: "cli-4" },
    );

    expect(getOperationProgress).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ...canceled, finished: true, error: "" });
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenLastCalledWith({
      operation: "copy",
      operationId: "cli-4",
      completed: true,
      alert: false,
    });
  });

  it("swallows a poller rejection when the operation is not tracked in secondaryOperationsArray", async () => {
    const { store } = createTestUploadDataStore();
    vi.mocked(getOperationProgress).mockRejectedValueOnce(
      new Error("progress fetch failed"),
    );
    const data = makeOperation({ id: "srv-5" });

    const result = await store.loopFilesOperations(data, {
      operation: "move",
      operationId: "cli-5",
    });

    expect(result).toBe(data);
    expect(getOperationProgress).toHaveBeenCalledTimes(1);
  });

  it("re-throws a poller rejection when the operation IS tracked and not completed", async () => {
    const { store } = createTestUploadDataStore({
      secondaryProgressDataStore: {
        secondaryOperationsArray: [
          {
            operation: "move",
            items: [{ operationId: "cli-6", completed: false }],
          },
        ],
      },
    });
    const boom = new Error("progress fetch failed");
    vi.mocked(getOperationProgress).mockRejectedValueOnce(boom);

    await expect(
      store.loopFilesOperations(makeOperation({ id: "srv-6" }), {
        operation: "move",
        operationId: "cli-6",
      }),
    ).rejects.toBe(boom);
  });
});

describe("UploadDataStore.moveToCopyTo — operation finalization", () => {
  it("move: clears active operations, removes moved items via the real FilesStore and closes folder actions", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    filesStore.getFilesContextOptions = () => CTX;
    filesStore.files = [listFile(5), listFile(6)] as never;
    filesStore.folders = [listFolder(7)] as never;
    filesStore.filter.total = 3;
    filesStore.setActiveFiles([5], 99);
    filesStore.setActiveFolders([7], 99);

    const removeFilesSpy = vi.fn(filesStore.removeFiles);
    filesStore.removeFiles = removeFilesSpy;

    store.moveToCopyTo(
      99,
      { operation: "move", operationId: "op-m" },
      false,
      [5],
      [7],
    );

    expect(removeFilesSpy).toHaveBeenCalledTimes(1);
    expect(removeFilesSpy).toHaveBeenCalledWith([5], [7], null, 99);
    expect(filesStore.files.map((f) => f.id)).toEqual([6]);
    expect(filesStore.folders).toHaveLength(0);
    expect(filesStore.activeFiles).toEqual([]);
    expect(filesStore.activeFolders).toEqual([]);
    expect(fakes.dialogsStore.setIsFolderActions).toHaveBeenCalledWith(false);
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "move",
      percent: 100,
      completed: true,
      operationId: "op-m",
    });
    expect(getNavigateMock()).not.toHaveBeenCalled();
  });

  it("move of the currently selected folder triggers navigateToNewFolderLocation with the selected id", () => {
    const { store } = createTestUploadDataStore();
    const navSpy = vi.fn(() => Promise.resolve());
    store.navigateToNewFolderLocation = navSpy;

    store.moveToCopyTo(
      99,
      { operation: "move", operationId: "op-n" },
      false,
      [],
      [1],
    );

    expect(navSpy).toHaveBeenCalledTimes(1);
    expect(navSpy).toHaveBeenCalledWith(1);
  });

  it("copy into the currently open folder clears active ops and closes folder actions without removing files", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    filesStore.files = [listFile(5)] as never;
    filesStore.setActiveFiles([5], 1);
    const removeFilesSpy = vi.fn(filesStore.removeFiles);
    filesStore.removeFiles = removeFilesSpy;

    store.moveToCopyTo(
      1,
      { operation: "copy", operationId: "op-c" },
      true,
      [5],
      [],
    );

    expect(removeFilesSpy).not.toHaveBeenCalled();
    expect(filesStore.files.map((f) => f.id)).toEqual([5]);
    expect(filesStore.activeFiles).toEqual([]);
    expect(fakes.dialogsStore.setIsFolderActions).toHaveBeenCalledWith(false);
    expect(getNavigateMock()).not.toHaveBeenCalled();
  });

  it("copy to another folder only clears active ops and completes the bar (no dialog interaction)", () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    filesStore.setActiveFiles([5], 99);

    store.moveToCopyTo(
      99,
      { operation: "copy", operationId: "op-c2" },
      true,
      [5],
      [],
    );

    expect(filesStore.activeFiles).toEqual([]);
    expect(fakes.dialogsStore.setIsFolderActions).not.toHaveBeenCalled();
    expect(
      fakes.secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalledWith({
      operation: "copy",
      percent: 100,
      completed: true,
      operationId: "op-c2",
    });
  });
});

describe("UploadDataStore.navigateToNewFolderLocation", () => {
  it("mutates the real filter's folder, resolves the category URL and navigates with replace", async () => {
    const { store, filesStore } = createTestUploadDataStore();
    vi.mocked(filesApi.getFolderInfo).mockResolvedValue({
      rootFolderType: FolderType.Rooms,
      parentId: 5,
    } as never);

    await store.navigateToNewFolderLocation(42);

    expect(filesStore.filter.folder).toBe(42);
    expect(filesApi.getFolderInfo).toHaveBeenCalledWith(42);

    expect(getNavigateMock()).toHaveBeenCalledTimes(1);
    expect(getNavigateMock()).toHaveBeenCalledWith(
      `/rooms/shared/42/filter?${filesStore.filter.toUrlParams()}`,
      { replace: true },
    );
  });

  it("logs and swallows a getFolderInfo rejection; the filter mutation has already happened", async () => {
    const { store, filesStore } = createTestUploadDataStore();
    const boom = new Error("folder gone");
    vi.mocked(filesApi.getFolderInfo).mockRejectedValue(boom);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await expect(store.navigateToNewFolderLocation(42)).resolves.toBeUndefined();

    expect(filesStore.filter.folder).toBe(42);
    expect(getNavigateMock()).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledWith(
      "[UploadDataStore] navigate failed:",
      boom,
    );
    consoleError.mockRestore();
  });
});

describe("UploadDataStore.clearActiveOperations", () => {
  it("filters the given ids out of the real FilesStore active arrays", () => {
    const { store, filesStore } = createTestUploadDataStore();
    filesStore.activeFiles = [{ id: 1 }, { id: 2 }];
    filesStore.activeFolders = [{ id: 3 }];

    store.clearActiveOperations([1], [3]);

    expect(filesStore.activeFiles.map((i) => i.id)).toEqual([2]);
    expect(filesStore.activeFiles).toHaveLength(1);
    expect(filesStore.activeFolders).toEqual([]);
  });

  it("null arguments (as passed by FilesActionsStore) keep every active item", () => {
    const { store, filesStore } = createTestUploadDataStore();
    filesStore.activeFiles = [{ id: 1 }, { id: 2 }];
    filesStore.activeFolders = [{ id: 3 }];

    store.clearActiveOperations(null, null);

    expect(filesStore.activeFiles.map((i) => i.id)).toEqual([1, 2]);
    expect(filesStore.activeFolders.map((i) => i.id)).toEqual([3]);
  });
});

describe("UploadDataStore.refreshFiles — mutating the real FilesStore (§3.4.1 foreign state)", () => {
  it("unshifts a newly uploaded file, bumps filter.total by exactly 1 and setFilesCount by 1", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore({
      selectedFolderStore: { filesCount: 5 },
    });
    const f1 = makeFileInfo({ id: 11 });
    const f2 = makeFileInfo({ id: 12 });
    filesStore.files = [f1, f2] as never;
    filesStore.filter.total = 2;

    const uploadedInfo = makeFileInfo({ id: 999, title: "fresh.docx" });
    const currentFile = makeUploadFile({
      fileInfo: uploadedInfo,
      path: [1],
    });

    await store.refreshFiles(currentFile);

    expect(filesStore.files.map((f) => f.id)).toEqual([999, 11, 12]);
    expect(filesStore.files[0]).toMatchObject({
      id: 999,
      title: "fresh.docx",
    });
    expect(filesStore.files[1]).toMatchObject({ id: 11, title: f1.title });
    expect(filesStore.files[2]).toMatchObject({ id: 12, title: f2.title });
    expect(filesStore.filter.total).toBe(3);
    expect(fakes.selectedFolderStore.setFilesCount).toHaveBeenCalledTimes(1);
    expect(fakes.selectedFolderStore.setFilesCount).toHaveBeenCalledWith(6);
  });

  it("replaces the existing entry in place when the file is already listed and storeOriginalFiles is false", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    const f1 = makeFileInfo({ id: 11 });
    const f2 = makeFileInfo({ id: 12 });
    filesStore.files = [f1, f2] as never;
    filesStore.filter.total = 2;

    const converted = makeFileInfo({ id: 12, title: "converted.docx" });
    const currentFile = makeUploadFile({ fileInfo: converted, path: [1] });

    await store.refreshFiles(currentFile);

    expect(filesStore.files.map((f) => f.id)).toEqual([11, 12]);
    expect(filesStore.files[1]).toMatchObject({
      id: 12,
      title: "converted.docx",
    });
    expect(filesStore.files[0]).toMatchObject({ id: 11, title: f1.title });
    expect(filesStore.filter.total).toBe(2);
    expect(fakes.selectedFolderStore.setFilesCount).not.toHaveBeenCalled();
  });

  it("is a no-op when the current view is filtered (filter.search)", async () => {
    const { store, fakes, filesStore } = createTestUploadDataStore();
    filesStore.files = [makeFileInfo({ id: 11 })] as never;
    filesStore.filter.total = 1;
    filesStore.filter.search = "report";

    await store.refreshFiles(
      makeUploadFile({ fileInfo: makeFileInfo({ id: 999 }), path: [1] }),
    );

    expect(filesStore.files.map((f) => f.id)).toEqual([11]);
    expect(filesStore.filter.total).toBe(1);
    expect(fakes.selectedFolderStore.setFilesCount).not.toHaveBeenCalled();
  });

  it("is a no-op when filesStore.showNewFilesInList is false (indexed folder not fully listed)", async () => {
    const filesStore = createTestFilesStore({
      selectedFolderStore: { isIndexedFolder: true },
    });
    filesStore.getFilesContextOptions = () => CTX;
    filesStore.files = [listFile(5), listFile(6)] as never;
    filesStore.filter.total = 10;
    expect(filesStore.showNewFilesInList).toBe(false);

    const { store, fakes } = createTestUploadDataStore({ filesStore });

    await store.refreshFiles(
      makeUploadFile({ fileInfo: makeFileInfo({ id: 999 }), path: [1] }),
    );

    expect(filesStore.files.map((f) => f.id)).toEqual([5, 6]);
    expect(filesStore.filter.total).toBe(10);
    expect(fakes.selectedFolderStore.setFilesCount).not.toHaveBeenCalled();
  });
});
