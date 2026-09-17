#!/usr/bin/env node
/**
 * Drops a freshly packed ui-kit tarball into this repo and makes pnpm actually
 * install it.
 *
 * The naive procedure -- copy the .tgz over, run `pnpm install` -- silently
 * does nothing. The tarball keeps one filename across versions on purpose (so a
 * bump touches no app manifest), which means the `file:onlyoffice-apps-ui-kit.tgz`
 * specifier never changes. pnpm sees a specifier it already has, matches the
 * integrity recorded in pnpm-lock.yaml, and keeps the cached copy. `--force`
 * does not help either. The result is a green install, an unchanged lockfile,
 * and the previous build still in node_modules -- the failure mode this script
 * exists to remove.
 *
 * So: copy, rewrite the recorded integrity, drop the extracted copy, install,
 * then verify by hash that what landed in node_modules is what was copied in.
 *
 *   node scripts/update-ui-kit.mjs                     # newest pack in the sibling checkout
 *   node scripts/update-ui-kit.mjs path/to/pack.tgz    # an explicit tarball
 *   DOCSPACE_UI_KIT_SRC=... node scripts/update-ui-kit.mjs
 */

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { gunzipSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TARBALL = path.join(ROOT, "onlyoffice-apps-ui-kit.tgz");
const LOCKFILE = path.join(ROOT, "pnpm-lock.yaml");
const PNPM_DIR = path.join(ROOT, "node_modules", ".pnpm");

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const integrityOf = (file) =>
  `sha512-${createHash("sha512").update(fs.readFileSync(file)).digest("base64")}`;

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

  const packs = fs
    .readdirSync(uiKit)
    .filter((f) => /^onlyoffice-apps-ui-kit-.*\.tgz$/.test(f))
    .map((f) => path.join(uiKit, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  if (packs.length === 0) {
    fail(`No onlyoffice-apps-ui-kit-*.tgz in ${uiKit}. Run \`pnpm build && pnpm pack\` there first.`);
  }

  uiKitRoot = uiKit;

  return packs[0];
};

/**
 * ui-kit statically imports @onlyoffice/ai-chat, so the two move together. That
 * tarball is versioned in its filename, which means a bump is not just a file
 * swap -- every app manifest naming it has to change with it. Doing that by
 * hand is how the repositories last drifted apart: ui-kit required 0.5.113
 * while this repo still vendored, and every app still named, 0.5.110.
 *
 * So take whatever ai-chat sits next to the ui-kit checkout as the truth.
 *
 * Returns null when nothing moved, otherwise the new filename and a `restore`
 * that puts the previous tarball(s) and every rewritten manifest back -- the
 * install below can still fail, and a tree whose manifests name a file the
 * lockfile does not know is the half-updated state this script exists to avoid.
 */
const syncAiChat = (uiKitRoot) => {
  if (uiKitRoot === null) return null;

  const NAME = /^onlyoffice-ai-chat-(.+)\.tgz$/;
  const [newest] = fs
    .readdirSync(uiKitRoot)
    .filter((f) => NAME.test(f))
    .sort((a, b) => fs.statSync(path.join(uiKitRoot, b)).mtimeMs - fs.statSync(path.join(uiKitRoot, a)).mtimeMs);

  if (!newest) return null;

  const current = fs.readdirSync(ROOT).filter((f) => NAME.test(f));

  if (current.length === 1 && current[0] === newest) return null;

  // Snapshot before touching anything: the bytes of every tarball about to be
  // removed or overwritten, and the text of every manifest about to change.
  const previousTarballs = current.map((f) => [f, fs.readFileSync(path.join(ROOT, f))]);
  const previousManifests = [];

  fs.copyFileSync(path.join(uiKitRoot, newest), path.join(ROOT, newest));
  for (const stale of current) {
    if (stale !== newest) fs.rmSync(path.join(ROOT, stale), { force: true });
  }

  // Every manifest that names the old file has to name the new one, or the
  // install fails on a path that no longer exists.
  const touched = [];
  for (const app of fs.readdirSync(path.join(ROOT, "packages"))) {
    const manifest = path.join(ROOT, "packages", app, "package.json");
    if (!fs.existsSync(manifest)) continue;

    const text = fs.readFileSync(manifest, "utf8");
    const next = text.replace(
      /"@onlyoffice\/ai-chat": "file:\.\.\/\.\.\/onlyoffice-ai-chat-[^"]+\.tgz"/g,
      `"@onlyoffice/ai-chat": "file:../../${newest}"`,
    );

    if (next === text) continue;
    previousManifests.push([manifest, text]);
    fs.writeFileSync(manifest, next);
    touched.push(app);
  }

  console.log(
    `@onlyoffice/ai-chat -> ${newest}` +
      (touched.length > 0 ? ` (${touched.join(", ")} repointed)` : ""),
  );

  const restore = () => {
    for (const [manifest, text] of previousManifests) fs.writeFileSync(manifest, text);
    if (!current.includes(newest)) fs.rmSync(path.join(ROOT, newest), { force: true });
    for (const [f, bytes] of previousTarballs) fs.writeFileSync(path.join(ROOT, f), bytes);
  };

  return { file: newest, restore };
};

// Checked before anything is written. Everything below overwrites tarballs and
// app manifests, and the rollback that undoes them is only wired up once the
// install is about to run -- so a precondition that fails after those writes
// leaves exactly the half-updated tree this script exists to avoid. Read the
// lockfile first and bail while there is still nothing to undo.
const LOCK_PATTERN =
  /(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:onlyoffice-apps-ui-kit\.tgz)/g;
const lock = fs.readFileSync(LOCKFILE, "utf8");
const lockMatches = lock.match(LOCK_PATTERN);

if (!lockMatches || lockMatches.length === 0) {
  fail("No @onlyoffice/apps-ui-kit entry in pnpm-lock.yaml -- has the dependency been renamed?");
}

const source = findSource();
const aiChat = syncAiChat(uiKitRoot);
const hadTarball = fs.existsSync(TARBALL);
// Snapshot before overwriting: the rollback below has to put these exact bytes
// back, and by then the file on disk is already the new pack.
const previousTarball = hadTarball ? fs.readFileSync(TARBALL) : null;
const before = hadTarball ? integrityOf(TARBALL) : null;

fs.copyFileSync(source, TARBALL);

const after = integrityOf(TARBALL);

// An unchanged tarball still falls through to the verification below rather
// than exiting here. The install step can die after the tarball, the lockfile
// and the extracted copies have already been rewritten -- that is what the
// `shell` flag and the rollback below exist for -- and a re-run that exits
// early on "same build" would report success over a tree with no ui-kit in it
// at all.
//
// Nor does an unchanged ui-kit mean there is nothing to install: ai-chat may
// have moved on its own, and the manifests rewritten above then need pnpm to
// pick the new file up.
if (before === after && aiChat === null) {
  console.log(
    `${path.relative(ROOT, TARBALL)} is already this build -- checking what is installed.`,
  );
} else {
  const restore = () => {
    fs.writeFileSync(LOCKFILE, lock);
    if (previousTarball === null) fs.rmSync(TARBALL, { force: true });
    else fs.writeFileSync(TARBALL, previousTarball);
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

  const rewritten = `${lockMatches.length} lockfile ${lockMatches.length === 1 ? "entry" : "entries"} rewritten`;

  // `--force` because a plain install short-circuits on "Already up to date":
  // once the lockfile matches what pnpm last installed it skips the link step
  // entirely, and the extracted copy removed just above is never recreated.
  console.log(`Installing ${path.basename(source)} (${rewritten})...`);
  // `shell` on Windows: pnpm is a .CMD shim there, and CreateProcess cannot run
  // one. Without it execFileSync throws ENOENT after the tarball and the lockfile
  // have already been rewritten, leaving the tree half-updated.
  try {
    execFileSync("pnpm", ["install", "--force"], {
      cwd: ROOT,
      stdio: "inherit",
      shell: process.platform === "win32",
    });
  } catch (error) {
    // The tarball, the lockfile and (when ai-chat moved) its tarball and the
    // app manifests were already rewritten above, so a failed install leaves
    // the tree claiming a version it does not have. Put all of it back.
    restore();
    fail(
      `pnpm install failed; tarball, lockfile${aiChat ? ", ai-chat and manifests" : ""} restored: ${error.message}`,
    );
  }
}

// Prove it landed. A silent no-op is exactly what this script is here to catch,
// so do not take the install's exit code as evidence.
//
// Digest everything the tarball ships, not a chosen subtree. Narrower versions
// kept missing changes: `dist/styles.css` alone is identical across any build
// that touched only JavaScript, and `dist/` alone misses `styles/` and
// `locales/`, which the exports map serves directly and which hundreds of the
// client's own .module.scss files `@use`. Hashing the whole `package/` prefix
// also means this needs no edit when the manifest's `files` changes.
//
// The tarball is read with node's own gzip and a minimal tar walker rather
// than the `tar` binary: the GNU tar that ships with Git Bash reads a Windows
// path as a remote `host:path` spec and refuses both the archive and `-C`.
const PACKAGE_PREFIX = "package/";

// pnpm puts the package's own dependencies here; the tarball has no such entry.
const INSTALL_ONLY = ["node_modules"];

const digestEntries = (entries) => {
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

const contentsOfDir = (dir) => {
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

const contentsOfTarball = (file) => {
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
    // record that follows, which matters for this package's deepest subpaths.
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

const expected = digestEntries(contentsOfTarball(TARBALL));

// Every extracted copy, not just the one the client resolves: pnpm installs one
// per distinct peer-resolution set. There is one today (zod is pinned through
// the catalog so client and sdk resolve the same ai-chat variant), but the
// moment a peer drifts there are two again, and a stale sibling is as broken as
// a stale primary -- it is what the apps that resolve to it will run.
const copies = fs.existsSync(PNPM_DIR)
  ? fs
      .readdirSync(PNPM_DIR)
      .filter((entry) => entry.startsWith("@onlyoffice+apps-ui-kit@"))
      .map((entry) =>
        path.join(PNPM_DIR, entry, "node_modules", "@onlyoffice", "apps-ui-kit"),
      )
      .filter((dir) => fs.existsSync(dir))
  : [];

if (copies.length === 0) {
  fail("@onlyoffice/apps-ui-kit is not in node_modules after the install -- the tree is broken.");
}

const stale = copies.filter(
  (dir) => digestEntries(contentsOfDir(dir)) !== expected,
);

if (stale.length > 0) {
  console.error("node_modules still holds a different build of @onlyoffice/apps-ui-kit:\n");
  for (const dir of stale) console.error(`  ${path.relative(ROOT, dir)}`);
  fail("\nRemove node_modules/.pnpm/@onlyoffice+apps-ui-kit* and reinstall.");
}

const { version } = JSON.parse(
  fs.readFileSync(path.join(copies[0], "package.json"), "utf8"),
);

console.log(
  `@onlyoffice/apps-ui-kit ${version} installed and verified against the tarball ` +
    `(${copies.length} extracted ${copies.length === 1 ? "copy" : "copies"}).`,
);
console.log("Commit onlyoffice-apps-ui-kit.tgz together with pnpm-lock.yaml.");
