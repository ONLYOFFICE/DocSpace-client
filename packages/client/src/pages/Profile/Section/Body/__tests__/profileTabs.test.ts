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
  getPluginTabId,
  getProfileBasePath,
  getProfileTabId,
  getProfileTabPath,
  resolveProfileTab,
} from "../profileTabs";

describe("getProfileTabId", () => {
  it("takes what follows /profile/, a plugin tab's p/ segment included", () => {
    expect(getProfileTabId("/profile/login")).toBe("login");
    expect(getProfileTabId("/profile/p/calendar-sync/")).toBe("p/calendar-sync");
    expect(getProfileTabId("/portal-settings/profile/p/calendar-sync")).toBe(
      "p/calendar-sync",
    );
  });

  it("keeps a plugin tab named like a portal tab apart from it", () => {
    expect(
      getProfileTabId("/portal-settings/profile/p/keys-management"),
    ).not.toBe("keys-management");
    expect(getProfileTabId("/profile/p/my-login-sync")).not.toBe("login");
  });

  it("decodes the key the router percent-encoded, a space or a non-Latin letter", () => {
    expect(getProfileTabId("/profile/p/calendar%20sync")).toBe("p/calendar sync");
    expect(getProfileTabId("/profile/p/%D0%BA%D0%B0%D0%BB")).toBe(
      "p/кал",
    );
    expect(getProfileTabId("/profile/p/100%")).toBe("p/100%");
  });
});

describe("getProfileTabPath", () => {
  it("encodes a plugin tab's key, so the address reads back as the same tab", () => {
    ["crm/sync", "a?b", "a#b", "100%", "calendar-sync"].forEach((key) => {
      const tabId = getPluginTabId(key);

      expect(getProfileTabId(`/profile/${getProfileTabPath(tabId)}`)).toBe(
        tabId,
      );
    });
    expect(getProfileTabPath(getPluginTabId("crm/sync"))).toBe("p/crm%2Fsync");
  });

  it("leaves a portal tab as it is", () => {
    expect(getProfileTabPath("keys-management")).toBe("keys-management");
  });
});

describe("getProfileBasePath", () => {
  it("cuts the address back to /profile, wherever the profile is mounted", () => {
    expect(getProfileBasePath("/profile/p/calendar-sync")).toBe("/profile");
    expect(getProfileBasePath("/portal-settings/profile/login")).toBe(
      "/portal-settings/profile",
    );
  });
});

describe("resolveProfileTab", () => {
  const tabIds = ["login", "notifications", getPluginTabId("calendar-sync")];

  it("opens the tab the address names", () => {
    expect(resolveProfileTab("p/calendar-sync", tabIds, false)).toEqual({
      kind: "tab",
      id: "p/calendar-sync",
    });
  });

  it("falls back to the first tab for a portal tab the user does not have", () => {
    expect(resolveProfileTab("authorized-apps", tabIds, false)).toEqual({
      kind: "tab",
      id: "login",
    });
  });

  it("waits for the plugins before deciding a plugin tab is missing", () => {
    expect(resolveProfileTab("p/crm", tabIds, true)).toEqual({ kind: "pending" });
    expect(resolveProfileTab("p/crm", tabIds, false)).toEqual({ kind: "missing" });
  });
});
