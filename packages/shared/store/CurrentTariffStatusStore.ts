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

import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";

import api from "../api";
import { getWalletPayer } from "../api/portal";

import { PaymentMethodStatus, QuotaState, TariffState } from "../enums";

import { TCustomerInfo, TPortalTariff, TQuotas } from "../api/portal/types";
import { isValidDate } from "../utils";
import { getDaysLeft, getDaysRemaining, isAdmin } from "../utils/common";
import {
  parseToDateTime,
  formatDateLocalized,
  getAppTimezone,
  isAfter,
  now,
} from "@docspace/ui-kit/utils/date";
import { Nullable } from "../types";
import { UserStore } from "./UserStore";
import { SettingsStore } from "./SettingsStore";

class CurrentTariffStatusStore {
  userStore: UserStore;

  settingsStore: SettingsStore;

  portalTariffStatus: Nullable<TPortalTariff> = null;

  isLoaded = false;

  language: string = "en";

  walletQuotas: TQuotas[] = [];

  previousWalletQuota: TQuotas[] = [];

  payerInfo: TCustomerInfo = {
    portalId: null,
    paymentMethodStatus: 0,
    email: null,
    payer: null,
  };

  isPayerInfoLoaded = false;

  constructor(userStore: UserStore, settingsStore: SettingsStore) {
    makeAutoObservable(this);

    this.userStore = userStore;
    this.settingsStore = settingsStore;
  }

  setLanguage = (language: string) => {
    this.language = language;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get isEnterprise() {
    return this.portalTariffStatus?.enterprise;
  }

  get isDeveloper() {
    return this.isEnterprise && this.portalTariffStatus?.developer;
  }

  get isCommunity() {
    return this.portalTariffStatus?.openSource;
  }

  get isGracePeriod() {
    return this.portalTariffStatus?.state === TariffState.Delay;
  }

  get isPaidPeriod() {
    return this.portalTariffStatus?.state === TariffState.Paid;
  }

  get isNotPaidPeriod() {
    return this.portalTariffStatus?.state === TariffState.NotPaid;
  }

  get dueDate() {
    return this.portalTariffStatus ? this.portalTariffStatus.dueDate : null;
  }

  get delayDueDate() {
    return this.portalTariffStatus
      ? this.portalTariffStatus.delayDueDate
      : null;
  }

  get licenseDate() {
    return this.portalTariffStatus?.licenseDate;
  }

  get paymentDate() {
    if (this.dueDate === null) return "";

    return formatDateLocalized(this.dueDate, "DATE_FULL", {
      locale: this.language,
      timezone: getAppTimezone(),
    });
  }

  get isPaymentDateValid() {
    if (this.dueDate === null) return false;
    return isValidDate(this.dueDate);
  }

  get isLicenseDateExpired() {
    if (!this.isPaymentDateValid) return;

    const dueDateDt = parseToDateTime(this.dueDate);
    if (!dueDateDt) return;

    return isAfter(now(), dueDateDt.setZone(getAppTimezone()));
  }

  get gracePeriodEndDate() {
    if (this.delayDueDate === null) return "";

    const endDate = isValidDate(this.delayDueDate)
      ? this.delayDueDate
      : this.dueDate;

    return formatDateLocalized(endDate, "DATE_FULL", {
      locale: this.language,
      timezone: getAppTimezone(),
    });
  }

  get delayDaysCount() {
    if (this.delayDueDate === null) return "";
    return getDaysRemaining(this.delayDueDate);
  }

  get isLicenseExpiring() {
    if (!this.dueDate) return false;

    const days = getDaysLeft(this.dueDate);

    if (days <= 7) return true;

    return false;
  }

  get trialDaysLeft() {
    if (!this.dueDate) return;

    return getDaysLeft(this.dueDate);
  }

  get walletCustomerEmail() {
    return this.payerInfo.email;
  }

  get walletCustomerUnlinkedStatus() {
    return this.payerInfo.paymentMethodStatus === PaymentMethodStatus.None;
  }

  get walletCustomerExpiredStatus() {
    return this.payerInfo.paymentMethodStatus === PaymentMethodStatus.Expired;
  }

  get walletCustomerStatusNotActive() {
    if (!this.walletCustomerEmail) return false;

    return (
      this.walletCustomerUnlinkedStatus || this.walletCustomerExpiredStatus
    );
  }

  get walletCustomerInfo() {
    return this.payerInfo.payer;
  }

  fetchPayerInfo = async (isRefresh?: boolean) => {
    try {
      const res = await getWalletPayer(isRefresh);

      if (!res) return;

      this.payerInfo = res;

      return res;
    } catch (e) {
      console.error(e);
      throw e;
    } finally {
      this.isPayerInfoLoaded = true;
    }
  };

  fetchPortalTariff = async (refresh?: boolean) => {
    const abortController = new AbortController();
    this.settingsStore.addAbortControllers(abortController);

    return api.portal
      .getPortalTariff(refresh, abortController.signal)
      .then((res) => {
        if (!res) return;

        const { user } = this.userStore;

        runInAction(() => {
          this.portalTariffStatus = res;

          if (user && isAdmin(user)) {
            const quota = res.quotas.find((q) => q.wallet === true);

            if (quota) {
              if (quota.state === QuotaState.Overdue) {
                this.previousWalletQuota = [quota];
                this.walletQuotas = [];
              } else {
                this.walletQuotas = [quota];
                this.previousWalletQuota = [];
              }
            } else {
              this.walletQuotas = [];
              this.previousWalletQuota = [];
            }
          }
        });

        this.setIsLoaded(true);

        return {
          res: this.portalTariffStatus,
          walletQuotas: this.walletQuotas,
        };
      })
      .catch((err) => {
        if (axios.isCancel(err)) return;
        throw err;
      });
  };
}

export { CurrentTariffStatusStore };

