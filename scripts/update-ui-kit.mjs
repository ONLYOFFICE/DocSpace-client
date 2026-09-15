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
const before = fs.existsSync(TARBALL) ? integrityOf(TARBALL) : null;

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
execFileSync("pnpm", ["install", "--force"], { cwd: ROOT, stdio: "inherit" });

// Prove it landed. A silent no-op is exactly what this script is here to catch,
// so do not take the install's exit code as evidence.
let installed;
try {
  const require_ = createRequire(path.join(ROOT, "packages", "client", "noop.js"));
  installed = path.dirname(require_.resolve("@onlyoffice/apps-ui-kit/package.json"));
} catch {
  fail("@onlyoffice/apps-ui-kit did not resolve after the install -- the tree is broken.");
}

const stylesheet = path.join(installed, "dist", "styles.css");
const packed = execFileSync("tar", ["-xzOf", TARBALL, "package/dist/styles.css"], {
  maxBuffer: 64 * 1024 * 1024,
});

const sameStylesheet =
  fs.existsSync(stylesheet) &&
  createHash("sha1").update(fs.readFileSync(stylesheet)).digest("hex") ===
    createHash("sha1").update(packed).digest("hex");

if (!sameStylesheet) {
  fail(
    "node_modules still holds a different build of @onlyoffice/apps-ui-kit. " +
      "Remove node_modules/.pnpm/@onlyoffice+apps-ui-kit* and reinstall.",
  );
}

const { version } = JSON.parse(fs.readFileSync(path.join(installed, "package.json"), "utf8"));

console.log(`@onlyoffice/apps-ui-kit ${version} installed and verified against the tarball.`);
console.log("Commit onlyoffice-apps-ui-kit.tgz together with pnpm-lock.yaml.");
