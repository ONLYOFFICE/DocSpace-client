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
import { describe, expect, it } from "vitest";

import { isInside } from "../ui-kit-dev";
import { uiKitBoundaryPlugin } from "./ui-kit-boundary";

const ROOT = path.resolve("/work/docspace-ui-kit-react");
const CLIENT = path.resolve("/work/DocSpace/client/packages/client");

const inKit = (...parts: string[]) => path.join(ROOT, ...parts);

type ResolveId = (source: string, importer?: string) => unknown;

const resolveId = (source: string, importer?: string) => {
  const plugin = uiKitBoundaryPlugin(ROOT);
  const hook = plugin.resolveId as unknown as ResolveId;
  return hook(source, importer);
};

const violates = (source: string, importer?: string) =>
  expect(() => resolveId(source, importer)).toThrow(/ui-kit boundary violated/);

const passes = (source: string, importer?: string) =>
  expect(resolveId(source, importer)).toBeNull();

describe("isInside", () => {
  it("accepts a path strictly below the root", () => {
    expect(isInside(ROOT, inKit("components", "text", "index.tsx"))).toBe(true);
  });

  it("rejects the root itself, siblings and parents", () => {
    expect(isInside(ROOT, ROOT)).toBe(false);
    expect(isInside(ROOT, path.resolve(ROOT, "..", "other"))).toBe(false);
    expect(isInside(ROOT, path.resolve(ROOT, ".."))).toBe(false);
    expect(isInside(ROOT, `${ROOT}-sibling/index.ts`)).toBe(false);
  });
});

describe("uiKitBoundaryPlugin", () => {
  const importer = inKit("components", "text", "index.tsx");

  it("only runs on the dev server", () => {
    expect(uiKitBoundaryPlugin(ROOT)).toMatchObject({
      name: "ui-kit-boundary",
      enforce: "pre",
      apply: "serve",
    });
  });

  it("throws on a relative import that climbs out of the checkout", () => {
    violates("../../../DocSpace/client/packages/shared/utils", importer);
  });

  it("throws on an alias already rewritten to an absolute client path", () => {
    // `vite:alias` runs first, so `@docspace/shared/x` arrives as this.
    violates(path.join(CLIENT, "..", "shared", "utils", "index.ts"), importer);
    violates(path.join(CLIENT, "public", "images", "logo.svg"), importer);
  });

  it("names the importer, the specifier and the destination", () => {
    const outside = path.join(CLIENT, "src", "store", "index.ts");
    expect(() => resolveId(outside, importer)).toThrow(importer);
    expect(() => resolveId(outside, importer)).toThrow(outside);
  });

  it("lets a relative import that stays inside through", () => {
    passes("../button", importer);
    passes("./Text.module.scss", importer);
    passes("../../assets/icons/close.svg?react", importer);
  });

  it("lets an absolute path inside the checkout through", () => {
    passes(inKit("utils", "socket", "index.ts"), importer);
  });

  it("ignores bare specifiers: they resolve from the checkout's node_modules", () => {
    passes("react", importer);
    passes("@onlyoffice/ai-chat/core", importer);
  });

  it("ignores Vite's internal and virtual ids", () => {
    passes("\0virtual:something", importer);
    passes("/@vite/client", importer);
    passes("/@fs/work/DocSpace/client/packages/shared/x.ts", importer);
    passes("virtual:svg-icons", importer);
  });

  it("ignores importers outside the checkout", () => {
    passes("../../shared/utils", path.join(CLIENT, "src", "App.js"));
    passes(path.join(CLIENT, "src", "x.ts"), path.join(CLIENT, "src", "App.js"));
  });

  it("ignores the checkout's own node_modules", () => {
    passes(
      "../../../DocSpace/client/packages/shared/x",
      inKit("node_modules", "some-dep", "index.js"),
    );
  });

  it("ignores entry ids with no importer", () => {
    passes(path.join(CLIENT, "src", "index.tsx"));
  });

  it("strips query and hash from the importer before judging it", () => {
    violates(path.join(CLIENT, "src", "x.ts"), `${importer}?v=123`);
    passes("./x", `${inKit("node_modules", "dep", "index.js")}?v=1`);
  });
});
