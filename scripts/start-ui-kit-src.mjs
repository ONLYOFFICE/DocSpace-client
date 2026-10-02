#!/usr/bin/env node
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

/**
 * Starts the usual dev servers with the client resolving @onlyoffice/apps-ui-kit
 * from a checkout instead of the installed tarball, so edits in ui-kit show up
 * through HMR with no build, pack or install in between.
 *
 * It exists at the repo root because that is where the dev servers are actually
 * started -- `pnpm start` fans out to five apps through Nx, and a script buried
 * in packages/client is never the one anyone runs. The variable is read by
 * packages/client/config/ui-kit-dev.ts for the Vite client and by
 * scripts/ui-kit-dev.cjs for the four Next.js apps.
 *
 *   pnpm run start:ui-kit-src                 # same app set as `pnpm start`
 *   pnpm run start:ui-kit-src start:lite      # any other start script
 *   DOCSPACE_UI_KIT_SRC=../elsewhere pnpm run start:ui-kit-src
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CHECKOUT = "../../docspace-ui-kit-react";

const [target = "start"] = process.argv.slice(2);
const checkout = process.env.DOCSPACE_UI_KIT_SRC ?? DEFAULT_CHECKOUT;
const resolved = path.resolve(ROOT, checkout);

// Checked here rather than left to the dev servers, because by then Nx has
// started all five apps: the four Next ones come up, the client alone dies on
// the missing checkout, and it reads as "the portal will not open" instead of
// "the kit is not set up". packages/client/config/ui-kit-dev.ts validates the
// rest and prints which ui-kit is being served.
//
// node_modules, not just package.json: a fresh clone has the manifest and none
// of the dependencies, and that is the state people are in the first time they
// press the button.
if (!fs.existsSync(path.join(resolved, "package.json"))) {
  console.error(
    `No @onlyoffice/apps-ui-kit checkout at ${resolved}.\n` +
      "Clone it there, or set DOCSPACE_UI_KIT_SRC to where it lives.",
  );
  process.exit(1);
}

if (!fs.existsSync(path.join(resolved, "node_modules"))) {
  console.error(
    `The @onlyoffice/apps-ui-kit checkout at ${resolved} has no node_modules.\n` +
      "It resolves its own dependencies, so run `pnpm install` there first.",
  );
  process.exit(1);
}

// `shell` on Windows: pnpm is a .CMD shim there and CreateProcess cannot run one.
const { status } = spawnSync("pnpm", ["run", target], {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DOCSPACE_UI_KIT_SRC: checkout },
});

process.exit(status ?? 1);
