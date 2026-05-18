// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
