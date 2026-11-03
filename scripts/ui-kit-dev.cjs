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


// Serving @onlyoffice/apps-ui-kit from a checkout in the Next apps, the way
// packages/client/config/ui-kit-dev.ts does it for Vite.
//
// Waiting for build, pack, install and a restart on every ui-kit edit is the
// cost of consuming a prebuilt package. DOCSPACE_UI_KIT_SRC removes it for
// local work: the package specifier is aliased to the checkout and webpack
// compiles its TypeScript and SCSS like the app's own.
//
// CommonJS on purpose -- a next.config.js is loaded as CommonJS.

const fs = require("fs");
const path = require("path");

const UI_KIT_PACKAGE = "@onlyoffice/apps-ui-kit";
const UI_KIT_SRC_ENV = "DOCSPACE_UI_KIT_SRC";
const PLUGIN_NAME = "UiKitSourcePeers";

const fail = (message) => {
  throw new Error(`${UI_KIT_SRC_ENV}: ${message}`);
};

/**
 * The checkout to serve, or null when the variable is unset.
 * `appDir` is the app's own directory; the path is resolved against the repo
 * root, so the same value works for every app and for the Vite client.
 */
const readCheckout = (appDir) => {
  const raw = process.env[UI_KIT_SRC_ENV]?.trim();

  if (!raw) return null;

  const root = path.resolve(appDir, "../..", raw);
  const manifestPath = path.join(root, "package.json");

  if (!fs.existsSync(root))
    fail(`${root} does not exist. Point it at a ${UI_KIT_PACKAGE} checkout.`);

  if (!fs.existsSync(manifestPath))
    fail(`${root} has no package.json, so it is not a ${UI_KIT_PACKAGE} checkout.`);

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

  if (manifest.name !== UI_KIT_PACKAGE)
    fail(`${root} is "${manifest.name}", not ${UI_KIT_PACKAGE}.`);

  if (!fs.existsSync(path.join(root, "node_modules")))
    fail(
      `${root} has no node_modules. The checkout resolves its own dependencies, ` +
        "so run `pnpm install` there first.",
    );

  return { root, manifest };
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** True when `target` is `root` or lies below it. */
const isInside = (root, target) => {
  if (typeof target !== "string") return false;

  const relative = path.relative(root, target);

  return !relative.startsWith("..") && !path.isAbsolute(relative);
};

/**
 * True when `name` is installed for `appDir`, by the node_modules walk Node
 * itself does. require.resolve cannot tell: it fails on packages whose
 * `exports` hide package.json or offer no `require` condition.
 */
const isInstalled = (name, appDir) => {
  for (let dir = appDir; ; dir = path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "node_modules", name, "package.json")))
      return true;
    if (path.dirname(dir) === dir) return false;
  }
};

/** Every rule whose loader is next-swc-loader, at any depth of `oneOf`. */
const swcRules = (rules, found = []) => {
  for (const rule of rules ?? []) {
    if (!rule || typeof rule !== "object") continue;
    if (rule.oneOf) swcRules(rule.oneOf, found);

    const loaders = Array.isArray(rule.use)
      ? rule.use
      : rule.use
        ? [rule.use]
        : [];

    if (
      loaders.some(
        (loader) =>
          typeof loader === "object" &&
          typeof loader.loader === "string" &&
          loader.loader.includes("next-swc-loader"),
      )
    ) {
      found.push(rule);
    }
  }

  return found;
};

/**
 * Points an app's webpack config at a ui-kit checkout. A no-op when the
 * variable is unset, so every next.config.js can call it unconditionally.
 * Returns the checkout path, for the log line.
 */
const applyUiKitSourceMode = (config, appDir) => {
  const checkout = readCheckout(appDir);

  if (!checkout) return null;

  const { root, manifest } = checkout;

  config.resolve = config.resolve ?? {};
  config.resolve.alias = { ...config.resolve.alias, [UI_KIT_PACKAGE]: root };

  // The checkout sits outside this repo, so every bare specifier in ui-kit
  // source resolves against the checkout's own node_modules. For a package
  // both trees carry that means two copies, and for anything holding module
  // state -- a context, a store, a socket -- two copies is a silent behaviour
  // change. A peer imported from inside the checkout is therefore resolved as
  // if the app imported it: the ordinary lookup, so `exports`, browser
  // conditions and subpaths behave exactly as in the app's own code. Aliasing
  // the package directory instead skips `exports` and breaks packages that
  // have nothing else (react-router).
  const peers = Object.keys(manifest.peerDependencies ?? {}).filter(
    (peer) => peer !== UI_KIT_PACKAGE && isInstalled(peer, appDir),
  );

  if (peers.length > 0) {
    const peerRequest = new RegExp(
      `^(?:${peers.map(escapeRegExp).join("|")})(?:/|$)`,
    );

    config.plugins = config.plugins ?? [];
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (factory) => {
          factory.hooks.beforeResolve.tap(PLUGIN_NAME, (data) => {
            if (peerRequest.test(data.request) && isInside(root, data.context))
              data.context = appDir;
          });
        });
      },
    });
  }

  // The alias above is invisible to webpack's persistent cache: the config
  // file does not change when the variable does, so modules compiled in one
  // mode would be served in the other -- two Reacts, "Invalid hook call".
  if (config.cache && typeof config.cache === "object")
    config.cache.version = `${config.cache.version ?? ""}|${UI_KIT_SRC_ENV}=${root}`;

  // Next compiles what lies under the app, and the checkout does not. Adding
  // it to the SWC rules is what makes its TypeScript compile; the CSS rules
  // need nothing -- they key off the file extension, so the checkout's
  // *.module.scss go through the app's own CSS Modules pipeline and come out
  // named by it rather than by ui-kit's rollup config.
  const rules = swcRules(config.module?.rules);

  if (rules.length === 0)
    fail(
      "no next-swc-loader rule found in the webpack config, so ui-kit source " +
        "would not compile. Next's internals changed; update scripts/ui-kit-dev.cjs.",
    );

  for (const rule of rules) {
    if (Array.isArray(rule.include)) rule.include.push(root);
  }

  return root;
};

/**
 * Refuses a production build while the variable is set. The alias is a
 * dev-server switch: a build from a checkout is not the artifact the package
 * produces -- it is compiled by the app's own loaders, with the app's CSS
 * Modules naming, and none of ui-kit's own build steps run.
 */
const refuseBuildFromSource = (appDir) => {
  const checkout = readCheckout(appDir);

  if (checkout)
    fail(
      `set to ${checkout.root}, and it is a dev-server switch. ` +
        "Unset it to build: a build must come from the installed package.",
    );
};

module.exports = {
  UI_KIT_PACKAGE,
  UI_KIT_SRC_ENV,
  applyUiKitSourceMode,
  refuseBuildFromSource,
};
