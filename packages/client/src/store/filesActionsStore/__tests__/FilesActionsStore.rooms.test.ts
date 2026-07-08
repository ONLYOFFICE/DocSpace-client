// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("../helpers", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  setPinAction: vi.fn(async () => undefined),
}));

import { setPinAction } from "../helpers";
import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — room operations (batch 5)", () => {
  it("pinRooms pins only the not-yet-pinned rooms", () => {
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [
          { id: 1, pinned: false },
          { id: 2, pinned: true },
          { id: 3, pinned: false },
        ],
      },
    });
    store.pinRooms(t);
    expect(setPinAction).toHaveBeenLastCalledWith("pin", [1, 3], t, false);
  });

  it("unpinRooms unpins only the pinned rooms", () => {
    const store = createTestFilesActionsStore({
      filesStore: {
        selection: [
          { id: 1, pinned: false },
          { id: 2, pinned: true },
        ],
      },
    });
    store.unpinRooms(t);
    expect(setPinAction).toHaveBeenLastCalledWith("unpin", [2], t, false);
  });

  it("archiveRooms: unarchive + quota warning shows the quota dialog", () => {
    const setQuotaWarningDialogVisible = vi.fn();
    const setArchiveDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      currentQuotaStore: { isWarningRoomsDialog: true },
      dialogsStore: {
        setQuotaWarningDialogVisible,
        setArchiveDialogVisible,
        setRestoreRoomDialogVisible: vi.fn(),
      },
    });
    store.archiveRooms("unarchive");
    expect(setQuotaWarningDialogVisible).toHaveBeenCalledWith(true);
    expect(setArchiveDialogVisible).not.toHaveBeenCalled();
  });

  it("archiveRooms: archive opens the archive dialog", () => {
    const setArchiveDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      dialogsStore: {
        setArchiveDialogVisible,
        setQuotaWarningDialogVisible: vi.fn(),
        setRestoreRoomDialogVisible: vi.fn(),
      },
    });
    store.archiveRooms("archive");
    expect(setArchiveDialogVisible).toHaveBeenCalledWith(true);
  });

  it("archiveRooms: non-archive opens the restore dialog", () => {
    const setRestoreRoomDialogVisible = vi.fn();
    const store = createTestFilesActionsStore({
      dialogsStore: {
        setRestoreRoomDialogVisible,
        setArchiveDialogVisible: vi.fn(),
        setQuotaWarningDialogVisible: vi.fn(),
      },
    });
    store.archiveRooms("unarchive");
    expect(setRestoreRoomDialogVisible).toHaveBeenCalledWith(true);
  });

  it("changeRoomQuota / changeAIAgentsQuota dispatch a CHANGE_QUOTA event", () => {
    const dispatchEvent = vi.spyOn(window, "dispatchEvent");
    const store = createTestFilesActionsStore();
    store.changeRoomQuota([{ id: 1 }] as never);
    store.changeAIAgentsQuota([2] as never);
    expect(dispatchEvent).toHaveBeenCalledTimes(2);
    dispatchEvent.mockRestore();
  });

  it("disableRoomQuota sets a custom quota of -1", async () => {
    const setCustomRoomQuota = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { setCustomRoomQuota },
    });
    await store.disableRoomQuota([{ id: 1 }, 2] as never, t);
    expect(setCustomRoomQuota).toHaveBeenCalledWith([1, 2], -1);
  });

  it("resetRoomQuota delegates to filesStore.resetRoomQuota", async () => {
    const resetRoomQuota = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      filesStore: { resetRoomQuota },
    });
    await store.resetRoomQuota([{ id: 1 }] as never, t);
    expect(resetRoomQuota).toHaveBeenCalledWith([1]);
  });
});
