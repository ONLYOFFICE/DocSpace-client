import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createLoader, MIN_LOADER_TIMER, SHOW_LOADER_TIMER } from "./createLoader";

describe("createLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("never shows the loader for an answer that comes before the show delay", () => {
    const { startLoader, endLoader } = createLoader();
    const show = vi.fn();
    const hide = vi.fn();
    startLoader(show);
    vi.advanceTimersByTime(SHOW_LOADER_TIMER - 1);
    endLoader(hide);
    vi.runAllTimers();
    expect(show).not.toHaveBeenCalled();
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it("keeps a shown loader up for the minimum time, hiding it once", () => {
    const { startLoader, endLoader } = createLoader();
    const show = vi.fn();
    const hide = vi.fn();
    startLoader(show);
    vi.advanceTimersByTime(SHOW_LOADER_TIMER + 50);
    expect(show).toHaveBeenCalledTimes(1);
    endLoader(hide);
    expect(hide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(MIN_LOADER_TIMER - 50 - 1);
    expect(hide).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(hide).toHaveBeenCalledTimes(1);
  });

  it("hides a loader that has been up long enough at once", () => {
    const { startLoader, endLoader } = createLoader();
    const hide = vi.fn();
    startLoader(() => {});
    vi.advanceTimersByTime(SHOW_LOADER_TIMER + MIN_LOADER_TIMER);
    endLoader(hide);
    expect(hide).toHaveBeenCalledTimes(1);
  });
});
