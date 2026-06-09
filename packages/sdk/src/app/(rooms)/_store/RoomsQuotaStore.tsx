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

"use client";

import React from "react";
import { makeAutoObservable, runInAction } from "mobx";

import { getPortalQuota, getPortalTariff } from "@docspace/shared/api/portal";
import type {
  TPaymentQuota,
  TNumericPaymentFeature,
  TPortalTariff,
} from "@docspace/shared/api/portal/types";
import { TariffState } from "@docspace/shared/enums";
import { PortalFeaturesLimitations } from "@docspace/ui-kit/enums";
import { ROOM } from "@docspace/ui-kit/billing/constants";
import { COUNT_FOR_SHOWING_BAR } from "@docspace/shared/constants";
import type { Nullable } from "@docspace/shared/types";

// SDK-local mirror of quota/tariff checks needed for the "new room" warning
// dialog. Keeps the (rooms) route decoupled from the shared full quota store
// (which depends on settings + abort-controller plumbing not wired here).
class RoomsQuotaStore {
  private portalTariff: Nullable<TPortalTariff> = null;

  private portalQuota: Nullable<TPaymentQuota> = null;

  isLoaded = false;

  private inflight: Promise<unknown> | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  private get roomFeature(): Nullable<TNumericPaymentFeature> {
    if (!this.portalQuota) return null;
    const feature = this.portalQuota.features.find((f) => f.id === ROOM);
    return (feature as TNumericPaymentFeature) ?? null;
  }

  get isGracePeriod() {
    return this.portalTariff?.state === TariffState.Delay;
  }

  get dueDate() {
    return this.portalTariff?.dueDate ?? null;
  }

  get delayDueDate() {
    return this.portalTariff?.delayDueDate ?? null;
  }

  get maxCountRoomsByQuota(): number {
    const value = this.roomFeature?.value;
    if (!value) return PortalFeaturesLimitations.Limitless;
    return value;
  }

  get usedRoomsCount(): number {
    return this.roomFeature?.used?.value ?? 0;
  }

  get isRoomsTariffLimit(): boolean {
    if (this.maxCountRoomsByQuota === PortalFeaturesLimitations.Limitless)
      return false;
    return (
      this.maxCountRoomsByQuota - this.usedRoomsCount <=
        COUNT_FOR_SHOWING_BAR &&
      this.usedRoomsCount >= this.maxCountRoomsByQuota
    );
  }

  get isWarningRoomsDialog(): boolean {
    return this.isGracePeriod || this.isRoomsTariffLimit;
  }

  fetch = async (): Promise<void> => {
    if (this.isLoaded) return;
    if (this.inflight !== null) {
      await this.inflight;
      return;
    }
    const run = async () => {
      try {
        const [tariff, quota] = await Promise.all([
          getPortalTariff(),
          getPortalQuota(),
        ]);
        runInAction(() => {
          this.portalTariff = tariff;
          this.portalQuota = quota;
          this.isLoaded = true;
        });
      } catch {
        // ignore fetch errors — store stays unloaded, dialog won't open
      } finally {
        this.inflight = null;
      }
    };
    this.inflight = run();
    await this.inflight;
  };
}

const RoomsQuotaStoreContext = React.createContext<RoomsQuotaStore | null>(
  null,
);

export const RoomsQuotaStoreContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = React.useMemo(() => new RoomsQuotaStore(), []);
  return (
    <RoomsQuotaStoreContext.Provider value={store}>
      {children}
    </RoomsQuotaStoreContext.Provider>
  );
};

export const useRoomsQuotaStore = (): RoomsQuotaStore => {
  const store = React.useContext(RoomsQuotaStoreContext);
  if (!store)
    throw new Error(
      "useRoomsQuotaStore must be used within RoomsQuotaStoreContextProvider",
    );
  return store;
};

export default RoomsQuotaStore;

