// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

const request = vi.fn(async (_options: unknown) => ({}));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import {
  addPlugin,
  deleteMemberPlugin,
  deletePlugin,
  getMembersPlugins,
  getPersonalPlugins,
  getPlugins,
  setPersonalPluginsEnabled,
  updateMemberPlugin,
  updatePlugin,
} from ".";

const urlOf = () =>
  (request.mock.calls.at(-1)?.[0] as { url: string } | undefined)?.url;

describe("plugins API", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("asks for the workspace list or the caller's own", async () => {
    await getPlugins(null);
    expect(urlOf()).toBe("/settings/webplugins");

    await getPersonalPlugins();
    expect(urlOf()).toBe("/settings/webplugins?personal=true");
  });

  it("uploads for the workspace or for the caller alone", async () => {
    await addPlugin(new FormData());
    expect(urlOf()).toBe("/settings/webplugins");

    await addPlugin(new FormData(), true);
    expect(urlOf()).toBe("/settings/webplugins?personal=true");
  });

  it("switches a workspace plugin or the caller's own", async () => {
    await updatePlugin("hello", true, "");
    expect(urlOf()).toBe("/settings/webplugins/hello");

    await updatePlugin("hello", true, "", true);
    expect(urlOf()).toBe("/settings/webplugins/hello?personal=true");
  });

  it("deletes a workspace plugin or the caller's own", async () => {
    await deletePlugin("hello");
    expect(urlOf()).toBe("/settings/webplugins/hello");

    await deletePlugin("hello", true);
    expect(urlOf()).toBe("/settings/webplugins/hello?personal=true");
  });

  it("switches personal plugins for the workspace", async () => {
    await setPersonalPluginsEnabled(false);

    expect(request).toHaveBeenLastCalledWith({
      method: "POST",
      url: "/settings/personalwebplugins",
      data: { enabled: false },
    });
  });

  it("reads, switches and deletes the plugins of members", async () => {
    await getMembersPlugins();
    expect(urlOf()).toBe("/settings/personalwebplugins/plugins");

    await updateMemberPlugin("u1", "hello", false);
    expect(request).toHaveBeenLastCalledWith({
      method: "PUT",
      url: "/settings/personalwebplugins/plugins/u1/hello",
      data: { enabled: false },
    });

    await deleteMemberPlugin("u1", "hello");
    expect(request).toHaveBeenLastCalledWith({
      method: "DELETE",
      url: "/settings/personalwebplugins/plugins/u1/hello",
    });
  });

  it("reports a refused delete to the caller", async () => {
    request.mockRejectedValueOnce(new Error("Access denied"));

    await expect(deletePlugin("hello", true)).rejects.toThrow("Access denied");
  });
});
