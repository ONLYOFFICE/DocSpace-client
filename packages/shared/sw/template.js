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

importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/7.3.0/workbox-sw.js",
);

if (!self.workbox) {
  console.error("Workbox failed to load in the Service Worker");
} else {
  console.log("Workbox loaded in the Service Worker");
}

const {
  precaching,
  routing,
  strategies,
  expiration,
  cacheableResponse,
  recipes,
  core,
} = self.workbox || {};

precaching && precaching.precacheAndRoute(self.__WB_MANIFEST || []);
precaching && precaching.cleanupOutdatedCaches();

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

core &&
  core.setCacheNameDetails({
    prefix: "docspace",
    suffix: "v3.3.0",
    precache: "precache",
    runtime: "runtime",
  });

const cacheNames = core
  ? core.cacheNames
  : {
      precache: "docspace-precache-v3.3.0",
      runtime: "docspace-runtime-v3.3.0",
    };

routing &&
  routing.registerRoute(
    ({ url }) => url.pathname.includes("/locales/"),
    new strategies.StaleWhileRevalidate({
      cacheName: `${cacheNames.runtime}-translations`,
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 1 day
        }),
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

const ssrPaths = [
  /^\/login(\/|$)/,
  /^\/management(\/|$)/,
  /^\/doceditor(\/|$)/,
  /^\/sdk(\/|$)/,
];
routing &&
  routing.registerRoute(
    ({ request, url }) =>
      request.mode === "navigate" &&
      ssrPaths.some((re) => re.test(url.pathname)),
    new strategies.NetworkOnly(),
  );

routing &&
  routing.registerRoute(
    ({ request, url }) =>
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "font" ||
      /\.(js|css|woff2?|ttf)$/.test(url.pathname),
    new strategies.CacheFirst({
      cacheName: `${cacheNames.runtime}-static`,
      plugins: [
        new expiration.ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    }),
  );

recipes &&
  recipes.imageCache({
    cacheName: `${cacheNames.runtime}-images`,
    maxEntries: 60,
  });

recipes &&
  recipes.googleFontsCache({ cachePrefix: `${cacheNames.runtime}-gfonts` });

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

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

console.log("DocSpace Service Worker v3.3.0 activated with Workbox");
