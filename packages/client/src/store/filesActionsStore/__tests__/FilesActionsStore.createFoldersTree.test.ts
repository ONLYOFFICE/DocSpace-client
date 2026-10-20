import { beforeEach, describe, expect, it, vi } from "vitest";

import { createTestFilesActionsStore } from "./testHarness";

import { createFolder } from "@docspace/shared/api/files";
import { toastr } from "@onlyoffice/apps-ui-kit/components/toast";

import type { TUploadTreeFile } from "../helpers";
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

describe("FilesActionsStore.createFoldersTree — folders dropped on a private room", () => {
  it("refuses the folder entries, keeps the files and warns once", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });
    const files = [
      entry("report.docx"),
      entry("dir/nested.txt"),
      entry("empty", { isEmptyDirectory: true }),
    ];

    const result = await store.createFoldersTree(t, files, 7, true);

    expect(result.map((f) => f.name)).toEqual(["report.docx"]);
    expect(result[0].parentFolderId).toBe(7);
    expect(createFolder).not.toHaveBeenCalled();
    expect(toastr.warning).toHaveBeenCalledTimes(1);
    expect(toastr.warning).toHaveBeenCalledWith(
      "Common:FolderUploadNotSupportedInPrivateRoom",
    );
  });

  it("stays silent when the drop contains files only", async () => {
    const store = createTestFilesActionsStore({
      treeFoldersStore: { isPrivacyFolder: true },
    });

    const result = await store.createFoldersTree(t, [entry("a.txt")], 7);

    expect(result.map((f) => f.name)).toEqual(["a.txt"]);
    expect(toastr.warning).not.toHaveBeenCalled();
  });

  it("creates the folder tree as before outside private rooms", async () => {
    const store = createTestFilesActionsStore();

    const result = await store.createFoldersTree(
      t,
      [entry("report.docx"), entry("dir/nested.txt")],
      7,
    );

    expect(createFolder).toHaveBeenCalledWith(7, "dir");
    expect(result.map((f) => f.name).sort()).toEqual([
      "nested.txt",
      "report.docx",
    ]);
    expect(toastr.warning).not.toHaveBeenCalled();
  });
});
