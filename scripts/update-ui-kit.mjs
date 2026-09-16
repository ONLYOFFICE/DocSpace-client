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
 *   DOCSPACE_UI_KIT_ROOT=... node scripts/update-ui-kit.mjs
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

  return packs[0];
};

const source = findSource();
const before = fs.existsSync(TARBALL) ? integrityOf(TARBALL) : null;

fs.copyFileSync(source, TARBALL);

const after = integrityOf(TARBALL);

// An unchanged tarball still falls through to the verification below rather
// than exiting here. The install step can die after the tarball, the lockfile
// and the extracted copies have already been rewritten -- that is what the
// `shell` flag below exists for -- and a re-run that exits early on "same
// build" would report success over a tree with no ui-kit in it at all.
if (before === after) {
  console.log(
    `${path.relative(ROOT, TARBALL)} is already this build -- checking what is installed.`,
  );
} else {
  // Point the lockfile at the new contents. Without this pnpm trusts the old
  // hash and never reads the file.
  const lock = fs.readFileSync(LOCKFILE, "utf8");
  const pattern = /(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:onlyoffice-apps-ui-kit\.tgz)/g;
  const matches = lock.match(pattern);

  if (!matches || matches.length === 0) {
    fail("No @onlyoffice/apps-ui-kit entry in pnpm-lock.yaml -- has the dependency been renamed?");
  }

  fs.writeFileSync(LOCKFILE, lock.replace(pattern, `$1${after}$2`));

  // And drop the extracted copy, which pnpm would otherwise relink as is.
  if (fs.existsSync(PNPM_DIR)) {
    for (const entry of fs.readdirSync(PNPM_DIR)) {
      if (entry.startsWith("@onlyoffice+apps-ui-kit@")) {
        fs.rmSync(path.join(PNPM_DIR, entry), { recursive: true, force: true });
      }
    }
  }

  const rewritten = `${matches.length} lockfile ${matches.length === 1 ? "entry" : "entries"} rewritten`;

  // `--force` because a plain install short-circuits on "Already up to date":
  // once the lockfile matches what pnpm last installed it skips the link step
  // entirely, and the extracted copy removed just above is never recreated.
  console.log(`Installing ${path.basename(source)} (${rewritten})...`);
  // `shell` on Windows: pnpm is a .CMD shim there, and CreateProcess cannot run
  // one. Without it execFileSync throws ENOENT after the tarball and the lockfile
  // have already been rewritten, leaving the tree half-updated.
  execFileSync("pnpm", ["install", "--force"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
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
// per distinct peer-resolution set, and a stale sibling is as broken as a stale
// primary -- it is what the apps that resolve to it will run.
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
