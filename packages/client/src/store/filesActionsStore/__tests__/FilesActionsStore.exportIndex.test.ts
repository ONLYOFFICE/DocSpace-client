// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  deleteVersionFile: vi.fn(async () => [{}]),
}));
vi.mock("SRC_DIR/helpers/toast-helpers", () => ({
  showSuccessExportRoomIndexToast: vi.fn(),
}));

import api from "@docspace/shared/api";
import { showSuccessExportRoomIndexToast } from "SRC_DIR/helpers/toast-helpers";
import { createTestFilesActionsStore, t } from "./testHarness";

describe("FilesActionsStore — export-index & version delete (batch 12)", () => {
  it("onSuccessExportRoomIndex shows the success toast", () => {
    const store = createTestFilesActionsStore({
      filesSettingsStore: { openOnNewPage: true },
    });
    store.onSuccessExportRoomIndex(t, "index.xlsx", "/f/index.xlsx");
    expect(showSuccessExportRoomIndexToast).toHaveBeenCalledTimes(1);
  });

  it("checkPreviousExportRoomIndexInProgress: false when last export completed", async () => {
    const spy = vi
      .spyOn(api.rooms, "getExportRoomIndexProgress")
      .mockResolvedValue({ isCompleted: true } as never);
    const store = createTestFilesActionsStore();
    await expect(
      store.checkPreviousExportRoomIndexInProgress(),
    ).resolves.toBeFalsy();
    spy.mockRestore();
  });

  it("exportRoomIndex aborts (error toast, no progress) if one is already running", async () => {
    const spy = vi
      .spyOn(api.rooms, "getExportRoomIndexProgress")
      .mockResolvedValue({ isCompleted: false } as never);
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    await store.exportRoomIndex(t, 1);
    expect(setSecondaryProgressBarData).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("onDeleteVersionFile drives the progress bar", async () => {
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
        },
      },
      versionHistoryStore: {
        setVersionDeletionProcess: vi.fn(),
        setVersionSelectedForDeletion: vi.fn(),
      },
    });
    await store.onDeleteVersionFile(1, [2]);
    expect(setSecondaryProgressBarData).toHaveBeenCalled();
  });
});
