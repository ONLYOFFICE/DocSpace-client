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

import { describe, it, expect } from "vitest";

import type { TAPIPlugin } from "@docspace/shared/api/plugins/types";

import {
  clashesWith,
  getLocalizedText,
  isUserPlugin,
  getPersonalPluginRows,
} from "SRC_DIR/helpers/plugins/personal";

const apiPlugin = (name: string, pluginName: string): TAPIPlugin =>
  ({ name, pluginName, personal: true }) as TAPIPlugin;

describe("clashesWith", () => {
  it("matches the same manifest name in any case", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "HELLO", pluginName: "Other" },
      ),
    ).toBe(true);
  });

  it("matches the same global under another name", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "greeter", pluginName: "Hello" },
      ),
    ).toBe(true);
  });

  it("keeps plugins with a different name and global apart", () => {
    expect(
      clashesWith(
        { name: "hello", pluginName: "Hello" },
        { name: "greeter", pluginName: "Greeter" },
      ),
    ).toBe(false);
  });
});

describe("getPersonalPluginRows", () => {
  it("takes the loaded personal plugin of the same name", () => {
    const loaded = [{ name: "hello", pluginName: "Hello", personal: true }];

    const [row] = getPersonalPluginRows([apiPlugin("hello", "Hello")], loaded);

    expect(row.loaded).toBe(loaded[0]);
    expect(row.shadowedBy).toBeUndefined();
  });

  it("names the portal plugin that took the name of a personal one", () => {
    const portal = { name: "hello", pluginName: "Hello", personal: false };

    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [portal],
    );

    expect(row.loaded).toBeUndefined();
    expect(row.shadowedBy).toBe(portal);
  });

  it("names the portal plugin that registers the same global", () => {
    const portal = { name: "greeter", pluginName: "Hello", personal: false };

    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [portal],
    );

    expect(row.shadowedBy).toBe(portal);
  });

  it("does not take a portal plugin for the personal one", () => {
    const [row] = getPersonalPluginRows(
      [apiPlugin("hello", "Hello")],
      [{ name: "other", pluginName: "Other", personal: false }],
    );

    expect(row.loaded).toBeUndefined();
    expect(row.shadowedBy).toBeUndefined();
  });
});

describe("getLocalizedText", () => {
  it("takes the text of the language", () => {
    expect(getLocalizedText({ en: "Hello", ru: "Privet" }, "ru", "fallback")).toBe("Privet");
  });

  it("falls back when the language is missing", () => {
    expect(getLocalizedText({ en: "Hello" }, "ru", "fallback")).toBe("fallback");
  });

  it("falls back when the plugin has no translations", () => {
    expect(getLocalizedText(undefined, "ru", "fallback")).toBe("fallback");
  });
});

describe("isUserPlugin", () => {
  const plugin = { name: "hello", createBy: { id: "u1" } } as TAPIPlugin;

  it("matches the plugin of that user by its name in any case", () => {
    expect(isUserPlugin(plugin, "u1", "Hello")).toBe(true);
  });

  it("does not match the plugin of the same name of another user", () => {
    expect(isUserPlugin(plugin, "u2", "hello")).toBe(false);
  });
});
