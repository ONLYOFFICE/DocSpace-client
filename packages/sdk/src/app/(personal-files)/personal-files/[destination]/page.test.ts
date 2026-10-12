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

import { describe, expect, test, vi } from "vitest";

import { redirect } from "next/navigation";

import PersonalFilesDestination from "./page";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const render = (destination: string, searchParams: Record<string, string>) =>
  PersonalFilesDestination({
    params: Promise.resolve({ destination }),
    searchParams: Promise.resolve(searchParams),
  });

const redirectedParams = () => {
  const url = vi.mocked(redirect).mock.calls[0][0];
  return new URLSearchParams(url.slice(url.indexOf("?") + 1));
};

describe("personal-files destination redirect", () => {
  test("maps a known section to its folder alias on the list page", async () => {
    await render("favorites", {});

    expect(redirect).toHaveBeenCalledWith("/personal-files?folder=%40favorites");
  });

  test("falls back to My documents for an unknown section", async () => {
    await render("unknown", {});

    expect(redirect).toHaveBeenCalledWith("/personal-files?folder=%40my");
  });

  test("prefers an explicit folder id over the section alias", async () => {
    await render("recent", { id: "15" });

    const params = redirectedParams();
    expect(params.get("folder")).toBe("15");
    expect(params.has("id")).toBe(false);
  });

  test("renames count to pageCount", async () => {
    await render("my-documents", { count: "50" });

    const params = redirectedParams();
    expect(params.get("pageCount")).toBe("50");
    expect(params.has("count")).toBe(false);
  });

  test("forwards theme, locale, styles and the sign-in parameters", async () => {
    await render("trash", {
      theme: "Dark",
      locale: "de",
      stylesUrl: "https://host.example/sdk.css",
      providerName: "sso",
      inviteKey: "invite",
      emplType: "user",
      uid: "u-1",
      auth: "oauth",
      page: "2",
      sortBy: "DateAndTime",
      sortOrder: "descending",
      search: "report",
      disableActionButton: "true",
    });

    const params = redirectedParams();
    expect(Object.fromEntries(params)).toEqual({
      folder: "@trash",
      theme: "Dark",
      locale: "de",
      stylesUrl: "https://host.example/sdk.css",
      providerName: "sso",
      inviteKey: "invite",
      emplType: "user",
      uid: "u-1",
      auth: "oauth",
      page: "2",
      sortBy: "DateAndTime",
      sortOrder: "descending",
      search: "report",
      disableActionButton: "true",
    });
  });

  test("drops empty values", async () => {
    await render("my-documents", { search: "", theme: "Base" });

    const params = redirectedParams();
    expect(params.has("search")).toBe(false);
    expect(params.get("theme")).toBe("Base");
  });
});
