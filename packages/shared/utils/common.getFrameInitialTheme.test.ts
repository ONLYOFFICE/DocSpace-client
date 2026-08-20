// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, it, expect, afterEach } from "vitest";
import { ThemeKeys } from "@docspace/ui-kit/enums";

import { getFrameInitialTheme } from "./common";

const setLocation = (search: string) => {
  window.history.replaceState(null, "", `/rooms/shared/filter${search}`);
};

describe("getFrameInitialTheme", () => {
  afterEach(() => {
    window.name = "";
    window.history.replaceState(null, "", "/");
  });

  it("returns null outside of an SDK frame", () => {
    window.name = "";
    setLocation("?theme=Dark");
    expect(getFrameInitialTheme()).toBeNull();
  });

  it("defaults to Base inside a frame without a theme param", () => {
    window.name = "frameDocSpace";
    setLocation("");
    expect(getFrameInitialTheme()).toBe(ThemeKeys.BaseStr);
  });

  it("reads the theme param inside a frame", () => {
    window.name = "frameDocSpace__#ds-frame";
    setLocation("?theme=Dark");
    expect(getFrameInitialTheme()).toBe(ThemeKeys.DarkStr);

    setLocation("?theme=System");
    expect(getFrameInitialTheme()).toBe(ThemeKeys.SystemStr);

    setLocation(`?theme=${ThemeKeys.Dark}`);
    expect(getFrameInitialTheme()).toBe(ThemeKeys.DarkStr);
  });

  it("falls back to Base on a malformed theme param", () => {
    window.name = "frameDocSpace";
    setLocation("?theme=neon");
    expect(getFrameInitialTheme()).toBe(ThemeKeys.BaseStr);
  });
});
