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

import { type Plugin } from "vite";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { rootDir } from "../utils";

// The client owns most namespaces; the repo-root public holds the shared ones
// (Common, etc.). Both feed the combined bundle and its hash.
const localeSrcRoots = () => [
  path.resolve(rootDir, "public/locales"),
  path.resolve(rootDir, "../../public/locales"),
];

// ---------------------------------------------------------------------------
// Custom plugin: copy and minify locale JSON files to dist/ (production build)
// Replaces Webpack's CopyPlugin with minifyJson transform.
// ---------------------------------------------------------------------------
function copyAndMinifyLocales(src: string, dest: string) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyAndMinifyLocales(srcPath, destPath);
    } else if (entry.name.endsWith(".json")) {
      try {
        const content = JSON.parse(fs.readFileSync(srcPath, "utf-8"));
        fs.writeFileSync(destPath, JSON.stringify(content), "utf-8");
      } catch {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  }
}

// Mirror getLanguage() so combined files are keyed exactly like the runtime
// lookup (en-US/en-GB → en, xx-Xx → xx).
function normalizeLanguage(lng: string) {
  let language = lng === "en-US" || lng === "en-GB" ? "en" : lng;
  const splitted = lng.split("-");
  if (splitted.length === 2 && splitted[0] === splitted[1].toLowerCase()) {
    [language] = splitted;
  }
  return language;
}

// Merge every namespace of a language (from BOTH locale roots — the client's
// own namespaces and the shared root that holds Common) into a single
// serialized bundle string `{ [namespace]: translations }`. Loading this one
// file gives i18next every namespace in a single request instead of ~15+.
// Returns the exact JSON string per language so the emitted `_combined.json`
// and its ?hash= cache-buster are derived from identical content.
function buildLanguageBundleJson(srcRoots: string[]): Map<string, string> {
  const byLanguage = new Map<string, Record<string, unknown>>();

  for (const root of srcRoots) {
    if (!fs.existsSync(root)) continue;
    for (const dir of fs.readdirSync(root, { withFileTypes: true })) {
      if (!dir.isDirectory() || dir.name.startsWith(".")) continue;
      const language = normalizeLanguage(dir.name);
      const bundle = byLanguage.get(language) ?? {};
      const langDir = path.join(root, dir.name);
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
      byLanguage.set(language, bundle);
    }
  }

  const result = new Map<string, string>();
  for (const [language, bundle] of byLanguage) {
    result.set(language, JSON.stringify(bundle));
  }
  return result;
}

function buildCombinedLocales(srcRoots: string[], destDir: string) {
  for (const [language, json] of buildLanguageBundleJson(srcRoots)) {
    const langDestDir = path.join(destDir, language);
    fs.mkdirSync(langDestDir, { recursive: true });
    fs.writeFileSync(path.join(langDestDir, "_combined.json"), json, "utf-8");
  }
}

// Per-language md5 of the combined bundle, baked into the client at build time
// (Vite `define`) and appended as `?hash=` in loadCombinedLanguagePath. The
// `_combined.json` URL is fixed and served `immutable, max-age=31536000`, so
// without this cache-buster a browser would keep stale translations forever.
// Mirrors the per-namespace ?hash= emitted by the static-url plugin.
export function computeCombinedLocaleHashes(): Record<string, string> {
  const hashes: Record<string, string> = {};
  for (const [language, json] of buildLanguageBundleJson(localeSrcRoots())) {
    hashes[language] = crypto.createHash("md5").update(json).digest("hex");
  }
  return hashes;
}

export const copyLocalesPlugin = (): Plugin => ({
  name: "copy-locales",
  closeBundle() {
    const [clientLocales] = localeSrcRoots();
    const destDir = path.resolve(rootDir, "dist/locales");
    copyAndMinifyLocales(clientLocales, destDir);
    buildCombinedLocales(localeSrcRoots(), destDir);
  },
});
