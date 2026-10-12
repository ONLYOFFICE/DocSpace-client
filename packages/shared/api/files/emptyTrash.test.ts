// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

import { FolderType } from "../../enums";

const request = vi.fn(async (_options: unknown) => [{}]);

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import { emptyTrash } from ".";

describe("emptyTrash", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("keeps clearing the whole trash when no scope is given", async () => {
    await emptyTrash();

    expect(request).toHaveBeenCalledWith({
      method: "put",
      url: "/files/fileops/emptytrash?single=true",
    });
  });

  it("sends every section folder type as a repeated query param (bug 82588)", async () => {
    await emptyTrash([
      FolderType.EditingRoom,
      FolderType.CustomRoom,
      FolderType.PublicRoom,
      FolderType.VirtualDataRoom,
    ]);

    expect(request).toHaveBeenCalledWith({
      method: "put",
      url: "/files/fileops/emptytrash?single=true&folderType=16&folderType=19&folderType=22&folderType=29",
    });
  });

  it("ignores an empty scope list", async () => {
    await emptyTrash([]);

    expect(request).toHaveBeenCalledWith({
      method: "put",
      url: "/files/fileops/emptytrash?single=true",
    });
  });
});
