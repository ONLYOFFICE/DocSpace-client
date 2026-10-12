/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

import {
  buildChunkRetryInlineScript,
  chunkRetryInlineScript,
} from "./chunk-retry-script";

const reloadMock = vi.fn();
Object.defineProperty(window, "location", {
  value: { reload: reloadMock },
  writable: true,
});

const RELOAD_KEY = "chunk-retry-reload-count";

const CHUNK_URL =
  "https://portal.example/doceditor/_next/static/chunks/app/page-1.js";
const CSS_URL =
  "https://portal.example/doceditor/_next/static/css/styles-1.css";

const setVisibility = (state: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
};

const setOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

// The inline script registers window/document listeners it never removes
// (it lives for the whole page). Tests run many script instances in one
// jsdom window, so every registered listener is recorded and detached
// between tests.
type RecordedListener = {
  target: EventTarget;
  type: string;
  fn: EventListenerOrEventListenerObject;
  opts?: boolean | AddEventListenerOptions;
};

const recordedListeners: RecordedListener[] = [];

const trackListeners = (target: EventTarget) => {
  const original = target.addEventListener.bind(target);
  vi.spyOn(target, "addEventListener").mockImplementation(
    (type, fn, opts) => {
      if (fn) recordedListeners.push({ target, type, fn, opts });
      original(type, fn, opts);
    },
  );
};

const runInlineScript = () => new Function(chunkRetryInlineScript)();

// The default script judges the page by `window.next`, which Next's client
// runtime defines as soon as it starts. Every test begins on a booted page;
// the ones about a page that never booted delete it.
const bootedWindow = window as unknown as { next?: { version: string } };

type TimingEntry = { name: string; responseStatus?: number };
const originalGetEntriesByType = Object.getOwnPropertyDescriptor(
  Performance.prototype,
  "getEntriesByType",
);

// What the browser would report through Resource Timing. `undefined`
// emulates a browser without the API at all.
const setResourceTimings = (entries: TimingEntry[] | undefined) => {
  Object.defineProperty(performance, "getEntriesByType", {
    configurable: true,
    value:
      entries === undefined ? undefined : () => entries.map((e) => ({ ...e })),
  });
};

// A tag that is already in the document when the bootstrap runs and whose
// failure fired while the bootstrap was still blocked: no error event is
// ever dispatched for it, only Resource Timing knows.
const addSettledScript = (src: string) => {
  const el = document.createElement("script");
  el.src = src;
  document.head.appendChild(el);
  return el;
};

// Settling the page: load event plus the health grace period.
const settlePage = () => {
  window.dispatchEvent(new Event("load"));
  vi.advanceTimersByTime(1000);
};

const scriptsFor = (base: string) =>
  Array.from(document.head.querySelectorAll("script")).filter((el) =>
    el.src.startsWith(base),
  );

const failScript = (src: string) => {
  const el = document.createElement("script");
  el.src = src;
  document.head.appendChild(el);
  el.dispatchEvent(new Event("error"));
  return el;
};

// Walks one chunk through all MAX_RETRIES re-injections. The last injected
// script is left pending, so the caller's next dispatched failure is the
// one that hits the reload fallback.
const exhaustRetries = (base: string) => {
  failScript(base);
  for (const delay of [300, 600]) {
    vi.advanceTimersByTime(delay);
    const injected = scriptsFor(base);
    injected[injected.length - 1].dispatchEvent(new Event("error"));
  }
  vi.advanceTimersByTime(1200);
};

beforeEach(() => {
  vi.useFakeTimers();
  window.sessionStorage.clear();
  setVisibility("visible");
  setOnline(true);
  bootedWindow.next = { version: "test" };
  setResourceTimings([]);
  trackListeners(window);
  trackListeners(document);
  runInlineScript();
});

