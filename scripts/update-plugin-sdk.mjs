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
 * Switches the apps from the npm release of @onlyoffice/docspace-plugin-sdk to
 * a locally packed tarball, for trying an SDK build before it is published, and
 * makes pnpm actually install it.
 *
 * The tarball is versioned in its filename, as ai-chat's is:
 * `onlyoffice-docspace-plugin-sdk-<version>.tgz`, with a pre-release version
 * such as `3.1.0-20261106` (another pack that day: `3.1.0-20261106.2`), so it
 * never claims to be a release that is not on npm, and the published `3.1.0`
 * is still the newer version under `^3.1.0`. A new version means a new `file:`
 * specifier in every app manifest, and pnpm re-resolves it on its own. A
 * different build under a version already at the root is refused: that is the
 * ui-kit trap again. The extracted copy is dropped either way, and the result
 * is verified by hash against the tarball.
 * An earlier unversioned `onlyoffice-docspace-plugin-sdk.tgz` at the root is
 * replaced. The Dockerfiles copy the root `*.tgz`, so an image builds in either
 * mode.
 *
 * Pack in the SDK checkout with the pre-release version, then restore its
 * package.json:
 *
 *   npm version 3.1.0-20261106 --no-git-tag-version && npm run build && npm pack
 *
 *   node scripts/update-plugin-sdk.mjs                     # newest pack in the sibling checkout
 *   node scripts/update-plugin-sdk.mjs path/to/pack.tgz    # an explicit tarball
 *   DOCSPACE_PLUGIN_SDK_SRC=... node scripts/update-plugin-sdk.mjs
 *
 * Back to the registry: `pnpm -r update @onlyoffice/docspace-plugin-sdk@^<version>`,
 * then delete the tarball.
 */
import fs from "node:fs";
import path from "node:path";
import {
  LOCKFILE,
  PLUGIN_SDK_AT_ROOT,
  PLUGIN_SDK_TARBALL,
  PNPM_DIR,
  ROOT,
  escapeRegExp,
  fail,
  integrityOf,
  lockDrift,
  newestIn,
  packedManifest,
  placeVersionedTarball,
  pnpmInstall,
  verifyExtractedCopies,
} from "./lib/vendored-tarball.mjs";

const PACKAGE = "@onlyoffice/docspace-plugin-sdk";

// pnpm shortens a long virtual store name and appends a hash, so the SDK's
// directory is `@onlyoffice+docspace-plugin_<hash>` as often as the full name.
const isExtractedCopy = (entry) => entry.startsWith("@onlyoffice+docspace-plugin");

/** The tarball to install: an explicit argument, or the newest pack next door. */
const findSource = () => {
  const [arg] = process.argv.slice(2);
  if (arg) {
    const full = path.resolve(arg);
    if (!fs.existsSync(full)) fail(`${arg} does not exist.`);
    return full;
  }

  const sdk = path.resolve(
    ROOT,
    process.env.DOCSPACE_PLUGIN_SDK_SRC ?? "../../docspace-plugin-sdk",
  );

  if (!fs.existsSync(sdk)) {
    fail(
      `The plugin SDK is not checked out at ${sdk}. Clone it, or pass the tarball ` +
        "path, or set DOCSPACE_PLUGIN_SDK_SRC.",
    );
  }

  const pack = newestIn(sdk, PLUGIN_SDK_TARBALL);

  if (pack === null) {
    fail(
      `No onlyoffice-docspace-plugin-sdk-*.tgz in ${sdk}. Pack it there first ` +
        "(`npm version <x.y.z-yyyymmdd> --no-git-tag-version && npm run build && npm pack`).",
    );
  }

  return path.join(sdk, pack);
};

const source = findSource();
const file = path.basename(source);

// The app manifests carry the version in this filename.
if (!PLUGIN_SDK_TARBALL.test(file)) {
  fail(`${file} is not named onlyoffice-docspace-plugin-sdk-<version>.tgz -- rename it first.`);
}

const target = path.join(ROOT, file);
const lock = fs.readFileSync(LOCKFILE, "utf8");
const after = integrityOf(source);
const before = fs.existsSync(target) ? integrityOf(target) : null;

// A second build under a version already in use is the stale-copy trap: a
// teammate's install can keep the first build. Every pack gets its own version.
if (before !== null && before !== after) {
  const [, version] = file.match(PLUGIN_SDK_TARBALL);
  const counter = version.match(/^(.*-\d{8})\.(\d+)$/);
  const next = counter ? `${counter[1]}.${Number(counter[2]) + 1}` : `${version}.2`;
  fail(
    `${file} is already at the root with other contents. Pack this build as ` +
      `${next} (npm version ${next} --no-git-tag-version) and re-run.`,
  );
}

