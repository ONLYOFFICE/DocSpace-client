import { afterEach, describe, expect, it, vi } from "vitest";

import {
  clearDeviceSetupHintHandler,
  registerDeviceSetupHintHandler,
  requestDeviceSetupHint,
} from "../device-setup-hint-notifier";

declare function allowConsoleError(matcher: RegExp | string): void;

afterEach(() => {
  clearDeviceSetupHintHandler();
});

describe("device-setup-hint-notifier", () => {
  it("returns false and does nothing when no handler is registered", () => {
    expect(requestDeviceSetupHint()).toBe(false);
  });

  it("runs the registered handler on every request (no session gate)", () => {
    const handler = vi.fn();
    registerDeviceSetupHintHandler(handler);

    expect(requestDeviceSetupHint()).toBe(true);
    expect(requestDeviceSetupHint()).toBe(true);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it("stops firing after the handler is cleared", () => {
    const handler = vi.fn();
    registerDeviceSetupHintHandler(handler);
    clearDeviceSetupHintHandler();

    expect(requestDeviceSetupHint()).toBe(false);
    expect(handler).not.toHaveBeenCalled();
  });

  it("swallows a throwing handler and reports false", () => {
    allowConsoleError("[device-setup-hint] handler threw");
    registerDeviceSetupHintHandler(() => {
      throw new Error("boom");
    });

    expect(requestDeviceSetupHint()).toBe(false);
  });
});
