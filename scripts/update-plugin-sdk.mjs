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
 * The same procedure as update-ui-kit.mjs, for the same reason: the tarball
 * sits at the repo root as `onlyoffice-docspace-plugin-sdk.tgz`, with no
 * version in its name, so from the second run on the specifier no longer
 * changes and a plain `pnpm install` keeps the cached copy. The script copies
 * the pack, repoints the manifests, rewrites the recorded integrity, drops the
 * extracted copy, installs, and verifies by hash what landed. The Dockerfiles
 * already copy the root `*.tgz`, so an image builds in either mode.
 *
 * Pack in the SDK checkout with `npm run build && npm pack`. The version the
 * apps see is the one in the packed package.json.
 *
 * Back to the registry: `pnpm -r update @onlyoffice/docspace-plugin-sdk@^<version>`,
 * then delete the tarball.
 *
 *   node scripts/update-plugin-sdk.mjs                     # newest pack in the sibling checkout
 *   node scripts/update-plugin-sdk.mjs path/to/pack.tgz    # an explicit tarball
 *   DOCSPACE_PLUGIN_SDK_SRC=... node scripts/update-plugin-sdk.mjs
 */

import fs from "node:fs";
import path from "node:path";
import {
  LOCKFILE,
  PNPM_DIR,
  ROOT,
  fail,
  integrityOf,
  lockDrift,
  newestIn,
  packedManifest,
  pnpmInstall,
  repointManifests,
  verifyExtractedCopies,
} from "./lib/vendored-tarball.mjs";

const PACKAGE = "@onlyoffice/docspace-plugin-sdk";
const TARBALL = path.join(ROOT, "onlyoffice-docspace-plugin-sdk.tgz");
const SPECIFIER = "file:../../onlyoffice-docspace-plugin-sdk.tgz";

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

  const pack = newestIn(sdk, /^onlyoffice-docspace-plugin-sdk-.*\.tgz$/);

  if (pack === null) {
    fail(
      `No onlyoffice-docspace-plugin-sdk-*.tgz in ${sdk}. Run \`npm run build && npm pack\` there first.`,
    );
  }

  return path.join(sdk, pack);
};

// The lockfile has entries for the tarball only once the apps already use it;
// coming from the registry there are none, and pnpm resolves the new
// specifier fresh.
const LOCK_PATTERN =
  /(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:onlyoffice-docspace-plugin-sdk\.tgz)/g;
const lock = fs.readFileSync(LOCKFILE, "utf8");
const lockMatches = lock.match(LOCK_PATTERN) ?? [];

const source = findSource();
const hadTarball = fs.existsSync(TARBALL);
// Snapshot before overwriting: the rollback below has to put these exact bytes
// back, and by then the file on disk is already the new pack.
const previousTarball = hadTarball ? fs.readFileSync(TARBALL) : null;
const before = hadTarball ? integrityOf(TARBALL) : null;

if (path.resolve(source) !== TARBALL) fs.copyFileSync(source, TARBALL);

const after = integrityOf(TARBALL);
const manifests = repointManifests(PACKAGE, SPECIFIER);

if (manifests.touched.length > 0) {
  console.log(`${PACKAGE} -> ${SPECIFIER} (${manifests.touched.join(", ")} repointed)`);
}

// An unchanged tarball still falls through to the verification below: a
// previous run may have died after rewriting the tree, and only the check
// tells whether what is installed is this build.
if (before === after && manifests.touched.length === 0) {
  console.log(
    `${path.relative(ROOT, TARBALL)} is already this build -- checking what is installed.`,
  );
} else {
  const restore = () => {
    fs.writeFileSync(LOCKFILE, lock);
    if (previousTarball === null) fs.rmSync(TARBALL, { force: true });
    else fs.writeFileSync(TARBALL, previousTarball);
    manifests.restore();
  };

  // Point the lockfile at the new contents. Without this pnpm trusts the old
  // hash and never reads the file.
  fs.writeFileSync(LOCKFILE, lock.replace(LOCK_PATTERN, `$1${after}$2`));

  // And drop every extracted copy, which pnpm would otherwise relink as is.
  if (fs.existsSync(PNPM_DIR)) {
    for (const entry of fs.readdirSync(PNPM_DIR)) {
      if (isExtractedCopy(entry)) {
        fs.rmSync(path.join(PNPM_DIR, entry), { recursive: true, force: true });
      }
    }
  }

  const rewritten =
    lockMatches.length > 0
      ? ` (${lockMatches.length} lockfile ${lockMatches.length === 1 ? "entry" : "entries"} rewritten)`
      : "";

  console.log(`Installing ${path.basename(source)}${rewritten}...`);
  try {
    pnpmInstall();
  } catch (error) {
    // The tarball, the lockfile and the app manifests were already rewritten
    // above, so a failed install leaves the tree claiming a version it does
    // not have. Put all of it back.
    restore();
    fail(`pnpm install failed; tarball, lockfile and manifests restored: ${error.message}`);
  }
}

// Prove it landed: the install's exit code says nothing about which build is
// in node_modules.
const copies = verifyExtractedCopies(TARBALL, PACKAGE, isExtractedCopy);

// The bytes match, but the lockfile can still describe the previous build.
const drift = lockDrift(`${PACKAGE}@file:onlyoffice-docspace-plugin-sdk.tgz`, packedManifest(TARBALL));

if (drift.length > 0) {
  console.error(`pnpm-lock.yaml still describes a previous build of ${PACKAGE}:\n`);
  for (const line of drift) console.error(`  ${line}`);
  fail(
    `\nRun \`pnpm update -r ${PACKAGE}\`, review what else it moves in ` +
      "pnpm-lock.yaml, and re-run this script.",
  );
}

const { version } = JSON.parse(fs.readFileSync(path.join(copies[0], "package.json"), "utf8"));

console.log(
  `${PACKAGE} ${version} installed and verified against the tarball ` +
    `(${copies.length} extracted ${copies.length === 1 ? "copy" : "copies"}).`,
);
console.log(
  "The apps now use the tarball instead of the npm release. To go back, run " +
    `\`pnpm -r update ${PACKAGE}@^<version>\` and delete onlyoffice-docspace-plugin-sdk.tgz.`,
);
