// (c) Copyright Ascensio System SIA 2009-2026
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

import { readFile, stat } from "fs/promises";
import path from "path";

import type { TTranslations } from "@docspace/ui-kit/providers/translation";

const fileCache = new Map<string, Promise<Record<string, string> | null>>();
const warnedMissingDirs = new Set<string>();

const warnIfDirMissing = async (filePath: string) => {
  const dir = path.dirname(filePath);
  if (warnedMissingDirs.has(dir)) return;
  const exists = await stat(dir)
    .then((s) => s.isDirectory())
    .catch(() => false);
  if (!exists) {
    warnedMissingDirs.add(dir);
    console.warn(
      `[ssr-translation-loader] Locale directory does not exist: ${dir}`,
    );
  }
};

const tryReadJson = (filePath: string): Promise<Record<string, string> | null> => {
  const cached = fileCache.get(filePath);
  if (cached) return cached;

  const promise = readFile(filePath, "utf-8")
    .then((content) => JSON.parse(content) as Record<string, string>)
    .catch(async (err: NodeJS.ErrnoException) => {
      if (err.code === "ENOENT") {
        await warnIfDirMissing(filePath);
      } else {
        console.warn(`Failed to load translation ${filePath}:`, err);
      }
      fileCache.delete(filePath);
      return null;
    });

  fileCache.set(filePath, promise);
  return promise;
};

export async function loadTranslationsForLocale(
  locale: string,
  config: {
    namespaces: readonly string[];
    appLocalesDir: string;
    sharedLocalesDir: string;
  },
): Promise<TTranslations> {
  const { namespaces, appLocalesDir, sharedLocalesDir } = config;

  const loadNs = async (ns: string, dir: string, lng: string) => {
    const data =
      (await tryReadJson(path.join(dir, lng, `${ns}.json`))) ??
      (await tryReadJson(path.join(dir, "en", `${ns}.json`))) ??
      {};
    return [ns, data] as const;
  };

  const loadAllNsForLng = async (lng: string) => {
    const [appEntries, commonEntry] = await Promise.all([
      Promise.all(namespaces.map((ns) => loadNs(ns, appLocalesDir, lng))),
      loadNs("Common", sharedLocalesDir, lng),
    ]);
    return new Map([...appEntries, commonEntry]);
  };

  const translations: TTranslations = new Map();

  const effectiveLng = locale || "en";
  translations.set(effectiveLng, await loadAllNsForLng(effectiveLng));

  if (effectiveLng !== "en") {
    translations.set("en", await loadAllNsForLng("en"));
  }

  return translations;
}
