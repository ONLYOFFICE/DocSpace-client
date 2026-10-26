// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  downloadFiles: vi.fn(),
}));

import { createTestFilesActionsStore, t } from "./testHarness";
import { downloadFiles as downloadFilesApi } from "@docspace/shared/api/files";
// After the harness, which mocks the toast module.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

// Recursive {id,label} projection excluding onClick/handlers.
type Node = { id?: unknown; key?: unknown; label?: unknown; items?: Node[] };
const shape = (model: unknown[]): unknown[] =>
  (model as Node[]).map((m) => ({
    id: m?.id,
    label: m?.label,
    ...(Array.isArray(m?.items) ? { items: shape(m.items) } : {}),
  }));

// Maximally-enabling selection state so every option that a folder-type
// builder offers is actually produced (availability is gated by
// isAvailableOption, covered separately).
const enabling = {
  filesStore: {
    hasSelection: true,
    allFilesIsEditing: false,
    canConvertSelected: true,
    hasRoomsToChangeQuota: true,
    hasRoomsToDisableQuota: true,
    hasRoomsToResetQuota: true,
    hasAIAgentsToChangeQuota: true,
    hasAIAgentsToDisableQuota: true,
    hasAIAgentsToResetQuota: true,
    roomsFilter: { groupId: "g1", clone: () => ({}) },
    selection: [
      {
        id: 1,
        security: {
          Copy: true,
          Download: true,
          Move: true,
          Delete: true,
          CreateRoomFrom: true,
          Vectorization: true,
        },
      },
    ],
  },
  filesSettingsStore: { organizeRoomsGrouping: true },
  dialogsStore: { roomGroups: [{ id: "g1" }] },
};

const menuFor = (treeFlags: Record<string, boolean>) =>
  shape(
    createTestFilesActionsStore({
      ...enabling,
      treeFoldersStore: treeFlags,
    }).getHeaderMenu(t),
  );

describe("FilesActionsStore.getHeaderMenu — dispatch by folder type", () => {
  it("recycle bin", () => {
    expect(menuFor({ isRecycleBinFolder: true })).toMatchSnapshot();
  });
  it("favorites", () => {
    expect(menuFor({ isFavoritesFolder: true })).toMatchSnapshot();
  });
  it("privacy", () => {
    expect(menuFor({ isPrivacyFolder: true })).toMatchSnapshot();
  });
  it("shared with me", () => {
    expect(menuFor({ isSharedWithMeFolder: true })).toMatchSnapshot();
  });
  it("recent", () => {
    expect(menuFor({ isRecentFolder: true })).toMatchSnapshot();
  });
  it("archive rooms", () => {
    expect(menuFor({ isArchiveFolder: true })).toMatchSnapshot();
  });
  it("rooms", () => {
    expect(menuFor({ isRoomsFolder: true })).toMatchSnapshot();
  });
  it("templates", () => {
    expect(menuFor({ isTemplatesFolder: true })).toMatchSnapshot();
  });
  it("ai agents", () => {
    expect(menuFor({ isAIAgentsFolder: true })).toMatchSnapshot();
  });
  it("another (default) folder", () => {
    expect(menuFor({})).toMatchSnapshot();
  });
});

describe("FilesActionsStore.getHeaderMenu — Private section", () => {
  const ROOM_GROUP_ITEMS = [
    "menu-create-group",
    "menu-add-to-group",
    "menu-remove-from-group",
  ];
  const ids = (menu: unknown[]) => menu.map((item) => (item as Node).id);

  afterEach(() => window.history.pushState({}, "", "/"));

  it("Context menu of a private room in the section", () => {
    window.history.pushState({}, "", "/rooms/shared/filter");
    const inRooms = ids(menuFor({ isRoomsFolder: true }));

    window.history.pushState({}, "", "/private/filter");
    const inPrivate = ids(menuFor({ isRoomsFolder: true }));

    expect(inRooms).toEqual(expect.arrayContaining(ROOM_GROUP_ITEMS));
    expect(inPrivate).toEqual(
      inRooms.filter((id) => !ROOM_GROUP_ITEMS.includes(id as string)),
    );
  });
});

describe("FilesActionsStore.getHeaderMenu — private room", () => {
  const security = { Download: true, Move: true, Delete: true };

  it("Bulk header menu", () => {
    const store = createTestFilesActionsStore({
      ...enabling,
      filesStore: {
        ...enabling.filesStore,
        selection: [
          { id: 1, fileExst: ".docx", encrypted: true, security },
          { id: 2, fileExst: ".xlsx", encrypted: true, security },
          { id: 3, isFolder: true, security },
        ],
      },
      treeFoldersStore: { isPrivacyFolder: true },
    });
    const downloadFiles = vi.fn(async () => undefined);
    store.downloadFiles = downloadFiles;

    const menu = store.getHeaderMenu(t) as {
      id?: string;
      onClick?: () => unknown;
    }[];
    const menuIds = menu.map((item) => item.id);

    expect(menuIds.indexOf("menu-download-encrypted")).toBe(
      menuIds.indexOf("menu-download") + 1,
    );

    menu.find((item) => item.id === "menu-download-encrypted")!.onClick!();

    expect(downloadFiles).toHaveBeenCalledWith([1, 2], [3], {
      label: "Common:ArchivingData",
      errorMessage: expect.any(Function),
    });
  });

  it("Folder selected in the header menu", async () => {
    const folder = { id: 3, isFolder: true, security };
    const store = createTestFilesActionsStore({
      ...enabling,
      filesStore: { ...enabling.filesStore, selection: [folder] },
      treeFoldersStore: { isPrivacyFolder: true },
    });
    const downloadFiles = vi.fn(async () => undefined);
    const downloadEncryptedFolder = vi.fn(async () => undefined);
    store.downloadFiles = downloadFiles;
    store.downloadEncryptedFolder = downloadEncryptedFolder;

    const menu = store.getHeaderMenu(t) as {
      id?: string;
      onClick?: () => unknown;
    }[];
    await menu.find((item) => item.id === "menu-download")!.onClick!();

    expect(downloadEncryptedFolder).toHaveBeenCalledWith(folder);
    expect(downloadFiles).not.toHaveBeenCalled();
  });

  it("Download without decryption fails", async () => {
    const store = createTestFilesActionsStore({
      ...enabling,
      filesStore: {
        ...enabling.filesStore,
        selection: [
          { id: 1, fileExst: ".docx", encrypted: true, security },
          { id: 3, isFolder: true, security },
        ],
      },
      dialogsStore: {
        ...enabling.dialogsStore,
        downloadItems: [],
        setDownloadItems: vi.fn(),
      },
      treeFoldersStore: { isPrivacyFolder: true },
    });
    const error = new Error("Network Error");
    vi.mocked(downloadFilesApi).mockRejectedValue(error);

    const menu = store.getHeaderMenu(t) as {
      id?: string;
      onClick?: () => unknown;
    }[];
    await menu.find((item) => item.id === "menu-download-encrypted")!.onClick!();

    expect(toastr.error).toHaveBeenCalledWith(
      "Common:EncryptedOperationFailed",
      null,
      0,
      true,
    );
    expect(vi.mocked(toastr.error).mock.calls.flat()).not.toContain(error);
  });
});
