// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";
import { createTestFilesActionsStore } from "./testHarness";

// The default harness userStore has no encryptionKeys, so every encrypted
// operation hits its "keys not configured" guard and returns without touching
// the download/copy pipeline. That guard is what these tests lock.

describe("FilesActionsStore — encrypted ops guard (batch 18)", () => {
  it("downloadEncryptedFile without keys resolves without opening a URL", async () => {
    const openUrl = vi.fn();
    const store = createTestFilesActionsStore({ settingsStore: { openUrl } });
    await store.downloadEncryptedFile({ id: 1 } as never);
    expect(openUrl).not.toHaveBeenCalled();
  });

  it("downloadEncryptedFilesAsZip without keys does not start a progress op", async () => {
    const setSecondaryProgressBarData = vi.fn();
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        secondaryProgressDataStore: {
          setSecondaryProgressBarData,
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    await store.downloadEncryptedFilesAsZip([{ id: 1 }] as never);
    expect(setSecondaryProgressBarData).not.toHaveBeenCalled();
  });

  it("copyEncryptedFilesToFolder without keys does not copy", async () => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        itemOperationToFolder,
        secondaryProgressDataStore: {
          setSecondaryProgressBarData: vi.fn(),
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    await store.copyEncryptedFilesToFolder([{ id: 1 }] as never, 2, {} as never);
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });

  it("duplicateEncryptedFile delegates to copyEncryptedFilesToFolder (guarded)", async () => {
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      uploadDataStore: {
        itemOperationToFolder,
        secondaryProgressDataStore: {
          setSecondaryProgressBarData: vi.fn(),
          clearSecondaryProgressData: vi.fn(),
        },
      },
    });
    await store.duplicateEncryptedFile({ id: 1, folderId: 2 } as never);
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });
});
