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
 * Drops a freshly packed @onlyoffice/ai-chat tarball into this repo on its
 * own, without a ui-kit bump, and makes pnpm actually install it.
 *
 * `update-ui-kit` already moves ai-chat when ui-kit moves, taking whatever
 * tarball sits next to the ui-kit checkout. This is for the other case: an
 * ai-chat fix packed in the ai-chat checkout (`npm run pack:docs -- <n>`) that
 * ui-kit does not need to be rebuilt for.
 *
 * The tarball is versioned in its filename, so a new version means a new
 * `file:` specifier in every app manifest, and pnpm re-resolves it on its own.
 * A repack under the same filename is the ui-kit trap again: the specifier is
 * unchanged, pnpm matches the recorded integrity and keeps the cached copy. So
 * the recorded integrity is rewritten and the extracted copy dropped either
 * way, and the result is verified by hash against the tarball.
 *
 *   node scripts/update-ai-chat.mjs                    # newest pack in the sibling checkout
 *   node scripts/update-ai-chat.mjs path/to/pack.tgz   # an explicit tarball
 *   DOCSPACE_AI_CHAT_SRC=... node scripts/update-ai-chat.mjs
 */

import fs from "node:fs";
import path from "node:path";
import {
  AI_CHAT_TARBALL,
  LOCKFILE,
  PNPM_DIR,
  ROOT,
  escapeRegExp,
  fail,
  integrityOf,
  lockDrift,
  newestIn,
  packedManifest,
  placeAiChat,
  pnpmInstall,
  verifyExtractedCopies,
} from "./lib/vendored-tarball.mjs";

/** The tarball to install: an explicit argument, or the newest pack next door. */
const findSource = () => {
  const [arg] = process.argv.slice(2);
  if (arg) {
    const full = path.resolve(arg);
    if (!fs.existsSync(full)) fail(`${arg} does not exist.`);
    return full;
  }

  const aiChat = path.resolve(
    ROOT,
    process.env.DOCSPACE_AI_CHAT_SRC ?? "../../onlyoffice-ai-chat",
  );

  if (!fs.existsSync(aiChat)) {
    fail(
      `ai-chat is not checked out at ${aiChat}. Clone it, or pass the tarball ` +
        "path, or set DOCSPACE_AI_CHAT_SRC.",
    );
  }

  const pack = newestIn(aiChat, AI_CHAT_TARBALL);

  if (pack === null) {
    fail(
      `No onlyoffice-ai-chat-*.tgz in ${aiChat}. Run \`npm run pack:docs -- <n>\` ` +
        "(or `npm run pack:pre -- <version>`) there first.",
    );
  }

  return path.join(aiChat, pack);
};

const source = findSource();
const file = path.basename(source);

// The app manifests carry the version in this filename, and pnpm's directory
// under node_modules/.pnpm is derived from it.
if (!AI_CHAT_TARBALL.test(file)) {
  fail(`${file} is not named onlyoffice-ai-chat-<version>.tgz -- rename it first.`);
}

const target = path.join(ROOT, file);
// pnpm's directory for it, plus a `_<peer hash>` suffix when it has peers.
const dirPrefix = `@onlyoffice+ai-chat@file+${file}`;
const isExtractedCopy = (entry) => entry === dirPrefix || entry.startsWith(`${dirPrefix}_`);
const lock = fs.readFileSync(LOCKFILE, "utf8");
const after = integrityOf(source);
const before = fs.existsSync(target) ? integrityOf(target) : null;

const appsNaming = (name) =>
  fs
    .readdirSync(path.join(ROOT, "packages"))
    .map((app) => path.join(ROOT, "packages", app, "package.json"))
    .filter((manifest) => fs.existsSync(manifest))
    .map((manifest) => fs.readFileSync(manifest, "utf8"))
    .filter((text) => text.includes('"@onlyoffice/ai-chat"'))
    .every((text) => text.includes(`"@onlyoffice/ai-chat": "file:../../${name}"`));

const othersAtRoot = fs
  .readdirSync(ROOT)
  .filter((f) => AI_CHAT_TARBALL.test(f) && f !== file);

// As in update-ui-kit, an unchanged tarball still falls through to the
// verification below rather than exiting: a previous run can have died after
// the lockfile and the extracted copy were already rewritten.
if (before === after && othersAtRoot.length === 0 && appsNaming(file)) {
  console.log(`${file} is already this build -- checking what is installed.`);
} else {
  const placed = placeAiChat(source);

  console.log(
    `@onlyoffice/ai-chat -> ${file}` +
      (placed.touched.length > 0 ? ` (${placed.touched.join(", ")} repointed)` : "") +
      (before !== null && before !== after ? " (same filename, new contents)" : ""),
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

  // And drop the extracted copy, which pnpm would otherwise relink as is.
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
    fail(`pnpm install failed; ai-chat tarball, manifests and lockfile restored: ${error.message}`);
  }
}

// Prove it landed: no lockfile reference to another ai-chat tarball, every
// extracted copy byte-identical to the tarball, and the lockfile entry
// describing the manifest that was actually packed.
const leftovers = [
  ...new Set(
    [...fs.readFileSync(LOCKFILE, "utf8").matchAll(/onlyoffice-ai-chat-[^\s'"(),}]+\.tgz/g)]
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

const copies = verifyExtractedCopies(target, "@onlyoffice/ai-chat", isExtractedCopy);

const packed = packedManifest(target);
const drift = lockDrift(`@onlyoffice/ai-chat@file:${file}`, packed);

if (drift.length > 0) {
  console.error("pnpm-lock.yaml still describes a previous build of @onlyoffice/ai-chat:\n");
  for (const line of drift) console.error(`  ${line}`);
  fail(
    "\nRun `pnpm update -r @onlyoffice/ai-chat`, review what else it moves in " +
      "pnpm-lock.yaml, and re-run this script.",
  );
}

console.log(
  `@onlyoffice/ai-chat ${packed.version} installed and verified against ${file} ` +
    `(${copies.length} extracted ${copies.length === 1 ? "copy" : "copies"}).`,
);

// pack-pre names the file after the version it packs, so a mismatch means the
// file was renamed by hand -- typically to look like what ui-kit asks for.
const [, fileVersion] = file.match(AI_CHAT_TARBALL);
if (fileVersion !== packed.version) {
  console.warn(
    `Warning: ${file} contains @onlyoffice/ai-chat ${packed.version}, not ${fileVersion}.`,
  );
}

// ui-kit declares ai-chat as a peer; pnpm has already warned above if this
// version falls outside the range, but say it plainly too.
const uiKitTarball = path.join(ROOT, "onlyoffice-apps-ui-kit.tgz");
if (fs.existsSync(uiKitTarball)) {
  const range = packedManifest(uiKitTarball).peerDependencies?.["@onlyoffice/ai-chat"];
  if (range) console.log(`ui-kit expects @onlyoffice/ai-chat ${range}.`);
}

console.log(
  `Commit ${file} (and the removal of the previous one) together with ` +
    "pnpm-lock.yaml and packages/*/package.json.",
);
