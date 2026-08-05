// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";

vi.mock("@docspace/shared/api/people", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  startEmptyPersonal: vi.fn(async () => ({})),
  getEmptyPersonalProgress: vi.fn(async () => ({ isCompleted: true, percentage: 100 })),
}));
vi.mock("../helpers", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  checkExportRoomIndexProgress: vi.fn(async () => ({
    isCompleted: true,
    percentage: 100,
  })),
}));

import { createTestFilesActionsStore, t } from "./testHarness";

const progressStore = () => ({
  loopFilesOperations: vi.fn(async () => ({})),
  clearActiveOperations: vi.fn(),
  primaryProgressDataStore: {
    setPrimaryProgressBarData: vi.fn(),
    clearPrimaryProgressData: vi.fn(),
  },
  secondaryProgressDataStore: {
    setSecondaryProgressBarData: vi.fn(),
    clearSecondaryProgressData: vi.fn(),
    isOperationStopped: vi.fn(() => false),
  },
});

describe("FilesActionsStore — polling/tree operations (batch 20)", () => {
  it("createFoldersTree resolves for an empty file set", async () => {
    const store = createTestFilesActionsStore({
      uploadDataStore: progressStore(),
      selectedFolderStore: {
        navigationPath: [],
        getSelectedFolder: () => ({ id: 1 }),
        id: 1,
      },
    });
    await expect(store.createFoldersTree(t, {})).resolves.toBeDefined();
  });

  it("emptyPersonalRoom drives the progress bar", async () => {
    const p = progressStore();
    const store = createTestFilesActionsStore({ uploadDataStore: p });
    await store.emptyPersonalRoom({ deleteOperation: "del" } as never);
    expect(p.secondaryProgressDataStore.setSecondaryProgressBarData).toHaveBeenCalled();
  });

  it("loopExportRoomIndexStatusChecking resolves once the export completes", async () => {
    const store = createTestFilesActionsStore({
      uploadDataStore: progressStore(),
    });
    await expect(
      store.loopExportRoomIndexStatusChecking({
        operation: "exportIndex" as never,
        operationId: "op1",
      }),
    ).resolves.toMatchObject({ isCompleted: true });
  });
});
