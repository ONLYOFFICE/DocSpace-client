// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("../helpers", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  setPinAction: vi.fn(async () => undefined),
  changeCustomFilter: vi.fn(async () => undefined),
}));
vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  lockFile: vi.fn(async () => ({ id: 1, locked: true })),
}));
vi.mock("@docspace/shared/api/settings", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  muteRoomNotification: vi.fn(async () => ({})),
}));

import { setPinAction, changeCustomFilter } from "../helpers";
import api from "@docspace/shared/api";
import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — actions (batch 4)", () => {
  it("setPinAction / changeCustomFilter delegate to helpers", async () => {
    const store = createTestFilesActionsStore();
    await store.setPinAction("pin", 1, t);
    expect(setPinAction).toHaveBeenCalledTimes(1);
    await store.changeCustomFilter({ id: 1 } as never, t);
    expect(changeCustomFilter).toHaveBeenCalledTimes(1);
  });

  it("setFavoriteAction('mark') marks then closes selection", async () => {
    const markAsFavorite = vi
      .spyOn(api.files, "markAsFavorite")
      .mockResolvedValue(undefined as never);
    const setSelected = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: {
        setSelected,
        getFileInfo: vi.fn(async () => ({})),
        getFolderInfo: vi.fn(async () => ({})),
      },
    });
    await store.setFavoriteAction("mark", [{ id: 1, fileExst: ".docx" }] as never);
    expect(markAsFavorite).toHaveBeenCalledTimes(1);
    expect(setSelected).toHaveBeenCalledWith("close");
    markAsFavorite.mockRestore();
  });

  it("setMuteAction updates the matching room's mute flag", () => {
    const updateRoomMute = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { folders: [{ id: 1 }], updateRoomMute },
      treeFoldersStore: { treeFolders: [{ id: 10, newItems: 5 }] },
    });
    store.setMuteAction("mute", { id: 1, rootFolderId: 10, new: 2 } as never, t);
    expect(updateRoomMute).toHaveBeenCalledWith(0, true);
  });

  it("lockFileAction locks via API and stores the result", async () => {
    const setFile = vi.fn();
    const store = createTestFilesActionsStore({ filesStore: { setFile } });
    await store.lockFileAction(1, true);
    expect(setFile).toHaveBeenCalledWith({ id: 1, locked: true });
  });

  it("selectRowAction selects on checked, deselects otherwise", () => {
    const selectFile = vi.fn();
    const deselectFile = vi.fn();
    const base = {
      filesStore: {
        selectFile,
        deselectFile,
        setBufferSelection: vi.fn(),
        setHotkeyCaret: vi.fn(),
        setHotkeyCaretStart: vi.fn(),
      },
    };
    createTestFilesActionsStore(base).selectRowAction(true, { id: 1 } as never);
    expect(selectFile).toHaveBeenCalledTimes(1);
    createTestFilesActionsStore(base).selectRowAction(false, { id: 1 } as never);
    expect(deselectFile).toHaveBeenCalledTimes(1);
  });

  it("retryVectorization is a no-op when nothing is vectorizable", async () => {
    const updateFileVectorizationStatus = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { updateFileVectorizationStatus },
    });
    await store.retryVectorization([{ id: 1, security: {} }] as never);
    expect(updateFileVectorizationStatus).not.toHaveBeenCalled();
  });

  it("onMarkAsRead drives the read progress bar", () => {
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
          isOperationStopped: vi.fn(() => false),
        },
      },
    });
    store.onMarkAsRead({ id: 1 } as never);
    expect(setSecondaryProgressBarData).toHaveBeenCalled();
  });
});
