import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";

import { ValidationStatus } from "@docspace/shared/enums";

const requestHeaders = new Headers();

vi.mock("next/headers", () => ({
  headers: async () => requestHeaders,
}));

const getFolderInfo = vi.hoisted(() => vi.fn());
const validatePublicRoomKey = vi.hoisted(() => vi.fn());

vi.mock("@/api/files", () => ({
  getFilesSettings: vi.fn(),
  getFolderInfo,
  getFolderPath: vi.fn(),
}));

vi.mock("@/api/rooms", () => ({ validatePublicRoomKey }));

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
    getFolderInfo.mockReset();
    validatePublicRoomKey.mockReset();
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

  describe("a visitor without an account", () => {
    const link = (isRoom: boolean, status = ValidationStatus.Ok) => ({
      response: { id: "17", isRoom, status },
    });

    beforeEach(() => {
      vi.mocked(getPrivateRoomAddress).mockRejectedValue({
        response: { status: 401 },
      });
    });

    test("Visitor of a public room link", async () => {
      validatePublicRoomKey.mockResolvedValue(link(true));
      getFolderInfo.mockResolvedValue({ id: 17, private: false });

      const element = await render();

      expect(element.type).toBe(MediaViewerClient);
      expect(validatePublicRoomKey).toHaveBeenCalledWith("tok");
      expect(getFolderInfo).toHaveBeenCalledWith("17");
    });

    test("Visitor of a link that opens a private room", async () => {
      validatePublicRoomKey.mockResolvedValue(link(true));
      getFolderInfo.mockResolvedValue({ id: 17, private: true });

      const element = await render();

      expect(element.type).toBe(PrivateTargetNotAvailable);
      expect(getFilesSettings).not.toHaveBeenCalled();
    });

    test("opens the gallery for a link to a folder inside a room", async () => {
      validatePublicRoomKey.mockResolvedValue(link(false));

      const element = await render();

      expect(element.type).toBe(MediaViewerClient);
      expect(getFolderInfo).not.toHaveBeenCalled();
    });

    test("Room of a valid link cannot be read", async () => {
      validatePublicRoomKey.mockResolvedValue(link(true));
      getFolderInfo.mockRejectedValue(new Error("Unauthorized"));

      const element = await render();

      expect(element.type).toBe(MediaViewerError);
      expect(element.props.event).toBe("onNoAccess");
      expect(getFilesSettings).not.toHaveBeenCalled();
    });

    test("reports onNoAccess for a link that does not validate", async () => {
      validatePublicRoomKey.mockResolvedValue(
        link(true, ValidationStatus.ExternalAccessDenied),
      );

      const element = await render();

      expect(element.type).toBe(MediaViewerError);
      expect(element.props.event).toBe("onNoAccess");
      expect(getFolderInfo).not.toHaveBeenCalled();
    });
  });

  test("Visitor without a link", async () => {
    vi.mocked(getPrivateRoomAddress).mockRejectedValue({
      response: { status: 401 },
    });

    const element = await Page({
      searchParams: Promise.resolve({ folder: "12" }),
    });

    expect(element.type).toBe(MediaViewerError);
    expect(element.props.event).toBe("onNoAccess");
    expect(getFilesSettings).not.toHaveBeenCalled();
    expect(validatePublicRoomKey).not.toHaveBeenCalled();
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
