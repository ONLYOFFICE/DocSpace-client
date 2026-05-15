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
import { makeAutoObservable } from "mobx";

import {
  getPaymentSettings,
  setLicense,
  acceptLicense,
} from "@docspace/shared/api/settings";
import {
  getServicesQuotas,
  getServiceQuota,
  getLicenseQuota,
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
import type { DateTime } from "luxon";
import { formatDate as formatDateUtil } from "@docspace/ui-kit/utils/date";

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
    if (!this.userStore || !this.currentTariffStatusStore) return;

    const { user } = this.userStore;
    const { walletCustomerEmail } = this.currentTariffStatusStore;

    if (!user || !walletCustomerEmail) return false;

    return user.email === walletCustomerEmail;
  }

  setIsUpdatingBasicSettings = (isUpdatingBasicSettings: boolean) => {
    this.isUpdatingBasicSettings = isUpdatingBasicSettings;
  };

  get cardLinkedOnFreeTariff() {
    if (!this.currentQuotaStore || !this.currentTariffStatusStore) return false;

    const { isFreeTariff } = this.currentQuotaStore;
    const { walletCustomerEmail } = this.currentTariffStatusStore;

    return isFreeTariff && !!walletCustomerEmail;
  }

  get cardLinkedOnNonProfit() {
    if (!this.currentQuotaStore || !this.currentTariffStatusStore) return false;

    const { walletCustomerEmail } = this.currentTariffStatusStore;
    const { isNonProfit } = this.currentQuotaStore;

    if (!isNonProfit) return false;

    if (!walletCustomerEmail) return false;

    return true;
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

  formatDate = (date: DateTime, timeType?: "start" | "end") => {
    if (!timeType) {
      return formatDateUtil(date, "yyyy-MM-dd'T'HH:mm:ss", { locale: "en" });
    }

    const dateStr = formatDateUtil(date, "yyyy-MM-dd", { locale: "en" });
    const timeTypeValue = timeType === "start" ? "00:00:00" : "23:59:59";

    return `${dateStr}T${timeTypeValue}`;
  };

  handleServiceQuota = async (serviceName = BACKUP_SERVICE) => {
    const abortController = new AbortController();
    this.settingsStore?.addAbortControllers(abortController);

    const service = await getServiceQuota(serviceName, abortController.signal);

    const feature = service.features[0];

    const featureWithPrice = {
      ...feature,
      price: service.price,
      serviceName: service.serviceName,
    } as TServiceFeatureWithPrice;

    const existingEntry = Array.from(
      this.servicesQuotasFeatures.entries(),
    ).find(
      ([, value]) =>
        (value as TServiceFeatureWithPrice).serviceName === service.serviceName,
    );

    const key = existingEntry
      ? existingEntry[0]
      : service.features[0].id.toString();

    this.servicesQuotasFeatures.set(key, featureWithPrice);

    return service.serviceName;
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

      toastr.success(t("ActivateLicenseActivated"));
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

