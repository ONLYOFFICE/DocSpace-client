// (c) Copyright Ascensio System SIA 2009-2024
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

/* eslint-disable class-methods-use-this */
/* eslint-disable no-console */
import axios from "axios";
import { makeAutoObservable } from "mobx";

import {
  getPaymentSettings,
  setLicense,
  acceptLicense,
} from "@docspace/shared/api/settings";
import { getPaymentLink } from "@docspace/shared/api/portal";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { authStore } from "@docspace/shared/store";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { UserStore } from "@docspace/shared/store/UserStore";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { PaymentQuotasStore } from "@docspace/shared/store/PaymentQuotasStore";
import { TTranslation } from "@docspace/shared/types";
import { TData } from "@docspace/shared/components/toast/Toast.type";

class PaymentStore {
  userStore: UserStore | null = null;

  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  currentQuotaStore: CurrentQuotasStore | null = null;

  paymentQuotasStore: PaymentQuotasStore | null = null;

  salesEmail = "";

  helpUrl = "https://helpdesk.onlyoffice.com";

  buyUrl =
    "https://www.onlyoffice.com/enterprise-edition.aspx?type=buyenterprise";

  standaloneMode = true;

  currentLicense = {
    expiresDate: new Date(),
    trialMode: true,
  };

  paymentLink = "";

  accountLink = "";

  isLoading = false;

  isUpdatingBasicSettings = false;

  totalPrice = 30;

  managersCount = 1;

  maxAvailableManagersCount = 999;

  stepByQuotaForManager = 1;

  minAvailableManagersValue = 1;

  stepByQuotaForTotalSize = 107374182400;

  minAvailableTotalSizeValue = 107374182400;

  isInitPaymentPage = false;

  isLicenseCorrect = false;

  constructor(
    userStore: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
    currentQuotaStore: CurrentQuotasStore,
    paymentQuotasStore: PaymentQuotasStore,
  ) {
    this.userStore = userStore;
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.currentQuotaStore = currentQuotaStore;
    this.paymentQuotasStore = paymentQuotasStore;

    makeAutoObservable(this);
  }

  get isAlreadyPaid() {
    const customerId = this.currentTariffStatusStore?.customerId;
    const isFreeTariff = this.currentQuotaStore?.isFreeTariff;

    return customerId?.length !== 0 || !isFreeTariff;
  }

  setIsInitPaymentPage = (value: boolean) => {
    this.isInitPaymentPage = value;
  };

  setIsUpdatingBasicSettings = (isUpdatingBasicSettings: boolean) => {
    this.isUpdatingBasicSettings = isUpdatingBasicSettings;
  };

  basicSettings = async () => {
    if (!this.currentTariffStatusStore || !this.currentQuotaStore) return;

    const { fetchPortalTariff, setPayerInfo } = this.currentTariffStatusStore;
    const { addedManagersCount } = this.currentQuotaStore;

    this.setIsUpdatingBasicSettings(true);

    const requests = [fetchPortalTariff()];

    if (this.isAlreadyPaid) requests.push(this.setPaymentAccount());
    else requests.push(this.getBasicPaymentLink(addedManagersCount));

    try {
      await Promise.all(requests);
      this.setBasicTariffContainer();
    } catch (error) {
      // toastr.error(t("Common:UnexpectedError"));
      console.error(error);
    }

    if (this.isAlreadyPaid) await setPayerInfo();

    this.setIsUpdatingBasicSettings(false);
  };

  init = async (t: TTranslation) => {
    if (this.isInitPaymentPage) {
      this.basicSettings();

      return;
    }

    if (
      !this.currentTariffStatusStore ||
      !this.currentQuotaStore ||
      !this.paymentQuotasStore
    )
      return;

    const { setPayerInfo } = this.currentTariffStatusStore;
    const { addedManagersCount } = this.currentQuotaStore;
    const { setPortalPaymentQuotas } = this.paymentQuotasStore;

    const requests = [this.getSettingsPayment(), setPortalPaymentQuotas()];

    if (this.isAlreadyPaid) requests.push(this.setPaymentAccount());
    else requests.push(this.getBasicPaymentLink(addedManagersCount));

    try {
      await Promise.all(requests);
      this.setRangeStepByQuota();
      this.setBasicTariffContainer();

      if (!this.isAlreadyPaid) this.setIsInitPaymentPage(true);
    } catch (error) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(error);
      return;
    }

    if (this.isAlreadyPaid) await setPayerInfo();

