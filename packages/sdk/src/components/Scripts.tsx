// (c) Copyright Ascensio System SIA 2009-2024
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

interface RuntimeConfig {
  date: number;
  checksums: Record<string, string>;
}

const getRuntimeConfig = (): {
  runtime: Partial<RuntimeConfig>;
  hashDate: number;
} => {
  let runtime: Partial<RuntimeConfig> = {};
  const fallbackDate = new Date().getTime();

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    runtime = require("../../../runtime.json");
  } catch (e) {
    console.warn("Failed to load runtime.json:", e);
  }

  return {
    runtime,
    hashDate: runtime.date || fallbackDate,
  };
};

const { runtime, hashDate } = getRuntimeConfig();

const Scripts = () => {
  const getResourceHash = (resource: string): string => {
    return runtime.checksums?.[resource] || String(hashDate);
  };

  return (
    <>
      <Script
        id="browser-detector"
        src={`/static/scripts/browserDetector.js?hash=${getResourceHash("browserDetector.js")}`}
        strategy="beforeInteractive"
      />

      <Script id="portal-config" strategy="beforeInteractive">
        {`
          console.log("It's SDK INIT");
          fetch("/static/scripts/config.json?hash=${getResourceHash("config.json")}")
            .then((response) => {
              if (!response.ok) {
                throw new Error("HTTP error " + response.status);
              }
              return response.json();
            })
            .then((config) => {
              window.ClientConfig = {
                ...config,
              };
            })
            .catch((e) => {
              window.ClientConfig = {
                errorOnLoad: e,
              };
              console.error("Failed to load config:", e);
            });
          `}
      </Script>
    </>
  );
};

export default Scripts;
