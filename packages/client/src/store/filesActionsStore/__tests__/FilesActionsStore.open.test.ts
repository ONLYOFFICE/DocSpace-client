// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";
import api from "@docspace/shared/api";
import { createTestFilesActionsStore, t } from "./testHarness";

beforeEach(() => {
  (window as unknown as { DocSpace: unknown }).DocSpace = {
    location: { pathname: "/rooms", search: "", state: {} },
    navigate: vi.fn(),
  };
});

describe("FilesActionsStore — open/leave/owner (batch 16)", () => {
  it("openItemAction is a no-op while a section load is in progress", async () => {
    const openDocEditor = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { openDocEditor, setSelection: vi.fn(), categoryType: 0 },
      clientLoadingStore: { isLoading: true },
    });
    await store.openItemAction({
      id: 1,
      fileExst: ".docx",
      isFolder: false,
      viewUrl: "http://x/1",
      security: {},
    } as never);
    expect(openDocEditor).not.toHaveBeenCalled();
  });

  it("deleteRooms routes into the room-delete confirmation flow", () => {
    const setDeleteDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { selection: [{ id: 1 }, { id: 2 }] },
      filesSettingsStore: { confirmDelete: true },
      dialogsStore: {
        setDeleteDialogVisible,
        setIsRoomDelete: vi.fn(),
        setIsFolderActions: vi.fn(),
        setRemoveItem: vi.fn(),
      },
    });
    store.deleteRooms(t);
    expect(setDeleteDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onLeaveRoom updates the room member role via API", () => {
    const spy = vi
      .spyOn(api.rooms, "updateRoomMemberRole")
      .mockResolvedValue({} as never);
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [{ id: 5 }],
        bufferSelection: null,
        setSelected: vi.fn(),
        removeFiles: vi.fn(),
      },
      userStore: { user: { id: "u1", isOwner: false, isAdmin: false } },
    });
    store.onLeaveRoom(t);
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("changeRoomOwner sets the new file owner via API", () => {
    const spy = vi
      .spyOn(api.files, "setFileOwner")
      .mockResolvedValue([{}] as never);
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [{ id: 9 }],
        bufferSelection: null,
        setSelected: vi.fn(),
        setFolder: vi.fn(),
      },
      selectedFolderStore: {
        isRootFolder: false,
        id: 9,
        setCreatedBy: vi.fn(),
        setInRoom: vi.fn(),
        setSecurity: vi.fn(),
        setAccess: vi.fn(),
      },
    });
    store.changeRoomOwner(t, "user-2");
    expect(spy).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });
});

// Bug 82885: a plugin registered for an extension takes over the plain click
// on a file, so this path hands the file to the plugin without any menu. For an
// encrypted file the plugin can only ship ciphertext to a third party, and the
// file must open normally instead.
describe("FilesActionsStore — plugin file items vs encrypted files", () => {
  const docx = (encrypted: boolean) =>
    ({
      id: 1,
      fileExst: ".docx",
      isFolder: false,
      viewUrl: "http://x/1",
      webUrl: "",
      security: { Download: true },
      viewAccessibility: { WebEdit: true },
      ...(encrypted ? { encrypted: true } : {}),
    }) as never;

  const setup = (onClick: () => void, openDocEditor: () => void) =>
    createTestFilesActionsStore({
      settingsStore: {
        enablePlugins: true,
        currentDeviceType: "desktop",
        isFrame: false,
      },
      pluginStore: {
        fileItemsList: [{ key: ".docx", value: { onClick } }],
      },
      filesStore: { openDocEditor, setSelection: vi.fn(), categoryType: 0 },
    });

  it("hands a regular file to the plugin registered for its extension", async () => {
    const onClick = vi.fn();
    const openDocEditor = vi.fn();

    await setup(onClick, openDocEditor).openItemAction(docx(false), t);

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(openDocEditor).not.toHaveBeenCalled();
  });

  it("skips the plugin for an encrypted file and opens the editor instead", async () => {
    const onClick = vi.fn();
    const openDocEditor = vi.fn();

    await setup(onClick, openDocEditor).openItemAction(docx(true), t);

    expect(onClick).not.toHaveBeenCalled();
    expect(openDocEditor).toHaveBeenCalledTimes(1);
  });
});
