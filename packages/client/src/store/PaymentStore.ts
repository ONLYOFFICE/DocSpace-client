// (c) Copyright Ascensio System SIA 2009-2025
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
import moment from "moment";

import {
  getPaymentSettings,
  setLicense,
  acceptLicense,
} from "@docspace/shared/api/settings";
import {
  getBalance,
  getCardLinked,
  getTransactionHistory,
  getPaymentLink,
  getAutoTopUpSettings,
  updateAutoTopUpSettings,
  getServicesQuotas,
  getServiceQuota,
} from "@docspace/shared/api/portal";
import api from "@docspace/shared/api";
import { toastr } from "@docspace/shared/components/toast";
import { authStore, settingsStore } from "@docspace/shared/store";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { UserStore } from "@docspace/shared/store/UserStore";
import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { PaymentQuotasStore } from "@docspace/shared/store/PaymentQuotasStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TTranslation } from "@docspace/shared/types";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import {
  TBalance,
  TAutoTopUpSettings,
  TTransactionCollection,
  TPaymentFeature,
  TPaymentQuota,
  TNumericPaymentFeature,
} from "@docspace/shared/api/portal/types";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import {
  BACKUP_SERVICE,
  STORAGE_TARIFF_DEACTIVATED,
} from "@docspace/shared/constants";

// Constants for feature identifiers
export const TOTAL_SIZE = "total_size";

type TServiceFeatureWithPrice = TNumericPaymentFeature & {
  price: {
    value: number;
    currencySymbol: string;
  };
};

class PaymentStore {
  userStore: UserStore | null = null;

  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  currentQuotaStore: CurrentQuotasStore | null = null;

  settingsStore: SettingsStore | null = null;

  paymentQuotasStore: PaymentQuotasStore | null = null;

  salesEmail = "";

  buyUrl = "";

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

  isInitWalletPage = false;

  balance: TBalance = 0;

  previousBalance: TBalance = 0;

  cardLinked = "";

  transactionHistory: TTransactionCollection[] = [];

  isTransactionHistoryExist = false;

  autoPayments: TAutoTopUpSettings | null = null;

  minBalance: string = "";

  upToBalance: string = "";

  isAutomaticPaymentsEnabled: boolean = false;

  isVisibleWalletSettings = false;

  upToBalanceError = false;

  minBalanceError = false;

  servicesQuotasFeatures: Map<string, TPaymentFeature> = new Map(); // temporary solution, should be in the service store

  servicesQuotas: TPaymentQuota | null = null; // temporary solution, should be in the service store

  isShowStorageTariffDeactivatedModal = false;

  reccomendedAmount = "";

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
    this.settingsStore = settingsStore;

