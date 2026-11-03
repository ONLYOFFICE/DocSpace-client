// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { beforeEach, describe, expect, it, vi } from "vitest";

const request = vi.fn(async (_options: unknown) => ({ displayName: "Alice" }));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import { getUserById } from ".";

describe("getUserById", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("asks for the profile with the page's forbidden handling by default", async () => {
    await getUserById("user-1");

    expect(request).toHaveBeenCalledWith({
      method: "get",
      url: "/people/user-1",
      signal: undefined,
    });
  });

  it("skips the forbidden handling when the caller asks for it", async () => {
    await getUserById("user-1", undefined, { skipForbidden: true });

    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/people/user-1", skipForbidden: true }),
    );
  });
});
