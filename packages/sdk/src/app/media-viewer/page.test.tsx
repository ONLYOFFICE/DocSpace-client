import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(),
}));

vi.mock("../../../logger.mjs", () => ({ logger: { info: vi.fn() } }));

vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("./page.oauth.client", () => ({ default: () => null }));
vi.mock("./page.error.client", () => ({ default: () => null }));

import { getFilesSettings } from "@/api/files";
import { OAUTH_FRAME_HEADER } from "@/utils/constants";

import Page from "./page";
import MediaViewerClient from "./page.client";
import MediaViewerOAuthPage from "./page.oauth.client";
import MediaViewerError from "./page.error.client";

const filesSettings = { extsImagePreviewed: [".png"] };

const render = () =>
  Page({
    searchParams: Promise.resolve({ folder: "12", fileId: "7", key: "tok" }),
  });

describe("media-viewer page", () => {
  beforeEach(() => {
    requestHeaders.delete(OAUTH_FRAME_HEADER);
    (getFilesSettings as Mock).mockReset().mockResolvedValue(filesSettings);
  });

  test("renders the gallery with the folder, the link key and the start file", async () => {
    const element = await render();

    expect(element.type).toBe(MediaViewerClient);
    expect(element.props).toEqual({
      folderId: "12",
      requestToken: "tok",
      startFileId: "7",
      filesSettings,
    });
  });

  test("reports onNoAccess when file settings are unavailable", async () => {
    (getFilesSettings as Mock).mockResolvedValue(undefined);

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("reports onNoAccess when the file settings request fails", async () => {
    (getFilesSettings as Mock).mockRejectedValue(new Error("Forbidden"));

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("loads the data on the client in an OAuth frame", async () => {
    requestHeaders.set(OAUTH_FRAME_HEADER, "1");

    const element = await render();

    expect(element.type).toBe(MediaViewerOAuthPage);
    expect(element.props).toEqual({
      folderId: "12",
      requestToken: "tok",
      startFileId: "7",
    });
    expect(getFilesSettings).not.toHaveBeenCalled();
  });
});
