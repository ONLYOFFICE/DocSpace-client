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

import axios from "axios";
import { makeAutoObservable, runInAction } from "mobx";

import {
  getPaymentSettings,
  setLicense,
  acceptLicense,
} from "@docspace/shared/api/settings";
import {
  getServicesQuotas,
  getServiceQuota,
  getLicenseQuota,
  setServiceState,
  getWalletBalance,
} from "@docspace/shared/api/portal";
import { toastr } from "@docspace/ui-kit/components/toast";
import { authStore, settingsStore } from "@docspace/shared/store";
import { UserStore } from "@docspace/shared/store/UserStore";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TTranslation } from "@docspace/shared/types";
import { type TData } from "@docspace/ui-kit/components/toast";
import {
  TBalance,
  TAutoTopUpSettings,
  TTransactionCollection,
  TPaymentFeature,
  TPaymentQuota,
  TNumericPaymentFeature,
  TLicenseQuota,
} from "@docspace/shared/api/portal/types";

import { AI_ENUM, BACKUP_SERVICE } from "@docspace/ui-kit/billing/constants";
import { applyServiceQuotaToMap } from "@docspace/ui-kit/billing/utils/parsers";
import {
  getCardLinkedOnFreeTariff,
  getCardLinkedOnNonProfit,
  getIsCardLinkedToPortal,
  getIsPayer,
  getWalletBalanceAmount,
  getWalletBalanceCurrency,
  formatPaymentDate,
} from "@docspace/ui-kit/billing/utils/paymentSelectors";
import type { DateTime } from "luxon";

// Constants for feature identifiers
export const TOTAL_SIZE = "total_size";

type TServiceFeatureWithPrice = TNumericPaymentFeature & {
  price: {
    value: number;
    currencySymbol?: string;
  };
  serviceName?: string;
};

class PaymentStore {
  userStore: UserStore | null = null;

  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  currentQuotaStore: CurrentQuotasStore | null = null;

  settingsStore: SettingsStore | null = null;

  licenseQuota: TLicenseQuota | null = null;

  walletBalanceData: TBalance | null = null;

  get walletBalance(): number {
    return getWalletBalanceAmount(this.walletBalanceData);
  }

  get walletCodeCurrency(): string {
    return getWalletBalanceCurrency(this.walletBalanceData);
  }

  fetchWalletBalance = async (isRefresh?: boolean) => {
    const res = await getWalletBalance(isRefresh);
    if (res) this.walletBalanceData = res;
    return this.walletBalance;
  };

  salesEmail = "";

  buyUrl = "";

  standaloneMode = true;

  currentLicense = {
    expiresDate: new Date(),
    trialMode: true,
  };

  isLoading = false;

  isUpdatingBasicSettings = false;

  maxAvailableManagersCount = 999;

  isInitPaymentPage = false;

  isLicenseCorrect = false;

  servicesQuotasFeatures: Map<
    string,
    TPaymentFeature | TServiceFeatureWithPrice
  > = new Map(); // temporary solution, should be in the service store

  servicesQuotas: TPaymentQuota | null = null; // temporary solution, should be in the service store

  constructor(
    userStore: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    currentQuotaStore: CurrentQuotasStore,
  ) {
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.currentQuotaStore = currentQuotaStore;
    this.settingsStore = settingsStore;

    makeAutoObservable(this);
  }

  get isPayer() {
    return getIsPayer(
      this.userStore?.user?.email,
      this.currentTariffStatusStore?.walletCustomerEmail,
    );
  }

  setIsUpdatingBasicSettings = (isUpdatingBasicSettings: boolean) => {
    this.isUpdatingBasicSettings = isUpdatingBasicSettings;
  };

  get cardLinkedOnFreeTariff() {
    if (!this.currentQuotaStore || !this.currentTariffStatusStore) return false;

    return getCardLinkedOnFreeTariff(
      this.currentQuotaStore.isFreeTariff,
      this.currentTariffStatusStore.walletCustomerEmail,
    );
  }

  get cardLinkedOnNonProfit() {
    if (!this.currentQuotaStore || !this.currentTariffStatusStore) return false;

    return getCardLinkedOnNonProfit(
      this.currentQuotaStore.isNonProfit,
      this.currentTariffStatusStore.walletCustomerEmail,
    );
  }

  get isCardLinkedToPortal() {
    if (!this.currentQuotaStore || !this.currentTariffStatusStore) return false;

    return getIsCardLinkedToPortal({
      isNonProfit: this.currentQuotaStore.isNonProfit,
      isFreeTariff: this.currentQuotaStore.isFreeTariff,
      walletCustomerEmail: this.currentTariffStatusStore.walletCustomerEmail,
    });
  }

