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
 * Shared by update-ui-kit.mjs and update-ai-chat.mjs: both drop a vendored
 * tarball at the repo root, make pnpm install it, and then prove that what
 * landed in node_modules and pnpm-lock.yaml is what was copied in.
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
);
export const LOCKFILE = path.join(ROOT, "pnpm-lock.yaml");
export const PNPM_DIR = path.join(ROOT, "node_modules", ".pnpm");

export const fail = (message) => {
  console.error(message);
  process.exit(1);
};

export const integrityOf = (file) =>
  `sha512-${createHash("sha512").update(fs.readFileSync(file)).digest("base64")}`;

export const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Newest file in `dir` whose name matches `pattern`, by mtime. */
export const newestIn = (dir, pattern) =>
  fs
    .readdirSync(dir)
    .filter((f) => pattern.test(f))
    .sort(
      (a, b) =>
        fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs,
    )[0] ?? null;

/**
 * `pnpm install --force`. `--force` because a plain install short-circuits on
 * "Already up to date": once the lockfile matches what pnpm last installed it
 * skips the link step entirely, and an extracted copy removed beforehand is
 * never recreated.
 *
 * `shell` on Windows: pnpm is a .CMD shim there, and CreateProcess cannot run
 * one. Without it execFileSync throws ENOENT after the tarball and the lockfile
 * have already been rewritten, leaving the tree half-updated.
 */
export const pnpmInstall = () =>
  execFileSync("pnpm", ["install", "--force"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });

// The digest covers everything the tarball ships, not a chosen subtree.
// Narrower versions kept missing changes: `dist/styles.css` alone is identical
// across any ui-kit build that touched only JavaScript, and `dist/` alone
// misses `styles/` and `locales/`, which the exports map serves directly.
// Hashing the whole `package/` prefix also means this needs no edit when a
// manifest's `files` changes.
//
// The tarball is read with node's own gzip and a minimal tar walker rather
// than the `tar` binary: the GNU tar that ships with Git Bash reads a Windows
// path as a remote `host:path` spec and refuses both the archive and `-C`.
const PACKAGE_PREFIX = "package/";

// pnpm puts the package's own dependencies here; the tarball has no such entry.
const INSTALL_ONLY = ["node_modules"];

export const digestEntries = (entries) => {
  const hash = createHash("sha1");

  for (const [name, content] of [...entries].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  )) {
    hash.update(name);
    hash.update("\0");
    hash.update(content);
  }

  return hash.digest("hex");
};

export const contentsOfDir = (dir) => {
  const entries = [];

  const walk = (current, prefix) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const name = prefix ? `${prefix}/${entry.name}` : entry.name;

      if (INSTALL_ONLY.includes(name)) continue;

      if (entry.isDirectory()) walk(full, name);
      else entries.push([name, fs.readFileSync(full)]);
    }
  };

  walk(dir, "");

  return entries;
};

export const contentsOfTarball = (file) => {
  const buf = gunzipSync(fs.readFileSync(file));
  const entries = [];
  let offset = 0;
  let override = null;

  while (offset + 512 <= buf.length) {
    const header = buf.subarray(offset, offset + 512);

    if (header.every((byte) => byte === 0)) break;

    const field = (start, length) =>
      header
        .subarray(start, start + length)
        .toString("utf8")
        .replace(/\0.*$/, "");

    const size = parseInt(field(124, 12).trim(), 8) || 0;
    const type = String.fromCharCode(header[156]);
    const body = buf.subarray(offset + 512, offset + 512 + size);

    offset += 512 + Math.ceil(size / 512) * 512;

    // GNU long name and PAX extended header: both carry the real path for the
    // record that follows, which matters for the deepest subpaths.
    if (type === "L") {
      override = body.toString("utf8").replace(/\0.*$/, "");
      continue;
    }

    if (type === "x" || type === "g") {
      const match = body.toString("utf8").match(/\d+ path=([^\n]*)\n/);
      if (match) [, override] = match;
      continue;
    }

    const prefix = field(345, 155);
    const name = field(0, 100);
    const full = override ?? (prefix ? `${prefix}/${name}` : name);

    override = null;

    if ((type === "0" || type === "\0") && full.startsWith(PACKAGE_PREFIX)) {
      entries.push([full.slice(PACKAGE_PREFIX.length), body]);
    }
  }

  if (entries.length === 0) {
    fail(`${path.basename(file)} carries no ${PACKAGE_PREFIX} entries -- the tarball is broken.`);
  }

  return entries;
};

