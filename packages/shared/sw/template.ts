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

import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import {
  StaleWhileRevalidate,
  CacheFirst,
  NetworkFirst,
} from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { SW_CONFIG } from "./config";

interface ExtendableEvent extends Event {
  waitUntil(fn: Promise<unknown>): void;
}

interface ExtendableMessageEvent extends ExtendableEvent {
  data: unknown;
}

interface Clients {
  claim(): Promise<void>;
}

interface ServiceWorkerGlobalScope {
  addEventListener(
    type: "activate",
    listener: (event: ExtendableEvent) => void,
  ): void;
  addEventListener(
    type: "message",
    listener: (event: ExtendableMessageEvent) => void,
  ): void;
  skipWaiting(): Promise<void>;
  clients: Clients;
  __WB_MANIFEST: Array<{ url: string; revision: string | null }>;
}

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

const navigationRoute = new NavigationRoute(
  createHandlerBoundToURL("/index.html"),
  {
    allowlist: [/^(?!.*\/(login|management|doceditor|sdk)(\/|$)).*$/],
    denylist: [/^\/__/, /\/[^/?]+\.[^/]+$/],
  },
);

registerRoute(navigationRoute);

registerRoute(
  ({ url }) =>
    url.pathname.includes("/locales/") && url.pathname.endsWith(".json"),
  new StaleWhileRevalidate({
    cacheName: `${SW_CONFIG.cachePrefix}-translations-${SW_CONFIG.cacheSuffix}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: SW_CONFIG.cache.translations.maxEntries,
        maxAgeSeconds: SW_CONFIG.cache.translations.maxAgeSeconds,
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "worker",
  new CacheFirst({
    cacheName: `${SW_CONFIG.cachePrefix}-static-${SW_CONFIG.cacheSuffix}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: SW_CONFIG.cache.static.maxEntries,
        maxAgeSeconds: SW_CONFIG.cache.static.maxAgeSeconds,
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ request }) => request.destination === "image",
  new CacheFirst({
    cacheName: `${SW_CONFIG.cachePrefix}-images-${SW_CONFIG.cacheSuffix}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: SW_CONFIG.cache.images.maxEntries,
        maxAgeSeconds: SW_CONFIG.cache.images.maxAgeSeconds,
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

registerRoute(
  ({ url }) => url.pathname.startsWith("/api/"),
  new NetworkFirst({
    cacheName: `${SW_CONFIG.cachePrefix}-api-${SW_CONFIG.cacheSuffix}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
);

self.addEventListener("activate", (event: ExtendableEvent) => {
  if (SW_CONFIG.debug) {
    console.log("[SW] Activating service worker version:", SW_CONFIG.version);
  }

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const currentCacheName = SW_CONFIG.cacheSuffix;

      await Promise.all(
        cacheNames
          .filter(
            (cacheName) =>
              cacheName.startsWith(SW_CONFIG.cachePrefix) &&
              !cacheName.includes(currentCacheName),
          )
          .map((cacheName) => {
            if (SW_CONFIG.debug) {
              console.log("[SW] Deleting old cache:", cacheName);
            }
            return caches.delete(cacheName);
          }),
      );

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event: ExtendableMessageEvent) => {
  const data = event.data as { type?: string };
  if (data && data.type === "SKIP_WAITING") {
    if (SW_CONFIG.debug) {
      console.log("[SW] Skipping waiting phase");
    }
    self.skipWaiting();
  }
});

if (SW_CONFIG.debug) {
  console.log(`[SW] Service Worker initialized - version ${SW_CONFIG.version}`);
  console.log("[SW] Configuration:", SW_CONFIG);
}