    this.setIsInitPaymentPage(true);
  };

  getBasicPaymentLink = async (managersCount: number) => {
    const backUrl = combineUrl(
      window.location.origin,
      "/portal-settings/payments/portal-payments?complete=true",
    );

    try {
      const link = await getPaymentLink(managersCount, backUrl);

      if (!link) return;
      this.setPaymentLink(link);
    } catch (err) {
      console.error(err);
    }
  };

  getPaymentLink = async (token = undefined) => {
    const backUrl = combineUrl(
      window.location.origin,
      "/portal-settings/payments/portal-payments?complete=true",
    );

    await getPaymentLink(this.managersCount, backUrl, token)
      ?.then((link) => {
        if (!link) return;
        this.setPaymentLink(link);
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          console.log("Request canceled", err.message);
        } else {
          console.error(err);
          if (err?.response?.status === 402) {
            return;
          }
          if (this.isInitPaymentPage) toastr.error(err);
        }
      });
  };

  standaloneBasicSettings = async (t: TTranslation) => {
    const { getPaymentInfo } = authStore;

    this.setIsUpdatingBasicSettings(true);

    try {
      await getPaymentInfo();
    } catch (e) {
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
      await Promise.all([this.getSettingsPayment(), getPaymentInfo()]);
    } catch (error) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(error);
      return;
    }

    this.isInitPaymentPage = true;
  };

  getSettingsPayment = async () => {
    try {
      const newSettings = await getPaymentSettings();

      if (!newSettings) return;

      const {
        buyUrl,
        salesEmail,
        currentLicense,
        standalone: standaloneMode,
        feedbackAndSupportUrl: helpUrl,
        max,
      } = newSettings;

      this.buyUrl = buyUrl;
      this.salesEmail = salesEmail;
      this.helpUrl = helpUrl;
      this.standaloneMode = standaloneMode;
      this.maxAvailableManagersCount = max;

      if (currentLicense) {
        if (currentLicense.date)
          this.currentLicense.expiresDate = new Date(currentLicense.date);

        if (currentLicense.trial)
          this.currentLicense.trialMode = currentLicense.trial;
      }
    } catch (e) {
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
    } catch (e) {
      toastr.error(e as TData);
    }
  };

  setPaymentAccount = async () => {
    const res = await api.portal.getPaymentAccount();

    if (res) {
      if (res.indexOf("error") === -1) {
        this.accountLink = res;
      } else {
        toastr.error(res);
      }
    }
  };

  setPaymentLink = async (link: string) => {
    this.paymentLink = link;
  };

  setIsLoading = (isLoading: boolean) => {
    this.isLoading = isLoading;
  };

  getTotalCostByFormula = (value: number) => {
    const costValuePerManager = this.paymentQuotasStore?.planCost.value;
    if (costValuePerManager) return value * +costValuePerManager;
  };

  get allowedStorageSizeByQuota() {
    if (this.managersCount > this.maxAvailableManagersCount)
      return this.maxAvailableManagersCount * this.stepByQuotaForTotalSize;

    return this.managersCount * this.stepByQuotaForTotalSize;
  }

  resetTariffContainerToBasic = () => {
    this.setBasicTariffContainer();
  };

  setBasicTariffContainer = () => {
    if (!this.currentQuotaStore) return;

    const { currentPlanCost, maxCountManagersByQuota, addedManagersCount } =
      this.currentQuotaStore;
    const currentTotalPrice = currentPlanCost.value;

    if (this.isAlreadyPaid) {
      const countOnRequest =
        maxCountManagersByQuota > this.maxAvailableManagersCount;

      this.managersCount = countOnRequest
        ? this.maxAvailableManagersCount + 1
        : maxCountManagersByQuota;

      this.totalPrice = +currentTotalPrice;

      return;
    }

    this.managersCount = addedManagersCount;
    const totalPrice = this.getTotalCostByFormula(addedManagersCount);

    if (totalPrice) this.totalPrice = totalPrice;
  };

  setTotalPrice = (value: number) => {
    const price = this.getTotalCostByFormula(value);
    if (price !== this.totalPrice && price) this.totalPrice = price;
  };

  setManagersCount = (managers: number) => {
    if (managers > this.maxAvailableManagersCount)
      this.managersCount = this.maxAvailableManagersCount + 1;
    else this.managersCount = managers;
  };

  get isNeedRequest() {
    return this.managersCount > this.maxAvailableManagersCount;
  }

  get isLessCountThanAcceptable() {
    return this.managersCount < this.minAvailableManagersValue;
  }

  get isPayer() {
    if (!this.userStore || !this.currentTariffStatusStore) return;
    const { user } = this.userStore;

    const { payerInfo } = this.currentTariffStatusStore;

    if (!user || !payerInfo) return false;

    return user.email === payerInfo.email;
  }

  get isStripePortalAvailable() {
    if (!this.userStore) return;
    const { user } = this.userStore;

    if (!user) return false;

    return user.isOwner || this.isPayer;
  }

  get canUpdateTariff() {
    if (!this.userStore || !this.currentQuotaStore) return;
    const { user } = this.userStore;
    const { isFreeTariff } = this.currentQuotaStore;

    if (!user) return false;

    if (isFreeTariff) return true;

    return this.isPayer;
  }

  get canPayTariff() {
    if (!this.currentQuotaStore) return;
    const { addedManagersCount } = this.currentQuotaStore;

    if (this.managersCount >= addedManagersCount) return true;

    return false;
  }

  get canDowngradeTariff() {
    if (!this.currentQuotaStore) return;
    const { addedManagersCount, usedTotalStorageSizeCount } =
      this.currentQuotaStore;

    if (addedManagersCount > this.managersCount) return false;
    if (usedTotalStorageSizeCount > this.allowedStorageSizeByQuota)
      return false;

    return true;
  }

  setRangeStepByQuota = () => {
    if (!this.paymentQuotasStore) return;

    const { stepAddingQuotaManagers, stepAddingQuotaTotalSize } =
      this.paymentQuotasStore;

    if (stepAddingQuotaManagers)
      this.stepByQuotaForManager = stepAddingQuotaManagers;
    this.minAvailableManagersValue = this.stepByQuotaForManager;

    if (stepAddingQuotaTotalSize)
      this.stepByQuotaForTotalSize = stepAddingQuotaTotalSize;
    this.minAvailableTotalSizeValue = this.stepByQuotaForManager;
  };

  sendPaymentRequest = async (
    email: string,
    userName: string,
    message: string,
  ) => {
    try {
      await api.portal.sendPaymentRequest(email, userName, message);
      // toastr.success(t("SuccessfullySentMessage"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };
}

export default PaymentStore;