  get storageSizeIncrement() {
    return (
      (this.servicesQuotasFeatures.get(TOTAL_SIZE) as TNumericPaymentFeature)
        ?.value || 0
    );
  }
  get storagePriceIncrement() {
    return (
      (this.servicesQuotasFeatures.get(TOTAL_SIZE) as TServiceFeatureWithPrice)
        ?.price?.value || 0
    );
  }
  get backupServicePrice() {
    return (
      (
        this.servicesQuotasFeatures.get(
          BACKUP_SERVICE,
        ) as TServiceFeatureWithPrice
      )?.price?.value || 0
    );
  }

  get isBackupServiceOn() {
    return this.servicesQuotasFeatures.get(BACKUP_SERVICE)?.value;
  }

  get isAiToolsServiceOn() {
    return this.servicesQuotasFeatures.get(AI_ENUM)?.value;
  }

  get isAIReady() {
    return Boolean(this.isAiToolsServiceOn) || Boolean(settingsStore.aiConfig?.aiReady);
  }

  formatDate = (date: DateTime, timeType?: "start" | "end") =>
    formatPaymentDate(date, timeType);

  handleServiceQuota = async (serviceName = BACKUP_SERVICE) => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    const service = await getServiceQuota(serviceName, abortController.signal);

    applyServiceQuotaToMap(service, this.servicesQuotasFeatures as Parameters<typeof applyServiceQuotaToMap>[1]);

    return service.serviceName;
  };

  enableAIService = async (onSuccess?: () => void | Promise<void>) => {
    const feature = this.servicesQuotasFeatures.get(AI_ENUM);
    if (feature) {
      this.servicesQuotasFeatures.set(AI_ENUM, { ...feature, value: true });
    }
    try {
      await setServiceState({ service: AI_ENUM, enabled: true });
      await onSuccess?.();
    } catch {
      if (feature) {
        this.servicesQuotasFeatures.set(AI_ENUM, { ...feature, value: false });
      }
    }
  };

  standaloneBasicSettings = async (t: TTranslation) => {
    const { getPaymentInfo } = authStore;

    this.setIsUpdatingBasicSettings(true);

    try {
      await getPaymentInfo();
    } catch (e) {
      console.error(e);
      toastr.error(t("Common:UnexpectedError"));

      return;
    }

    this.setIsUpdatingBasicSettings(false);
  };

  standaloneInit = async (t: TTranslation) => {
    const { getPaymentInfo } = authStore;

    if (this.isInitPaymentPage) {
      this.standaloneBasicSettings(t);

      return;
    }

    try {
      await Promise.all([
        this.getSettingsPayment(),
        this.getPortalLicenseQuota(),
        getPaymentInfo(),
      ]);
    } catch (error) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(error);
      return;
    }

    this.isInitPaymentPage = true;
  };

  getSettingsPayment = async () => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    try {
      const newSettings = await getPaymentSettings(abortController.signal);

      if (!newSettings) return;

      const {
        buyUrl,
        salesEmail,
        currentLicense,
        standalone: standaloneMode,
        max,
      } = newSettings;

      this.buyUrl = buyUrl;
      this.salesEmail = salesEmail;
      this.standaloneMode = standaloneMode;
      this.maxAvailableManagersCount = max;

      if (currentLicense) {
        if (currentLicense.date)
          this.currentLicense.expiresDate = new Date(currentLicense.date);

        if (currentLicense.trial)
          this.currentLicense.trialMode = currentLicense.trial;
      }
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      console.error(e);
    }
  };

  getPortalLicenseQuota = async () => {
    try {
      const licenseQuota = await getLicenseQuota();
      if (!licenseQuota) return;

      this.licenseQuota = licenseQuota;
    } catch (e) {
      if (axios.isCancel(e)) {
        return;
      }
      console.error(e);
    }
  };

  setIsLicenseCorrect = (isLicenseCorrect: boolean) => {
    this.isLicenseCorrect = isLicenseCorrect;
  };

  setPaymentsLicense = async (confirmKey: string, data: FormData) => {
    try {
      const message = await setLicense(confirmKey, data);
      this.setIsLicenseCorrect(true);

      toastr.success(message);
    } catch (e) {
      toastr.error(e as TData);
      this.setIsLicenseCorrect(false);
    }
  };

  acceptPaymentsLicense = async (t: TTranslation) => {
    try {
      const { getPaymentInfo } = authStore;

      const message = await acceptLicense();

      if (message) {
        toastr.error(message);
        return;
      }

      toastr.success(t("Common:ActivateLicenseActivated"));
      localStorage.removeItem("enterpriseAlertClose");

      await getPaymentInfo();
      await this.settingsStore?.getSettings();
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };
}

export default PaymentStore;

