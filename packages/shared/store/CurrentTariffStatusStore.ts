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

/* eslint-disable no-console */
import { makeAutoObservable } from "mobx";
import moment from "moment-timezone";

import { TariffState } from "../enums";
import api from "../api";
import { getUserByEmail } from "../api/people";
import { TPortalTariff } from "../api/portal/types";
import { TUser } from "../api/people/types";
import { isValidDate } from "../utils";
import { getDaysLeft, getDaysRemaining } from "../utils/common";
import { Nullable } from "../types";

class CurrentTariffStatusStore {
  portalTariffStatus: Nullable<TPortalTariff> = null;

  isLoaded = false;

  payerInfo: TUser | null = null;

  language: string = "en";

  constructor() {
    makeAutoObservable(this);
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

  get customerId() {
    return this.portalTariffStatus?.customerId;
  }

  get portalStatus() {
    return this.portalTariffStatus?.portalStatus;
  }

  get licenseDate() {
    return this.portalTariffStatus?.licenseDate;
  }

  setPayerInfo = async () => {
    try {
      if (!this.customerId || !this.customerId?.length) {
        this.payerInfo = null;
        return;
      }

      const result = await getUserByEmail(this.customerId);
      if (!result) {
        this.payerInfo = null;
        return;
      }

      this.payerInfo = result;
    } catch (e) {
      this.payerInfo = null;
      console.error(e);
    }
  };

  get paymentDate() {
    moment.locale(this.language);
    if (this.dueDate === null) return "";

    return moment(this.dueDate).tz(window.timezone).format("LL");
  }

  get isPaymentDateValid() {
    if (this.dueDate === null) return false;
    return isValidDate(this.dueDate);
  }

  get isLicenseDateExpired() {
    if (!this.isPaymentDateValid) return;

    return moment() > moment(this.dueDate).tz(window.timezone);
  }

  get gracePeriodEndDate() {
    moment.locale(this.language);
    if (this.delayDueDate === null) return "";

    const endDate = isValidDate(this.delayDueDate)
      ? this.delayDueDate
      : this.dueDate;

    return moment(endDate).tz(window.timezone).format("LL");
  }

  get delayDaysCount() {
    moment.locale(this.language);
    if (this.delayDueDate === null) return "";
    return getDaysRemaining(this.delayDueDate);
  }

  get isLicenseExpiring() {
    if (!this.dueDate || !this.isEnterprise) return;

    const days = getDaysLeft(this.dueDate);

    if (days <= 7) return true;

    return false;
  }

  get trialDaysLeft() {
    if (!this.dueDate) return;

    return getDaysLeft(this.dueDate);
  }

  fetchPortalTariff = async (refresh?: boolean) => {
    return api.portal.getPortalTariff(refresh).then((res) => {
      if (!res) return;

      this.portalTariffStatus = res;
      this.setIsLoaded(true);
    });
  };
}

export { CurrentTariffStatusStore };
