import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

vi.mock("@docspace/shared/utils/common", () => ({
  frameCallbackData: vi.fn(),
  frameCallCommand: vi.fn(),
  frameHandlePing: () => false,
  toFrameMethodError: (err: unknown) => ({ error: String(err) }),
}));

vi.mock("@docspace/shared/utils/customStyles", () => ({
  applyCustomStyles: vi.fn(),
}));

import { frameCallbackData } from "@docspace/shared/utils/common";

import { SDKConfigProvider } from "./SDKConfigProvider";
import { registerSdkMethod } from "./sdkMethods";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

const hostWindow = { postMessage: vi.fn() } as unknown as Window;

const callMethod = async (methodName: string, callId: number) => {
  await act(async () => {
    window.dispatchEvent(
      new MessageEvent("message", {
        data: JSON.stringify({ data: { methodName, callId, data: { a: 1 } } }),
        source: hostWindow,
      }),
    );
    await Promise.resolve();
  });
};

describe("SDKConfigProvider method dispatch", () => {
  let root: Root | undefined;
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    vi.spyOn(window, "parent", "get").mockReturnValue(hostWindow);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => root!.render(<SDKConfigProvider>{null}</SDKConfigProvider>));
  });

  afterEach(() => {
    if (root) act(() => root!.unmount());
    container?.remove();
    vi.restoreAllMocks();
    vi.mocked(frameCallbackData).mockClear();
  });

  test("answers an unregistered method with the wrong-mode reply", async () => {
    await callMethod("setCustomActions", 7);

    expect(frameCallbackData).toHaveBeenCalledWith(
      "Wrong method for this mode",
      7,
    );
  });

  test("resolves a registered method with its handler result", async () => {
    const unregister = registerSdkMethod("getFiles", (data) => ({ data }));

    await callMethod("getFiles", 8);

    expect(frameCallbackData).toHaveBeenCalledWith({ data: { a: 1 } }, 8);
    unregister();
  });

  test("replies with the method error when the handler throws", async () => {
    const unregister = registerSdkMethod("navigateSection", () => {
      throw new Error("Unknown section");
    });

    await callMethod("navigateSection", 9);

    expect(frameCallbackData).toHaveBeenCalledWith(
      { error: "Error: Unknown section" },
      9,
    );
    unregister();
  });
});
