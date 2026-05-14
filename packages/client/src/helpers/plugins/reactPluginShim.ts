// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
