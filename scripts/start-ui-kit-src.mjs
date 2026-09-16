#!/usr/bin/env node
/**
 * Starts the usual dev servers with the client resolving @onlyoffice/apps-ui-kit
 * from a checkout instead of the installed tarball, so edits in ui-kit show up
 * through HMR with no build, pack or install in between.
 *
 * It exists at the repo root because that is where the dev servers are actually
 * started -- `pnpm start` fans out to five apps through Nx, and a script buried
 * in packages/client is never the one anyone runs. The variable is read only by
 * packages/client/config/ui-kit-dev.ts; the Next.js apps ignore it.
 *
 *   pnpm run start:ui-kit-src                 # same app set as `pnpm start`
 *   pnpm run start:ui-kit-src start:lite      # any other start script
 *   DOCSPACE_UI_KIT_SRC=../elsewhere pnpm run start:ui-kit-src
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DEFAULT_CHECKOUT = "../../docspace-ui-kit-react";

const [target = "start"] = process.argv.slice(2);
const checkout = process.env.DOCSPACE_UI_KIT_SRC ?? DEFAULT_CHECKOUT;
const resolved = path.resolve(ROOT, checkout);

// Only the cheapest check here. packages/client/config/ui-kit-dev.ts validates
// the checkout properly and prints which ui-kit is being served; this one just
// avoids spinning up five apps through Nx before that happens.
if (!fs.existsSync(path.join(resolved, "package.json"))) {
  console.error(
    `No @onlyoffice/apps-ui-kit checkout at ${resolved}.\n` +
      "Clone it there, or set DOCSPACE_UI_KIT_SRC to where it lives.",
  );
  process.exit(1);
}

// `shell` on Windows: pnpm is a .CMD shim there and CreateProcess cannot run one.
const { status } = spawnSync("pnpm", ["run", target], {
  cwd: ROOT,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, DOCSPACE_UI_KIT_SRC: checkout },
});

process.exit(status ?? 1);