const appsNaming = (name) =>
  fs
    .readdirSync(path.join(ROOT, "packages"))
    .map((app) => path.join(ROOT, "packages", app, "package.json"))
    .filter((manifest) => fs.existsSync(manifest))
    .map((manifest) => fs.readFileSync(manifest, "utf8"))
    .filter((text) => text.includes(`"${PACKAGE}"`))
    .every((text) => text.includes(`"${PACKAGE}": "file:../../${name}"`));

const othersAtRoot = fs
  .readdirSync(ROOT)
  .filter((f) => PLUGIN_SDK_AT_ROOT.test(f) && f !== file);

// An unchanged tarball still falls through to the verification below: a
// previous run may have died after rewriting the tree, and only the check
// tells whether what is installed is this build.
if (before === after && othersAtRoot.length === 0 && appsNaming(file)) {
  console.log(`${file} is already this build -- checking what is installed.`);
} else {
  const placed = placeVersionedTarball(PACKAGE, PLUGIN_SDK_AT_ROOT, source);

  console.log(
    `${PACKAGE} -> ${file}` +
      (placed.touched.length > 0 ? ` (${placed.touched.join(", ")} repointed)` : ""),
  );

  const restore = () => {
    fs.writeFileSync(LOCKFILE, lock);
    placed.restore();
  };

  // Same filename, new contents: point the lockfile at them, or pnpm trusts
  // the old hash and never reads the file. A new filename matches nothing
  // here and pnpm resolves it fresh.
  const pattern = new RegExp(
    `(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:${escapeRegExp(file)}\\})`,
    "g",
  );
  fs.writeFileSync(LOCKFILE, lock.replace(pattern, `$1${after}$2`));

  // And drop every extracted copy, which pnpm would otherwise relink as is.
  if (fs.existsSync(PNPM_DIR)) {
    for (const entry of fs.readdirSync(PNPM_DIR)) {
      if (isExtractedCopy(entry)) {
        fs.rmSync(path.join(PNPM_DIR, entry), { recursive: true, force: true });
      }
    }
  }

  console.log(`Installing ${file}...`);
  try {
    pnpmInstall();
  } catch (error) {
    // The tarball, the manifests and the lockfile were already rewritten
    // above, so a failed install leaves the tree claiming a version it does
    // not have. Put all of it back.
    restore();
    fail(`pnpm install failed; SDK tarball, manifests and lockfile restored: ${error.message}`);
  }
}

// Prove it landed: no lockfile reference to another SDK tarball, every
// extracted copy byte-identical to the tarball, and the lockfile entry
// describing the manifest that was actually packed.
const leftovers = [
  ...new Set(
    [
      ...fs
        .readFileSync(LOCKFILE, "utf8")
        .matchAll(/onlyoffice-docspace-plugin-sdk(?:-[^\s'"(),}]+)?\.tgz/g),
    ]
      .map(([name]) => name)
      .filter((name) => name !== file),
  ),
];

if (leftovers.length > 0) {
  fail(
    `pnpm-lock.yaml still references ${leftovers.join(", ")} -- some manifest ` +
      "still names it. Repoint it and re-run.",
  );
}

const copies = verifyExtractedCopies(target, PACKAGE, isExtractedCopy);

const packed = packedManifest(target);
const drift = lockDrift(`${PACKAGE}@file:${file}`, packed);

if (drift.length > 0) {
  console.error(`pnpm-lock.yaml still describes a previous build of ${PACKAGE}:\n`);
  for (const line of drift) console.error(`  ${line}`);
  fail(
    `\nRun \`pnpm update -r ${PACKAGE}\`, review what else it moves in ` +
      "pnpm-lock.yaml, and re-run this script.",
  );
}

console.log(
  `${PACKAGE} ${packed.version} installed and verified against ${file} ` +
    `(${copies.length} extracted ${copies.length === 1 ? "copy" : "copies"}).`,
);

// npm pack names the file after the version it packs, so a mismatch means the
// file was renamed by hand.
const [, fileVersion] = file.match(PLUGIN_SDK_TARBALL);
if (fileVersion !== packed.version) {
  console.warn(`Warning: ${file} contains ${PACKAGE} ${packed.version}, not ${fileVersion}.`);
}

console.log(
  "The apps now use the tarball instead of the npm release. To go back, run " +
    `\`pnpm -r update ${PACKAGE}@^<version>\` and delete ${file}.`,
);
