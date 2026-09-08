import { beforeEach, describe, expect, test, vi, type Mock } from "vitest";
import type { TGetFolder } from "@docspace/shared/api/files/types";

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-pathname": "/public-room" }),
}));

vi.mock("@/api/files", () => ({
  getFolder: vi.fn(),
  getFilesSettings: vi.fn(),
}));

vi.mock("@/api/settings", () => ({ getSettings: vi.fn() }));

vi.mock("./page.client", () => ({ default: () => null }));
vi.mock("@/components/InvalidLinkError", () => ({ default: () => null }));

import { getFilesSettings, getFolder } from "@/api/files";
import { getSettings } from "@/api/settings";
import InvalidLinkError from "@/components/InvalidLinkError";

import PublicRoom from "./page";
import PublicRoomPage from "./page.client";

const folderList = {
  files: [],
  folders: [],
  total: 0,
  current: { id: 12, rootFolderType: 1 },
  pathParts: [],
} as unknown as TGetFolder;

const filesSettings = { displayFileExtension: true };
const portalSettings = { timezone: "UTC", displayAbout: true };

const render = () =>
  PublicRoom({
    searchParams: Promise.resolve({ folder: "12", key: "share-key" }),
  });

describe("public-room page", () => {
  beforeEach(() => {
    (getFolder as Mock).mockResolvedValue(folderList);
    (getFilesSettings as Mock).mockResolvedValue(filesSettings);
    (getSettings as Mock).mockResolvedValue(portalSettings);
  });

  test("renders the room when every request succeeded", async () => {
    const element = await render();

    expect(element.type).toBe(PublicRoomPage);
    expect(element.props).toMatchObject({
      folderList,
      filesSettings,
      portalSettings,
      shareKey: "share-key",
    });
  });

  test("shows the invalid link screen when file settings are unavailable", async () => {
    (getFilesSettings as Mock).mockResolvedValue(undefined);

    const element = await render();

    expect(element.type).toBe(InvalidLinkError);
  });

  test("shows the invalid link screen when portal settings are restricted", async () => {
    (getSettings as Mock).mockResolvedValue("access-restricted");

    const element = await render();

    expect(element.type).toBe(InvalidLinkError);
  });

  test("shows the invalid link screen when the folder request fails", async () => {
    (getFolder as Mock).mockRejectedValue(new Error("Failed to get folder"));

    const element = await render();

    expect(element.type).toBe(InvalidLinkError);
  });
});
