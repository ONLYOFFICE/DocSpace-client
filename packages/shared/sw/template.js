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
import { registerRoute } from "workbox-routing";
import { CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { imageCache, googleFontsCache } from "workbox-recipies";

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

const CACHE_PREFIX = "docspace-v3.2.1";
const CACHE_NAMES = {
  static: `${CACHE_PREFIX}-static`,
  images: `${CACHE_PREFIX}-images`,
  translations: `${CACHE_PREFIX}-translations`,
  gfonts: `${CACHE_PREFIX}-gfonts`,
};

const bgSyncPlugin = new BackgroundSyncPlugin("apiQueue", {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours (specified in minutes)
});

registerRoute(
  ({ url }) => url.pathname.includes("/locales/"),
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.translations,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) =>
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    /\.(js|css|woff2?|ttf)$/.test(url.pathname),
  new CacheFirst({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

imageCache({ cacheName: CACHE_NAMES.images, maxEntries: 60 });

/* registerRoute(
  ({ request, url }) =>
    request.destination === "image" ||
    /\.(png|jpg|jpeg|gif|svg|webp|ico)$/.test(url.pathname),
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
); */

googleFontsCache({ cachePrefix: CACHE_PREFIX.gfonts });

/* registerRoute(
  ({ url }) =>
    url.origin === "https://fonts.googleapis.com" ||
    url.origin === "https://fonts.gstatic.com",
  new CacheFirst({
    cacheName: CACHE_NAMES.gfonts,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
); */

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

if ("sync" in self.registration) {
  self.addEventListener("sync", (event) => {
    if (event.tag === "background-sync") {
      event.waitUntil(doBackgroundSync());
    }
  });
}

async function doBackgroundSync() {
  try {
    console.log("Background sync triggered");
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      if (clients.length > 0) {
        return clients[0].focus();
      }
      return self.clients.openWindow("/");
    }),
  );
});

console.log("DocSpace Service Worker v3.2.1 activated with Workbox");
