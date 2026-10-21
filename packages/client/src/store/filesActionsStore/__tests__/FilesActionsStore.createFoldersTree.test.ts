import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestFilesActionsStore } from "./testHarness";

import { createFolder } from "@docspace/shared/api/files";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type { TUploadTreeFile } from "../helpers";
import type { TUploadTarget } from "../../uploadDataStore/helpers";
import { RoomsType } from "@docspace/shared/enums";
import type { TTranslation } from "@docspace/shared/types";

vi.mock("@docspace/shared/api/files", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  createFolder: vi.fn(async () => ({ id: 55 })),
}));

const t = ((key: string) => key) as unknown as TTranslation;

const entry = (
  path: string,
  extra: Partial<TUploadTreeFile> = {},
): TUploadTreeFile =>
  Object.assign(new File(["x"], path.split("/").pop() || path), {
    path,
    ...extra,
  }) as TUploadTreeFile;

beforeEach(() => {
  vi.clearAllMocks();
});

const privateRoomTarget = (folderId = 7): TUploadTarget => ({
  folderId,
  isPrivate: true,
  roomType: RoomsType.CustomRoom,
  encryptionRoomId: 7,
});

const plainTarget = (folderId = 7): TUploadTarget => ({
  folderId,
  isPrivate: false,
  roomType: null,
  encryptionRoomId: null,
});

describe("FilesActionsStore.createFoldersTree — the drop's target decides the folder-tree refusal", () => {
  it("Folders dropped on the view", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: false },
    });

    const result = await store.createFoldersTree(
      t,
      [entry("dir/nested.txt"), entry("empty", { isEmptyDirectory: true })],
      privateRoomTarget(),
      true,
    );

    expect(result).toEqual([]);
    expect(createFolder).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:FolderUploadNotSupportedInPrivateRoom",
    );
  });

  it("Files and folders dropped together", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: false },
    });
    const files = [
      entry("report.docx"),
      entry("dir/nested.txt"),
      entry("empty", { isEmptyDirectory: true }),
    ];

    const result = await store.createFoldersTree(
      t,
      files,
      privateRoomTarget(),
      true,
    );

    expect(result.map((f) => f.name)).toEqual(["report.docx"]);
    expect(result[0].parentFolderId).toBe(7);
    expect(createFolder).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:FolderUploadNotSupportedInPrivateRoom",
    );
  });

  it("Folders dropped on a folder of the open room", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: false },
    });

    const result = await store.createFoldersTree(
      t,
      [entry("report.docx"), entry("dir/nested.txt")],
      privateRoomTarget(60),
      true,
    );

    expect(result.map((f) => [f.name, f.parentFolderId])).toEqual([
      ["report.docx", 60],
    ]);
    expect(createFolder).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:FolderUploadNotSupportedInPrivateRoom",
    );
  });

  it("stays silent when the drop contains files only", async () => {
    const store = createTestFilesActionsStore();

    const result = await store.createFoldersTree(
      t,
      [entry("a.txt")],
      privateRoomTarget(),
    );

    expect(result.map((f) => f.name)).toEqual(["a.txt"]);
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("creates the folder tree in a target outside private rooms, even while a private room is open", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });

    const result = await store.createFoldersTree(
      t,
      [entry("report.docx"), entry("dir/nested.txt")],
      plainTarget(),
    );

    expect(createFolder).toHaveBeenCalledWith(7, "dir");
    expect(result.map((f) => f.name).sort()).toEqual([
      "nested.txt",
      "report.docx",
    ]);
    expect(toastr.warning).not.toHaveBeenCalled();
  });
});