export const packedManifest = (file) =>
  JSON.parse(
    contentsOfTarball(file)
      .find(([name]) => name === "package.json")[1]
      .toString("utf8"),
  );

/**
 * Every extracted copy under node_modules/.pnpm whose directory name passes
 * `matches`, not just the one the client resolves: pnpm installs one per
 * distinct peer-resolution set, and a stale sibling is as broken as a stale
 * primary -- it is what the apps that resolve to it will run.
 *
 * Fails unless at least one copy exists and every copy matches `tarball` byte
 * for byte. Returns the copies.
 */
export const verifyExtractedCopies = (tarball, packageName, matches) => {
  const expected = digestEntries(contentsOfTarball(tarball));
  const copies = fs.existsSync(PNPM_DIR)
    ? fs
        .readdirSync(PNPM_DIR)
        .filter(matches)
        .map((entry) => path.join(PNPM_DIR, entry, "node_modules", ...packageName.split("/")))
        .filter((dir) => fs.existsSync(dir))
    : [];

  if (copies.length === 0) {
    fail(`${packageName} is not in node_modules after the install -- the tree is broken.`);
  }

  const stale = copies.filter((dir) => digestEntries(contentsOfDir(dir)) !== expected);

  if (stale.length > 0) {
    console.error(`node_modules still holds a different build of ${packageName}:\n`);
    for (const dir of stale) console.error(`  ${path.relative(ROOT, dir)}`);
    fail(`\nRemove those directories under node_modules/.pnpm and reinstall.`);
  }

  return copies;
};

const unquote = (value) => value.trim().replace(/^'(.*)'$/, "$1");

