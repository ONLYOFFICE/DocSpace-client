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
import fs from "fs";
import { createRequire } from "module";

import { rootDir } from "./utils";

const require = createRequire(import.meta.url);

export const UI_KIT_PACKAGE = "@onlyoffice/apps-ui-kit";

export const UI_KIT_SRC_ENV = "DOCSPACE_UI_KIT_SRC";

const fail = (message: string): never => {
  throw new Error(`${UI_KIT_SRC_ENV}: ${message}`);
};

const repoRoot = path.resolve(rootDir, "../..");

type UiKitManifest = {
  name?: string;
  peerDependencies?: Record<string, string>;
};

type UiKitCheckout = { root: string; manifest: UiKitManifest };

const readDevCheckout = (): UiKitCheckout | null => {
  const raw = process.env[UI_KIT_SRC_ENV]?.trim();

  if (!raw) return null;

  const root = path.resolve(repoRoot, raw);
  const manifestPath = path.join(root, "package.json");

  if (!fs.existsSync(root))
    return fail(`${root} does not exist. Point it at a ${UI_KIT_PACKAGE} checkout.`);

  if (!fs.existsSync(manifestPath))
    return fail(`${root} has no package.json, so it is not a ${UI_KIT_PACKAGE} checkout.`);

  const manifest = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8"),
  ) as UiKitManifest;

  if (manifest.name !== UI_KIT_PACKAGE)
    return fail(`${root} is "${manifest.name}", not ${UI_KIT_PACKAGE}.`);

  if (!fs.existsSync(path.join(root, "node_modules")))
    return fail(
      `${root} has no node_modules. The checkout resolves its own dependencies, ` +
        "so run `pnpm install` there first.",
    );

  return { root, manifest };
};

const checkout = readDevCheckout();

export const uiKitDevRoot = checkout?.root ?? null;

// Called from vite.config.ts once the command is known, not at import time:
// this module is loaded by every config consumer, and a build that is about to
// refuse the variable has no use for the line.
export const logUiKitMode = () =>
  console.log(
    uiKitDevRoot
      ? `ui-kit: serving source from ${uiKitDevRoot}`
      : `ui-kit: installed package (set ${UI_KIT_SRC_ENV}, or run \`pnpm run start:ui-kit-src\`, to serve a checkout)`,
  );

export const uiKitDir =
  uiKitDevRoot ??
  path.dirname(require.resolve(`${UI_KIT_PACKAGE}/package.json`));

// Read from the checkout rather than listed by hand: every peer is a package
// both trees can resolve separately, and a second copy of any of them is a
// second module registry. A hand-picked subset rots silently on the next bump
// on either side.
export const uiKitPeerDependencies = Object.keys(
  checkout?.manifest.peerDependencies ?? {},
);

/** True when `target` lies strictly below `root` (the root itself does not count). */
export const isInside = (root: string, target: string) => {
  const rel = path.relative(root, target);

  return rel !== "" && !rel.startsWith("..") && !path.isAbsolute(rel);
};

export const isInsideUiKit = (target: string) =>
  uiKitDevRoot !== null && isInside(uiKitDevRoot, target);

export const uiKitBoundaryError = (
  importer: string,
  source: string,
  reason: string,
) =>
  new Error(
    [
      `ui-kit boundary violated in ${importer}`,
      ``,
      `  import "${source}"`,
      ``,
      `  ${reason}.`,
      ``,
      `  It resolves here only because the client dev server is serving ui-kit`,
      `  from source. The ui-kit repository has no such alias and no access to`,
      `  this tree, so its own \`pnpm build\` will fail on this import.`,
      ``,
      `  Use something the ui-kit checkout owns: a relative path inside it, one`,
      `  of its declared dependencies, or a value the host passes in at runtime.`,
    ].join("\n"),
  );
