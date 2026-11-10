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

import { getSafeReturnUrl } from "./getSafeReturnUrl";

// Bug 84860: /login?referenceUrl=javascript:alert(document.domain) ran the
// script in the portal's origin once the user logged in, and an address of
// another site turned the login page into an open redirect.
describe("getSafeReturnUrl", () => {
  const { origin, host, hostname, protocol } = window.location;
  const otherProtocol = protocol === "https:" ? "http:" : "https:";

  it.each([
    ["/rooms/shared/1", `${origin}/rooms/shared/1`],
    ["/rooms?folder=1#top", `${origin}/rooms?folder=1#top`],
    ["rooms", `${origin}/rooms`],
    [`${origin}/rooms/shared/1`, `${origin}/rooms/shared/1`],
    [
      `${origin}/filehandler.ashx?action=download`,
      `${origin}/filehandler.ashx?action=download`,
    ],
  ])("follows %s, a page of the portal", (url, expected) => {
    expect(getSafeReturnUrl(url)).toBe(expected);
  });

  it.each([
    "javascript:alert(document.domain)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    `blob:${origin}/1f6a2d1e-0000-4000-8000-000000000000`,
    "https://example.com/",
    `${protocol}//${hostname}.example.com/`,
    `${otherProtocol}//${host}/rooms`,
    "//example.com",
    "/\\example.com",
    "\\\\example.com",
  ])("drops %s", (url) => {
    expect(getSafeReturnUrl(url)).toBeUndefined();
  });

  it.each([null, undefined, ""])("drops an empty value (%s)", (url) => {
    expect(getSafeReturnUrl(url)).toBeUndefined();
  });
});
