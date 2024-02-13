import { makeAutoObservable, runInAction } from "mobx";
import api from "../api";
import { TPaymentFeature, TPaymentQuota } from "../api/portal/types";
import { MANAGER, TOTAL_SIZE } from "../constants";
import { Nullable } from "../types";

class PaymentQuotasStore {
  portalPaymentQuotas: Nullable<TPaymentQuota> = null;

  portalPaymentQuotasFeatures: TPaymentFeature[] = [];

  isLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get planCost() {
    if (this.portalPaymentQuotas?.price) return this.portalPaymentQuotas.price;
    return { value: 0, currencySymbol: "" };
  }

  get stepAddingQuotaManagers() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === MANAGER,
    );
    return result?.value;
  }

  get stepAddingQuotaTotalSize() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );
    return result?.value;
  }

  get tariffTitle() {
    return this.portalPaymentQuotas?.title;
  }

  get usedTotalStorageSizeTitle() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );
    return result?.priceTitle;
  }

  get addedManagersCountTitle() {
    const result = this.portalPaymentQuotasFeatures.find(
      (obj) => obj.id === MANAGER,
    );
    return result?.priceTitle;
  }

  get tariffPlanTitle() {
    return this.portalPaymentQuotas?.title;
  }

  setPortalPaymentQuotas = async () => {
    if (this.isLoaded) return;

    const res = await api.portal.getPortalPaymentQuotas();

    if (!res) return;

    runInAction(() => {
      this.portalPaymentQuotas = res[0];

      this.portalPaymentQuotasFeatures = res[0].features;
    });

    this.setIsLoaded(true);
  };
}

export { PaymentQuotasStore };
