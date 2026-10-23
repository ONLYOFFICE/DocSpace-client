// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, vi, beforeEach } from "vitest";

const request = vi.fn(async (_options: unknown) => ({
  editorConfig: { mode: "edit" },
}));

vi.mock("../client", () => ({
  request: (options: unknown) => request(options),
}));

// eslint-disable-next-line import/first
import { openEdit } from ".";

const getUrl = () => {
  const [options] = request.mock.calls[0];

  return options && typeof options === "object" && "url" in options
    ? options.url
    : undefined;
};

describe("openEdit", () => {
  beforeEach(() => {
    request.mockClear();
  });

  it("sends no action when none is given", async () => {
    await openEdit(1);

    expect(getUrl()).toBe("/files/file/1/openedit?");
  });

  it("passes the action as a flag next to the other params", async () => {
    await openEdit(1, undefined, "doc", undefined, "key", "2", "fill");

    expect(getUrl()).toBe(
      "/files/file/1/openedit?doc=doc&share=key&editorType=2&fill=true",
    );
  });

  it("keeps the mode the server returned for an action other than view", async () => {
    const res = await openEdit(1, undefined, undefined, undefined, undefined, undefined, "edit");

    expect(res.editorConfig.mode).toBe("edit");
  });

  // editorConfig sits at the top level of the response: the mode used to be
  // set on res.config, which threw and left the editor without a refresh
  it("forces the view mode for the view action", async () => {
    const res = await openEdit(1, undefined, undefined, undefined, undefined, undefined, "view");

    expect(getUrl()).toBe("/files/file/1/openedit?view=true");
    expect(res.editorConfig.mode).toBe("view");
  });
});
