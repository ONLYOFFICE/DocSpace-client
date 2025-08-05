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

import type { InjectManifestOptions } from "workbox-build";

const config: InjectManifestOptions = {
  globDirectory: "../../../publish/web",
  swSrc: "sw/template.js",
  swDest: "../../../client/web/public/sw.js",

  globPatterns: [
    // Critical resources
    "**/*.{html,json}",
    // Static assets
    "**/*.{css,js}",
    // Icons and images (limit size for performance)
    "**/*.{ico,png,svg,webp}",
    // Fonts (modern formats)
    "**/*.{woff2,woff}",
    // Manifest and service worker related
    "**/manifest.json",
    "**/offline.html",
  ],

  globIgnores: [
    // Build artifacts and configs
    "**/node_modules/**",
    "**/.*",
    "**/*.map",
    "**/*.config.*",

    // Large media files that shouldn't be precached
    "**/*.{mp4,mp3,avi,mov,mkv}",
    "**/*.{zip,tar,gz,rar}",

    // Development files
    "**/*.{log,tmp,temp}",
    "**/test/**",
    "**/tests/**",
    "**/*.test.*",
    "**/*.spec.*",

    // Documentation and readme files
    "**/*.md",
    "**/README*",
    "**/LICENSE*",

    // Next.js specific ignores
    "**/_next/static/chunks/webpack-*.js",
    "**/buildManifest.js",
    "**/ssgManifest.js",

    // Large JSON files that change frequently
    "**/locales/**/*.json",
  ],

  // Maximum file size to precache (3MB)
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
};

export default config;
