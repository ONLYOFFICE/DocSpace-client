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

import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { RoomPrivacyFilter, RoomSearchArea } from "@docspace/shared/enums";

import { scopeRoomsRequest } from "./roomsRequestScope";

describe("scopeRoomsRequest", () => {
  it("Generic rooms list", () => {
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.Active);

    const scoped = scopeRoomsRequest(filter);

    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(filter.privacyFilter).not.toBe(RoomPrivacyFilter.NotPrivate);
  });

  it("leaves private rooms out of the generic archive", () => {
    const filter = RoomsFilter.getDefault(undefined, RoomSearchArea.Archive);

    const scoped = scopeRoomsRequest(filter, { isArchive: true });

    expect(scoped.privacyFilter).toBe(RoomPrivacyFilter.NotPrivate);
    expect(scoped.searchArea).toBe(RoomSearchArea.Archive);
  });

  it("lists only private rooms on the private pages, in the area they name", () => {
    const active = scopeRoomsRequest(RoomsFilter.getDefault(), {
      isPrivate: true,
    });
    const archived = scopeRoomsRequest(RoomsFilter.getDefault(), {
      isPrivate: true,
      isArchive: true,
    });

    expect(active.privacyFilter).toBe(RoomPrivacyFilter.Private);
    expect(active.searchArea).toBe(RoomSearchArea.Active);
    expect(archived.privacyFilter).toBe(RoomPrivacyFilter.Private);
    expect(archived.searchArea).toBe(RoomSearchArea.Archive);
  });
});
