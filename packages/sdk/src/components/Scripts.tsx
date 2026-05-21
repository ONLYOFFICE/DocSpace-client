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

import Script from "next/script";

import { getStaticHash } from "@docspace/shared/utils/static-hash";

const browserDetectorHash = getStaticHash("browserDetector.js");
const configHash = getStaticHash("config.json");

const Scripts = () => {
  return (
    <>
      <Script
        id="browser-detector"
        src={`/static/scripts/browserDetector.js?hash=${browserDetectorHash}`}
        strategy="beforeInteractive"
      />

      <Script id="portal-config" strategy="beforeInteractive">
        {`
          console.log("It's SDK INIT");
          (function () {
            var url = "/static/scripts/config.json?hash=${configHash}";
            var backoffs = [0, 300, 900];
            var hasTimeout = typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function";
            function attempt(i) {
              var init = hasTimeout ? { signal: AbortSignal.timeout(5000) } : {};
              return fetch(url, init)
                .then(function (res) {
                  if (!res.ok) throw new Error("HTTP " + res.status);
                  return res.json();
                })
                .catch(function (err) {
                  if (i + 1 < backoffs.length) {
                    return new Promise(function (r) { setTimeout(r, backoffs[i + 1]); })
                      .then(function () { return attempt(i + 1); });
                  }
                  throw err;
                });
            }
            attempt(0)
              .then(function (config) {
                window.ClientConfig = Object.assign({}, window.ClientConfig, config);
              })
              .catch(function (err) {
                window.ClientConfig = Object.assign(
                  { api: { origin: window.location.origin } },
                  window.ClientConfig,
                  { errorOnLoad: String(err) }
                );
                console.error("Failed to load config after retries:", err);
              });
          })();
          `}
      </Script>
    </>
  );
};

export default Scripts;
