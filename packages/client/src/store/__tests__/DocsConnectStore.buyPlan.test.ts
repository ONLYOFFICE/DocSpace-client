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

vi.mock("@docspace/shared/api/docs-connect", () => ({
  getDocsConnectInfo: vi.fn(),
  startDocsConnectTrial: vi.fn(),
  buyDocsConnectPlan: vi.fn(),
  calculateDocsConnectDevPack: vi.fn(),
  switchDocsConnectToDevPack: vi.fn(),
  cancelDocsConnectPlan: vi.fn(),
  cancelDocsConnectScheduledChange: vi.fn(),
  updateDocsConnectConfig: vi.fn(),
  startDocsConnectReport: vi.fn(),
  getDocsConnectReportStatus: vi.fn(),
  getDocsConnectConnection: vi.fn(),
}));

vi.mock("@docspace/shared/api/portal", () => ({
  saveDeposite: vi.fn(),
}));

vi.mock("@docspace/shared/api/files", () => ({
  changeDocumentServiceLocation: vi.fn(),
  getDocumentServiceLocation: vi.fn(),
}));

vi.mock("@docspace/ui-kit/components/toast", () => ({
  toastr: { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() },
}));

vi.mock("../../i18n", () => ({
  default: { t: (key: string) => key },
}));