/** Package names under `overrides:` in pnpm-workspace.yaml. */
const overriddenNames = () => {
  const workspace = fs.readFileSync(path.join(ROOT, "pnpm-workspace.yaml"), "utf8");
  const block = workspace.match(/^overrides:\n((?:[ #].*\n|\n)*)/m)?.[1] ?? "";
  const names = new Set();
  for (const [, key] of block.matchAll(/^ {2}("[^"]+"|'[^']+'|[^\s:#][^:]*):/gm)) {
    // `"smol-toml@^1"` overrides smol-toml for every range it names.
    names.add(key.replace(/^["']|["']$/g, "").replace(/(.)@.*$/, "$1"));
  }
  return names;
};

/**
 * Compares the lockfile entry `key` (e.g.
 * `@onlyoffice/apps-ui-kit@file:onlyoffice-apps-ui-kit.tgz`) with the manifest
 * that was actually packed, and returns one line per mismatch.
 *
 * Matching bytes are not enough: when the specifier is unchanged, rewriting the
 * integrity makes pnpm read the new tarball, yet it keeps the package's
 * recorded peerDependencies and snapshot as they were. A new runtime
 * dependency would be missed the same way and never linked, with
 * `--frozen-lockfile` in Docker staying green.
 */
export const lockDrift = (key, packed) => {
  const lockText = fs.readFileSync(LOCKFILE, "utf8");

  // `last`: a key with no peer suffix appears twice, under `packages:` first
  // and `snapshots:` second.
  const lockEntry = (suffix, last = false) => {
    const needle = `\n  '${key}${suffix}`;
    const start = last ? lockText.lastIndexOf(needle) : lockText.indexOf(needle);
    if (start === -1) return null;
    const end = lockText.indexOf("\n\n", start + 1);
    return lockText.slice(start + 1, end === -1 ? undefined : end);
  };

  const fieldOf = (entry, field) => {
    const body = entry.match(new RegExp(`^ {4}${field}:\\n((?: {6}.*\\n?)*)`, "m"))?.[1] ?? "";
    return new Map(
      [...body.matchAll(/^ {6}('[^']+'|[^\s:]+): (.*)$/gm)].map(([, name, value]) => [
        unquote(name),
        unquote(value),
      ]),
    );
  };

  const packagesEntry = lockEntry("':");
  // A package with peers has its snapshot under a `(...)` peer suffix; one
  // without is keyed exactly like its packages entry.
  const snapshotEntry = lockEntry("(") ?? lockEntry("':", true);

  if (packagesEntry === null || snapshotEntry === null || snapshotEntry === packagesEntry) {
    return [`no ${key} entry in pnpm-lock.yaml packages/snapshots`];
  }

  const drift = [];
  const overridden = overriddenNames();

  const lockedPeers = fieldOf(packagesEntry, "peerDependencies");
  for (const [name, range] of Object.entries(packed.peerDependencies ?? {})) {
    // An override rewrites the recorded range, so it says nothing about drift.
    if (overridden.has(name)) continue;
    if (lockedPeers.get(name) !== range) {
      drift.push(`peer ${name}: tarball ${range}, lockfile ${lockedPeers.get(name) ?? "(missing)"}`);
    }
  }

  const linked = new Set([
    ...fieldOf(snapshotEntry, "dependencies").keys(),
    ...fieldOf(snapshotEntry, "optionalDependencies").keys(),
  ]);
  for (const name of Object.keys(packed.dependencies ?? {})) {
    if (!linked.has(name)) drift.push(`dependency ${name}: in the tarball, not in the lockfile snapshot`);
  }

  return drift;
};

/** `onlyoffice-ai-chat-<version>.tgz`: the version is part of the filename. */
export const AI_CHAT_TARBALL = /^onlyoffice-ai-chat-(.+)\.tgz$/;

const AI_CHAT_SPECIFIER =
  /"@onlyoffice\/ai-chat": "file:\.\.\/\.\.\/onlyoffice-ai-chat-[^"]+\.tgz"/g;

/**
 * Puts `source` at the repo root as the only ai-chat tarball there and
 * repoints every app manifest at it.
 *
 * The ai-chat tarball is versioned in its filename, so a bump is not just a
 * file swap -- every app manifest naming it has to change with it, or the
 * install fails on a path that no longer exists. Doing that by hand is how the
 * repositories once drifted apart: ui-kit required 0.5.113 while this repo
 * still vendored, and every app still named, 0.5.110.
 *
 * Returns the new filename, the repointed apps, and a `restore` that puts the
 * previous tarball(s) and every rewritten manifest back -- the install that
 * follows can still fail, and a tree whose manifests name a file the lockfile
 * does not know is the half-updated state the updaters exist to avoid.
 */
export const placeAiChat = (source) => {
  const file = path.basename(source);
  const target = path.join(ROOT, file);
  const current = fs.readdirSync(ROOT).filter((f) => AI_CHAT_TARBALL.test(f));

  // Snapshot before touching anything: the bytes of every tarball about to be
  // removed or overwritten, and the text of every manifest about to change.
  const previousTarballs = current.map((f) => [f, fs.readFileSync(path.join(ROOT, f))]);
  const previousManifests = [];

  if (path.resolve(source) !== target) fs.copyFileSync(source, target);
  for (const stale of current) {
    if (stale !== file) fs.rmSync(path.join(ROOT, stale), { force: true });
  }

  const touched = [];
  for (const app of fs.readdirSync(path.join(ROOT, "packages"))) {
    const manifest = path.join(ROOT, "packages", app, "package.json");
    if (!fs.existsSync(manifest)) continue;

    const text = fs.readFileSync(manifest, "utf8");
    const next = text.replace(AI_CHAT_SPECIFIER, `"@onlyoffice/ai-chat": "file:../../${file}"`);

    if (next === text) continue;
    previousManifests.push([manifest, text]);
    fs.writeFileSync(manifest, next);
    touched.push(app);
  }

  const restore = () => {
    for (const [manifest, text] of previousManifests) fs.writeFileSync(manifest, text);
    if (!current.includes(file)) fs.rmSync(target, { force: true });
    for (const [f, bytes] of previousTarballs) fs.writeFileSync(path.join(ROOT, f), bytes);
  };

  return { file, touched, restore };
};
