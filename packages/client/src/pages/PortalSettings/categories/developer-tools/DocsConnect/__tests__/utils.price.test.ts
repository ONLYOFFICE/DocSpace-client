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

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import {
  getDocsConnectPlanDevPack,
  getDocsConnectPricePerUser,
  getDocsConnectScheduledState,
} from "../utils";

const makeInfo = ({
  devPackEnabled = false,
  deactivated = false,
  previousPlan = null,
}: {
  devPackEnabled?: boolean;
  deactivated?: boolean;
  previousPlan?: { users: number; devPackEnabled: boolean } | null;
}) =>
  ({
    tenant: { payment: { quantity: 10 } },
    tenantInfo: { license: { trial: false } },
    prices: { pricePerUser: 8, devPackPrice: 4 },
    devPackEnabled,
    deactivated,
    previousPlan,
    scheduledChange: null,
  }) as TDocsConnectInfo;

describe("getDocsConnectPlanDevPack", () => {
  it("follows the current quota while the subscription is active", () => {
    expect(
      getDocsConnectPlanDevPack(
        makeInfo({
          devPackEnabled: true,
          previousPlan: { users: 10, devPackEnabled: false },
        }),
      ),
    ).toBe(true);
  });

  it("takes the Dev Pack of the previous plan once the subscription is deactivated", () => {
    expect(
      getDocsConnectPlanDevPack(
        makeInfo({
          deactivated: true,
          previousPlan: { users: 10, devPackEnabled: true },
        }),
      ),
    ).toBe(true);
  });

  it("falls back to the current quota when a deactivated portal has no previous plan", () => {
    expect(getDocsConnectPlanDevPack(makeInfo({ deactivated: true }))).toBe(
      false,
    );
  });
});

describe("getDocsConnectPricePerUser", () => {
  it("prices a deactivated Dev Pack plan with the Dev Pack", () => {
    const info = makeInfo({
      deactivated: true,
      previousPlan: { users: 10, devPackEnabled: true },
    });

    expect(getDocsConnectPricePerUser(info)).toBe(12);
    expect(getDocsConnectScheduledState(info).nextDevPackEnabled).toBe(true);
  });

  it("prices a deactivated base plan without the Dev Pack", () => {
    expect(
      getDocsConnectPricePerUser(
        makeInfo({
          deactivated: true,
          previousPlan: { users: 10, devPackEnabled: false },
        }),
      ),
    ).toBe(8);
  });

  it("honours an explicit Dev Pack flag", () => {
    expect(getDocsConnectPricePerUser(makeInfo({}), true)).toBe(12);
  });
});
