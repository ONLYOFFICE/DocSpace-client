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

import { isDocsConnectLocked } from "../utils";

const FUTURE = "2999-01-01T00:00:00Z";
const PAST = "2000-01-01T00:00:00Z";

const makeInfo = ({
  trial,
  endDate,
  deactivated = false,
}: {
  trial: boolean;
  endDate: string;
  deactivated?: boolean;
}) =>
  ({
    tenant: { endDate, payment: { quantity: 10 } },
    tenantInfo: { license: { trial } },
    deactivated,
    scheduledChange: null,
  }) as TDocsConnectInfo;

describe("isDocsConnectLocked", () => {
  it("returns false without info", () => {
    expect(isDocsConnectLocked(null)).toBe(false);
    expect(isDocsConnectLocked(undefined)).toBe(false);
  });

  it("locks an expired trial", () => {
    expect(isDocsConnectLocked(makeInfo({ trial: true, endDate: PAST }))).toBe(
      true,
    );
  });

  it("keeps a running trial unlocked", () => {
    expect(isDocsConnectLocked(makeInfo({ trial: true, endDate: FUTURE }))).toBe(
      false,
    );
  });

  it("locks a deactivated subscription", () => {
    expect(
      isDocsConnectLocked(
        makeInfo({ trial: false, endDate: FUTURE, deactivated: true }),
      ),
    ).toBe(true);
  });

  it("keeps an active subscription unlocked past its end date", () => {
    expect(isDocsConnectLocked(makeInfo({ trial: false, endDate: PAST }))).toBe(
      false,
    );
  });
});
