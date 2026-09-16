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

// Bootstrap that recovers Next.js static assets that failed to load (e.g.
// background throttling in a minimized window / hidden tab aborts the
// requests). It must survive on its own even when every other script fails,
// so it is serialized with Function.prototype.toString() and inlined into
// the document <head> (see the shared ChunkRetryScript component).
//
// It cannot be the first thing that runs, though. React hoists the app's
// stylesheets and Next's async chunk <script> tags above everything the
// layout puts in <head>, and an inline script does not execute until every
// stylesheet before it has loaded. Chunk requests start as soon as the
// parser sees the tags, so a chunk that fails fast fails while this script
// is still waiting for the CSS -- its error event is dispatched with nobody
// listening. The error listener below therefore only covers failures that
// happen after the CSS arrived; the catch-up in `check` covers the rest by
// reading the failed fetches back out of Resource Timing once the page has
// finished loading.
//
// Because of the serialization the function MUST stay fully
// self-contained: no imports and no references to anything outside its own
// scope. The unit test executes the serialized string, so a violation
// fails the suite.
//
// assetPattern (regex source) overrides the default Next.js asset URLs for
// other bundlers -- e.g. the Vite-built client app. bootMarker names a
// window property the app's runtime defines once it has started (Next sets
// `window.next`); with it the bootstrap can tell a page that silently never
// booted from a healthy one and fall back to a reload for it.
const chunkRetryBootstrap = (assetPattern?: string, bootMarker?: string) => {
  // Re-injecting a failed initial script lets it self-register in
  // webpackChunk and the bootstrap continues. For chunks requested via a
  // dynamic import() the webpack promise is already rejected by the time
  // the error fires, so re-injection only warms the cache — the page
  // reload fallback is what actually recovers that case.
  const ASSET_RE = assetPattern
    ? new RegExp(assetPattern)
    : /_next\/static\/(?:chunks\/.+?\.js|css\/.+?\.css)/;
  const MAX_RETRIES = 3;
  const MAX_RELOADS = 2;
  const RELOAD_KEY = "chunk-retry-reload-count";
  // How long after the page settles before judging whether it booted. Every
  // initial script has executed by the load event, so this only absorbs
  // scheduling slack.
  const HEALTH_GRACE = 1000;
  let attempts: Record<string, number> = {};
  let reloading = false;
  let hadFailure = false;
  // Retries scheduled, deferred or in flight. While it is non-zero the page
  // is still being repaired and must not be judged.
  let pending = 0;
  let caughtUp = false;
  let checkTimer: number | undefined;

  // Retrying while the tab is still hidden or the device is offline would
  // most likely fail for the same reason the original load did, so wait
  // until the page is both visible and connected. onLine === false is the
  // only reliable signal (true does not guarantee connectivity), which is
  // why it may only defer a retry, never cancel one.
  const isReady = () =>
    document.visibilityState === "visible" && navigator.onLine !== false;

  const whenReady = (fn: () => void) => {
    if (isReady()) {
      fn();
      return;
    }
    const handler = () => {
      if (!isReady()) return;
      document.removeEventListener("visibilitychange", handler);
      window.removeEventListener("online", handler);
      fn();
    };
    document.addEventListener("visibilitychange", handler);
    window.addEventListener("online", handler);
  };

  // Failures while offline say nothing about the assets themselves, so a
  // restored connection grants every chunk a fresh retry budget.
  window.addEventListener("online", () => {
    attempts = {};
  });

  const reloadCount = () => {
    try {
      return (
        parseInt(window.sessionStorage.getItem(RELOAD_KEY) || "0", 10) || 0
      );
    } catch {
      // No sessionStorage (sandboxed SDK iframe, private mode): the
      // counter cannot survive a reload, so allowing reloads here could
      // loop forever. Disable the fallback in such environments.
      return MAX_RELOADS;
    }
  };

  const reloadFallback = () => {
    // Several chunks exhausting their retries in the same incident must
    // consume only one reload from the budget.
    if (reloading) return;
    // Reaching for a reload means this load was not healthy, whatever the
    // error listener saw -- the budget restore below must not clear the
    // count, or a page that stays broken would reload on every visit.
    hadFailure = true;
    const count = reloadCount();
    if (count >= MAX_RELOADS) return;
    reloading = true;
    try {
      window.sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    } catch {
      // Unreachable: reloadCount() already exhausted the budget above.
    }
    whenReady(() => {
      window.location.reload();
    });
  };

  const bustUrl = (base: string, attempt: number) => {
    // The failure is a dropped request, not a poisoned cache, so the first
    // retry reuses the original URL and can still be served from the HTTP
    // cache; later retries bypass caches entirely.
    if (attempt < 2) return base;
    const separator = base.indexOf("?") === -1 ? "?" : "&";
    return `${base + separator}chunkRetry=${attempt}-${Date.now()}`;
  };

  const reinject = (
    node: HTMLScriptElement | HTMLLinkElement,
    base: string,
  ) => {
    const count = attempts[base] || 0;
    if (count >= MAX_RETRIES) {
      reloadFallback();
      return;
    }
    attempts[base] = count + 1;
    const attempt = attempts[base];
    const delay = 300 * 2 ** count;
    pending += 1;

    whenReady(() => {
      window.setTimeout(() => {
        let next: HTMLScriptElement | HTMLLinkElement;
        if (node.tagName === "LINK") {
          next = document.createElement("link");
          next.rel = "stylesheet";
          next.href = bustUrl(base, attempt);
        } else {
          next = document.createElement("script");
          next.src = bustUrl(base, attempt);
          next.async = (node as HTMLScriptElement).async;
          if (node.type) next.type = node.type;
        }
        if (node.crossOrigin) next.crossOrigin = node.crossOrigin;
        if (node.integrity) next.integrity = node.integrity;
        const nonce = node.getAttribute("nonce");
        if (nonce) next.setAttribute("nonce", nonce);
        // The window listener sees a failure of this node first (capture
        // phase) and schedules the next attempt before `settle` runs, so
        // `pending` never drops to zero between two attempts.
        const settle = () => {
          pending -= 1;
          scheduleCheck();
        };
        next.addEventListener("load", settle);
        next.addEventListener("error", settle);
        document.head.appendChild(next);
      }, delay);
    });
  };

  const booted = () =>
    Boolean(
      bootMarker &&
        (window as unknown as Record<string, unknown>)[bootMarker],
    );

  // Assets whose failure the error listener never saw, because they failed
  // while this script was still blocked behind the stylesheets. Resource
  // Timing records every fetch, failed ones included: a network error shows
  // up as responseStatus 0. The newest entry per URL wins, so an asset that
  // failed once and then loaded (a preload followed by the real request, or
  // an earlier retry) is not counted. Returns null where the browser does
  // not report responseStatus at all, so the caller can tell "no failures"
  // from "cannot know".
  const missedFailures = () => {
    if (
      typeof performance === "undefined" ||
      typeof performance.getEntriesByType !== "function"
    ) {
      return null;
    }
    const entries = performance.getEntriesByType("resource") as Array<
      PerformanceResourceTiming & { responseStatus?: number }
    >;
    const outcome: Record<string, number> = {};
    let reported = false;
    for (const entry of entries) {
      if (typeof entry.responseStatus !== "number") continue;
      if (!ASSET_RE.test(entry.name)) continue;
      reported = true;
      outcome[entry.name.split("?")[0]] = entry.responseStatus;
    }
    if (!reported) return null;

    const failed: Array<[HTMLScriptElement | HTMLLinkElement, string]> = [];
    const seen: Record<string, boolean> = {};
    const nodes = document.querySelectorAll<
      HTMLScriptElement | HTMLLinkElement
    >('script[src], link[rel="stylesheet"]');
    nodes.forEach((node) => {
      const url =
        node.tagName === "SCRIPT"
          ? (node as HTMLScriptElement).src
          : (node as HTMLLinkElement).href;
      const base = url.split("?")[0];
      if (seen[base] || outcome[base] !== 0) return;
      seen[base] = true;
      failed.push([node, base]);
    });
    return failed;
  };

  // Runs once the page has settled: after the load event and again whenever
  // the last outstanding retry finishes. A page whose runtime never started
  // is repaired by re-injecting whatever Resource Timing says failed; if
  // that leaves nothing to attribute the failure to, the bounded reload is
  // the only remaining option.
  const check = () => {
    if (reloading || pending > 0 || booted()) return;
    if (!caughtUp) {
      caughtUp = true;
      const missed = missedFailures();
      if (missed && missed.length > 0) {
        hadFailure = true;
        for (const [node, base] of missed) reinject(node, base);
        return;
      }
    }
    if (bootMarker) reloadFallback();
  };

  const scheduleCheck = () => {
    window.clearTimeout(checkTimer);
    checkTimer = window.setTimeout(check, HEALTH_GRACE);
  };

  window.addEventListener(
    "error",
    (event) => {
      const node = event.target as
        | HTMLScriptElement
        | HTMLLinkElement
        | null;
      if (!node || !node.tagName) return;
      let url: string;
      if (node.tagName === "SCRIPT") {
        url = (node as HTMLScriptElement).src || "";
      } else if (
        node.tagName === "LINK" &&
        (node as HTMLLinkElement).rel === "stylesheet"
      ) {
        url = (node as HTMLLinkElement).href || "";
      } else {
        return;
      }
      if (!ASSET_RE.test(url)) return;
      hadFailure = true;
      reinject(node, url.split("?")[0]);
    },
    true,
  );

  // The stylesheets that delayed this script may have been the last thing
  // the page was waiting for, in which case the load event already fired.
  if (document.readyState === "complete") scheduleCheck();
  else window.addEventListener("load", scheduleCheck);

  // Restore the reload budget once the page proves healthy so a later,
  // unrelated incident in the same tab still has a working fallback. Skip
  // it if this load saw any asset failure — otherwise a permanently broken
  // page would clear the counter and reload forever.
  window.addEventListener("load", () => {
    window.setTimeout(() => {
      if (hadFailure) return;
      try {
        window.sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        // Nothing to clean up when sessionStorage is unavailable.
      }
    }, 10000);
  });
};

// Serialized once at module load; type annotations are erased by the
// transpiler before toString() ever runs, so the string is plain JS.
// `window.next` is what Next's client bootstrap defines first, before it
// requires any application module.
export const chunkRetryInlineScript = `(${chunkRetryBootstrap.toString()})(void 0, "next");`;

// Same bootstrap for non-Next bundlers: pass the regex source matching the
// bundler's script/stylesheet URLs (e.g. Vite's /static/js/... in the
// client app), and optionally the window property that marks a started
// runtime. Without a marker the bootstrap still retries every failure it
// can attribute but never falls back to a reload for a page that stayed
// blank.
export const buildChunkRetryInlineScript = (
  assetPattern: string,
  bootMarker?: string,
) =>
  `(${chunkRetryBootstrap.toString()})(${JSON.stringify(assetPattern)}, ${JSON.stringify(bootMarker)});`;
