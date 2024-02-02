/* eslint-disable no-console */
import { makeAutoObservable, runInAction } from "mobx";
import moment from "moment-timezone";

import { TariffState } from "../enums";
import api from "../api";
import { getUserByEmail } from "../api/people";
import { TPortalTariff } from "../api/portal/types";
import { TUser } from "../api/people/types";
import { isValidDate } from "../utils";
import { getDaysLeft, getDaysRemaining } from "../utils/common";

class CurrentTariffStatusStore {
  portalTariffStatus: TPortalTariff = {} as TPortalTariff;

  isLoaded = false;

  payerInfo: TUser | null = null;

  language: string = "en";

  isEnterprise: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setLanguage = (language: string) => {
    this.language = language;
  };

  setIsEnterprise = (isEnterprise: boolean) => {
    this.isEnterprise = isEnterprise;
  };

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get isGracePeriod() {
    return this.portalTariffStatus.state === TariffState.Delay;
  }

  get isPaidPeriod() {
    return this.portalTariffStatus.state === TariffState.Paid;
  }

  get isNotPaidPeriod() {
    return this.portalTariffStatus.state === TariffState.NotPaid;
  }

  get dueDate() {
    return this.portalTariffStatus.dueDate;
  }

  get delayDueDate() {
    return this.portalTariffStatus.delayDueDate;
  }

  get customerId() {
    return this.portalTariffStatus.customerId;
  }

  get portalStatus() {
    return this.portalTariffStatus.portalStatus;
  }

  get licenseDate() {
    return this.portalTariffStatus.licenseDate;
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
    return moment(this.delayDueDate).tz(window.timezone).format("LL");
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

  setPortalTariffValue = async (res: TPortalTariff) => {
    this.portalTariffStatus = res;

    this.setIsLoaded(true);
  };

  setPortalTariff = async () => {
    const res = await api.portal.getPortalTariff();

    if (!res) return;

    runInAction(() => {
      this.portalTariffStatus = res;
    });
  };
}

export { CurrentTariffStatusStore };
