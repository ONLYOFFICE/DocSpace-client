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

import {
  groupProfilePluginItems,
  placeProfilePluginItems,
} from "../profileMenu";

type TEntry = { key: string; isSeparator?: boolean; items?: TEntry[] };

const separators: [TEntry, TEntry] = [
  { key: "separator-plugins", isSeparator: true },
  { key: "separator-after-plugins", isSeparator: true },
];
const options = { beforeKeys: ["chat", "about"], endKey: "logout" };
const keys = (entries: TEntry[]) => entries.map(({ key }) => key);
const entries = (...names: string[]): TEntry[] =>
  names.map((key) =>
    key.startsWith("s") && key.length === 2 ? { key, isSeparator: true } : { key },
  );

const place = (actions: TEntry[], plugins: string[]) =>
  keys(placeProfilePluginItems(actions, entries(...plugins), separators, options));

describe("placeProfilePluginItems", () => {
  it("leaves the menu alone when no plugin adds an item", () => {
    const actions = entries("profile", "logout");

    expect(placeProfilePluginItems(actions, [], separators, options)).toBe(actions);
  });

  it("puts the plugin block above the chat block, with a separator on either side", () => {
    expect(place(entries("profile", "s1", "help", "chat", "about", "logout"), ["mcp", "crm"])).toEqual([
      "profile",
      "s1",
      "help",
      "separator-plugins",
      "mcp",
      "crm",
      "separator-after-plugins",
      "chat",
      "about",
      "logout",
    ]);
  });

  it("reuses the separator that already closes the block above", () => {
    expect(place(entries("help", "s2", "chat", "logout"), ["mcp"])).toEqual([
      "help",
      "s2",
      "mcp",
      "separator-after-plugins",
      "chat",
      "logout",
    ]);
  });

  it("starts at the first item of the chat block that is shown", () => {
    expect(place(entries("help", "s2", "about", "logout"), ["mcp"])).toEqual([
      "help",
      "s2",
      "mcp",
      "separator-after-plugins",
      "about",
      "logout",
    ]);
  });

  it("goes right above sign out, without a separator there, when the chat block is empty", () => {
    expect(place(entries("help", "s2", "logout"), ["mcp"])).toEqual(["help", "s2", "mcp", "logout"]);
  });

  it("ends the menu when there is neither a chat block nor sign out", () => {
    expect(place(entries("profile", "help"), ["mcp"])).toEqual([
      "profile",
      "help",
      "separator-plugins",
      "mcp",
    ]);
  });
});

describe("groupProfilePluginItems", () => {
  const toSubmenu = (items: TEntry[]): TEntry => ({ key: "more-options", items });

  it("keeps up to two plugin items in the menu itself", () => {
    expect(keys(groupProfilePluginItems(entries("mcp"), toSubmenu))).toEqual(["mcp"]);
    expect(keys(groupProfilePluginItems(entries("mcp", "crm"), toSubmenu))).toEqual(["mcp", "crm"]);
  });

  it("moves three and more into one submenu, in their order", () => {
    const grouped = groupProfilePluginItems(entries("mcp", "crm", "wiki"), toSubmenu);

    expect(keys(grouped)).toEqual(["more-options"]);
    expect(keys(grouped[0].items ?? [])).toEqual(["mcp", "crm", "wiki"]);
  });
});
