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

import { beforeEach, describe, expect, it, vi } from "vitest";

import { pollTask } from "../utils/poll-task";
import { DbSyncService } from "./db-sync.service";
import { XlsxUpdateService } from "./xlsx-update.service";

vi.mock("../utils/poll-task", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  pollTask: vi.fn(),
}));

// Which liveness each service polls with is the contract with its server, so a
// change of it has to be deliberate.
describe("task polling contracts", () => {
  beforeEach(() => {
    vi.mocked(pollTask).mockReset();
  });

  it("waits out an XLSX report for as long as the server keeps it", () => {
    XlsxUpdateService.poll(1, () => {});

    expect(vi.mocked(pollTask).mock.calls[0][0].liveness).toEqual({
      kind: "presence",
      missingTimeoutMs: 75_000,
    });
  });

  it("gives up a DB sync whose percentage stops growing", () => {
    DbSyncService.poll(1, () => {});

    expect(vi.mocked(pollTask).mock.calls[0][0].liveness).toEqual({
      kind: "progress",
      stallTimeoutMs: 120_000,
    });
  });
});
