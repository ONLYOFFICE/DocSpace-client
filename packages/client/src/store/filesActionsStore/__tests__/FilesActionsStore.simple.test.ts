// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  deleteFilesFromRecent: vi.fn(async () => {}),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — simple methods (batch 3)", () => {
  it("nameWithoutExtension strips the extension", () => {
    expect(createTestFilesActionsStore().nameWithoutExtension("Doc.docx")).toBe(
      "Doc",
    );
  });

  it("resolveRoomIdForFile: originRoomId wins", () => {
    expect(
      createTestFilesActionsStore().resolveRoomIdForFile({
        originRoomId: 55,
      } as never),
    ).toBe(55);
  });

  it("resolveRoomIdForFile: falls back to navigation-path room", () => {
    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        navigationPath: [{ id: 7, isRoom: true }],
        isRoom: false,
      },
    });
    expect(store.resolveRoomIdForFile({} as never)).toBe(7);
  });

  it("resolveRoomIdForFile: current folder when it is a room, else null", () => {
    expect(
      createTestFilesActionsStore({
        selectedFolderStore: { id: 3, isRoom: true, navigationPath: [] },
      }).resolveRoomIdForFile({} as never),
    ).toBe(3);
    expect(
      createTestFilesActionsStore({
        selectedFolderStore: { isRoom: false, navigationPath: [] },
      }).resolveRoomIdForFile({} as never),
    ).toBeNull();
  });

  it("getItemsInfo routes folders/files to the right filesStore fetch", () => {
    const getFolderInfo = vi.fn(async () => ({}));
    const getFileInfo = vi.fn(async () => ({}));
    const store = createTestFilesActionsStore({
      filesStore: { getFolderInfo, getFileInfo },
    });
    store.getItemsInfo([
      { id: 1, isFolder: true } as never,
      { id: 2, fileExst: ".docx" } as never,
    ]);
    expect(getFolderInfo).toHaveBeenCalledWith(1);
    expect(getFileInfo).toHaveBeenCalledWith(2);
  });

  it("setGroupMenuBlocked / setProcessCreatingRoomFromData set state", () => {
    const store = createTestFilesActionsStore();
    store.setGroupMenuBlocked(true);
    expect(store.isGroupMenuBlocked).toBe(true);
    store.setProcessCreatingRoomFromData(true);
    expect(store.processCreatingRoomFromData).toBe(true);
  });

  it("onClickCreateRoom sets the flag and dispatches ROOM_CREATE", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestFilesActionsStore();
    store.onClickCreateRoom();
    expect(store.processCreatingRoomFromData).toBe(true);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });

  it("askAIAction records the file for the AI chat bridge", () => {
    const setAskAIFile = vi.fn();
    const store = createTestFilesActionsStore({
      dialogsStore: { setAskAIFile },
    });
    store.askAIAction({ id: 1 } as never);
    expect(setAskAIFile).toHaveBeenCalledWith({ id: 1 });
  });

  it("setThirdpartyInfo opens the connect dialog with the matched provider", () => {
    const setConnectDialogVisible = vi.fn();
    const setConnectItem = vi.fn();
    const store = createTestFilesActionsStore({
      dialogsStore: { setConnectDialogVisible, setConnectItem },
      filesSettingsStore: {
        thirdPartyStore: {
          providers: [{ provider_key: "gd", customer_title: "GDrive" }],
          capabilities: [["gd", "http://x"]],
        },
      },
    });
    store.setThirdpartyInfo("gd");
    expect(setConnectItem).toHaveBeenCalledTimes(1);
    expect(setConnectDialogVisible).toHaveBeenCalledWith(true);
  });

  it("onClickRemoveFromRecent removes ids and clears selection", () => {
    const setSelected = vi.fn();
    const refreshFiles = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { setSelected, refreshFiles },
    });
    store.onClickRemoveFromRecent([{ id: 1 }, { id: 2 }] as never, t);
    expect(setSelected).toHaveBeenCalledWith("none");
  });

  it("removeFilesFromRecent refreshes the list after the API call", async () => {
    const refreshFiles = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { refreshFiles },
    });
    await store.removeFilesFromRecent([1, 2], t);
    expect(refreshFiles).toHaveBeenCalledTimes(1);
  });

  it("onCreateRoomFromTemplate dispatches ROOM_CREATE", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestFilesActionsStore();
    store.onCreateRoomFromTemplate({ id: 1 } as never);
    expect(dispatchEvent).toHaveBeenCalledTimes(1);
    dispatchEvent.mockRestore();
  });
});
