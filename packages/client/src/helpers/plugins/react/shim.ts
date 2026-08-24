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

// A plugin runs as a blob-URL module, where no bare specifier resolves: every
// package it keeps external is shimmed to a host copy. The SDK root needs none —
// no module state, so the plugin's own copy is equivalent.

import * as ReactAll from "react";
import * as ReactDOMAll from "react-dom";
import * as ReactJSXRuntimeAll from "react/jsx-runtime";
import * as PluginSDKReactAll from "@onlyoffice/docspace-plugin-sdk/react";
import * as PluginUiKitAll from "./uiKit";

declare global {
  interface Window {
    __ds_React?: typeof ReactAll;
    __ds_ReactDOM?: typeof ReactDOMAll;
    __ds_ReactJSXRuntime?: typeof ReactJSXRuntimeAll;
    __ds_PluginSDKReact?: typeof PluginSDKReactAll;
    __ds_PluginUiKit?: typeof PluginUiKitAll;
  }
}

window.__ds_React = ReactAll;
window.__ds_ReactDOM = ReactDOMAll;
window.__ds_ReactJSXRuntime = ReactJSXRuntimeAll;
window.__ds_PluginSDKReact = PluginSDKReactAll;
window.__ds_PluginUiKit = PluginUiKitAll;

// String export names, not `const` bindings: a key like `delete` is a legal
// export name but not an identifier. `default` is claimed by `export default`.
function buildShimSource(
  globalKey: string,
  mod: Record<string, unknown>,
): string {
  const keys = Object.keys(mod).filter((key) => key !== "default");
  const lines = [`const R = window.${globalKey};`, "export default R;"];

  if (keys.length > 0) {
    keys.forEach((key, i) => {
      lines.push(`const $${i} = R[${JSON.stringify(key)}];`);
    });
    lines.push(
      `export { ${keys
        .map((key, i) => `$${i} as ${JSON.stringify(key)}`)
        .join(", ")} };`,
    );
  }

  return lines.join("\n");
}

const REACT_SHIM_URL = URL.createObjectURL(
  new Blob(
    [buildShimSource("__ds_React", ReactAll as Record<string, unknown>)],
    { type: "application/javascript" },
  ),
);

const REACT_DOM_SHIM_URL = URL.createObjectURL(
  new Blob(
    [buildShimSource("__ds_ReactDOM", ReactDOMAll as Record<string, unknown>)],
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

// A dev-mode plugin calls `jsxDEV`, which the production runtime lacks;
// `isStaticChildren` is the flag that picks between `jsx` and `jsxs`.
const JSX_DEV_RUNTIME_SHIM_URL = URL.createObjectURL(
  new Blob(
    [
      [
        `const R = window.__ds_ReactJSXRuntime;`,
        `export const Fragment = R["Fragment"];`,
        `export const jsxDEV = (type, props, key, isStatic) =>`,
        `  isStatic`,
        `    ? R["jsxs"](type, props, key)`,
        `    : R["jsx"](type, props, key);`,
        `export default { Fragment, jsxDEV };`,
      ].join("\n"),
    ],
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

const PLUGIN_UI_KIT_SHIM_URL = URL.createObjectURL(
  new Blob(
    [
      buildShimSource(
        "__ds_PluginUiKit",
        PluginUiKitAll as Record<string, unknown>,
      ),
    ],
    { type: "application/javascript" },
  ),
);

const SPECIFIER_MAP: Record<string, string> = {
  react: REACT_SHIM_URL,
  "react-dom": REACT_DOM_SHIM_URL,
  "react/jsx-runtime": JSX_RUNTIME_SHIM_URL,
  "react/jsx-dev-runtime": JSX_DEV_RUNTIME_SHIM_URL,
  "@onlyoffice/docspace-plugin-sdk/react": PLUGIN_SDK_REACT_SHIM_URL,
  "@docspace/ui-kit": PLUGIN_UI_KIT_SHIM_URL,
};

// The kit shim re-exports the kit in full, so subpaths resolve to it as well.
const PREFIX_MAP: [string, string][] = [
  ["@docspace/ui-kit/", PLUGIN_UI_KIT_SHIM_URL],
];

// What the browser resolves by itself; everything else is a package name.
const isResolvable = (specifier: string) =>
  specifier.startsWith(".") ||
  specifier.startsWith("/") ||
  /^[a-z][a-z\d+.-]*:/i.test(specifier);

/**
 * Points the plugin's imports at the host's copies. Throws on any other bare
 * specifier: it can never resolve, and `import()` would not say what or why.
 */
export function rewritePluginImports(code: string): string {
  const unresolved = new Set<string>();

  const resolve = (specifier: string) =>
    SPECIFIER_MAP[specifier] ??
    PREFIX_MAP.find(([prefix]) => specifier.startsWith(prefix))?.[1];

  // `from "x"` covers import, export-from and re-export; `import "x"` has none.
  let rewritten = code.replace(
    /\b(from|import)\s+["']([^"']+)["']/g,
    (match, keyword: string, specifier: string) => {
      const shimUrl = resolve(specifier);

      if (shimUrl) return `${keyword} "${shimUrl}"`;

      if (!isResolvable(specifier)) unresolved.add(specifier);

      return match;
    },
  );

  // Dynamic imports of an external package survive bundling too. Only a literal
  // specifier can be rewritten; `import(url)` is the plugin's own business.
  rewritten = rewritten.replace(
    /\bimport\s*\(\s*(["'])([^"']+)\1\s*\)/g,
    (match, _quote: string, specifier: string) => {
      const shimUrl = resolve(specifier);

      if (shimUrl) return `import("${shimUrl}")`;

      if (!isResolvable(specifier)) unresolved.add(specifier);

      return match;
    },
  );

  if (unresolved.size > 0) {
    const missing = Array.from(unresolved)
      .map((s) => `"${s}"`)
      .join(", ");
    const provided = Object.keys(SPECIFIER_MAP)
      .map((s) => `"${s}"`)
      .join(", ");

    throw new Error(
      `The bundle imports ${missing}, which DocSpace does not provide. ` +
        `Drop them from "external" in the plugin build config so they are ` +
        `bundled into plugin.js. DocSpace provides: ${provided}.`,
    );
  }

  return rewritten;
}
