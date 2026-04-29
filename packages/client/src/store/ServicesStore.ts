// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

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
  AI_TOOLS,
  BACKUP_SERVICE,
  STORAGE_ENUM,
} from "@docspace/ui-kit/billing/constants";

type TAiToolsChatPrice = {
  prompt: number;
  completion: number;
};

type TAiToolsEmbeddingPrice = {
  prompt: number;
};

type TAiToolsChatModelPrice = {
  id: string;
  alias: string;
  provider: string;
  image: string;
  price: TAiToolsChatPrice;
};

type TAiToolsEmbeddingModelPrice = {
  id: string;
  alias: string;
  provider: string;
  image: string;
  price: TAiToolsEmbeddingPrice;
};

type TAiToolsWebSearchPrice = {
  id: string;
  alias: string;
  provider: string;
  image: string;
  price: number;
};

export type TAiToolsPrices = {
  currency?: {
    code: string;
    symbol: string;
  };
  chat?: TAiToolsChatModelPrice[];
  embedding?: TAiToolsEmbeddingModelPrice[];
  webSearch?: TAiToolsWebSearchPrice[];
};

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

  reccomendedAmount: number = 0;

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
        AI_TOOLS,
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
}

export default ServicesStore;

