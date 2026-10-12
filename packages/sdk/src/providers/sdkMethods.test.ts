// (c) Copyright Ascensio System SIA 2009-2026
// SPDX-License-Identifier: AGPL-3.0-only
import { describe, expect, test, vi } from "vitest";

import { getSdkMethod, registerSdkMethod } from "./sdkMethods";

describe("sdkMethods registry", () => {
  test("registers a handler and hands it back by name", () => {
    const handler = vi.fn(() => "result");
    const unregister = registerSdkMethod("getFiles", handler);

    expect(getSdkMethod("getFiles")).toBe(handler);
    expect(getSdkMethod("getFiles")?.({ a: 1 })).toBe("result");

    unregister();
    expect(getSdkMethod("getFiles")).toBeUndefined();
  });

  test("a later registration replaces the earlier one and only its own unregister removes it", () => {
    const first = vi.fn();
    const second = vi.fn();
    const unregisterFirst = registerSdkMethod("navigateSection", first);
    const unregisterSecond = registerSdkMethod("navigateSection", second);

    expect(getSdkMethod("navigateSection")).toBe(second);

    unregisterFirst();
    expect(getSdkMethod("navigateSection")).toBe(second);

    unregisterSecond();
    expect(getSdkMethod("navigateSection")).toBeUndefined();
  });

  test("unknown methods have no handler", () => {
    expect(getSdkMethod("setCustomActions")).toBeUndefined();
  });
});
