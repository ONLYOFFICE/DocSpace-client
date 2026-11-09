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

import { beforeEach, describe, expect, it } from "vitest";

import { keepPageForLogin } from "./referenceUrl";

const PAGE = "http://localhost/portal-settings/security/access-portal";

describe("keepPageForLogin", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("keeps the page the tab is on by default", () => {
    keepPageForLogin();

    expect(sessionStorage.getItem("referenceUrl")).toBe(window.location.href);
  });

  it("keeps the page it is given", () => {
    keepPageForLogin(PAGE);

    expect(sessionStorage.getItem("referenceUrl")).toBe(PAGE);
  });

  // Bug 84856: whoever logged in next in the tab was sent to the page of the
  // user whose session had ended, and met an access error there.
  it("names the page after the user the tab was showing", () => {
    sessionStorage.setItem("sessionUserId", "owner-id");

    keepPageForLogin(PAGE);

    expect(sessionStorage.getItem("loggedOutUserId")).toBe("owner-id");
  });

  it("names no one when the tab never learned its user", () => {
    keepPageForLogin(PAGE);

    expect(sessionStorage.getItem("loggedOutUserId")).toBeNull();
  });
});
