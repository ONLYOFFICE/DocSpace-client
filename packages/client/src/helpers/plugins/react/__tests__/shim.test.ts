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

import { describe, it, expect, vi, beforeAll } from "vitest";

// One stub export is enough to build the kit's shim module from.
vi.mock("@docspace/ui-kit", () => ({ Text: () => null }));

let rewritePluginImports: (code: string) => string;

beforeAll(async () => {
  // jsdom implements no blob URLs, and the shim needs them at import time. Only
  // the statics are filled in — replacing `URL` would drop the constructor.
  let issued = 0;

  URL.createObjectURL = () => `blob:mock/${(issued += 1)}`;
  URL.revokeObjectURL = () => {};

  ({ rewritePluginImports } = await import(
    "SRC_DIR/helpers/plugins/react/shim"
  ));
});

const rewrittenSpecifiers = (code: string) =>
  Array.from(rewritePluginImports(code).matchAll(/["'](blob:[^"']+)["']/g)).map(
    (match) => match[1],
  );

describe("rewritePluginImports", () => {
  it("points a static import at the host's copy", () => {
    const [react] = rewrittenSpecifiers(`import React from "react";`);

    expect(react).toMatch(/^blob:/);
  });

  it.each([
    "react",
    "react-dom",
    "react/jsx-runtime",
    "react/jsx-dev-runtime",
    "@onlyoffice/docspace-plugin-sdk/react",
    "@docspace/ui-kit",
  ])("provides %s", (specifier) => {
    expect(rewrittenSpecifiers(`import x from "${specifier}";`)).toHaveLength(1);
  });

  // A package kept external survives bundling in a dynamic import too.
  it.each([
    ['const React = await import("react");', "await"],
    ['import ("react").then(useIt);', "a space before the parenthesis"],
  ])("points a dynamic import at the host's copy (%s)", (code) => {
    expect(rewrittenSpecifiers(code)).toHaveLength(1);
  });

  // The kit is published with a single entry point, so a subpath is a mistake
  // the plugin has to hear about by name — silently sending it to the barrel
  // would break later, in the browser, on the first export the barrel lacks.
  it("refuses a subpath of the kit", () => {
    expect(() =>
      rewritePluginImports(
        `import { Button } from "@docspace/ui-kit/components/button";`,
      ),
    ).toThrow(/"@docspace\/ui-kit\/components\/button"/);
  });

  it("leaves a specifier the browser can resolve on its own", () => {
    const code = [
      `import a from "./local";`,
      `import b from "/absolute.js";`,
      `import c from "https://cdn.example.com/x.js";`,
      `const d = await import("blob:something");`,
    ].join("\n");

    expect(rewritePluginImports(code)).toBe(code);
  });

  it.each([
    ['import { debounce } from "lodash-es";', "a static import"],
    ['const { z } = await import("zod");', "a dynamic import"],
  ])("refuses a package DocSpace does not provide (%s)", (code) => {
    expect(() => rewritePluginImports(code)).toThrow(
      /which DocSpace does not provide/,
    );
  });

  it("names every missing package, and what is on offer", () => {
    let thrown = "";

    try {
      rewritePluginImports(
        `import "lodash-es";\nconst z = await import("zod");`,
      );
    } catch (cause) {
      thrown = cause instanceof Error ? cause.message : "";
    }

    expect(thrown).toContain('"lodash-es"');
    expect(thrown).toContain('"zod"');
    expect(thrown).toContain('"@docspace/ui-kit"');
  });

  it("leaves the plugin's own code alone", () => {
    const code = `export const title = "imported from react";`;

    expect(rewritePluginImports(code)).toBe(code);
  });

  it.each([
    [`export const note = 'the icons come from "lucide-react"';`, "a string"],
    [`const a = 1; // ported over from "zod"`, "a trailing comment"],
    [`// re-exported from "lodash-es"\nexport const a = 1;`, "a comment line"],
  ])("does not read a package name out of %s", (code) => {
    expect(rewritePluginImports(code)).toBe(code);
  });

  it("rewrites a bundle whose text mentions a package it does not import", () => {
    const code = [
      `import { Text } from "@docspace/ui-kit";`,
      `export const hint = 'not unlike "zod", but hand-written';`,
    ].join("\n");

    const rewritten = rewritePluginImports(code);

    expect(rewrittenSpecifiers(code)).toHaveLength(1);
    expect(rewritten).toContain(`'not unlike "zod", but hand-written'`);
  });

  it.each([
    [`import"react";`, "a bare import"],
    [`import x from"react";`, "a default import"],
    [`export{a}from"react";`, "a re-export"],
  ])("rewrites minified %s", (code) => {
    expect(rewrittenSpecifiers(code)).toHaveLength(1);
  });
});
