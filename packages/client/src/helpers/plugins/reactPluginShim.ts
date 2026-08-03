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

// Shim module for isolating React and SDK dependencies of plugins.
//
// Module plugins are loaded via dynamic import() from a blob URL. To ensure
// the plugin and the host share the same React and SDK instances (otherwise
// hooks break because of different context objects), this module:
//  1. Registers host instances in window globals on first import.
//  2. Creates blob-URL shims that proxy to those globals.
//  3. Exports rewritePluginImports — replaces bare specifiers in the plugin
//     source with the corresponding blob URLs before execution.

import * as ReactAll from "react";
import * as ReactJSXRuntimeAll from "react/jsx-runtime";
import * as PluginSDKAll from "@onlyoffice/docspace-plugin-sdk";
import * as PluginSDKReactAll from "@onlyoffice/docspace-plugin-sdk/react";

declare global {
  interface Window {
    __ds_React?: typeof ReactAll;
    __ds_ReactJSXRuntime?: typeof ReactJSXRuntimeAll;
    __ds_PluginSDK?: typeof PluginSDKAll;
    __ds_PluginSDKReact?: typeof PluginSDKReactAll;
  }
}

window.__ds_React = ReactAll;
window.__ds_ReactJSXRuntime = ReactJSXRuntimeAll;
window.__ds_PluginSDK = PluginSDKAll;
window.__ds_PluginSDKReact = PluginSDKReactAll;

function buildShimSource(
  globalKey: string,
  mod: Record<string, unknown>,
): string {
  const namedExports = Object.keys(mod)
    .filter((k) => k !== "default")
    .map((k) => `export const ${k} = R["${k}"];`)
    .join("\n");
  return `const R = window.${globalKey};\nexport default R;\n${namedExports}`;
}

const REACT_SHIM_URL = URL.createObjectURL(
  new Blob(
    [buildShimSource("__ds_React", ReactAll as Record<string, unknown>)],
    { type: "application/javascript" },
  ),
);

const JSX_RUNTIME_SHIM_URL = URL.createObjectURL(
  new Blob(
    [
      buildShimSource(
        "__ds_ReactJSXRuntime",
        ReactJSXRuntimeAll as Record<string, unknown>,
      ),
    ],
    { type: "application/javascript" },
  ),
);

const PLUGIN_SDK_SHIM_URL = URL.createObjectURL(
  new Blob(
    [buildShimSource("__ds_PluginSDK", PluginSDKAll as Record<string, unknown>)],
    { type: "application/javascript" },
  ),
);

const PLUGIN_SDK_REACT_SHIM_URL = URL.createObjectURL(
  new Blob(
    [
      buildShimSource(
        "__ds_PluginSDKReact",
        PluginSDKReactAll as Record<string, unknown>,
      ),
    ],
    { type: "application/javascript" },
  ),
);

const SPECIFIER_MAP: Record<string, string> = {
  react: REACT_SHIM_URL,
  "react/jsx-runtime": JSX_RUNTIME_SHIM_URL,
  "@onlyoffice/docspace-plugin-sdk": PLUGIN_SDK_SHIM_URL,
  "@onlyoffice/docspace-plugin-sdk/react": PLUGIN_SDK_REACT_SHIM_URL,
};

export function rewritePluginImports(code: string): string {
  return code.replace(
    /from\s+["']([^"']+)["']/g,
    (match, specifier: string) => {
      const shimUrl = SPECIFIER_MAP[specifier];
      return shimUrl ? `from "${shimUrl}"` : match;
    },
  );
}
