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

import path from "path";
import { http } from "msw";
import fs from "fs";

// Source locale roots, mirroring the production copy-locales plugin: the
// client owns most namespaces, the repo-root public holds the shared ones
// (Common, etc.). `__dirname` is .../packages/shared/__mocks__/handlers/statics.
const CLIENT_LOCALES_ROOT = path.join(
  __dirname,
  "../../../../client/public/locales",
);
const SHARED_LOCALES_ROOT = path.join(__dirname, "../../../../../public/locales");

// Build the `{ [namespace]: translations }` bundle for a language by merging
// every namespace file from both source roots. Mirrors `buildCombinedLocales`
// in config/plugins/copy-locales.ts so the mock serves the same shape the
// production build emits (the `_combined.json` file only exists in `dist`, not
// in the source tree the rest of this handler reads from).
const buildCombinedBundle = (language: string) => {
  const bundle: Record<string, unknown> = {};

  for (const root of [CLIENT_LOCALES_ROOT, SHARED_LOCALES_ROOT]) {
    let langDir = path.join(root, language);
    if (!fs.existsSync(langDir)) langDir = path.join(root, "en");
    if (!fs.existsSync(langDir)) continue;

    for (const file of fs.readdirSync(langDir)) {
      if (!file.endsWith(".json") || file === "_combined.json") continue;
      const ns = file.slice(0, -".json".length);
      try {
        bundle[ns] = JSON.parse(
          fs.readFileSync(path.join(langDir, file), "utf-8"),
        );
      } catch {
        // skip malformed namespace, keep the rest of the bundle usable
      }
    }
  }

  return bundle;
};

export const localesHandler = () => {
  return http.get("*/**/locales/**", async ({ request }) => {
    try {
      const url = request.url;

      // Skip campaign locales - they are handled by campaignsHandler
      if (url.includes("/campaigns/locales/")) {
        return;
      }

      const hasStatic = url.includes("static");
      const local = url.split("/locales/").at(-1)!.split("?")[0];

      // Production builds bundle every namespace into one `_combined.json` per
      // language. That file is emitted only into `dist`, so assemble it from the
      // source namespace files here instead of returning the empty `{}` fallback.
      if (local.endsWith("/_combined.json")) {
        const language = local.split("/")[0];
        return new Response(JSON.stringify(buildCombinedBundle(language)), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const localePath = hasStatic
        ? `../../../../../public/locales/${local}`
        : `../../../../client/public/locales/${local}`;
      const localeFullPath = path.join(__dirname, localePath);

      // Check if file exists, fallback to en if not
      if (!fs.existsSync(localeFullPath)) {
        const enLocal = local.replace(/^[a-z]{2}(-[A-Z]{2})?\//, "en/");
        const enLocalePath = hasStatic
          ? `../../../../../public/locales/${enLocal}`
          : `../../../../client/public/locales/${enLocal}`;
        const enLocaleFullPath = path.join(__dirname, enLocalePath);

        if (fs.existsSync(enLocaleFullPath)) {
          const localeContent = fs.readFileSync(enLocaleFullPath, "utf-8");
          return new Response(localeContent, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        // Return empty object if no locale found
        return new Response("{}", {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      const localeContent = fs.readFileSync(localeFullPath, "utf-8");

      return new Response(localeContent, {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Error reading locale file:", error);
      // Return empty object instead of error to prevent JSON parse errors
      return new Response("{}", {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  });
};