afterEach(() => {
  for (const { target, type, fn, opts } of recordedListeners) {
    target.removeEventListener(type, fn, opts);
  }
  recordedListeners.length = 0;
  document.head.innerHTML = "";
  delete bootedWindow.next;
  if (originalGetEntriesByType) {
    Object.defineProperty(
      performance,
      "getEntriesByType",
      originalGetEntriesByType,
    );
  } else {
    delete (performance as unknown as Record<string, unknown>)
      .getEntriesByType;
  }
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("chunkRetryInlineScript", () => {
  it("re-injects a failed chunk script after a delay", () => {
    failScript(CHUNK_URL);
    expect(scriptsFor(CHUNK_URL)).toHaveLength(1);

    vi.advanceTimersByTime(300);

    const scripts = scriptsFor(CHUNK_URL);
    expect(scripts).toHaveLength(2);
    // The first retry must reuse the original URL to stay HTTP-cacheable.
    expect(scripts[1].src).toBe(CHUNK_URL);
  });

  it("cache-busts from the second retry on", () => {
    failScript(CHUNK_URL);
    vi.advanceTimersByTime(300);

    scriptsFor(CHUNK_URL)[1].dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(600);

    const scripts = scriptsFor(CHUNK_URL);
    expect(scripts).toHaveLength(3);
    expect(scripts[2].src).toContain("?chunkRetry=2-");
  });

  it("ignores scripts that are not Next.js chunks", () => {
    const foreign = "https://portal.example/static/scripts/api.js";
    failScript(foreign);

    vi.advanceTimersByTime(10_000);

    expect(scriptsFor(foreign)).toHaveLength(1);
  });

  it("retries failed CSS chunks", () => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = CSS_URL;
    document.head.appendChild(link);
    link.dispatchEvent(new Event("error"));

    vi.advanceTimersByTime(300);

    const links = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"]'),
    ).filter((el) => (el as HTMLLinkElement).href.startsWith(CSS_URL));
    expect(links).toHaveLength(2);
  });

  it("emulates the original bug: chunks fail while the window is minimized", () => {
    // Background throttling drops the chunk request while the window is
    // minimized (Firefox headless / manual minimize during editor load).
    setVisibility("hidden");
    failScript(CHUNK_URL);

    // The old behavior retried immediately with setTimeout and burned all
    // attempts in the still-hidden window. Now nothing happens in the
    // background no matter how long it stays minimized.
    vi.advanceTimersByTime(600_000);
    expect(scriptsFor(CHUNK_URL)).toHaveLength(1);

    // The user restores the window: the retry runs and can now succeed.
    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(300);

    expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
  });

  it("pauses retries while offline and resumes on reconnect", () => {
    // A mobile connection drops right as the chunks start loading.
    setOnline(false);
    failScript(CHUNK_URL);

    // Nothing is retried into the void, no matter how long the outage is.
    vi.advanceTimersByTime(600_000);
    expect(scriptsFor(CHUNK_URL)).toHaveLength(1);

    // Connectivity returns: the browser fires "online" and the retry runs.
    setOnline(true);
    window.dispatchEvent(new Event("online"));
    vi.advanceTimersByTime(300);

    expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
  });

  it("waits for both visibility and connectivity before retrying", () => {
    setVisibility("hidden");
    setOnline(false);
    failScript(CHUNK_URL);

    setOnline(true);
    window.dispatchEvent(new Event("online"));
    vi.advanceTimersByTime(600_000);
    expect(scriptsFor(CHUNK_URL)).toHaveLength(1);

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));
    vi.advanceTimersByTime(300);

    expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
  });

  it("grants a fresh retry budget when the connection returns", () => {
    exhaustRetries(CHUNK_URL);

    // Reconnecting resets the per-chunk attempt counters…
    window.dispatchEvent(new Event("online"));

    // …so the next failure retries again instead of burning a reload.
    const injected = scriptsFor(CHUNK_URL);
    injected[injected.length - 1].dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(300);

    expect(scriptsFor(CHUNK_URL).length).toBeGreaterThan(injected.length);
    expect(reloadMock).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBeNull();
  });

  it("defers the fallback reload until the connection returns", () => {
    exhaustRetries(CHUNK_URL);

    setOnline(false);
    const injected = scriptsFor(CHUNK_URL);
    injected[injected.length - 1].dispatchEvent(new Event("error"));

    // The budget is consumed immediately, but the reload waits for
    // connectivity.
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("1");
    expect(reloadMock).not.toHaveBeenCalled();

    setOnline(true);
    window.dispatchEvent(new Event("online"));

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("falls back to a single visibility-gated reload after retries are exhausted", () => {
    exhaustRetries(CHUNK_URL);

    // Retries are spent; the last failure happens while the tab is hidden.
    setVisibility("hidden");
    const injected = scriptsFor(CHUNK_URL);
    injected[injected.length - 1].dispatchEvent(new Event("error"));

    // The budget is consumed immediately, but the reload itself waits for
    // the window to become visible again.
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("1");
    expect(reloadMock).not.toHaveBeenCalled();

    setVisibility("visible");
    document.dispatchEvent(new Event("visibilitychange"));

    expect(reloadMock).toHaveBeenCalledTimes(1);

    // A second chunk exhausting its retries in the same incident must not
    // consume another reload from the budget.
    const otherChunk =
      "https://portal.example/doceditor/_next/static/chunks/app/page-2.js";
    exhaustRetries(otherChunk);
    const other = scriptsFor(otherChunk);
    other[other.length - 1].dispatchEvent(new Event("error"));

    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("1");
    expect(reloadMock).toHaveBeenCalledTimes(1);
  });

  it("stops reloading once the budget is spent", () => {
    window.sessionStorage.setItem(RELOAD_KEY, "2");

    exhaustRetries(CHUNK_URL);
    const injected = scriptsFor(CHUNK_URL);
    injected[injected.length - 1].dispatchEvent(new Event("error"));

    expect(reloadMock).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("2");
  });

  it("restores the reload budget after a healthy load", () => {
    window.sessionStorage.setItem(RELOAD_KEY, "2");

    window.dispatchEvent(new Event("load"));
    vi.advanceTimersByTime(10_000);

    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBeNull();
  });

  it("keeps the reload budget when the load saw a chunk failure", () => {
    window.sessionStorage.setItem(RELOAD_KEY, "2");

    failScript(CHUNK_URL);
    window.dispatchEvent(new Event("load"));
    vi.advanceTimersByTime(10_000);

    expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("2");
  });

  // Failures the error listener never saw: the bootstrap is inlined after
  // the stylesheets React hoists into <head>, so it does not run until they
  // have loaded, while chunk requests start (and can fail) as soon as the
  // parser sees their tags.
  describe("failures that fired before the bootstrap ran", () => {
    it("re-injects the chunks Resource Timing reports as failed", () => {
      delete bootedWindow.next;
      addSettledScript(CHUNK_URL);
      setResourceTimings([{ name: CHUNK_URL, responseStatus: 0 }]);

      settlePage();
      expect(scriptsFor(CHUNK_URL)).toHaveLength(1);
      vi.advanceTimersByTime(300);

      expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
      expect(reloadMock).not.toHaveBeenCalled();
    });

    it("trusts the newest entry: a chunk that failed and then loaded is left alone", () => {
      delete bootedWindow.next;
      const other =
        "https://portal.example/doceditor/_next/static/chunks/other-2.js";
      addSettledScript(CHUNK_URL);
      addSettledScript(other);
      setResourceTimings([
        { name: CHUNK_URL, responseStatus: 0 },
        { name: other, responseStatus: 0 },
        { name: `${other}?chunkRetry=2-1`, responseStatus: 200 },
      ]);

      settlePage();
      vi.advanceTimersByTime(300);

      expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
      expect(scriptsFor(other)).toHaveLength(1);
    });

    it("reloads a page that never booted when no failure can be attributed", () => {
      delete bootedWindow.next;
      addSettledScript(CHUNK_URL);
      setResourceTimings([]);

      settlePage();

      expect(reloadMock).toHaveBeenCalledTimes(1);
      expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("1");
    });

    it("reloads a page that never booted in a browser without Resource Timing statuses", () => {
      delete bootedWindow.next;
      addSettledScript(CHUNK_URL);
      setResourceTimings(undefined);

      settlePage();

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it("leaves a booted page alone", () => {
      addSettledScript(CHUNK_URL);
      // Even a stale failure entry is irrelevant once the runtime started.
      setResourceTimings([{ name: CHUNK_URL, responseStatus: 0 }]);

      settlePage();
      vi.advanceTimersByTime(10_000);

      expect(scriptsFor(CHUNK_URL)).toHaveLength(1);
      expect(reloadMock).not.toHaveBeenCalled();
    });

    it("waits for in-flight retries before judging the page", () => {
      delete bootedWindow.next;
      failScript(CHUNK_URL);

      // The retry is scheduled but has not settled: no verdict yet.
      settlePage();
      expect(reloadMock).not.toHaveBeenCalled();

      // The retry lands, the page still has not booted, nothing else is
      // attributable -> the bounded reload.
      const injected = scriptsFor(CHUNK_URL);
      injected[injected.length - 1].dispatchEvent(new Event("load"));
      vi.advanceTimersByTime(1000);

      expect(reloadMock).toHaveBeenCalledTimes(1);
    });

    it("never judges the page while a retry is deferred by the offline gate", () => {
      delete bootedWindow.next;
      setOnline(false);
      failScript(CHUNK_URL);

      settlePage();
      vi.advanceTimersByTime(60_000);

      expect(reloadMock).not.toHaveBeenCalled();
    });

    it("keeps the reload budget when the page never booted", () => {
      delete bootedWindow.next;
      window.sessionStorage.setItem(RELOAD_KEY, "2");

      settlePage();
      vi.advanceTimersByTime(10_000);

      expect(reloadMock).not.toHaveBeenCalled();
      expect(window.sessionStorage.getItem(RELOAD_KEY)).toBe("2");
    });

    it("does not wait for a load event that already fired", () => {
      // jsdom documents are complete from the start, so the instance from
      // beforeEach ran with readyState "complete" -- exactly the case of a
      // bootstrap that the stylesheets held back past the load event.
      expect(document.readyState).toBe("complete");
      delete bootedWindow.next;
      addSettledScript(CHUNK_URL);
      setResourceTimings([{ name: CHUNK_URL, responseStatus: 0 }]);

      // No load event is dispatched here.
      vi.advanceTimersByTime(1300);

      expect(scriptsFor(CHUNK_URL)).toHaveLength(2);
    });
  });
});

// The parameterized variant used by the Vite-built client app. The default
// instance from beforeEach stays active but ignores non-Next URLs, so the
// two do not interfere.
describe("buildChunkRetryInlineScript", () => {
  const VITE_PATTERN = "/static/(?:js/.+?\\.js|(?:styles|css)/.+?\\.css)";
  const VITE_URL =
    "https://portal.example/static/js/index.abc123.bundle.js";

  const runViteScript = () =>
    new Function(buildChunkRetryInlineScript(VITE_PATTERN))();

  it("retries assets matching the custom pattern", () => {
    runViteScript();

    failScript(VITE_URL);
    vi.advanceTimersByTime(300);

    expect(scriptsFor(VITE_URL)).toHaveLength(2);
  });

  it("preserves the module type on re-injected scripts", () => {
    runViteScript();

    const el = document.createElement("script");
    el.src = VITE_URL;
    el.type = "module";
    document.head.appendChild(el);
    el.dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(300);

    const scripts = scriptsFor(VITE_URL);
    expect(scripts).toHaveLength(2);
    expect(scripts[1].type).toBe("module");
  });

  it("retries the style bundle", () => {
    runViteScript();

    const cssUrl = "https://portal.example/static/styles/style.abc.css";
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssUrl;
    document.head.appendChild(link);
    link.dispatchEvent(new Event("error"));
    vi.advanceTimersByTime(300);

    const links = Array.from(
      document.head.querySelectorAll('link[rel="stylesheet"]'),
    ).filter((el) => (el as HTMLLinkElement).href.startsWith(cssUrl));
    expect(links).toHaveLength(2);
  });

  it("ignores assets outside the custom pattern", () => {
    runViteScript();

    const foreign = "https://portal.example/static/scripts/api.js";
    failScript(foreign);
    vi.advanceTimersByTime(10_000);

    expect(scriptsFor(foreign)).toHaveLength(1);
  });

  it("catches up on attributable failures but never reloads without a boot marker", () => {
    runViteScript();
    addSettledScript(VITE_URL);
    setResourceTimings([{ name: VITE_URL, responseStatus: 0 }]);

    settlePage();
    vi.advanceTimersByTime(300);
    expect(scriptsFor(VITE_URL)).toHaveLength(2);

    // The retry lands and nothing marks the app as started: without a
    // marker that is not evidence of a broken page.
    scriptsFor(VITE_URL)[1].dispatchEvent(new Event("load"));
    vi.advanceTimersByTime(10_000);
    expect(reloadMock).not.toHaveBeenCalled();
  });

  it("reloads a page that never booted when a boot marker is given", () => {
    new Function(buildChunkRetryInlineScript(VITE_PATTERN, "docspaceBooted"))();

    settlePage();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
