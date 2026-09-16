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
import { createRequire } from "node:module";
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
    process.env.DOCSPACE_UI_KIT_ROOT ?? "../../docspace-ui-kit-react",
  );

  if (!fs.existsSync(uiKit)) {
    fail(
      `ui-kit is not checked out at ${uiKit}. Clone it, or pass the tarball ` +
        "path, or set DOCSPACE_UI_KIT_ROOT.",
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
const hadTarball = fs.existsSync(TARBALL);
// Snapshot before overwriting: the rollback below has to put these exact bytes
// back, and by then the file on disk is already the new pack.
const previousTarball = hadTarball ? fs.readFileSync(TARBALL) : null;
const before = hadTarball ? integrityOf(TARBALL) : null;

fs.copyFileSync(source, TARBALL);

const after = integrityOf(TARBALL);

if (before === after) {
  console.log(`${path.relative(ROOT, TARBALL)} is already this build -- nothing to do.`);
  process.exit(0);
}

// Point the lockfile at the new contents. Without this pnpm trusts the old
// hash and never reads the file.
const lock = fs.readFileSync(LOCKFILE, "utf8");
const pattern = /(integrity: )sha512-[A-Za-z0-9+/=]+(, tarball: file:onlyoffice-apps-ui-kit\.tgz)/g;
const matches = lock.match(pattern);

if (!matches || matches.length === 0) {
  fail("No @onlyoffice/apps-ui-kit entry in pnpm-lock.yaml -- has the dependency been renamed?");
}

const restore = () => {
  fs.writeFileSync(LOCKFILE, lock);
  if (previousTarball === null) fs.rmSync(TARBALL, { force: true });
  else fs.writeFileSync(TARBALL, previousTarball);
};

fs.writeFileSync(LOCKFILE, lock.replace(pattern, `$1${after}$2`));

// And drop the extracted copy, which pnpm would otherwise relink as is.
if (fs.existsSync(PNPM_DIR)) {
  for (const entry of fs.readdirSync(PNPM_DIR)) {
    if (entry.startsWith("@onlyoffice+apps-ui-kit@")) {
      fs.rmSync(path.join(PNPM_DIR, entry), { recursive: true, force: true });
    }
  }
}

// `--force` because a plain install short-circuits on "Already up to date":
// once the lockfile matches what pnpm last installed it skips the link step
// entirely, and the extracted copy removed just above is never recreated.
console.log(`Installing ${path.basename(source)} (${matches.length} lockfile entry rewritten)...`);
// shell: true on Windows -- pnpm is a .CMD shim there and Node will not spawn
// one directly (ENOENT), and this workspace has no node_modules/.bin/pnpm to
// fall back on.
try {
  execFileSync("pnpm", ["install", "--force"], {
    cwd: ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
} catch (error) {
  // The tarball and the lockfile were already rewritten above, so a failed
  // install leaves the tree claiming a version it does not have. Put both back.
  restore();
  fail(`pnpm install failed, tarball and lockfile restored: ${error.message}`);
}

// Prove it landed. A silent no-op is exactly what this script is here to catch,
// so do not take the install's exit code as evidence.
// Every copy, not just the first. pnpm's isolated layout installs one physical
// copy per distinct peer-resolution set, and the apps do not all land on the
// same one -- packages/sdk currently resolves a different copy than everything
// else. Verifying only the copy that packages/client sees would leave the other
// one silently stale.
const installedCopies = () => {
  const found = new Map();

  for (const app of fs.readdirSync(path.join(ROOT, "packages"))) {
    try {
      const require_ = createRequire(path.join(ROOT, "packages", app, "noop.js"));
      const dir = fs.realpathSync(
        path.dirname(require_.resolve("@onlyoffice/apps-ui-kit/package.json")),
      );
      if (!found.has(dir)) found.set(dir, []);
      found.get(dir).push(app);
    } catch {
      // The app does not depend on ui-kit; nothing to verify for it.
    }
  }

  return found;
};

const copies = installedCopies();

if (copies.size === 0) {
  fail("@onlyoffice/apps-ui-kit did not resolve after the install -- the tree is broken.");
}

// Hash the whole package, not one file inside it. Comparing dist/styles.css
// alone passed a build whose JavaScript had changed and whose stylesheet had
// not -- which is most of them, since a change to a .ts file leaves the CSS
// byte-identical. The check that is meant to catch a silent no-op has to see
// everything the tarball ships.
const treeHash = (files) => {
  const digest = createHash("sha256");
  for (const [name, bytes] of [...files].sort(([a], [b]) => a.localeCompare(b))) {
    digest.update(name).update("\0").update(bytes).update("\0");
  }
  return digest.digest("hex");
};

/** Every file in the packed tarball, keyed by its path below `package/`. */
const packedFiles = () => {
  const list = execFileSync("tar", ["-tzf", TARBALL], { encoding: "utf8" })
    .split("\n")
    .filter((name) => name.startsWith("package/") && !name.endsWith("/"));

  return list.map((name) => [
    name.slice("package/".length),
    execFileSync("tar", ["-xzOf", TARBALL, name], { maxBuffer: 256 * 1024 * 1024 }),
  ]);
};

/** The same files as installed, skipping anything the tarball does not ship. */
const installedFiles = (root, names) =>
  names.map(([name]) => {
    const full = path.join(root, name);
    return [name, fs.existsSync(full) ? fs.readFileSync(full) : Buffer.alloc(0)];
  });

const packed = packedFiles();
const want = treeHash(packed);

for (const [dir, apps] of copies) {
  if (treeHash(installedFiles(dir, packed)) === want) continue;

  fail(
    `node_modules still holds a different build of @onlyoffice/apps-ui-kit for ` +
      `${apps.join(", ")} (${path.relative(ROOT, dir)}). ` +
      "Remove node_modules/.pnpm/@onlyoffice+apps-ui-kit* and reinstall.",
  );
}

const [firstCopy] = copies.keys();
const { version } = JSON.parse(fs.readFileSync(path.join(firstCopy, "package.json"), "utf8"));
const where = copies.size === 1 ? "1 copy" : `${copies.size} copies`;

console.log(`@onlyoffice/apps-ui-kit ${version} installed and verified against the tarball (${where}).`);
console.log("Commit onlyoffice-apps-ui-kit.tgz together with pnpm-lock.yaml.");
