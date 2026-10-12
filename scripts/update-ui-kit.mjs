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
 * Switches the apps from the npm release of @onlyoffice/apps-ui-kit to a
 * locally packed tarball, for trying a ui-kit build before it is published,
 * and makes pnpm actually install it.
 *
 * Every app manifest is repointed at `file:../../onlyoffice-apps-ui-kit.tgz`.
 * The filename carries no version, so from the second run on the specifier no
 * longer changes, and the naive procedure -- copy the .tgz over, run
 * `pnpm install` -- silently does nothing: pnpm sees a specifier it already
 * has, matches the integrity recorded in pnpm-lock.yaml, and keeps the cached
 * copy. `--force` does not help either. The result is a green install, an
 * unchanged lockfile, and the previous build still in node_modules -- the
 * failure mode this script exists to remove.
 *
 * So: copy, repoint the manifests, rewrite the recorded integrity, drop the
 * extracted copy, install, then verify by hash that what landed in
 * node_modules is what was copied in, and that the lockfile's peers and
 * dependencies match the packed manifest.
 *
 * Back to the registry: `pnpm -r update @onlyoffice/apps-ui-kit@^<version>`,
 * then delete the tarball.
 *
 *   node scripts/update-ui-kit.mjs                     # newest pack in the sibling checkout
 *   node scripts/update-ui-kit.mjs path/to/pack.tgz    # an explicit tarball
 *   DOCSPACE_UI_KIT_SRC=... node scripts/update-ui-kit.mjs
 */

import fs from "node:fs";
import path from "node:path";
import {
  AI_CHAT_TARBALL,
  LOCKFILE,
  PNPM_DIR,
  ROOT,
  fail,
  integrityOf,
  lockDrift,
  newestIn,
  packedManifest,
  placeAiChat,
  pnpmInstall,
  repointManifests,
  verifyExtractedCopies,
} from "./lib/vendored-tarball.mjs";

const TARBALL = path.join(ROOT, "onlyoffice-apps-ui-kit.tgz");
const SPECIFIER = "file:../../onlyoffice-apps-ui-kit.tgz";

/** Set by findSource when it located a ui-kit checkout rather than a bare path. */
let uiKitRoot = null;

/** The tarball to install: an explicit argument, or the newest pack next door. */
const findSource = () => {
  const [arg] = process.argv.slice(2);
  if (arg) {
    const full = path.resolve(arg);
    if (!fs.existsSync(full)) fail(`${arg} does not exist.`);
    return full;
  }

  const uiKit = path.resolve(
    ROOT,
    process.env.DOCSPACE_UI_KIT_SRC ?? "../../docspace-ui-kit-react",
  );

  if (!fs.existsSync(uiKit)) {
    fail(
      `ui-kit is not checked out at ${uiKit}. Clone it, or pass the tarball ` +
        "path, or set DOCSPACE_UI_KIT_SRC.",
    );
  }

  const pack = newestIn(uiKit, /^onlyoffice-apps-ui-kit-.*\.tgz$/);

  if (pack === null) {
    fail(`No onlyoffice-apps-ui-kit-*.tgz in ${uiKit}. Run \`pnpm build && pnpm pack\` there first.`);
  }

  uiKitRoot = uiKit;

  return path.join(uiKit, pack);
};

/**
 * ui-kit statically imports @onlyoffice/ai-chat, so the two move together, and
 * whatever ai-chat sits next to the ui-kit checkout is taken as the truth.
 * (`pnpm run update-ai-chat` moves ai-chat on its own, from an ai-chat
 * checkout, when ui-kit has not changed.)
 *
 * Returns null when nothing moved, otherwise what placeAiChat returns.
 */
const syncAiChat = (uiKitRoot) => {
  if (uiKitRoot === null) return null;

  const newest = newestIn(uiKitRoot, AI_CHAT_TARBALL);

  if (!newest) return null;

  const current = fs.readdirSync(ROOT).filter((f) => AI_CHAT_TARBALL.test(f));

  if (current.length === 1 && current[0] === newest) return null;

  const placed = placeAiChat(path.join(uiKitRoot, newest));

  console.log(
    `@onlyoffice/ai-chat -> ${placed.file}` +
      (placed.touched.length > 0 ? ` (${placed.touched.join(", ")} repointed)` : ""),
  );

  return placed;
};

// The lockfile has entries for the tarball only once the apps already use it;
// coming from the registry there are none, and pnpm resolves the new
// specifier fresh.
const LOCK_PATTERN =
  /(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:onlyoffice-apps-ui-kit\.tgz)/g;
