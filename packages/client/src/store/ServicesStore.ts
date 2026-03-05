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
import { authStore, settingsStore } from "@docspace/shared/store";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { formatterCurrencyWithoutTranction } from "SRC_DIR/pages/PortalSettings/categories/payments/Wallet/utils";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import { AI_TOOLS } from "@docspace/shared/constants";

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

  isInitAiPage = false;

  isVisibleWalletSettings = false;

  partialUpgradeFee: number = 0;

  reccomendedAmount: number = 0;

  featureCountData: number = 0;

  confirmActionType: string | null = null;

  aiToolsBalance: TBalance = null;

  aiToolsPrices: TAiToolsPrices | null = null;

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

  // get storageSizeIncrement() { // temp in payment store because of storage tariff deeactivation
  //   return (
  //     (this.servicesQuotasFeatures.get(TOTAL_SIZE) as TNumericPaymentFeature)
  //       ?.value || 0
  //   );
  // }

  // get storagePriceIncrement() {
  //   return this.servicesQuotas?.price.value ?? 0;
  // }

  // get storageQuotaIncrementPrice() {
  //   return (
  //     this.servicesQuotas?.price ?? {
  //       value: 0,
  //       currencySymbol: "",
  //       isoCurrencySymbol: "USD",
  //     }
  //   );
  // }

  get aiServiceBalance() {
    if (this.aiToolsBalance && this.aiToolsBalance.subAccounts.length > 0)
      return this.aiToolsBalance.subAccounts[0].amount;

    return 0.0;
  }

  get isAiServiceLowBalance() {
    if (!this.wasFirstAiServiceTopUp) return false;

    return this.aiServiceBalance < 1;
  }

  get aiServiceCodeCurrency() {
    if (this.aiToolsBalance && this.aiToolsBalance.subAccounts.length > 0)
      return this.aiToolsBalance.subAccounts[0].currency;

    return "USD";
  }

  get aiServiceLastCreditAmount() {
    if (!this.aiToolsBalance || typeof this.aiToolsBalance === "number")
      return null;

    return this.aiToolsBalance.lastCredit?.amount ?? null;
  }

  get aiServiceLastCreditCurrency() {
    if (!this.aiToolsBalance || typeof this.aiToolsBalance === "number")
      return "";

    return this.aiToolsBalance.lastCredit?.currency ?? "USD";
  }

  get aiServiceLastCreditDate() {
    if (!this.aiToolsBalance || typeof this.aiToolsBalance === "number")
      return null;

    return this.aiToolsBalance.lastCredit?.date ?? null;
  }

  get aiModelsCurrency() {
    const currency = this.aiToolsPrices?.currency;
    if (!currency) return "USD";

    return currency.code ?? "USD";
  }

  get aiModelsCurrencySymbol() {
    const currency = this.aiToolsPrices?.currency;
    if (!currency) return "$";

    return currency.symbol ?? "$";
  }

  get minimumInputPrice() {
    const inputValues: Array<number | undefined> = [];

    for (const model of this.aiToolsPrices?.chat ?? []) {
      inputValues.push(model.price?.prompt);
    }

    for (const model of this.aiToolsPrices?.embedding ?? []) {
      inputValues.push(model.price?.prompt);
    }

    for (const ws of this.aiToolsPrices?.webSearch ?? []) {
      inputValues.push(ws.price);
    }

    const values = inputValues.filter((v): v is number => Number.isFinite(v));

    return values.length ? Math.min(...values) : 0;
  }

  get minimumOutputPrice() {
    const values = (this.aiToolsPrices?.chat ?? [])
      .map((m) => m.price?.completion)
      .filter((v): v is number => Number.isFinite(v));

    return values.length ? Math.min(...values) : 0;
  }

  get wasFirstAiServiceTopUp() {
    // return false;
    if (!this.aiToolsBalance) return false;

    return this.aiToolsBalance.subAccounts.length !== 0;
  }

  setPartialUpgradeFee = (partialUpgradeFee: number) => {
    this.partialUpgradeFee = partialUpgradeFee;
  };

  setVisibleWalletSetting = (isVisibleWalletSettings: boolean) => {
    this.isVisibleWalletSettings = isVisibleWalletSettings;
  };

  setIsInitServicesPage = (isInitServicesPage: boolean) => {
    this.isInitServicesPage = isInitServicesPage;
  };

  setIsInitAiPage = (isInitAiPage: boolean) => {
    this.isInitAiPage = isInitAiPage;
  };

  fetchAiPrices = async () => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await getAiPrices(abortController.signal);
      if (!res) return;
      this.aiToolsPrices = res;
    } catch (error) {
      if (axios.isCancel(error)) return;
      console.error(error);
    }
  };

  fetchAiModelAvailabilitySettings = async () => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const res = await getAiModelRestrictions(abortController.signal);
      if (!res) return;

      const nextMap = new Map<string, boolean>();

      const restrictedModels = new Set<string>();

      if (Array.isArray((res as { models?: unknown }).models)) {
        (res as { models: string[] }).models.forEach((id) => {
          if (!id) return;
          restrictedModels.add(String(id));
        });
      }

      restrictedModels.forEach((modelId) => {
        nextMap.set(modelId, false);
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
        "aitools",
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

  // handleServicesQuotas = async () => { // temp in payment store because of storage tariff deeactivation
  //   const res = await getServicesQuotas();

  //   if (!res) return;

  //   res[0].features.forEach((feature) => {
  //     this.servicesQuotasFeatures.set(feature.id, feature);
  //   });

  //   this.servicesQuotas = res[0];

  //   return res;
  // };

  setConfirmActionType = (value: string) => {
    this.confirmActionType = value;
  };

  setReccomendedAmount = (amount: number) => {
    this.reccomendedAmount = amount;
  };

  setFeatureCountData = (featureCountData: number) => {
    this.featureCountData = featureCountData;
  };

  aiServicesinit = async (t: TTranslation) => {
    const isRefresh = window.location.href.includes("complete=true");

    this.setIsInitAiPage(false);

    const {
      fetchTransactionHistory,
      initWalletPayerAndBalance,
      handleServicesQuotas,
    } = this.paymentStore!;

    try {
      const requests = [
        this.fetchAiPrices(),
        this.fetchAiServiceBalance(),
        this.fetchAiModelAvailabilitySettings(),
        handleServicesQuotas(AI_TOOLS),
        fetchTransactionHistory(null, null, true, true, "", "aitools"),
        initWalletPayerAndBalance(isRefresh),
      ];

      await Promise.all(requests);
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:UnexpectedError"));
    } finally {
      this.setIsInitAiPage(true);
    }
  };

  servicesInit = async (t: TTranslation) => {
    const isRefresh = window.location.href.includes("complete=true");

    if (!isRefresh) {
      if (this.isVisibleWalletSettings) this.setVisibleWalletSetting(false);
    }

    const {
      fetchAutoPayments,
      fetchCardLinked,
      setPaymentAccount,
      initWalletPayerAndBalance,
      handleServicesQuotas,
    } = this.paymentStore!;

    const { fetchPortalTariff, walletCustomerStatusNotActive } =
      this.currentTariffStatusStore!;

    try {
      const requests = [
        handleServicesQuotas(),
        initWalletPayerAndBalance(isRefresh),
        fetchPortalTariff(),
        this.fetchAiServiceBalance(),
        this.fetchAiPrices(),
      ];

      const [quotas] = await Promise.all(requests);

      if (!quotas) throw new Error();

      if (this.paymentStore!.isAlreadyPaid) {
        if (this.paymentStore!.isStripePortalAvailable) {
          requests.push(setPaymentAccount());

          if (this.paymentStore!.isPayer && walletCustomerStatusNotActive) {
            requests.push(fetchCardLinked());
          }

          if (
            this.paymentStore!.isShowStorageTariffDeactivated() &&
            this.paymentStore!.isPayer
          ) {
            this.paymentStore!.setIsShowTariffDeactivatedModal(true);
          }
        }
        requests.push(fetchAutoPayments());
      } else {
        requests.push(fetchCardLinked());
      }

      this.setIsInitServicesPage(true);
      if (isRefresh) {
        const url = new URL(window.location.href);
        const params = url.searchParams;

        const amountParam = params.get("amount");
        const recommendedAmountParam = params.get("recommendedAmount");
        const actionTypeParam = params.get("actionType");

        if (amountParam && recommendedAmountParam) {
          const amount = Number(amountParam);
          const recommendedAmount = Number(recommendedAmountParam);

          this.setReccomendedAmount(Math.ceil(recommendedAmount));
          this.setFeatureCountData(amount);
        }

        if (amountParam && !recommendedAmountParam) {
          const amount = Number(amountParam);
          this.setFeatureCountData(amount);
        }

        if (actionTypeParam) {
          this.setConfirmActionType(actionTypeParam);
          this.setVisibleWalletSetting(true);
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    } catch (e) {
      if (axios.isCancel(e)) return;
      toastr.error(t("Common:UnexpectedError"));
      console.error(e);
    }
  };
}

export default ServicesStore;
