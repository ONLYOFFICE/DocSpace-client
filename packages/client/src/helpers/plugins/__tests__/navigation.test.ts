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
import {
  getPluginSectionByPath,
  getPluginSectionPath,
  getPluginSectionRoute,
  isPluginSectionPath,
} from "SRC_DIR/helpers/plugins/navigation";

describe("getPluginSectionPath", () => {
  it("builds the path from the section base and the item key", () => {
    expect(getPluginSectionPath(Section.Files, "overview")).toBe("/p/overview");
    expect(getPluginSectionPath(Section.Accounts, "overview")).toBe(
      "/accounts/p/overview",
    );
    expect(getPluginSectionPath(Section.Settings, "overview")).toBe(
      "/portal-settings/p/overview",
    );
  });
});

describe("getPluginSectionRoute", () => {
  it("builds the route pattern with the itemKey param", () => {
    expect(getPluginSectionRoute(Section.Files)).toBe("/p/:itemKey");
    expect(getPluginSectionRoute(Section.Accounts)).toBe(
      "/accounts/p/:itemKey",
    );
    expect(getPluginSectionRoute(Section.Settings)).toBe(
      "/portal-settings/p/:itemKey",
    );
  });
});

describe("getPluginSectionByPath", () => {
  it("resolves the section a plugin path belongs to", () => {
    expect(getPluginSectionByPath("/p/overview")).toBe(Section.Files);
    expect(getPluginSectionByPath("/accounts/p/overview")).toBe(
      Section.Accounts,
    );
    expect(getPluginSectionByPath("/portal-settings/p/overview")).toBe(
      Section.Settings,
    );
  });

  it("does not mistake a nested plugin path for the files one", () => {
    expect(getPluginSectionByPath("/portal-settings/p/settings")).not.toBe(
      Section.Files,
    );
  });

  it("keeps matching when the item key contains slashes", () => {
    expect(getPluginSectionByPath("/p/sample/nested")).toBe(Section.Files);
  });

  it("returns null for paths outside the plugin routes", () => {
    expect(getPluginSectionByPath("/rooms/personal/filter")).toBeNull();
    expect(getPluginSectionByPath("/profile")).toBeNull();
    expect(getPluginSectionByPath("/portal-settings/integration/plugins")).toBeNull();
  });

  it("does not match the section base without an item key", () => {
    expect(getPluginSectionByPath("/p")).toBeNull();
    expect(getPluginSectionByPath("/accounts/p")).toBeNull();
  });

  it("does not match a path that only starts with the same letters", () => {
    expect(getPluginSectionByPath("/profile/p/overview")).toBeNull();
    expect(getPluginSectionByPath("/pdf/overview")).toBeNull();
  });
});

describe("isPluginSectionPath", () => {
  it("mirrors getPluginSectionByPath", () => {
    expect(isPluginSectionPath("/p/overview")).toBe(true);
    expect(isPluginSectionPath("/portal-settings/p/overview")).toBe(true);
    expect(isPluginSectionPath("/rooms/shared")).toBe(false);
    expect(isPluginSectionPath("/p")).toBe(false);
  });
});
