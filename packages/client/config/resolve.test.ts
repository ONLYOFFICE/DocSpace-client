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
import { createRequire } from "module";
import { createServer } from "vite";
import { describe, expect, it } from "vitest";

import { resolve } from "./resolve";
import { rootDir } from "./utils";
import { uiKitDevRoot } from "./ui-kit-dev";

const require = createRequire(import.meta.url);
const { findSplitCopies, copyOfFile, repoRoot, sharedDir } =
  require("../../../scripts/split-copies.cjs") as typeof import("../../../scripts/split-copies.cjs");

// Resolves a package the way the client bundle does, from a given importer,
// and returns the installed copy the result belongs to. The importer must
// exist: for a missing one Vite resolves from the project root instead, and
// every lookup would land on the client's copy.
const resolveCopy = async (
  resolveId: (id: string, importer: string) => Promise<{ id: string } | null>,
  name: string,
  importer: string,
) => {
  for (const specifier of [name, `${name}/package.json`]) {
    const resolved = await resolveId(specifier, importer);

    if (resolved) return copyOfFile(resolved.id, name);
  }

  return null;
};

const show = (copy: string | null) =>
  copy ? path.relative(repoRoot, copy) : "nothing";

// In ui-kit source mode the alias replaces the installed package, so there is
// no second copy to collapse.
describe.skipIf(Boolean(uiKitDevRoot))("resolve.dedupe", () => {
  it("resolves every dependency split between client and shared to the client's copy", async () => {
    const splits = findSplitCopies(rootDir);

    const server = await createServer({
      configFile: false,
      root: rootDir,
      resolve,
      logLevel: "silent",
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true, include: [] },
    });

    try {
      const { pluginContainer } = server.environments.client;
      const resolveId = (id: string, importer: string) =>
        pluginContainer.resolveId(id, importer);

      const failures: string[] = [];

      for (const { name, appCopy } of splits) {
        const fromShared = await resolveCopy(
          resolveId,
          name,
          path.join(sharedDir, "package.json"),
        );
        const fromClient = await resolveCopy(
          resolveId,
          name,
          path.join(rootDir, "package.json"),
        );

        if (fromShared !== appCopy || fromClient !== appCopy) {
          failures.push(
            `${name} is installed twice (client and shared declare different ` +
              `peers). The bundle resolves it from client to ${show(fromClient)} ` +
              `and from shared to ${show(fromShared)}; add it to ` +
              "resolve.dedupe in config/resolve.ts.",
          );
        }
      }

      expect(failures).toEqual([]);
    } finally {
      await server.close();
    }
  });
});
