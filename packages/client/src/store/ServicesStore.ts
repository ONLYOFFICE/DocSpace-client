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

import { makeAutoObservable, observable } from "mobx";
import axios from "axios";

import { toastr } from "@docspace/ui-kit/components/toast";

import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import { TTranslation } from "@docspace/shared/types";

import PaymentStore from "./PaymentStore";
import { TBalance } from "@docspace/shared/api/portal/types";
import {
  getAiPrices,
  getAiModelRestrictions,
  setAiModelRestrictions,
  getServiceQuotaBalance,
} from "@docspace/shared/api/portal";
import { getBackupsCount } from "@docspace/shared/api/backup";
import { authStore, settingsStore } from "@docspace/shared/store";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { formatterCurrencyWithoutTranction } from "@docspace/ui-kit/billing/wallet/utils";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import {
  AI_ENUM,
  BACKUP_SERVICE,
  STORAGE_ENUM,
} from "@docspace/ui-kit/billing/constants";
import { parseAiPrices } from "@docspace/ui-kit/billing/utils/parsers";
import type { TAiToolsPrices } from "@docspace/ui-kit/billing/types";

export type { TAiToolsPrices };

class ServicesStore {
  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  // servicesQuotasFeatures: Map<string, TPaymentFeature> = new Map();

  // servicesQuotas: TPaymentQuota | null = null;

  paymentStore: PaymentStore | null = null;

  settingsStore: SettingsStore | null = null;

  isInitServicesPage = false;

  isInitServicesData = false;

  isVisibleWalletSettings = false;

  partialUpgradeFee: number = 0;

  recommendedAmount: number = 0;

  featureCountData: number = 0;

  confirmActionType: string | null = null;

  aiToolsBalance: TBalance = null;

  aiToolsPrices: TAiToolsPrices | null = null;

  usedBackupsCount: number = 0;

  aiModelAvailabilityMap: Map<string, boolean> = new Map();

  aiModelAvailabilityUpdatingSet: Set<string> = new Set();

  constructor(
    currentTariffStatusStore: CurrentTariffStatusStore,
    paymentStore: PaymentStore,
  ) {
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.paymentStore = paymentStore;
    this.settingsStore = settingsStore;

    makeAutoObservable(this, {
      aiModelAvailabilityMap: observable.ref,
      aiModelAvailabilityUpdatingSet: observable.ref,
    });
  }

  get aiServiceBalance() {
    if (this.aiToolsBalance && this.aiToolsBalance.subAccounts.length > 0)
      return this.aiToolsBalance.subAccounts[0].amount;

    return 0.0;
  }

  get aiServiceCodeCurrency() {
    if (this.aiToolsBalance && this.aiToolsBalance.subAccounts.length > 0)
      return this.aiToolsBalance.subAccounts[0].currency;

    return "USD";
  }

  get aiModelsCurrency() {
    const currency = this.aiToolsPrices?.currency;
    if (!currency) return "USD";

    return currency.code ?? "USD";
  }

  get aiModelsCurrencySymbol() {
    return this.aiToolsPrices?.currency?.symbol ?? "$";
  }

  formatAiModelsCurrency = (amount: number) => {
    const { language } = authStore;

    return formatterCurrencyWithoutTranction(
      language,
      amount,
      this.aiModelsCurrency,
    );
  };

  formatAiServiceCurrency = (
    item: number | null = null,
    fractionDigits: number = 3,
    currency: string = this.aiServiceCodeCurrency,
  ) => {
    const { language } = authStore;

    const amount = item ?? this.aiServiceBalance;

    return formatCurrencyValue(language, amount, currency, fractionDigits);
  };

  fetchAiServiceBalance = async (isRefresh?: boolean) => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await getServiceQuotaBalance(
        isRefresh,
        abortController.signal,
      );

      if (!res) return;

      this.aiToolsBalance = res;
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    }
  };

  fetchAiPrices = async () => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await getAiPrices(abortController.signal);

      const prices = parseAiPrices(res);
      if (!prices) return;

      this.aiToolsPrices = prices;
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    }
  };

  fetchAiModelRestrictions = async () => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await getAiModelRestrictions(abortController.signal);

      const models = Array.isArray(res) ? [] : (res?.models ?? []);

      const nextMap = new Map<string, boolean>();
      models.forEach((id) => {
        if (id) nextMap.set(String(id), false);
      });

      this.aiModelAvailabilityMap = nextMap;
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    }
  };

  setAiModelAvailability = async (modelId: string, enabled: boolean) => {
    if (!modelId || this.aiModelAvailabilityUpdatingSet.has(modelId)) return;

    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    this.aiModelAvailabilityUpdatingSet = new Set([
      ...this.aiModelAvailabilityUpdatingSet,
      modelId,
    ]);

    try {
      const restrictedModels: string[] = Array.from(
        this.aiModelAvailabilityMap.keys(),
      );

      const idx = restrictedModels.indexOf(modelId);

      if (enabled && idx >= 0) {
        restrictedModels.splice(idx, 1);
      }
      if (!enabled && idx < 0) {
        restrictedModels.push(modelId);
      }

      await setAiModelRestrictions(restrictedModels, abortController.signal);

      const nextMap = new Map(this.aiModelAvailabilityMap);
      if (enabled) nextMap.delete(modelId);
      else nextMap.set(modelId, false);
      this.aiModelAvailabilityMap = nextMap;
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    } finally {
      const nextSet = new Set(this.aiModelAvailabilityUpdatingSet);
      nextSet.delete(modelId);
      this.aiModelAvailabilityUpdatingSet = nextSet;
    }
  };
}

export default ServicesStore;

