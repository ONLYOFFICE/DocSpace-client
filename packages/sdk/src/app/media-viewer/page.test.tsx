import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import type { TGetFolder } from "@docspace/shared/api/files/types";

const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

vi.mock("@/api/files", () => ({
  getFolder: vi.fn(),
  getFilesSettings: vi.fn(),
}));

vi.mock("../../../logger.mjs", () => ({ logger: { info: vi.fn() } }));

vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("./page.oauth.client", () => ({ default: () => null }));
vi.mock("./page.error.client", () => ({ default: () => null }));

import { getFilesSettings, getFolder } from "@/api/files";
import { OAUTH_FRAME_HEADER, PAGE_COUNT } from "@/utils/constants";
import { FilterType } from "@docspace/shared/enums";

import Page from "./page";
import MediaViewerClient from "./page.client";
import MediaViewerOAuthPage from "./page.oauth.client";
import MediaViewerError from "./page.error.client";

const folderList = {
  files: [],
  folders: [],
  total: 0,
  current: { id: 12, rootFolderType: 1 },
  pathParts: [],
} as unknown as TGetFolder;

const filesSettings = { extsImagePreviewed: [".png"] };

const render = () =>
  Page({
    searchParams: Promise.resolve({ folder: "12", fileId: "7", key: "tok" }),
  });

describe("media-viewer page", () => {
  beforeEach(() => {
    requestHeaders.delete(OAUTH_FRAME_HEADER);
    (getFolder as Mock).mockReset().mockResolvedValue(folderList);
    (getFilesSettings as Mock).mockReset().mockResolvedValue(filesSettings);
  });

  test("renders the viewer with the folder files and the start file", async () => {
    const element = await render();

    expect(element.type).toBe(MediaViewerClient);
    expect(element.props).toMatchObject({
      folderId: "12",
      startFileId: "7",
      folderList,
      filesSettings,
    });
  });

  test("requests only the files of the folder, one page at a time", async () => {
    await render();

    const [folderId, filter] = (getFolder as Mock).mock.calls[0];

    expect(folderId).toBe("12");
    expect(filter.filterType).toBe(FilterType.FilesOnly);
    expect(filter.pageCount).toBe(PAGE_COUNT);
  });

  test("reports onNotFound when the folder does not exist", async () => {
    (getFolder as Mock).mockRejectedValue(
      new Error("Failed to get folder", { cause: 404 }),
    );

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNotFound");
  });

  test("reports onNoAccess when the folder request is refused", async () => {
    (getFolder as Mock).mockRejectedValue(
      new Error("Failed to get folder", { cause: 403 }),
    );

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("reports onNoAccess when file settings are unavailable", async () => {
    (getFilesSettings as Mock).mockResolvedValue(undefined);

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("loads the data on the client in an OAuth frame", async () => {
    requestHeaders.set(OAUTH_FRAME_HEADER, "1");

    const element = await render();

    expect(element.type).toBe(MediaViewerOAuthPage);
    expect(element.props).toMatchObject({ folderId: "12", startFileId: "7" });
    expect(getFolder).not.toHaveBeenCalled();
  });
});