    makeAutoObservable(this);
  }

  get isAlreadyPaid() {
    const isFreeTariff = this.currentQuotaStore?.isFreeTariff;

    return this.currentTariffStatusStore?.walletCustomerEmail || !isFreeTariff;
  }

  get isNeedRequest() {
    return this.managersCount > this.maxAvailableManagersCount;
  }

  get isLessCountThanAcceptable() {
    return this.managersCount < this.minAvailableManagersValue;
  }

  get isPayer() {
    if (!this.userStore || !this.currentTariffStatusStore) return;

    const { user } = this.userStore;
    const { walletCustomerEmail } = this.currentTariffStatusStore;

    if (!user || !walletCustomerEmail) return false;

    return user.email === walletCustomerEmail;
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
    const { walletCustomerEmail } = this.currentTariffStatusStore!;

    if (!user) return false;

    if (this.currentQuotaStore.isNonProfit) {
      if (!walletCustomerEmail) return true;
      return this.isPayer;
    }

    if (!this.isAlreadyPaid && !this.cardLinkedOnFreeTariff) return true;

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

  get isCardLinkedToPortal() {
    if (!this.currentQuotaStore) return false;

    const { isNonProfit, isFreeTariff } = this.currentQuotaStore;

    return (
      this.cardLinkedOnNonProfit ||
      this.cardLinkedOnFreeTariff ||
      (!isNonProfit && !isFreeTariff)
    );
  }

  setIsInitPaymentPage = (value: boolean) => {
    this.isInitPaymentPage = value;
  };

  setMinBalance = (value: string) => {
    this.minBalance = value;
  };

  setUpToBalance = (value: string) => {
    this.upToBalance = value;
  };

  setUpToBalanceError = (value: boolean) => {
    this.upToBalanceError = value;
  };

  setMinBalanceError = (value: boolean) => {
    this.minBalanceError = value;
  };

  setIsAutomaticPaymentsEnabled = (value: boolean) => {
    this.isAutomaticPaymentsEnabled = value;
  };

  setIsUpdatingBasicSettings = (isUpdatingBasicSettings: boolean) => {
    this.isUpdatingBasicSettings = isUpdatingBasicSettings;
  };

  basicSettings = async () => {
    if (!this.currentTariffStatusStore || !this.currentQuotaStore) return;

    const {
      fetchPortalTariff,
      fetchPayerInfo,
      isGracePeriod,
      isNotPaidPeriod,
      walletCustomerStatusNotActive,
    } = this.currentTariffStatusStore;
    const { addedManagersCount } = this.currentQuotaStore;

    this.setIsUpdatingBasicSettings(true);

    await fetchPayerInfo();

    const requests = [];

    requests.push(fetchPortalTariff());

    if (isGracePeriod || isNotPaidPeriod) {
      requests.push(this.getBasicPaymentLink(addedManagersCount));
    }

    if (this.isAlreadyPaid && this.isStripePortalAvailable) {
      requests.push(this.setPaymentAccount());

      if (this.isPayer && walletCustomerStatusNotActive) {
        requests.push(this.fetchCardLinked());
      }

      if (this.isShowStorageTariffDeactivated() && this.isPayer) {
        this.setIsShowTariffDeactivatedModal(true);

        await this.handleServicesQuotas();
      }
    } else {
      requests.push(this.getBasicPaymentLink(addedManagersCount));
    }

    try {
      await Promise.all(requests);
      this.setBasicTariffContainer();
    } catch (error) {
      // toastr.error(t("Common:UnexpectedError"));
      console.error(error);
    }

    this.setIsUpdatingBasicSettings(false);
  };

  setIsInitWalletPage = (value: boolean) => {
    this.isInitWalletPage = value;
  };

  get isAutoPaymentExist() {
    return this.autoPayments?.enabled;
  }

  get walletCodeCurrency() {
    if (this.balance) return this.balance?.subAccounts[0].currency;

    return "USD";
  }

  get walletBalance() {
    if (this.balance) return this.balance?.subAccounts[0].amount;

    return 0.0;
  }

  get wasFirstTopUp() {
    return typeof this.balance !== "number";
  }

  get wasChangeBalance() {
    return (
      this.previousBalance === 0 &&
      typeof this.balance !== "number" &&
      this.balance.subAccounts.length > 0
    );
  }

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

  formatWalletCurrency = (
    item: number | null = null,
    fractionDigits: number = 3,
  ) => {
    const { language } = authStore;

    const amount = item ?? this.walletBalance;

    return formatCurrencyValue(
      language,
      amount,
      this.walletCodeCurrency,
      fractionDigits,
    );
  };

  formatPaymentCurrency = (item: number = 0, fractionDigits: number = 0) => {
    const { language } = authStore;
    const amount = item || this.walletBalance;
    const { planCost } = this.paymentQuotasStore!;
    const { isoCurrencySymbol } = planCost;

    return formatCurrencyValue(
      language,
      amount,
      isoCurrencySymbol || "USD",
      fractionDigits,
    );
  };

  updatePreviousBalance = () => {
    this.previousBalance = this.balance;
  };

  fetchBalance = async (isRefresh?: boolean) => {
    const res = await getBalance(isRefresh);

    if (!res) return;

    this.balance = res;
  };

  getEndTransactionDate = (format = "YYYY-MM-DDTHH:mm:ss") => {
    return moment().format(format);
  };

  getStartTransactionDate = (format = "YYYY-MM-DDTHH:mm:ss") => {
    return moment().subtract(4, "weeks").format(format);
  };

  formatDate = (date: moment.Moment) => {
    return date.clone().locale("en").format("YYYY-MM-DDTHH:mm:ss");
  };

  fetchTransactionHistory = async (
    startDate = moment().subtract(4, "weeks"),
    endDate = moment(),
    credit = true,
    withdrawal = true,
  ) => {
    const res = await getTransactionHistory(
      this.formatDate(startDate),
      this.formatDate(endDate),
      credit,
      withdrawal,
    );

    if (!res) return;

    this.transactionHistory = res.collection;
    this.isTransactionHistoryExist = res.collection.length > 0;
  };

  fetchAutoPayments = async () => {
    const res = await getAutoTopUpSettings();

    if (!res) return;

    this.autoPayments = res;
    this.isAutomaticPaymentsEnabled = res.enabled;

    if (res.enabled) {
      this.setMinBalance(res.minBalance.toString());
      this.setUpToBalance(res.upToBalance.toString());
    }
  };

  fetchCardLinked = async (url?: string) => {
    const backUrl = url || `${window.location.href}?complete=true`;

    try {
      const res = await getCardLinked(backUrl);

      if (!res) return;

      this.cardLinked = res;
    } catch (error) {
      console.error(error);
    }
  };

  updateAutoPayments = async () => {
    try {
      const res = await updateAutoTopUpSettings(
        this.isAutomaticPaymentsEnabled,
        +this.minBalance,
        +this.upToBalance,
        this.walletCodeCurrency || "",
      );

      if (!res) {
        throw new Error();
      }

      this.autoPayments = res as TAutoTopUpSettings;
    } catch (error) {
      toastr.error(error as string);
    }
  };

  setVisibleWalletSetting = (isVisibleWalletSettings: boolean) => {
    this.isVisibleWalletSettings = isVisibleWalletSettings;
  };

  handleServicesQuotas = async () => {
    // temporary solution, should be in the service store

    const res = await getServicesQuotas();

    if (!res) return;

    const quotas = res.map((service) => {
      const feature = service.features[0];
      return {
        ...feature,
        price: service.price,
      };
    });

    this.servicesQuotasFeatures = new Map(
      quotas.map((feature) => [feature.id, feature]),
    );

    return res;
  };

  changeServiceState = async (service: string) => {
    const feature = this.servicesQuotasFeatures.get(service);

    if (!feature) return;

    this.servicesQuotasFeatures.set(service, {
      ...feature,
      value: !feature.value,
    });
  };

  isShowStorageTariffDeactivated = () => {
    const { previousStoragePlanSize } = this.currentTariffStatusStore!;

    if (!previousStoragePlanSize) return false;

    return localStorage.getItem(STORAGE_TARIFF_DEACTIVATED) !== "true";
  };

  setIsShowTariffDeactivatedModal = (value: boolean) => {
    this.isShowStorageTariffDeactivatedModal = value;
  };

  setPaymentAccount = async () => {
    try {
      const res = await api.portal.getPaymentAccount();

      if (!res) return;

      if (res.indexOf("error") === -1) {
        this.accountLink = res;
      } else {
        console.error(res);
      }
    } catch (error) {
      console.error(error);
    }
  };

  initWalletPayerAndBalance = async (isRefresh: boolean) => {
    if (!this.currentTariffStatusStore) return;
    const { fetchPayerInfo } = this.currentTariffStatusStore;

    await Promise.all([
      fetchPayerInfo(isRefresh),
      this.fetchBalance(isRefresh),
    ]);
  };

  setReccomendedAmount = (amount: string) => {
    this.reccomendedAmount = amount;
  };

  setServiceQuota = async (serviceName = "backup") => {
    const service = await getServiceQuota(serviceName);

    const feature = service.features[0];

    this.servicesQuotasFeatures = new Map([
      [
        feature.id,
        {
          ...feature,
          price: service.price,
        },
      ],
    ]);
  };

  walletInit = async (t: TTranslation) => {
    const isRefresh = window.location.href.includes("complete=true");
    if (!this.currentTariffStatusStore) return;

    const { fetchPortalTariff, walletCustomerStatusNotActive } =
      this.currentTariffStatusStore;

    const requests = [];

    requests.push(fetchPortalTariff());

    try {
      await this.initWalletPayerAndBalance(isRefresh);
      this.previousBalance = this.balance;

      if (this.isAlreadyPaid) {
        if (this.isStripePortalAvailable) {
          requests.push(this.setPaymentAccount());

          if (this.isPayer && walletCustomerStatusNotActive) {
            requests.push(this.fetchCardLinked());
          }
        }

        requests.push(this.fetchAutoPayments(), this.fetchTransactionHistory());
      } else {
        requests.push(this.fetchCardLinked());
      }

      if (this.isShowStorageTariffDeactivated() && this.isPayer) {
        this.setIsShowTariffDeactivatedModal(true);
        requests.push(this.handleServicesQuotas());
      }

      await Promise.all(requests);

      this.setIsInitWalletPage(true);

      const url = new URL(window.location.href);
      const params = url.searchParams;

      const priceParam = params.get("price");

      if (priceParam) {
        const reccomendedAmount = this.walletBalance - Number(priceParam);
        if (reccomendedAmount < 0)
          this.setReccomendedAmount(Math.abs(reccomendedAmount).toString());
      }

      if (
        window.location.href.includes("complete=true") ||
        window.location.href.includes("open=true")
      ) {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        this.setVisibleWalletSetting(true);
      }
    } catch (error) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(error);
    }
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

    const { addedManagersCount } = this.currentQuotaStore;
    const { setPortalPaymentQuotas } = this.paymentQuotasStore;
    const {
      fetchPortalTariff,
      fetchPayerInfo,
      walletCustomerStatusNotActive,
      isGracePeriod,
      isNotPaidPeriod,
    } = this.currentTariffStatusStore;

    const requests = [];

    requests.push(this.getSettingsPayment());
    requests.push(setPortalPaymentQuotas());
    requests.push(fetchPortalTariff());

    await fetchPayerInfo();

    if (isGracePeriod || isNotPaidPeriod) {
      requests.push(this.getBasicPaymentLink(addedManagersCount));
    }

    if (this.isAlreadyPaid && this.isStripePortalAvailable) {
      requests.push(this.setPaymentAccount());

      if (this.isPayer && walletCustomerStatusNotActive) {
        requests.push(this.fetchCardLinked());
      }
    } else {
      requests.push(this.getBasicPaymentLink(addedManagersCount));
    }

    if (this.isShowStorageTariffDeactivated() && this.isPayer) {
      this.setIsShowTariffDeactivatedModal(true);
      requests.push(this.handleServicesQuotas());
    }

    try {
      await Promise.all(requests);

      this.setRangeStepByQuota();
      this.setBasicTariffContainer();
    } catch (error) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(error);
      return;
    }

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
    const isFreeTariff = this.currentQuotaStore?.isFreeTariff;

    if (!isFreeTariff) {
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

  setRangeStepByQuota = () => {
    if (!this.paymentQuotasStore) return;

    const { stepAddingQuotaManagers, stepAddingQuotaTotalSize } =
      this.paymentQuotasStore;

    if (stepAddingQuotaManagers && typeof stepAddingQuotaManagers === "number")
      this.stepByQuotaForManager = stepAddingQuotaManagers;
    this.minAvailableManagersValue = this.stepByQuotaForManager;

    if (
      stepAddingQuotaTotalSize &&
      typeof stepAddingQuotaTotalSize === "number"
    )
      this.stepByQuotaForTotalSize = stepAddingQuotaTotalSize;
    this.minAvailableTotalSizeValue = this.stepByQuotaForManager;
  };

  sendPaymentRequest = async (
    email: string,
    userName: string,
    message: string,
    t: TTranslation,
  ) => {
    try {
      await api.portal.sendPaymentRequest(email, userName, message);
      toastr.success(t("SuccessfullySentMessage"));
    } catch (e) {
      toastr.error(e as TData);
    }
  };
}

export default PaymentStore;
