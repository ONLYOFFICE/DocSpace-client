// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  emptyTrash: vi.fn(async () => [{}]),
  removeFiles: vi.fn(async () => [{}]),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

const translations = { deleteOperation: "del" } as never;

describe("FilesActionsStore — empty operations (batch 7)", () => {
  it("emptyTrash drives the progress bar and loops the file operation", async () => {
    const setSecondaryProgressBarData = vi.fn();
    const loopFilesOperations = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isRecycleBinFolder: true },
      filesStore: {
        files: [{ id: 1 }],
        folders: [{ id: 2 }],
        addActiveItems: vi.fn(),
        getIsEmptyTrash: vi.fn(),
      },
      uploadDataStore: {
        loopFilesOperations,
        clearActiveOperations: vi.fn(),
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
          isOperationStopped: vi.fn(() => false),
        },
      },
    });
    await store.emptyTrash(translations);
    expect(setSecondaryProgressBarData).toHaveBeenCalled();
    expect(loopFilesOperations).toHaveBeenCalledTimes(1);
  });

  it("emptyArchive removes folders and loops the operation", async () => {
    const loopFilesOperations = vi.fn(async () => {});
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      filesStore: { roomsForDelete: [{ id: 5 }], addActiveItems: vi.fn() },
      uploadDataStore: {
        loopFilesOperations,
        clearActiveOperations: vi.fn(),
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
          isOperationStopped: vi.fn(() => false),
        },
      },
    });
    await store.emptyArchive(translations);
    expect(loopFilesOperations).toHaveBeenCalledTimes(1);
  });
});
