// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createTestFilesActionsStore, t } from "./testHarness";

let navigate: ReturnType<typeof vi.fn>;
beforeEach(() => {
  navigate = vi.fn();
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {} },
    navigate,
  };
});

describe("FilesActionsStore — tree/order/open (batch 17)", () => {
  it("createFolderTree returns early for an empty tree list", async () => {
    const store = createTestFilesActionsStore();
    await expect(store.createFolderTree([] as never, 1)).resolves.toBeUndefined();
  });

  it("setFilesOrder snapshots the current list before reordering", () => {
    const setPreviousFilesList = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        filesList: [
          { id: 1, isFolder: false, order: "1" },
          { id: 2, isFolder: false, order: "2" },
        ],
        setFiles: vi.fn(),
        setFolders: vi.fn(),
      },
      indexingStore: {
        setPreviousFilesList,
        updateSelection: [],
        setUpdateSelection: vi.fn(),
      },
    });
    store.setFilesOrder(
      { id: 1, order: "1", isFolder: false } as never,
      { id: 2, order: "2", isFolder: false } as never,
    );
    expect(setPreviousFilesList).toHaveBeenCalledTimes(1);
  });

  it("backToParentFolder in a public room redirects to the public room", async () => {
    const store = createTestFilesActionsStore({
      publicRoomStore: { isPublicRoom: true, publicRoomKey: "k" },
      selectedFolderStore: {
        navigationPath: [{ title: "R" }],
        parentId: 2,
        rootFolderType: 0,
      },
    });
    await store.backToParentFolder();
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it("openFileAction on an expired external link does not open the file", async () => {
    const openDocEditor = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { openDocEditor, setSelection: vi.fn() },
      clientLoadingStore: { isLoading: false },
    });
    await store.openFileAction({
      id: 1,
      external: true,
      isLinkExpired: true,
      security: {},
    } as never, t);
    expect(openDocEditor).not.toHaveBeenCalled();
  });
});
