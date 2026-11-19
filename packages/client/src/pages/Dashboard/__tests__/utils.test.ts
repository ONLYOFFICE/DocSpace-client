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

import { Section } from "SRC_DIR/helpers/plugins/enums";

import { getPluginCardSection } from "../utils";

const owner = { isOwner: true, isAdmin: false, isVisitor: false, isCollaborator: false };
const roomAdmin = { isOwner: false, isAdmin: false, isVisitor: false, isCollaborator: false };
const user = { isOwner: false, isAdmin: false, isVisitor: false, isCollaborator: true };
const guest = { isOwner: false, isAdmin: false, isVisitor: true, isCollaborator: false };

describe("getPluginCardSection", () => {
  it("opens an item that names no section in Files, for everyone", () => {
    for (const reader of [owner, roomAdmin, user, guest]) {
      expect(getPluginCardSection(undefined, reader)).toBe(Section.Files);
    }
  });

  it("gives a Contacts item a card only for those who can open Contacts", () => {
    const appears = [Section.Accounts];

    expect(getPluginCardSection(appears, owner)).toBe(Section.Accounts);
    expect(getPluginCardSection(appears, roomAdmin)).toBe(Section.Accounts);
    expect(getPluginCardSection(appears, user)).toBeUndefined();
    expect(getPluginCardSection(appears, guest)).toBeUndefined();
  });

  it("gives a Settings item a card only for administrators", () => {
    expect(getPluginCardSection([Section.Settings], owner)).toBe(Section.Settings);
    expect(getPluginCardSection([Section.Settings], { ...roomAdmin, isAdmin: true })).toBe(Section.Settings);
    expect(getPluginCardSection([Section.Settings], roomAdmin)).toBeUndefined();
  });

  it("takes the first section of the item the reader can open", () => {
    const appears = [Section.Settings, Section.Files];

    expect(getPluginCardSection(appears, owner)).toBe(Section.Settings);
    expect(getPluginCardSection(appears, user)).toBe(Section.Files);
  });

  it("gives no card to an item that appears nowhere or to a reader not loaded yet", () => {
    expect(getPluginCardSection([], owner)).toBeUndefined();
    expect(getPluginCardSection(undefined, null)).toBeUndefined();
  });
});
