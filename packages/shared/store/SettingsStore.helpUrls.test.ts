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

import { describe, expect, it, vi } from "vitest";

vi.mock("@onlyoffice/apps-ui-kit/utils/socket", async (io) => ({
  ...((await io()) as Record<string, unknown>),
  default: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
}));

vi.mock("@onlyoffice/apps-ui-kit/utils/get-system-theme", () => ({
  getSystemTheme: vi.fn(() => "Base"),
}));

import type { TExternalResources } from "../api/settings/types";

import { SettingsStore } from "./SettingsStore";

const DOMAIN = "https://helpcenter.onlyoffice.com";

const createStore = (entries: Record<string, string>) => {
  const store = new SettingsStore();
  store.externalResources = {
    helpcenter: { domain: DOMAIN, entries },
  } as unknown as TExternalResources;
  return store;
};

describe("SettingsStore.customFilterHelpUrl", () => {
  it("points at the custom filter article, not the managing rooms one", () => {
    const store = createStore({
      docspacemanagingrooms:
        "/docspace/administration/docspace-managing-rooms.aspx",
      customfilter:
        "/docspace/administration/managing-files/docspace-managing-documents-files#managingdocuments_block",
    });

    expect(store.customFilterHelpUrl).toBe(
      `${DOMAIN}/docspace/administration/managing-files/docspace-managing-documents-files#managingdocuments_block`,
    );
  });

  it("falls back to the help center root when the entry is missing", () => {
    const store = createStore({
      docspacemanagingrooms:
        "/docspace/administration/docspace-managing-rooms.aspx",
    });

    expect(store.customFilterHelpUrl).toBe(DOMAIN);
  });
});

describe("SettingsStore.privateRoomsHelpUrl", () => {
  it("Help article configured", () => {
    const store = createStore({ privaterooms: "/docspace/private-rooms.aspx" });

    expect(store.privateRoomsHelpUrl).toBe(
      `${DOMAIN}/docspace/private-rooms.aspx`,
    );
  });

  it("No help article: the entry is missing", () => {
    const store = createStore({});

    expect(store.privateRoomsHelpUrl).toBeUndefined();
  });

  it("No help article: the help-center domain is missing", () => {
    const store = new SettingsStore();
    store.externalResources = {
      helpcenter: { entries: { privaterooms: "/docspace/private-rooms.aspx" } },
    } as unknown as TExternalResources;

    expect(store.privateRoomsHelpUrl).toBeUndefined();
  });
});
