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


// Dependencies that an app and @docspace/shared resolve to different installed
// copies.
//
// Every app compiles shared's sources, and an import in a shared file resolves
// from packages/shared/node_modules. pnpm installs a package once per peer set,
// so when an app and shared declare different optional peers of one of their
// common dependencies (client and sdk declare ai-chat's, shared does not), the
// two get different copies of it. Both end up in the bundle, and anything that
// keeps module state -- a React context, a store, a socket -- silently stops
// being shared: ui-kit's ScrollbarContext split left the info panel Share tab
// empty, its ApiContext split crashed selectors with "useApi must be used
// within an ApiProvider".
//
// The app's bundler must resolve such a dependency from the app's copy for
// every importer (Vite's resolve.dedupe, a NormalModuleReplacementPlugin in
// webpack). The tests that guard this read the split from here.
//
// CommonJS on purpose -- the common tests and a next.config.js load it.

const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const sharedDir = path.join(repoRoot, "packages", "shared");

const declaredDependencies = (dir) => {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(dir, "package.json"), "utf8"),
  );

  return new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
  ]);
};

// The installed copy a directory sees for a package: the nearest
// node_modules/<name> going up, with pnpm's symlink resolved to the store
// directory -- the same lookup Node, Vite and webpack do.
const installedCopy = (fromDir, name) => {
  let dir = path.resolve(fromDir);

  for (;;) {
    const candidate = path.join(dir, "node_modules", name);

    if (fs.existsSync(candidate)) return fs.realpathSync(candidate);

    const parent = path.dirname(dir);

    if (parent === dir) return null;

    dir = parent;
  }
};

// The installed copy a resolved file belongs to: the path up to and including
// its last node_modules/<name> segment.
const copyOfFile = (file, name) => {
  const real = fs.realpathSync(file);
  const marker = `${path.sep}node_modules${path.sep}${name.split("/").join(path.sep)}${path.sep}`;
  const index = real.lastIndexOf(marker);

  return index === -1 ? null : real.slice(0, index + marker.length - 1);
};

/**
 * @param {string} appDir the app's package directory
 * @returns {{ name: string, appCopy: string, sharedCopy: string }[]}
 */
const findSplitCopies = (appDir) => {
  appDir = path.resolve(appDir);
  const shared = declaredDependencies(sharedDir);

  return [...declaredDependencies(appDir)]
    .filter((name) => shared.has(name))
    .map((name) => ({
      name,
      appCopy: installedCopy(appDir, name),
      sharedCopy: installedCopy(sharedDir, name),
    }))
    .filter(
      ({ appCopy, sharedCopy }) =>
        appCopy && sharedCopy && appCopy !== sharedCopy,
    )
    .sort((a, b) => a.name.localeCompare(b.name));
};

module.exports = {
  repoRoot,
  sharedDir,
  installedCopy,
  copyOfFile,
  findSplitCopies,
};
