// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn(async (_options: unknown): Promise<unknown> => ({}));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

import { RoomSearchArea } from "../../enums";
import RoomsFilter from "./filter";
import { getRooms } from "./index";

const page = () => ({
  files: [],
  folders: [],
  current: { id: 1, rootFolderType: 41 },
  total: 0,
});

const requestedUrl = () => (request.mock.calls[0][0] as { url: string }).url;

describe("getRooms", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue(page());
  });

  it("reads the AI Projects section from the project listing", async () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.AiProjects;
    filter.filterValue = "sales";

    await getRooms(filter);

    const url = new URL(requestedUrl(), "http://portal");
    expect(url.pathname).toBe("/ai/projects");
    expect(url.searchParams.get("filterValue")).toBe("sales");
  });

  it("reads every other section, AI rooms included, from files/rooms", async () => {
    const filter = RoomsFilter.getDefault();
    filter.searchArea = RoomSearchArea.AiHub;

    await getRooms(filter);

    const url = new URL(requestedUrl(), "http://portal");
    expect(url.pathname).toBe("/files/rooms");
    expect(url.searchParams.get("searchArea")).toBe("AiHub");
  });
});