const lock = fs.readFileSync(LOCKFILE, "utf8");
const lockMatches = lock.match(LOCK_PATTERN) ?? [];

const source = findSource();
const aiChat = syncAiChat(uiKitRoot);
const hadTarball = fs.existsSync(TARBALL);
// Snapshot before overwriting: the rollback below has to put these exact bytes
// back, and by then the file on disk is already the new pack.
const previousTarball = hadTarball ? fs.readFileSync(TARBALL) : null;
const before = hadTarball ? integrityOf(TARBALL) : null;

fs.copyFileSync(source, TARBALL);

const after = integrityOf(TARBALL);
const manifests = repointManifests("@onlyoffice/apps-ui-kit", SPECIFIER);

if (manifests.touched.length > 0) {
  console.log(`@onlyoffice/apps-ui-kit -> ${SPECIFIER} (${manifests.touched.join(", ")} repointed)`);
}

// An unchanged tarball still falls through to the verification below rather
// than exiting here. The install step can die after the tarball, the lockfile
// and the extracted copies have already been rewritten -- that is what the
// `shell` flag and the rollback below exist for -- and a re-run that exits
// early on "same build" would report success over a tree with no ui-kit in it
// at all.
//
// Nor does an unchanged ui-kit mean there is nothing to install: the apps may
// have just been switched over from the registry, or ai-chat may have moved on
// its own, and the manifests rewritten above then need pnpm to pick that up.
if (before === after && aiChat === null && manifests.touched.length === 0) {
  console.log(
    `${path.relative(ROOT, TARBALL)} is already this build -- checking what is installed.`,
  );
} else {
  const restore = () => {
    fs.writeFileSync(LOCKFILE, lock);
    if (previousTarball === null) fs.rmSync(TARBALL, { force: true });
    else fs.writeFileSync(TARBALL, previousTarball);
    manifests.restore();
    aiChat?.restore();
  };

  // Point the lockfile at the new contents. Without this pnpm trusts the old
  // hash and never reads the file.
  fs.writeFileSync(LOCKFILE, lock.replace(LOCK_PATTERN, `$1${after}$2`));

  // And drop the extracted copy, which pnpm would otherwise relink as is.
  if (fs.existsSync(PNPM_DIR)) {
    for (const entry of fs.readdirSync(PNPM_DIR)) {
      if (entry.startsWith("@onlyoffice+apps-ui-kit@")) {
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
    // The tarball, the lockfile, the app manifests and (when ai-chat moved)
    // its tarball were already rewritten above, so a failed install leaves
    // the tree claiming a version it does not have. Put all of it back.
    restore();
    fail(
      `pnpm install failed; tarball, lockfile, manifests${aiChat ? " and ai-chat" : ""} restored: ${error.message}`,
    );
  }
}

// Prove it landed. A silent no-op is exactly what this script is here to catch,
// so do not take the install's exit code as evidence. Every extracted copy is
// checked: there is one today (zod is pinned through the catalog so client and
// sdk resolve the same ai-chat variant), but the moment a peer drifts there are
// two again.
const copies = verifyExtractedCopies(TARBALL, "@onlyoffice/apps-ui-kit", (entry) =>
  entry.startsWith("@onlyoffice+apps-ui-kit@"),
);

// The bytes match, but the lockfile can still describe the previous build --
// which is how ui-kit once asked for katex ^0.17.0 while the lockfile still
// said ^0.16.47.
const drift = lockDrift(
  "@onlyoffice/apps-ui-kit@file:onlyoffice-apps-ui-kit.tgz",
  packedManifest(TARBALL),
);

if (drift.length > 0) {
  console.error("pnpm-lock.yaml still describes a previous build of @onlyoffice/apps-ui-kit:\n");
  for (const line of drift) console.error(`  ${line}`);
  fail(
    "\nRun `pnpm update -r @onlyoffice/apps-ui-kit`, review what else it moves in " +
      "pnpm-lock.yaml, and re-run this script.",
  );
}

const { version } = JSON.parse(
  fs.readFileSync(path.join(copies[0], "package.json"), "utf8"),
);

console.log(
  `@onlyoffice/apps-ui-kit ${version} installed and verified against the tarball ` +
    `(${copies.length} extracted ${copies.length === 1 ? "copy" : "copies"}).`,
);
console.log(
  "The apps now use the tarball instead of the npm release. To go back, run " +
    "`pnpm -r update @onlyoffice/apps-ui-kit@^<version>` and delete onlyoffice-apps-ui-kit.tgz.",
);
