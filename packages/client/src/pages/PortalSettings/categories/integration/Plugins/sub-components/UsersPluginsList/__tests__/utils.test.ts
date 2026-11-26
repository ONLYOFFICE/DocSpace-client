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

import { describe, expect, it } from "vitest";

import { AvatarRole } from "@onlyoffice/apps-ui-kit/components/avatar";
import type { TMemberPlugin } from "@docspace/shared/api/plugins/types";

import {
  getMemberAvatarRole,
  getMemberName,
  getMemberPluginKey,
  readHiddenColumns,
  saveHiddenColumns,
  sortUsersPlugins,
} from "../utils";

const plugin = (
  name: string,
  title: string,
  user: string,
  createOn: string,
): TMemberPlugin =>
  ({
    name,
    nameLocale: { ru: title },
    createOn,
    createBy: { id: user, displayName: user },
    createByType: "User",
    createByIsOwner: false,
  }) as unknown as TMemberPlugin;

const items = [
  plugin("weather-now", "Погода сейчас", "Смирнова Анна", "2026-11-25T13:00:00Z"),
  plugin("exchange-rates", "Курсы валют", "test test user", "2026-11-25T12:00:00Z"),
  plugin("copy-item-id", "Копирование ID", "test test user", "2026-11-25T14:00:00Z"),
  plugin("editor-link", "Ссылка на редактор", "Иванов Борис", "2026-11-25T11:00:00Z"),
];

const names = (list: TMemberPlugin[]) => list.map((p) => p.name);

describe("sortUsersPlugins", () => {
  it("groups a user's plugins by name, users in the language's alphabetical order", () => {
    expect(
      names(sortUsersPlugins(items, { sortBy: "user", descending: false }, "ru")),
    ).toEqual(["editor-link", "weather-now", "copy-item-id", "exchange-rates"]);
  });

  it("sorts by the plugin name in the interface language", () => {
    expect(
      names(sortUsersPlugins(items, { sortBy: "plugin", descending: false }, "ru")),
    ).toEqual(["copy-item-id", "exchange-rates", "weather-now", "editor-link"]);
  });

  it("puts the newest upload first when descending", () => {
    expect(
      names(sortUsersPlugins(items, { sortBy: "uploaded", descending: true }, "ru")),
    ).toEqual(["copy-item-id", "weather-now", "exchange-rates", "editor-link"]);
  });

  it("falls back to the manifest name when there is no translation", () => {
    const untranslated = plugin("zulu", "", "Anna", "2026-11-25T11:00:00Z");

    expect(
      names(
        sortUsersPlugins(
          [untranslated, items[0]],
          { sortBy: "plugin", descending: false },
          "en-US",
        ),
      ),
    ).toEqual(["weather-now", "zulu"]);
  });

  it("leaves the list it was given untouched", () => {
    const copy = [...items];
    sortUsersPlugins(items, { sortBy: "plugin", descending: true }, "ru");

    expect(items).toEqual(copy);
  });
});

describe("getMemberAvatarRole", () => {
  it("marks the owner, admins and room admins, and nobody else", () => {
    expect(
      getMemberAvatarRole({ createByType: "DocSpaceAdmin", createByIsOwner: true }),
    ).toBe(AvatarRole.owner);
    expect(
      getMemberAvatarRole({ createByType: "DocSpaceAdmin", createByIsOwner: false }),
    ).toBe(AvatarRole.admin);
    expect(
      getMemberAvatarRole({ createByType: "RoomAdmin", createByIsOwner: false }),
    ).toBe(AvatarRole.manager);
    expect(
      getMemberAvatarRole({ createByType: "User", createByIsOwner: false }),
    ).toBe(AvatarRole.user);
    expect(
      getMemberAvatarRole({ createByType: "Guest", createByIsOwner: false }),
    ).toBe(AvatarRole.user);
  });
});

describe("getMemberPluginKey", () => {
  it("tells apart the same plugin of two users", () => {
    expect(
      getMemberPluginKey({ name: "hello", createBy: { id: "u1" } } as TMemberPlugin),
    ).not.toBe(
      getMemberPluginKey({ name: "hello", createBy: { id: "u2" } } as TMemberPlugin),
    );
  });
});

describe("hidden columns", () => {
  it("keeps only the columns that can be hidden", () => {
    saveHiddenColumns("columns", ["Version", "Domains"]);
    localStorage.setItem("broken", JSON.stringify(["Name", "Version", 7]));

    expect(readHiddenColumns("columns")).toEqual(["Version", "Domains"]);
    expect(readHiddenColumns("broken")).toEqual(["Version"]);
  });

  it("shows every column when nothing or garbage is stored", () => {
    localStorage.setItem("garbage", "{not json");

    expect(readHiddenColumns("missing")).toEqual([]);
    expect(readHiddenColumns("garbage")).toEqual([]);
  });
});

describe("getMemberName", () => {
  it("decodes the name the server sends HTML-encoded", () => {
    const member = {
      createBy: { displayName: "O&#39;Brien &amp; Co" },
    } as unknown as TMemberPlugin;

    expect(getMemberName(member)).toBe("O'Brien & Co");
  });
});
