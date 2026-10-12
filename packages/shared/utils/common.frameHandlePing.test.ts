// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { afterEach, describe, expect, it, vi } from "vitest";

import { frameHandlePing } from "./common";

describe("frameHandlePing", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("answers a ping with a pong and reports the message as handled", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});

    expect(frameHandlePing({ type: "ping" })).toBe(true);
    expect(postMessage).toHaveBeenCalledTimes(1);
    expect(JSON.parse(postMessage.mock.calls[0][0] as string).type).toBe(
      "pong",
    );
  });

  it("swallows OAuth token replies and pushes without answering them", () => {
    const postMessage = vi
      .spyOn(window.parent, "postMessage")
      .mockImplementation(() => {});

    expect(frameHandlePing({ type: "onAuthTokenReturn" })).toBe(true);
    expect(postMessage).not.toHaveBeenCalled();
  });

  it("lets method calls and events through", () => {
    expect(frameHandlePing({ type: "onMethodReturn" })).toBe(false);
    expect(frameHandlePing({})).toBe(false);
  });
});
