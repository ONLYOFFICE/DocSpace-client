// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi } from "vitest";
import { FolderType, RoomsType } from "@docspace/shared/enums";
import { createTestFilesActionsStore } from "./testHarness";
// After the harness, which mocks the toast module.
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

declare function allowConsoleError(matcher: RegExp | string): void;

// The default harness userStore has an empty key list, so every encrypted
// operation hits its "keys not configured" guard and returns without touching
// the download/copy pipeline. That guard is what these tests lock.

describe("An unknown key list is read again before an action is refused", () => {
  const progress = () => ({
    setSecondaryProgressBarData: vi.fn(),
    clearSecondaryProgressData: vi.fn(),
    isOperationStopped: vi.fn(() => false),
  });

  const storeWith = (read: unknown[] | null) => {
    const ensureEncryptionKeys = vi.fn(async () => read);
    const secondaryProgressDataStore = progress();
    const itemOperationToFolder = vi.fn(async () => {});
    const store = createTestFilesActionsStore({
      userStore: {
        user: { id: "user-1" },
        encryptionKeys: null,
        ensureEncryptionKeys,
      },
      uploadDataStore: { itemOperationToFolder, secondaryProgressDataStore },
    });

    return {
      store,
      ensureEncryptionKeys,
      secondaryProgressDataStore,
      itemOperationToFolder,
    };
  };

  const loadFailed = () =>
    vi.mocked(toastr.error).mock.calls.filter((call) => call[2] === 0).length;
  const notConfigured = () =>
    vi
      .mocked(toastr.error)
      .mock.calls.filter(
        (call) => call[0] === "Common:EncryptionKeysNotConfigured",
      ).length;

  it("Read fails: download", async () => {
    const { store, ensureEncryptionKeys, secondaryProgressDataStore } =
      storeWith(null);

    await store.downloadEncryptedFile({ id: 1 } as never);
    await store.downloadEncryptedFilesAsZip([{ id: 1 }] as never);

    expect(ensureEncryptionKeys).toHaveBeenCalledTimes(2);
    expect(loadFailed()).toBe(2);
    expect(notConfigured()).toBe(0);
    expect(
      secondaryProgressDataStore.setSecondaryProgressBarData,
    ).not.toHaveBeenCalled();
  });

  it("Read fails: copy", async () => {
    const { store, itemOperationToFolder } = storeWith(null);

    await store.copyEncryptedFilesToFolder([{ id: 1 }] as never, 2, {} as never);

    expect(loadFailed()).toBe(1);
    expect(notConfigured()).toBe(0);
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });

  it("Read answers with an empty list", async () => {
    const { store, secondaryProgressDataStore } = storeWith([]);

    await store.downloadEncryptedFile({ id: 1 } as never);

    expect(notConfigured()).toBe(1);
    expect(loadFailed()).toBe(0);
    expect(
      secondaryProgressDataStore.setSecondaryProgressBarData,
    ).not.toHaveBeenCalled();
  });

  it("Read succeeds with a key", async () => {
    // Past the gate the download meets no server here.
    allowConsoleError(/downloadEncryptedFile threw/);
    const { store, secondaryProgressDataStore } = storeWith([{ id: "k1" }]);

    await store.downloadEncryptedFile({ id: 1, title: "a.docx" } as never);

    expect(notConfigured()).toBe(0);
    expect(loadFailed()).toBe(0);
    expect(
      secondaryProgressDataStore.setSecondaryProgressBarData,
    ).toHaveBeenCalled();
  });
});

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
          isOperationStopped: vi.fn(() => false),
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
          isOperationStopped: vi.fn(() => false),
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
          isOperationStopped: vi.fn(() => false),
        },
      },
    });
    await store.duplicateEncryptedFile({ id: 1, folderId: 2 } as never);
    expect(itemOperationToFolder).not.toHaveBeenCalled();
  });

  it("Duplicate started outside the room", async () => {
    const store = createTestFilesActionsStore({
      selectedFolderStore: {
        rootFolderId: 5,
        rootFolderType: FolderType.Recent,
        roomType: null,
      },
    });
    const copy = vi.fn(async () => {});
    store.copyEncryptedFilesToFolder = copy;
    const item = {
      id: 1,
      folderId: 2,
      rootFolderId: 3,
      rootFolderType: FolderType.Rooms,
      encrypted: true,
    };

    await store.duplicateEncryptedFile(item as never);

    expect(copy).toHaveBeenCalledWith([item], 2, {
      private: true,
      rootFolderId: 3,
      rootFolderType: FolderType.Rooms,
      roomType: RoomsType.CustomRoom,
    });
  });
});

describe("FilesActionsStore — opening an encrypted file", () => {
  it("Error text is localized", async () => {
    const store = createTestFilesActionsStore({
      filesStore: { setSelection: vi.fn(), categoryType: 0 },
    });
    store.downloadEncryptedFile = vi.fn(async () => {
      throw new Error("decrypt pipeline broke");
    });

    await store.openItemAction({
      id: 1,
      title: "archive.zip",
      fileExst: ".zip",
      isFolder: false,
      encrypted: true,
      viewUrl: "http://x/1",
      security: { Download: true },
      viewAccessibility: {},
    } as never);

    expect(toastr.error).toHaveBeenCalledWith("Common:EncryptedOperationFailed");
  });
});
