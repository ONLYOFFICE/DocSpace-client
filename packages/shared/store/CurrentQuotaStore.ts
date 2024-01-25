import { makeAutoObservable } from "mobx";

import { toastr } from "../components/toast";
import { TData } from "../components/toast/Toast.type";
import { PortalFeaturesLimitations } from "../enums";
import api from "../api";
import { TPaymentFeature, TPaymentQuota } from "../api/portal/types";
import {
  MANAGER,
  TOTAL_SIZE,
  FILE_SIZE,
  USERS,
  ROOM,
  USERS_IN_ROOM,
  COUNT_FOR_SHOWING_BAR,
  PERCENTAGE_FOR_SHOWING_BAR,
} from "../constants";

class CurrentQuotasStore {
  currentPortalQuota: TPaymentQuota = {} as TPaymentQuota;

  currentPortalQuotaFeatures: TPaymentFeature[] = [];

  isLoaded = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get isFreeTariff() {
    return this.currentPortalQuota.free;
  }

  get isTrial() {
    return this.currentPortalQuota.trial;
  }

  get currentPlanCost() {
    if (this.currentPortalQuota.price) return this.currentPortalQuota.price;

    return { value: 0, currencySymbol: "" };
  }

  get maxCountManagersByQuota() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === MANAGER,
    );

    return result?.value || 0;
  }

  get addedManagersCount() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === MANAGER,
    );

    return result?.used?.value || 0;
  }

  get maxTotalSizeByQuota() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );

    if (!result?.value) return PortalFeaturesLimitations.Limitless;

    return result?.value;
  }

  get usedTotalStorageSizeCount() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === TOTAL_SIZE,
    );
    return result?.used?.value || 0;
  }

  get maxFileSizeByQuota() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === FILE_SIZE,
    );

    return result?.value;
  }

  get maxCountUsersByQuota() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === USERS,
    );
    if (!result || !result?.value) return PortalFeaturesLimitations.Limitless;
    return result?.value;
  }

  get maxCountRoomsByQuota() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === ROOM,
    );
    if (!result || !result?.value) return PortalFeaturesLimitations.Limitless;
    return result?.value;
  }

  get usedRoomsCount() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === ROOM,
    );

    return result?.used?.value || 0;
  }

  get isBrandingAndCustomizationAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "whitelabel",
    );

    return result?.value;
  }

  get isOAuthAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "oauth",
    );

    return result?.value;
  }

  get isThirdPartyAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "thirdparty",
    );

    return result?.value;
  }

  get isSSOAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "sso",
    );

    return result?.value;
  }

  get isRestoreAndAutoBackupAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "restore",
    );

    return result?.value;
  }

  get isAuditAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "audit",
    );

    return result?.value;
  }

  get currentTariffPlanTitle() {
    return this.currentPortalQuota.title;
  }

  get quotaCharacteristics() {
    const result: TPaymentFeature[] = [];

    this.currentPortalQuotaFeatures.forEach((elem) => {
      if (elem.id === ROOM) result?.splice(0, 0, elem);
      if (elem.id === MANAGER) result?.splice(1, 0, elem);
      if (elem.id === TOTAL_SIZE) result?.splice(2, 0, elem);
    });

    return result;
  }

  get maxUsersCountInRoom() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === USERS_IN_ROOM,
    );

    if (!result || !result?.value) return PortalFeaturesLimitations.Limitless;

    return result?.value;
  }

  get showRoomQuotaBar() {
    return (
      this.maxCountRoomsByQuota - this.usedRoomsCount <=
        COUNT_FOR_SHOWING_BAR &&
      this.maxCountRoomsByQuota > 0 &&
      this.maxCountRoomsByQuota >= this.usedRoomsCount
    );
  }

  get showStorageQuotaBar() {
    return (
      (this.usedTotalStorageSizeCount / this.maxTotalSizeByQuota) * 100 >=
      PERCENTAGE_FOR_SHOWING_BAR
    );
  }

  get showUserQuotaBar() {
    return (
      this.addedManagersCount > 1 &&
      this.maxCountManagersByQuota - this.addedManagersCount <=
        COUNT_FOR_SHOWING_BAR &&
      this.maxCountManagersByQuota >= this.addedManagersCount
    );
  }

  get isNonProfit() {
    return this.currentPortalQuota?.nonProfit;
  }

  setPortalQuotaValue = (res: TPaymentQuota) => {
    this.currentPortalQuota = res;
    this.currentPortalQuotaFeatures = res.features;

    this.setIsLoaded(true);
  };

  updateQuotaUsedValue = (featureId: string, value: number) => {
    this.currentPortalQuotaFeatures.forEach((elem) => {
      if (elem.id === featureId && elem.used) elem.used.value = value;
    });
  };

  updateQuotaFeatureValue = (featureId: string, value: number) => {
    this.currentPortalQuotaFeatures.forEach((elem) => {
      if (elem.id === featureId) elem.value = value;
    });
  };

  setPortalQuota = async () => {
    try {
      const res = await api.portal.getPortalQuota();

      if (!res) return;

      this.setPortalQuotaValue(res);

      this.setIsLoaded(true);
    } catch (e) {
      toastr.error(e as TData);
    }
  };
}

export { CurrentQuotasStore };
