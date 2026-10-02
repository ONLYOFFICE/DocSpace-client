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

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@docspace/shared/api", () => ({
  default: {
    Filter: { getDefault: () => ({}) },
    settings: {
      startLoginHistoryReport: vi.fn(),
      getLoginHistoryReportStatus: vi.fn(),
      startAuditTrailReport: vi.fn(),
      getAuditTrailReportStatus: vi.fn(),
    },
  },
}));

vi.mock("@onlyoffice/apps-ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("../../i18n", () => ({
  default: { t: (key: string) => key },
}));

import api from "@docspace/shared/api";
import { AuditReportFormat } from "@docspace/shared/enums";

import SettingsSetupStore from "../SettingsSetupStore";
import {
  ReportType,
  type TReportRequests,
} from "../DocumentBuilderReportStore";
import type DocumentBuilderReportStore from "../DocumentBuilderReportStore";
import type { TfaStore } from "@docspace/shared/store/TfaStore";
import type { AuthStore } from "@docspace/shared/store/AuthStore";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { ThirdPartyStore } from "../ThirdPartyStore";

// The store only wires the endpoints; running the requests it hands over to
// the report store shows which format reaches the API.
const makeStore = () => {
  const buildReport = vi.fn(
    async (_type: string, requests: TReportRequests) => {
      await requests.start();
      await requests.getStatus();
    },
  );

  const store = new SettingsSetupStore(
    {} as TfaStore,
    {} as AuthStore,
    {} as SettingsStore,
    {} as ThirdPartyStore,
    { buildReport } as unknown as DocumentBuilderReportStore,
  );

  return { store, buildReport };
};

describe("SettingsSetupStore audit reports", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts the login history report in the requested format", async () => {
    const { store, buildReport } = makeStore();

    await store.getLoginHistoryReport(AuditReportFormat.Csv);

    expect(buildReport).toHaveBeenCalledWith(
      ReportType.LoginHistory,
      expect.any(Object),
    );
    expect(api.settings.startLoginHistoryReport).toHaveBeenCalledWith(
      AuditReportFormat.Csv,
    );
    expect(api.settings.getLoginHistoryReportStatus).toHaveBeenCalled();
  });

  it("starts the audit trail report in the requested format", async () => {
    const { store, buildReport } = makeStore();

    await store.getAuditTrailReport(AuditReportFormat.Csv);

    expect(buildReport).toHaveBeenCalledWith(
      ReportType.AuditTrail,
      expect.any(Object),
    );
    expect(api.settings.startAuditTrailReport).toHaveBeenCalledWith(
      AuditReportFormat.Csv,
    );
    expect(api.settings.getAuditTrailReportStatus).toHaveBeenCalled();
  });

  it("leaves the format to the server default when none is chosen", async () => {
    const { store } = makeStore();

    await store.getAuditTrailReport();

    expect(api.settings.startAuditTrailReport).toHaveBeenCalledWith(undefined);
  });
});
