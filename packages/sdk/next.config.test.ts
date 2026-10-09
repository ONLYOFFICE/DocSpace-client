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

import path from "path";
import { createRequire } from "module";
import { describe, expect, it } from "vitest";

const require = createRequire(import.meta.url);
const { findSplitCopies, installedCopy, repoRoot, sharedDir } =
  require("../../scripts/split-copies.cjs") as typeof import("../../scripts/split-copies.cjs");

type Resource = { request: string; context: string };

// The two fields of webpack's plugin this test applies. webpack ships no types
// to this package, and it is loaded through require like next.config.js does,
// so `instanceof` sees the same class.
type ReplacementPlugin = {
  resourceRegExp: RegExp;
  newResource: string | ((resource: Resource) => void);
};
const { NormalModuleReplacementPlugin } = require("webpack") as {
  NormalModuleReplacementPlugin: abstract new (
    ...args: never[]
  ) => ReplacementPlugin;
};

const appDir = __dirname;

const show = (copy: string | null) =>
  copy ? path.relative(repoRoot, copy) : "nothing";

// Just enough of a webpack config for the hook in next.config.js to run: it
// edits Next's svg and image rules, so those have to be there.
const stubWebpackConfig = () => ({
  mode: "production",
  resolve: {},
  plugins: [] as unknown[],
  output: {},
  module: {
    rules: [
      { test: /\.svg$/, issuer: /\.tsx?$/, resourceQuery: { not: [] } },
      { loader: "next-image-loader" },
    ] as Record<string, unknown>[],
  },
});

// The installed copy webpack picks for `request` imported from `context`, after
// the config's NormalModuleReplacementPlugins have had their say.
const resolveCopy = (
  plugins: ReplacementPlugin[],
  name: string,
  context: string,
) => {
  const resource: Resource = { request: name, context };

  for (const plugin of plugins) {
    if (!plugin.resourceRegExp.test(resource.request)) continue;

    if (typeof plugin.newResource === "function")
      plugin.newResource(resource);
    else resource.request = plugin.newResource;
  }

  return installedCopy(resource.context, name);
};

// In ui-kit source mode the alias replaces the installed package, so there is
// no second copy to collapse.
describe.skipIf(Boolean(process.env.DOCSPACE_UI_KIT_SRC?.trim()))(
  "next.config.js webpack dedupe",
  () => {
    it("resolves every dependency split between sdk and shared to the sdk's copy", () => {
      const nextConfig = require("./next.config.js");
      const config = nextConfig.webpack(stubWebpackConfig(), {});
      const plugins = config.plugins.filter(
        (plugin: unknown): plugin is ReplacementPlugin =>
          plugin instanceof NormalModuleReplacementPlugin,
      );

      const failures = findSplitCopies(appDir)
        .map(({ name, appCopy }) => ({
          name,
          appCopy,
          fromShared: resolveCopy(plugins, name, sharedDir),
          fromApp: resolveCopy(plugins, name, appDir),
        }))
        .filter(
          ({ appCopy, fromShared, fromApp }) =>
            fromShared !== appCopy || fromApp !== appCopy,
        )
        .map(
          ({ name, fromShared, fromApp }) =>
            `${name} is installed twice (sdk and shared declare different ` +
            `peers). The bundle resolves it from sdk to ${show(fromApp)} and ` +
            `from shared to ${show(fromShared)}; resolve it from this app's ` +
            "directory with the NormalModuleReplacementPlugin in next.config.js.",
        );

      expect(failures).toEqual([]);
    });
  },
);
