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
  matchesUserAccess,
  matchesUserRole,
} from "SRC_DIR/helpers/plugins/roles";
import { PluginUserRole, PluginUsersType } from "SRC_DIR/helpers/plugins/enums";

describe("matchesUserRole", () => {
  it("matches an item that lists no user types", () => {
    expect(matchesUserRole(undefined, PluginUserRole.guest)).toBe(true);
  });

  it("matches an item that lists the current role", () => {
    expect(
      matchesUserRole([PluginUserRole.fullAdmin], PluginUserRole.fullAdmin),
    ).toBe(true);
  });

  it("matches an item that lists the deprecated name of the current role", () => {
    expect(
      matchesUserRole(
        [PluginUsersType.docSpaceAdmin],
        PluginUserRole.fullAdmin,
      ),
    ).toBe(true);
    expect(
      matchesUserRole([PluginUsersType.collaborator], PluginUserRole.user),
    ).toBe(true);
    expect(matchesUserRole([PluginUsersType.user], PluginUserRole.guest)).toBe(
      true,
    );
  });

  it("rejects an item that lists only other roles", () => {
    expect(matchesUserRole([PluginUserRole.owner], PluginUserRole.guest)).toBe(
      false,
    );
    expect(matchesUserRole([], PluginUserRole.roomAdmin)).toBe(false);
  });

  it("keeps the user and guest roles apart", () => {
    expect(matchesUserRole([PluginUserRole.user], PluginUserRole.guest)).toBe(
      false,
    );
    expect(matchesUserRole([PluginUserRole.guest], PluginUserRole.user)).toBe(
      false,
    );
    expect(
      matchesUserRole([PluginUsersType.collaborator], PluginUserRole.guest),
    ).toBe(false);
    expect(matchesUserRole([PluginUsersType.user], PluginUserRole.user)).toBe(
      false,
    );
  });
});

describe("matchesUserAccess", () => {
  const user = { id: "director", groups: [{ id: "sales", manager: "", name: "Sales" }] };

  it("matches an item that lists neither users nor groups", () => {
    expect(matchesUserAccess({}, null)).toBe(true);
  });

  it("matches a user listed by id or through one of their groups", () => {
    expect(matchesUserAccess({ users: ["director"] }, user)).toBe(true);
    expect(matchesUserAccess({ groups: ["sales"] }, user)).toBe(true);
    expect(matchesUserAccess({ users: ["other"], groups: ["sales"] }, user)).toBe(true);
  });

  it("rejects a user who is neither listed nor in a listed group", () => {
    expect(matchesUserAccess({ users: ["other"], groups: ["support"] }, user)).toBe(false);
    expect(matchesUserAccess({ groups: ["sales"] }, { id: "director" })).toBe(false);
  });

  it("treats an empty list as access for nobody", () => {
    expect(matchesUserAccess({ users: [] }, user)).toBe(false);
    expect(matchesUserAccess({ groups: [] }, user)).toBe(false);
  });

  it("rejects a restricted item while no user is loaded", () => {
    expect(matchesUserAccess({ groups: ["sales"] }, null)).toBe(false);
  });
});
