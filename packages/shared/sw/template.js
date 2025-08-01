// (c) Copyright Ascensio System SIA 2009-2025
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

import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { setCacheNameDetails, clientsClaim } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { googleFontsCache, imageCache, offlineFallback } from "workbox-recipes";
import { StaleWhileRevalidate } from "workbox-strategies";

// SETTINGS

// Claiming control to start runtime caching asap
clientsClaim();

// PRECACHING
const prefix = "docspace";

// Setting custom cache name
setCacheNameDetails({
  prefix,
  precache: "precache",
  runtime: "runtime",
  suffix: "v3.2.0",
});

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// STATIC RESOURCES

googleFontsCache({ cachePrefix: `${prefix}-gfonts` });

// TRANSLATIONS

registerRoute(
  ({ url }) => url.pathname.indexOf("/locales/") !== -1,
  // Use cache but update in the background.
  new StaleWhileRevalidate({
    // Use a custom cache name.
    cacheName: `${prefix}-translation`,
  }),
);

// CONTENT

imageCache({ cacheName: `${prefix}-images`, maxEntries: 60 });

// APP SHELL UPDATE FLOW

addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// FALLBACK

offlineFallback({
  pageFallback: "/static/offline/offline.html",
  imageFallback: "/static/offline/offline.svg",
  fontFallback: false,
});
