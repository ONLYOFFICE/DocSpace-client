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

import type { TPaymentFeature } from "../api/portal/types";

import { CurrentQuotasStore } from "./CurrentQuotaStore";

type TStoreArgs = ConstructorParameters<typeof CurrentQuotasStore>;

const showStorageInfo = (
  user: { isOwner?: boolean; isAdmin?: boolean; isRoomAdmin?: boolean } | null,
  statistics: boolean,
) => {
  const store = new CurrentQuotasStore(
    ...([
      {
        user: user && {
          isOwner: false,
          isAdmin: false,
          isRoomAdmin: false,
          ...user,
        },
      },
      {},
      {},
    ] as unknown as TStoreArgs),
  );
  store.currentPortalQuotaFeatures.set("statistic", {
    id: "statistic",
    value: statistics,
  } as TPaymentFeature);
  return store.showStorageInfo;
};

describe("Storage quota of accounts is shown", () => {
  it.each([
    ["the Owner", { isOwner: true }],
    ["a DocSpace admin", { isAdmin: true }],
  ])("to %s with the statistics feature", (_, user) => {
    expect(showStorageInfo(user, true)).toBe(true);
  });

  it("to nobody without the statistics feature", () => {
    expect(showStorageInfo({ isOwner: true }, false)).toBe(false);
  });

  it.each([
    ["a Room admin", { isRoomAdmin: true }],
    ["a User", {}],
    ["nobody signed in", null],
  ])("not to %s", (_, user) => {
    expect(showStorageInfo(user, true)).toBe(false);
  });
});
