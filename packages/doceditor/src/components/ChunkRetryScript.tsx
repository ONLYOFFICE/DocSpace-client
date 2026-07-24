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
  var CHUNK_RE = /_next\\/static\\/chunks\\/.+?\\.js/;
  var MAX_RETRIES = 3;
  var MAX_RELOADS = 2;
  var RELOAD_KEY = "chunk-retry-reload-count";
  var attempts = {};

  function reloadCount() {
    try {
      return parseInt(window.sessionStorage.getItem(RELOAD_KEY) || "0", 10) || 0;
    } catch (e) {
      return MAX_RELOADS;
    }
  }

  function reloadFallback() {
    var count = reloadCount();
    if (count >= MAX_RELOADS) return;
    try {
      window.sessionStorage.setItem(RELOAD_KEY, String(count + 1));
    } catch (e) {}
    window.location.reload();
  }

  function reinject(node, base) {
    var count = attempts[base] || 0;
    if (count >= MAX_RETRIES) {
      reloadFallback();
      return;
    }
    attempts[base] = count + 1;

    var delay = 300 * Math.pow(2, count);
    window.setTimeout(function () {
      var next = document.createElement("script");
      next.src = base + (base.indexOf("?") === -1 ? "?" : "&") + "chunkRetry=" + attempts[base] + "-" + Date.now();
      next.async = node.async;
      next.defer = node.defer;
      if (node.type) next.type = node.type;
      if (node.crossOrigin) next.crossOrigin = node.crossOrigin;
      if (node.integrity) next.integrity = node.integrity;
      var nonce = node.getAttribute("nonce");
      if (nonce) next.setAttribute("nonce", nonce);
      document.head.appendChild(next);
    }, delay);
  }

  window.addEventListener(
    "error",
    function (event) {
      var node = event.target;
      if (!node || node.tagName !== "SCRIPT") return;
      var src = node.src || "";
      if (!CHUNK_RE.test(src)) return;
      reinject(node, src.split("?")[0]);
    },
    true,
  );
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