import {
  buyDocsConnectPlan,
  getDocsConnectInfo,
  switchDocsConnectToDevPack,
} from "@docspace/shared/api/docs-connect";
import { saveDeposite } from "@docspace/shared/api/portal";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { SettingsStore } from "@docspace/shared/store/SettingsStore";
import type { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import DocsConnectStore from "../DocsConnectStore";
import type DocumentBuilderReportStore from "../DocumentBuilderReportStore";

const PRICE_PER_USER = 2;
const DEV_PACK_PRICE = 3;
const USERS = 50;
const START_BALANCE = 10;
const DEV_PACK_CHARGE = 160;
const TOP_UP = DEV_PACK_CHARGE - START_BALANCE;

const makeInfo = ({
  devPackEnabled = false,
  availableCredits = START_BALANCE,
  quantity = USERS,
}: {
  devPackEnabled?: boolean;
  availableCredits?: number;
  quantity?: number;
} = {}) =>
  ({
    tenant: { endDate: "2026-09-01T00:00:00Z", payment: { quantity } },
    config: {
      tenantName: "tenant",
      security: { secret: "secret", header: "header" },
      server: { isAnonymousSupport: false },
    },
    tenantInfo: {
      license: { valid: "2026-09-01", trial: false, buildDate: "" },
      server: { version: "9.0", packageType: "cloud", date: "" },
      usersLimit: { edit: quantity, view: 0 },
      stats: {
        periodDay: 1,
        editor: {
          active: 0,
          internal: 0,
          external: 0,
          remaining: 0,
          criticalRemaining: false,
        },
        viewer: {
          active: 0,
          internal: 0,
          external: 0,
          remaining: 0,
          criticalRemaining: false,
        },
      },
    },
    prices: { pricePerUser: PRICE_PER_USER, devPackPrice: DEV_PACK_PRICE },
    wallet: { availableCredits, currency: "USD" },
    devPackEnabled,
    scheduledChange: null,
    deactivated: false,
  }) as TDocsConnectInfo;

const createStore = (info: TDocsConnectInfo) => {
  const store = new DocsConnectStore(
    {} as SettingsStore,
    {
      fetchPortalTariff: vi.fn().mockResolvedValue(null),
    } as unknown as CurrentTariffStatusStore,
    {
      fetchPortalQuota: vi.fn().mockResolvedValue(null),
    } as unknown as CurrentQuotasStore,
    {} as DocumentBuilderReportStore,
  );

  store.info = info;
  store.openBuyPlan("edit");

  return store;
};

const mockedSaveDeposite = vi.mocked(saveDeposite);
const mockedGetInfo = vi.mocked(getDocsConnectInfo);
const mockedSwitchToDevPack = vi.mocked(switchDocsConnectToDevPack);
const mockedBuyPlan = vi.mocked(buyDocsConnectPlan);

let walletBalance = START_BALANCE;

beforeEach(() => {
  vi.clearAllMocks();
  walletBalance = START_BALANCE;

  mockedSaveDeposite.mockImplementation(async (amount: number) => {
    walletBalance += amount;
    return "ok";
  });
  mockedGetInfo.mockImplementation(async () =>
    makeInfo({ availableCredits: walletBalance }),
  );
});

describe("DocsConnectStore.switchToDevPack", () => {
  it("tops up the wallet only once when the Dev Pack switch fails and is retried", async () => {
    const store = createStore(makeInfo());

    mockedSwitchToDevPack
      .mockRejectedValueOnce(new Error("Insufficient funds"))
      .mockResolvedValueOnce(
        makeInfo({ devPackEnabled: true, availableCredits: START_BALANCE }),
      );

    await expect(
      store.switchToDevPack({ quantity: USERS, topUp: TOP_UP }),
    ).rejects.toThrow("Insufficient funds");

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(1);
    expect(mockedSaveDeposite).toHaveBeenCalledWith(TOP_UP, "USD");
    expect(store.depositedTopUp).toBe(TOP_UP);
    expect(store.info?.wallet?.availableCredits).toBe(START_BALANCE + TOP_UP);
    expect(store.buyPlanPanelVisible).toBe(true);

    await store.switchToDevPack({ quantity: USERS, topUp: TOP_UP });

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(1);
    expect(mockedSwitchToDevPack).toHaveBeenCalledTimes(2);
    expect(store.info?.devPackEnabled).toBe(true);
    expect(store.depositedTopUp).toBe(0);
    expect(store.buyPlanPanelVisible).toBe(false);
  });

  it("tops up only the missing part when a later attempt needs more credits", async () => {
    const store = createStore(makeInfo());

    mockedSwitchToDevPack
      .mockRejectedValueOnce(new Error("Insufficient funds"))
      .mockResolvedValueOnce(makeInfo({ devPackEnabled: true }));

    await expect(
      store.switchToDevPack({ quantity: USERS, topUp: TOP_UP }),
    ).rejects.toThrow("Insufficient funds");

    await store.switchToDevPack({ quantity: USERS + 10, topUp: TOP_UP + 50 });

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(2);
    expect(mockedSaveDeposite).toHaveBeenNthCalledWith(1, TOP_UP, "USD");
    expect(mockedSaveDeposite).toHaveBeenNthCalledWith(2, 50, "USD");
  });

  it("does not switch the plan when the top-up itself fails", async () => {
    const store = createStore(makeInfo());

    mockedSaveDeposite.mockRejectedValueOnce(new Error("Card declined"));

    await expect(
      store.switchToDevPack({ quantity: USERS, topUp: TOP_UP }),
    ).rejects.toThrow("Card declined");

    expect(mockedSwitchToDevPack).not.toHaveBeenCalled();
    expect(store.depositedTopUp).toBe(0);

    mockedSwitchToDevPack.mockResolvedValueOnce(
      makeInfo({ devPackEnabled: true }),
    );

    await store.switchToDevPack({ quantity: USERS, topUp: TOP_UP });

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(2);
    expect(mockedSwitchToDevPack).toHaveBeenCalledTimes(1);
  });

  it("does not touch the wallet when the balance already covers the charge", async () => {
    const store = createStore(makeInfo({ availableCredits: DEV_PACK_CHARGE }));

    mockedSwitchToDevPack.mockResolvedValueOnce(
      makeInfo({ devPackEnabled: true }),
    );

    await store.switchToDevPack({ quantity: USERS });

    expect(mockedSaveDeposite).not.toHaveBeenCalled();
    expect(mockedSwitchToDevPack).toHaveBeenCalledWith({ quantity: USERS });
  });

  it("keeps the original error when refreshing the info also fails", async () => {
    const store = createStore(makeInfo());

    mockedSwitchToDevPack.mockRejectedValueOnce(new Error("Insufficient funds"));
    mockedGetInfo.mockRejectedValue(new Error("Refresh failed"));

    await expect(
      store.switchToDevPack({ quantity: USERS, topUp: TOP_UP }),
    ).rejects.toThrow("Insufficient funds");

    expect(store.depositedTopUp).toBe(TOP_UP);
  });

  it("tops up again for a new purchase made after a successful one", async () => {
    const store = createStore(makeInfo());

    mockedSwitchToDevPack.mockResolvedValue(
      makeInfo({ devPackEnabled: true, availableCredits: START_BALANCE }),
    );

    await store.switchToDevPack({ quantity: USERS, topUp: TOP_UP });
    expect(store.depositedTopUp).toBe(0);

    store.openBuyPlan("edit");
    await store.switchToDevPack({ quantity: USERS, topUp: TOP_UP });

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(2);
  });
});

describe("DocsConnectStore.buyPlan", () => {
  it("tops up the wallet only once when the purchase fails and is retried", async () => {
    const store = createStore(makeInfo());

    mockedBuyPlan
      .mockRejectedValueOnce(new Error("Insufficient funds"))
      .mockResolvedValueOnce(makeInfo({ quantity: USERS + 10 }));

    await expect(
      store.buyPlan({ users: USERS + 10, devPack: false, topUp: TOP_UP }),
    ).rejects.toThrow("Insufficient funds");

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(1);

    await store.buyPlan({ users: USERS + 10, devPack: false, topUp: TOP_UP });

    expect(mockedSaveDeposite).toHaveBeenCalledTimes(1);
    expect(mockedBuyPlan).toHaveBeenCalledTimes(2);
    expect(mockedBuyPlan).toHaveBeenLastCalledWith({
      users: USERS + 10,
      devPackEnabled: false,
      currentUsers: USERS,
      currentDevPackEnabled: false,
    });
    expect(store.info?.tenant.payment?.quantity).toBe(USERS + 10);
  });
});
