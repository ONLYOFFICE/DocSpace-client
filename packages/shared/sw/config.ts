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

import packageJson from "../package.json";

const APP_VERSION = packageJson.version;

export interface CacheConfig {
  maxEntries: number;
  maxAgeSeconds: number;
}

export interface RoutePattern {
  pattern: RegExp;
  description: string;
}

export interface NavigationConfig {
  ssrApps: RoutePattern[];
  denylist: RoutePattern[];
}

export interface SWConfig {
  version: string;
  cachePrefix: string;
  cacheSuffix: string;
  navigation: NavigationConfig;
  cache: {
    static: CacheConfig;
    i18n: CacheConfig;
  };
  updateInterval: number;
  debug: boolean;
}

export const SW_CONFIG: SWConfig = {
  version: APP_VERSION,
  cachePrefix: "docspace",
  cacheSuffix: `v${APP_VERSION}`,

  navigation: {
    ssrApps: [
      {
        pattern: /^\/login(\/|$)/,
        description: "Login app - Next.js SSR authentication pages",
      },
      {
        pattern: /^\/management(\/|$)/,
        description: "Management app - Next.js SSR admin portal",
      },
      {
        pattern: /^\/doceditor(\/|$)/,
        description: "DocEditor app - Next.js SSR document editor",
      },
      {
        pattern: /^\/sdk(\/|$)/,
        description: "SDK app - Next.js SSR developer documentation",
      },
    ],

    denylist: [
      {
        pattern: /^\/__/,
        description: "Internal paths (Webpack HMR, debug endpoints)",
      },
      {
        pattern: /\/[^/?]+\.[^/]+$/,
        description:
          "Direct file access with extensions (bypasses SPA routing)",
      },
    ],
  },

  cache: {
    static: {
      maxEntries: 60,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
    i18n: {
      maxEntries: 50,
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    },
  },

  updateInterval: 60 * 60 * 1000, // 1 hour
  debug: false,
};

export default SW_CONFIG;
