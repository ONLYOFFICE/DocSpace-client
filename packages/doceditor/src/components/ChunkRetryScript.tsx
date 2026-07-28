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

const script = `
(function () {
  // Recovers Next.js static assets that failed to load (e.g. background
  // throttling in a minimized window / hidden tab aborts the requests).
  // Re-injecting a failed initial script lets it self-register in
  // webpackChunk and the bootstrap continues. For chunks requested via a
  // dynamic import() the webpack promise is already rejected by the time
  // the error fires, so re-injection only warms the cache — the page
  // reload fallback is what actually recovers that case.
  var ASSET_RE = /_next\\/static\\/(?:chunks\\/.+?\\.js|css\\/.+?\\.css)/;
  var MAX_RETRIES = 3;
  var MAX_RELOADS = 2;
  var RELOAD_KEY = "chunk-retry-reload-count";
  var attempts = {};
  var reloading = false;
  var hadFailure = false;

  // Retrying while the tab is still hidden would most likely fail for the
  // same reason the original load did, so wait for visibility first.
  function whenVisible(fn) {
    if (document.visibilityState === "visible") {
      fn();
      return;
    }
    document.addEventListener("visibilitychange", function handler() {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", handler);
      fn();
    });
  }

  function reloadCount() {
    try {
      return (
        parseInt(window.sessionStorage.getItem(RELOAD_KEY) || "0", 10) || 0
      );
    } catch (e) {
      // No sessionStorage (sandboxed SDK iframe, private mode): the
      // counter cannot survive a reload, so allowing reloads here could
      // loop forever. Disable the fallback in such environments.
      return MAX_RELOADS;
    }
  }

  function reloadFallback() {
    // Several chunks exhausting their retries in the same incident must
    // consume only one reload from the budget.
    if (reloading) return;
    var count = reloadCount();
    if (count >= MAX_RELOADS) return;
    reloading = true;
    try {
      window.sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    } catch (e) {}
    whenVisible(function () {
      window.location.reload();
    });
  }

  function bustUrl(base, attempt) {
    // The failure is a dropped request, not a poisoned cache, so the first
    // retry reuses the original URL and can still be served from the HTTP
    // cache; later retries bypass caches entirely.
    if (attempt < 2) return base;
    return (
      base +
      (base.indexOf("?") === -1 ? "?" : "&") +
      "chunkRetry=" + attempt + "-" + Date.now()
    );
  }

  function reinject(node, base) {
    var count = attempts[base] || 0;
    if (count >= MAX_RETRIES) {
      reloadFallback();
      return;
    }
    attempts[base] = count + 1;
    var attempt = attempts[base];
    var delay = 300 * Math.pow(2, count);

    whenVisible(function () {
      window.setTimeout(function () {
        var next;
        if (node.tagName === "LINK") {
          next = document.createElement("link");
          next.rel = "stylesheet";
          next.href = bustUrl(base, attempt);
        } else {
          next = document.createElement("script");
          next.src = bustUrl(base, attempt);
          next.async = node.async;
          if (node.type) next.type = node.type;
        }
        if (node.crossOrigin) next.crossOrigin = node.crossOrigin;
        if (node.integrity) next.integrity = node.integrity;
        var nonce = node.getAttribute("nonce");
        if (nonce) next.setAttribute("nonce", nonce);
        document.head.appendChild(next);
      }, delay);
    });
  }

  window.addEventListener(
    "error",
    function (event) {
      var node = event.target;
      if (!node || !node.tagName) return;
      var url;
      if (node.tagName === "SCRIPT") url = node.src || "";
      else if (node.tagName === "LINK" && node.rel === "stylesheet")
        url = node.href || "";
      else return;
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
  window.addEventListener("load", function () {
    window.setTimeout(function () {
      if (hadFailure) return;
      try {
        window.sessionStorage.removeItem(RELOAD_KEY);
      } catch (e) {}
    }, 10000);
  });
})();
`;

const ChunkRetryScript = () => {
  return (
    <script
      id="chunk-retry"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: bootstrap script must run before hydration to retry failed Next.js chunk loads
      dangerouslySetInnerHTML={{ __html: script }}
    />
  );
};

export default ChunkRetryScript;
