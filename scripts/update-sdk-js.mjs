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
 * Switches the client from the npm release of @onlyoffice/docspace-sdk-js to a
 * locally packed tarball, for trying an Embed SDK build before it is
 * published, and makes pnpm actually install it.
 *
 * It works as update-plugin-sdk.mjs does: the tarball is versioned in its
 * filename with a pre-release version such as `2.3.0-20261117` (another pack
 * that day: `2.3.0-20261117.2`), a new version is a new `file:` specifier, a
 * different build under a version already at the root is refused, and the
 * result is verified by hash against the tarball.
 *
 * The Embed SDK presets also load the script build from
 * `public/scripts/sdk/<x.y.z>/api.js`, so the tarball's `dist/api.js` is put
 * there too, under the version without its pre-release part.
 *
 * Pack in the sdk-js checkout with the pre-release version, then restore its
 * package.json:
 *
 *   npm version 2.3.0-20261117 --no-git-tag-version && pnpm build && pnpm pack
 *
 *   node scripts/update-sdk-js.mjs                     # newest pack in the sibling checkout
 *   node scripts/update-sdk-js.mjs path/to/pack.tgz    # an explicit tarball
 *   DOCSPACE_SDK_JS_SRC=... node scripts/update-sdk-js.mjs
 *
 * Back to the registry: `pnpm -r update @onlyoffice/docspace-sdk-js@^<version>`,
 * delete the tarball and replace `public/scripts/sdk/<x.y.z>/api.js` with the
 * released build.
 */
import fs from "node:fs";
import path from "node:path";
import {
  LOCKFILE,
  PNPM_DIR,
  ROOT,
  SDK_JS_TARBALL,
  contentsOfTarball,
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

const PACKAGE = "@onlyoffice/docspace-sdk-js";

const isExtractedCopy = (entry) => entry.startsWith("@onlyoffice+docspace-sdk-js");

const findSource = () => {
  const [arg] = process.argv.slice(2);
  if (arg) {
    const full = path.resolve(arg);
    if (!fs.existsSync(full)) fail(`${arg} does not exist.`);
    return full;
  }

  const sdk = path.resolve(ROOT, process.env.DOCSPACE_SDK_JS_SRC ?? "../../docspace-sdk-js");

  if (!fs.existsSync(sdk)) {
    fail(
      `docspace-sdk-js is not checked out at ${sdk}. Clone it, or pass the tarball ` +
        "path, or set DOCSPACE_SDK_JS_SRC.",
    );
  }

  const pack = newestIn(sdk, SDK_JS_TARBALL);

  if (pack === null) {
    fail(
      `No onlyoffice-docspace-sdk-js-*.tgz in ${sdk}. Pack it there first ` +
        "(`npm version <x.y.z-yyyymmdd> --no-git-tag-version && pnpm build && pnpm pack`).",
    );
  }

  return path.join(sdk, pack);
};

const source = findSource();
const file = path.basename(source);

if (!SDK_JS_TARBALL.test(file)) {
  fail(`${file} is not named onlyoffice-docspace-sdk-js-<version>.tgz -- rename it first.`);
}

// A release version would overwrite the committed script of that release.
const { version } = packedManifest(source);
if (!version.includes("-")) {
  fail(
    `${file} carries ${PACKAGE} ${version}, a release version. Pack it under a ` +
      `pre-release one (npm version ${version}-<yyyymmdd> --no-git-tag-version).`,
  );
}

const target = path.join(ROOT, file);
const lock = fs.readFileSync(LOCKFILE, "utf8");
const after = integrityOf(source);
const before = fs.existsSync(target) ? integrityOf(target) : null;

if (before !== null && before !== after) {
  const [, fileVersion] = file.match(SDK_JS_TARBALL);
  const counter = fileVersion.match(/^(.*-\d{8})\.(\d+)$/);
  const next = counter ? `${counter[1]}.${Number(counter[2]) + 1}` : `${fileVersion}.2`;
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
  .filter((f) => SDK_JS_TARBALL.test(f) && f !== file);

if (before === after && othersAtRoot.length === 0 && appsNaming(file)) {
  console.log(`${file} is already this build -- checking what is installed.`);
} else {
  const placed = placeVersionedTarball(PACKAGE, SDK_JS_TARBALL, source);

  console.log(
    `${PACKAGE} -> ${file}` +
      (placed.touched.length > 0 ? ` (${placed.touched.join(", ")} repointed)` : ""),
  );

  const restore = () => {
    fs.writeFileSync(LOCKFILE, lock);
    placed.restore();
  };

  const pattern = new RegExp(
    `(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:${escapeRegExp(file)}\\})`,
    "g",
  );
  fs.writeFileSync(LOCKFILE, lock.replace(pattern, `$1${after}$2`));

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
    restore();
    fail(`pnpm install failed; SDK tarball, manifests and lockfile restored: ${error.message}`);
  }
}

const leftovers = [
  ...new Set(
    [
      ...fs
        .readFileSync(LOCKFILE, "utf8")
        .matchAll(/onlyoffice-docspace-sdk-js-[^\s'"(),}]+\.tgz/g),
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

const [, fileVersion] = file.match(SDK_JS_TARBALL);
if (fileVersion !== packed.version) {
  console.warn(`Warning: ${file} contains ${PACKAGE} ${packed.version}, not ${fileVersion}.`);
}

const script = contentsOfTarball(target).find(([name]) => name === "dist/api.js");
if (!script) fail(`${file} has no dist/api.js -- was it built before packing?`);

const [release] = packed.version.split("-");
const scriptFile = path.join(ROOT, "public", "scripts", "sdk", release, "api.js");
const scriptLabel = `public/scripts/sdk/${release}/api.js`;

if (fs.existsSync(scriptFile) && fs.readFileSync(scriptFile).equals(script[1])) {
  console.log(`${scriptLabel} is already this build.`);
} else {
  fs.mkdirSync(path.dirname(scriptFile), { recursive: true });
  fs.writeFileSync(scriptFile, script[1]);
  console.log(`${scriptLabel} written from ${file}.`);
}

console.log(
  "The client now uses the tarball instead of the npm release. To go back, run " +
    `\`pnpm -r update ${PACKAGE}@^<version>\`, delete ${file} and put the ` +
    `released build in ${scriptLabel}.`,
);
