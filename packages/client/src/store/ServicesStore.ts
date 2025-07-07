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
import { makeAutoObservable } from "mobx";

import { toastr } from "@docspace/shared/components/toast";

import { CurrentTariffStatusStore } from "@docspace/shared/store/CurrentTariffStatusStore";

import { TTranslation } from "@docspace/shared/types";

import PaymentStore from "./PaymentStore";

class ServicesStore {
  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  // servicesQuotasFeatures: Map<string, TPaymentFeature> = new Map();

  // servicesQuotas: TPaymentQuota | null = null;

  paymentStore: PaymentStore | null = null;

  isInitServicesPage = false;

  isVisibleWalletSettings = false;

  partialUpgradeFee: number = 0;

  reccomendedAmount: number = 0;

  featureCountData: number = 0;

  constructor(
    currentTariffStatusStore: CurrentTariffStatusStore,
    paymentStore: PaymentStore,
  ) {
    this.currentTariffStatusStore = currentTariffStatusStore;
    this.paymentStore = paymentStore;

    makeAutoObservable(this);
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

  setPartialUpgradeFee = (partialUpgradeFee: number) => {
    this.partialUpgradeFee = partialUpgradeFee;
  };

  setVisibleWalletSetting = (isVisibleWalletSettings: boolean) => {
    this.isVisibleWalletSettings = isVisibleWalletSettings;
  };

  setIsInitServicesPage = (isInitServicesPage: boolean) => {
    this.isInitServicesPage = isInitServicesPage;
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

  setReccomendedAmount = (amount: number) => {
    this.reccomendedAmount = amount;
  };

  setFeatureCountData = (featureCountData: number) => {
    this.featureCountData = featureCountData;
  };

  servicesInit = async (t: TTranslation) => {
    const isRefresh = window.location.href.includes("complete=true");

    const {
      fetchAutoPayments,
      fetchCardLinked,
      setPaymentAccount,
      isAlreadyPaid,
      initWalletPayerAndBalance,
      handleServicesQuotas,
    } = this.paymentStore!;

    const { fetchPortalTariff, walletCustomerStatusNotActive } =
      this.currentTariffStatusStore!;

    const requests = [
      handleServicesQuotas(),
      initWalletPayerAndBalance(isRefresh),
      fetchPortalTariff(),
    ];

    try {
      const [quotas] = await Promise.all(requests);

      if (!quotas) throw new Error();

      if (isAlreadyPaid) {
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

        if (amountParam && recommendedAmountParam) {
          const amount = Number(amountParam);
          const recommendedAmount = Number(recommendedAmountParam);

          this.setReccomendedAmount(Math.ceil(recommendedAmount));
          this.setFeatureCountData(amount);
        }

        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );

        this.setVisibleWalletSetting(true);
      }
    } catch (e) {
      toastr.error(t("Common:UnexpectedError"));
      console.error(e);
    }
  };
}

export default ServicesStore;
