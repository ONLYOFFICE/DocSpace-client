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
// requests). It must run before any chunk <script> tag and survive on its
// own even when every other script fails, so it is serialized with
// Function.prototype.toString() and inlined into the document <head> (see
// doceditor ChunkRetryScript).
//
// Because of the serialization the function MUST stay fully
// self-contained: no imports and no references to anything outside its own
// scope. The unit test executes the serialized string, so a violation
// fails the suite.
const chunkRetryBootstrap = (assetPattern?: string) => {
  // Re-injecting a failed initial script lets it self-register in
  // webpackChunk and the bootstrap continues. For chunks requested via a
  // dynamic import() the webpack promise is already rejected by the time
  // the error fires, so re-injection only warms the cache — the page
  // reload fallback is what actually recovers that case.
  //
  // assetPattern (regex source) overrides the default Next.js asset URLs
  // for other bundlers — e.g. the Vite-built client app.
  const ASSET_RE = assetPattern
    ? new RegExp(assetPattern)
    : /_next\/static\/(?:chunks\/.+?\.js|css\/.+?\.css)/;
  const MAX_RETRIES = 3;
  const MAX_RELOADS = 2;
  const RELOAD_KEY = "chunk-retry-reload-count";
  let attempts: Record<string, number> = {};
  let reloading = false;
  let hadFailure = false;

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
        document.head.appendChild(next);
      }, delay);
    });
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
export const chunkRetryInlineScript = `(${chunkRetryBootstrap.toString()})();`;

// Same bootstrap for non-Next bundlers: pass the regex source matching the
// bundler's script/stylesheet URLs (e.g. Vite's /static/js/... in the
// client app).
export const buildChunkRetryInlineScript = (assetPattern: string) =>
  `(${chunkRetryBootstrap.toString()})(${JSON.stringify(assetPattern)});`;
