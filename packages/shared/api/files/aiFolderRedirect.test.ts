// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

const request = vi.fn(async (_options: unknown, _skipRedirect?: boolean) => ({}));

vi.mock("../client", () => ({
  request: (options: unknown, skipRedirect?: boolean) =>
    request(options, skipRedirect),
}));

// eslint-disable-next-line import/first
import { createFolder, renameFolder } from ".";

// A second `.ai` folder in a room is refused by the server with 403, the
// code the shared client otherwise reads as lost access to the room and
// answers with a redirect to the root. That one title keeps the user where
// the toast is shown; every other title keeps the redirect.
describe("createFolder / renameFolder and the .ai folder", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("skips the 403 redirect when creating a .ai folder", async () => {
    await createFolder(12, ".ai");

    expect(request).toHaveBeenCalledWith(
      { method: "post", url: "/files/folder/12", data: { title: ".ai" } },
      true,
    );
  });

  it("skips the 403 redirect when renaming a folder to .ai", async () => {
    await renameFolder(40, " .ai ");

    expect(request).toHaveBeenCalledWith(
      { method: "put", url: "/files/folder/40", data: { title: " .ai " } },
      true,
    );
  });

  it("keeps the redirect for any other title", async () => {
    await createFolder(12, "Reports");
    await renameFolder(40, ".AI");

    expect(request).toHaveBeenNthCalledWith(1, expect.anything(), false);
    expect(request).toHaveBeenNthCalledWith(2, expect.anything(), false);
  });
});
