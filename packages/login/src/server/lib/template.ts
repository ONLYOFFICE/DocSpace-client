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

import { getScripts } from "./helpers";
import pkg from "../../../package.json";
import { getLogoFromPath } from "@docspace/shared/utils";

import fontsCssUrl from "PUBLIC_DIR/css/fonts.css?url";

const { title } = pkg;
const organizationName = "ONLYOFFICE"; //TODO: Replace to API variant

type Template = (
  initLoginState: IInitialState,
  appComponent: string,
  styleTags: string,
  initialI18nStoreASC: object,
  initialLanguage: string,
  assets: assetsType,
  t?: TFuncType
) => string;

const template: Template = (
  initLoginState,
  appComponent,
  styleTags,
  initialI18nStoreASC,
  initialLanguage,
  assets,
  t
) => {
  const documentTitle = t
    ? `${t("Common:Authorization")} - ${organizationName}`
    : title;

  const favicon = getLogoFromPath(
    initLoginState?.logoUrls && initLoginState?.logoUrls[2]?.path?.light
  );

  let clientScripts =
    assets && assets.hasOwnProperty("client.js")
      ? `<script defer="defer" src='${assets["client.js"]}'></script>`
      : "";

  if (!IS_DEVELOPMENT) {
    const productionBundleKeys = getScripts(assets);
    if (productionBundleKeys && typeof assets === "object")
      productionBundleKeys.map((key) => {
        clientScripts =
          clientScripts +
          `<script defer="defer" src='${assets[key]}'></script>`;
      });
  }

  const initialLoginStateStringify = JSON.stringify(initLoginState);

  const lt = /</g,
    gt = />/g;

  const initialLoginStateString = initialLoginStateStringify
    .replace(lt, "&lt;")
    .replace(gt, "&gt;");

  const scripts = `   
    <script id="__ASC_INITIAL_LOGIN_STATE__">
      window.__ASC_INITIAL_LOGIN_STATE__ = ${initialLoginStateString}
    </script>
    <script id="__ASC_INITIAL_LOGIN_I18N__">
      window.initialI18nStoreASC = ${JSON.stringify(initialI18nStoreASC)}
      window.initialLanguage = '${initialLanguage}'
    </script>
    ${clientScripts}
    <script>
      console.log("It's Login INIT");
      fetch("${CONFIG_URL}")
      .then((response) => {
        if (!response.ok) {
          throw new Error("HTTP error " + response.status);
        }
        return response.json();
      })
      .then((config) => {
        window.DocSpaceConfig = {
          ...config,
        };

        if (window.navigator.userAgent.includes("ZoomWebKit") || window.navigator.userAgent.includes("ZoomApps")) {
          window.DocSpaceConfig.editor = {
            openOnNewPage: false,
            requestClose: true
          };
        }
      })
      .catch((e) => {
        console.error(e);
      });
    </script>
`;

  const page = `
    <!DOCTYPE html>
    <html lang="en" translate="no">
      <head>
        <meta charset="utf-8">
        <title> ${documentTitle} </title>
        <meta charset="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
        <meta name="google" content="notranslate" />
        <link  rel="stylesheet preload" href=${fontsCssUrl}  as="style" type="text/css" crossorigin/>

        <link id="favicon" rel="shortcut icon" href=${favicon} />
        <link rel="manifest" href="/manifest.json" />
        <!-- Tell the browser it's a PWA -->
        <!-- <meta name="mobile-web-app-capable" content="yes" /> -->
        <!-- Tell iOS it's a PWA -->
        <!-- <meta name="apple-mobile-web-app-capable" content="yes" /> -->
        <!-- <link rel="apple-touch-icon" href="/appIcon-180.png" /> -->

        <link rel="apple-touch-icon" href=${favicon} />
        <link rel="android-touch-icon" href=${favicon} />


        ${styleTags}   
      </head>
      <body>
        <noscript> You need to enable JavaScript to run this app. </noscript>
        <div id="root">${appComponent}</div>
        <script src=${BROWSER_DETECTOR_URL}></script>
        ${scripts}
      </body>
    </html>
  `;

  return page;
};

export default template;
