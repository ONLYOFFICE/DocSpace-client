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
import type { UserConfig } from "vite";
import { rootDir } from "./utils";
import {
  UI_KIT_PACKAGE,
  uiKitDevRoot,
  uiKitPeerDependencies,
} from "./ui-kit-dev";

// One prefix alias is enough: the checkout mirrors the tarball's layout, so
// `@onlyoffice/apps-ui-kit/components/text` lands on `components/text` in both.
// Nothing imports the `styles.css` bundle any more -- components carry their
// own stylesheet, and ThemeProvider's source imports its SCSS directly.
const uiKitAlias: Record<string, string> = uiKitDevRoot
  ? { [UI_KIT_PACKAGE]: uiKitDevRoot }
  : {};

const baseDedupe = [
  "styled-components",
  "react",
  "react-dom",
  "@onlyoffice/ai-chat",
];

// The checkout sits next to this repo, so every bare specifier in ui-kit source
// resolves against the checkout's own node_modules. For a package both trees
// carry that means two copies, and for anything holding module state -- a
// context, a store, a socket -- two copies is a silent behaviour change.
// UI_KIT_PACKAGE itself is not listed: the alias above intercepts it first.
const dedupe = [...new Set([...baseDedupe, ...uiKitPeerDependencies])];

export const resolve: UserConfig["resolve"] = {
  alias: {
    PUBLIC_DIR: path.resolve(rootDir, "../../public"),
    ASSETS_DIR: path.resolve(rootDir, "./public"),
    SRC_DIR: path.resolve(rootDir, "./src"),
    PACKAGE_FILE: path.resolve(rootDir, "package.json"),
    COMMON_DIR: path.resolve(rootDir, "../common"),
    "@docspace/shared": path.resolve(rootDir, "../shared"),
    ...uiKitAlias,
  },
  extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  dedupe,
};
