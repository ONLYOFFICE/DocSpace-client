import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(),
  getFolderPath: vi.fn(),
}));

vi.mock("@/utils/private-room-address", () => ({
  getPrivateRoomAddress: vi.fn(),
}));

vi.mock("@/components/PrivateTargetNotAvailable", () => ({
  default: () => null,
}));

vi.mock("../../../logger.mjs", () => ({ logger: { info: vi.fn() } }));

vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("./page.oauth.client", () => ({ default: () => null }));
vi.mock("./page.error.client", () => ({ default: () => null }));

import { getFilesSettings, getFolderPath } from "@/api/files";
import PrivateTargetNotAvailable from "@/components/PrivateTargetNotAvailable";
import {
  MEDIA_VIEWER_LINK_ERROR_HEADER,
  OAUTH_FRAME_HEADER,
} from "@/utils/constants";
import { getPrivateRoomAddress } from "@/utils/private-room-address";

import Page from "./page";
import MediaViewerClient from "./page.client";
import MediaViewerOAuthPage from "./page.oauth.client";
import MediaViewerError from "./page.error.client";

const filesSettings = { extsImagePreviewed: [".png"] };

const render = (folder = "12") =>
  Page({
    searchParams: Promise.resolve({ folder, fileId: "7", key: "tok" }),
  });

describe("media-viewer page", () => {
  beforeEach(() => {
    requestHeaders.delete(OAUTH_FRAME_HEADER);
    requestHeaders.delete(MEDIA_VIEWER_LINK_ERROR_HEADER);
    (getFilesSettings as Mock).mockReset().mockResolvedValue(filesSettings);
    vi.mocked(getPrivateRoomAddress).mockReset().mockResolvedValue(null);
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

  test("reports onNotFound without asking anything when no folder is given", async () => {
    const element = await Page({ searchParams: Promise.resolve({}) });

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNotFound");
    expect(getFilesSettings).not.toHaveBeenCalled();
  });

  test.each(["onNotFound", "onNoAccess"])(
    "reports %s for a link the proxy refused, before anything else",
    async (event) => {
      requestHeaders.set(MEDIA_VIEWER_LINK_ERROR_HEADER, event);
      requestHeaders.set(OAUTH_FRAME_HEADER, "1");

      const element = await render();

      expect(element.type).toBe(MediaViewerError);
      expect(element.props.event).toBe(event);
      expect(getPrivateRoomAddress).not.toHaveBeenCalled();
    },
  );

  test("ignores a link error header with an unknown value", async () => {
    requestHeaders.set(MEDIA_VIEWER_LINK_ERROR_HEADER, "onAppError");

    const element = await render();

    expect(element.type).toBe(MediaViewerClient);
  });

  test("shows the not-available view for a folder of a private room", async () => {
    vi.mocked(getPrivateRoomAddress).mockResolvedValue("/private/19");

    const element = await render();

    expect(element.type).toBe(PrivateTargetNotAvailable);
    expect(getPrivateRoomAddress).toHaveBeenCalledWith(
      { id: "12" },
      {},
      getFolderPath,
    );
    expect(getFilesSettings).not.toHaveBeenCalled();
  });

  test("reports onNotFound when the folder path is missing", async () => {
    vi.mocked(getPrivateRoomAddress).mockRejectedValue({
      response: { status: 404 },
    });

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNotFound");
  });

  test("reports onNoAccess when the folder path cannot be read", async () => {
    vi.mocked(getPrivateRoomAddress).mockRejectedValue({
      response: { status: 403 },
    });

    const element = await render();

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
  });

  test("opens a link to a public room for a guest who cannot read the folder path", async () => {
    vi.mocked(getPrivateRoomAddress).mockRejectedValue({
      response: { status: 401 },
    });

    const element = await render();

    expect(element.type).toBe(MediaViewerClient);
  });

  test("reports onNoAccess for a guest without a link key", async () => {
    vi.mocked(getPrivateRoomAddress).mockRejectedValue({
      response: { status: 401 },
    });

    const element = await Page({
      searchParams: Promise.resolve({ folder: "12" }),
    });

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
    expect(getFilesSettings).not.toHaveBeenCalled();
  });

  test("does not look for a private room behind an alias or a third-party folder", async () => {
    const element = await render("@my");

    expect(element.type).toBe(MediaViewerClient);
    expect(getPrivateRoomAddress).not.toHaveBeenCalled();
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
