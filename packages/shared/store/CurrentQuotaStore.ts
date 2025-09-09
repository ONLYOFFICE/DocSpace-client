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

import { makeAutoObservable } from "mobx";

import { setDefaultUserQuota, setDefaultRoomQuota } from "../api/settings";

import { toastr } from "../components/toast";
import { TData } from "../components/toast/Toast.type";
import { EmployeeType, PortalFeaturesLimitations } from "../enums";
import api from "../api";
import {
  TPaymentFeature,
  TPaymentQuota,
  TNumericPaymentFeature,
  TBooleanPaymentFeature,
  TStringPaymentFeature,
} from "../api/portal/types";
import {
  MANAGER,
  TOTAL_SIZE,
  FILE_SIZE,
  USERS,
  ROOM,
  USERS_IN_ROOM,
  COUNT_FOR_SHOWING_BAR,
  PERCENTAGE_FOR_SHOWING_BAR,
  YEAR_KEY,
  FREE_BACKUP,
} from "../constants";
import { Nullable } from "../types";
import { UserStore } from "./UserStore";
import { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";

class CurrentQuotasStore {
  currentPortalQuota: Nullable<TPaymentQuota> = null;

  userStore: UserStore | null = null;

  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  currentPortalQuotaFeatures: Map<string, TPaymentFeature> = new Map();

  isLoaded = false;

  constructor(
    userStoreConst: UserStore,
    currentTariffStatusStore: CurrentTariffStatusStore,
  ) {
    makeAutoObservable(this);
    this.userStore = userStoreConst;
    this.currentTariffStatusStore = currentTariffStatusStore;
  }

  setIsLoaded = (isLoaded: boolean) => {
    this.isLoaded = isLoaded;
  };

  get currentQuotaId() {
    return this.currentPortalQuota?.id;
  }

  get isFreeTariff() {
    return this.currentPortalQuota?.free;
  }

  get isTrial() {
    return this.currentPortalQuota?.trial;
  }

  get currentPlanCost() {
    if (this.currentPortalQuota?.price) return this.currentPortalQuota.price;

    return { value: 0, currencySymbol: "" };
  }

  get maxCountManagersByQuota() {
    const result = this.currentPortalQuotaFeatures.get(
      MANAGER,
    ) as TNumericPaymentFeature;
    return result?.value || 0;
  }

  get addedManagersCount() {
    const result = this.currentPortalQuotaFeatures.get(
      MANAGER,
    ) as TNumericPaymentFeature;
    return result?.used?.value || 0;
  }

  get maxTotalSizeByQuota() {
    const result = this.currentPortalQuotaFeatures.get(
      TOTAL_SIZE,
    ) as TNumericPaymentFeature;
    if (!result?.value) return PortalFeaturesLimitations.Limitless;
    return result.value;
  }

  get usedTotalStorageSizeCount() {
    const result = this.currentPortalQuotaFeatures.get(
      TOTAL_SIZE,
    ) as TNumericPaymentFeature;
    return result?.used?.value || 0;
  }

  get usedTotalStorageSizeTitle() {
    const result = this.currentPortalQuotaFeatures.get(
      TOTAL_SIZE,
    ) as TPaymentFeature;

    return result?.used?.title;
  }

  get maxFileSizeByQuota() {
    const result = this.currentPortalQuotaFeatures.get(
      FILE_SIZE,
    ) as TNumericPaymentFeature;
    return result?.value;
  }

  get maxCountUsersByQuota() {
    const result = this.currentPortalQuotaFeatures.get(
      USERS,
    ) as TNumericPaymentFeature;
    if (!result || !result?.value) return PortalFeaturesLimitations.Limitless;
    return result?.value;
  }

  get maxCountRoomsByQuota() {
    const result = this.currentPortalQuotaFeatures.get(
      ROOM,
    ) as TNumericPaymentFeature;
    if (!result || !result?.value) return PortalFeaturesLimitations.Limitless;
    return result?.value;
  }

  get usedRoomsCount() {
    const result = this.currentPortalQuotaFeatures.get(
      ROOM,
    ) as TNumericPaymentFeature;
    return result?.used?.value || 0;
  }

  get isYearTariff() {
    const result = this.currentPortalQuotaFeatures.get(
      YEAR_KEY,
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isCustomizationAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "customization",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isOAuthAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "oauth",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isThirdPartyAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "thirdparty",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isSSOAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "sso",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isLdapAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "ldap",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isStatisticsAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "statistic",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isBackupPaid() {
    const result = this.currentPortalQuotaFeatures.get(
      FREE_BACKUP,
    ) as TNumericPaymentFeature;
    return result?.value !== -1;
  }

  get maxFreeBackups(): number {
    const result = this.currentPortalQuotaFeatures.get(
      FREE_BACKUP,
    ) as TNumericPaymentFeature;

    return result?.value ?? 0;
  }

  get isRestoreAndAutoBackupAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "restore",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isAuditAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "audit",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get isBrandingAvailable() {
    const result = this.currentPortalQuotaFeatures.get(
      "branding",
    ) as TBooleanPaymentFeature;
    return result?.value;
  }

  get currentTariffPlanTitle() {
    return this.currentPortalQuota?.title ?? "";
  }

  get quotaCharacteristics() {
    const result: TPaymentFeature[] = [];
    const roomFeature = this.currentPortalQuotaFeatures.get(ROOM);
    const managerFeature = this.currentPortalQuotaFeatures.get(MANAGER);
    const totalSizeFeature = this.currentPortalQuotaFeatures.get(TOTAL_SIZE);

    if (roomFeature) result.push(roomFeature);
    if (managerFeature) result.push(managerFeature);
    if (totalSizeFeature) result.push(totalSizeFeature);

    return result;
  }

  get maxUsersCountInRoom() {
    const result = this.currentPortalQuotaFeatures.get(USERS_IN_ROOM);

    if (!result) return PortalFeaturesLimitations.Limitless;

    if ("value" in result && result?.value) return result.value;

    return PortalFeaturesLimitations.Limitless;
  }

  get isRoomsTariffAlmostLimit() {
    if (this.maxCountRoomsByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return (
      this.maxCountRoomsByQuota - this.usedRoomsCount <=
        COUNT_FOR_SHOWING_BAR && this.usedRoomsCount < this.maxCountRoomsByQuota
    );
  }

  get isRoomsTariffLimit() {
    if (this.maxCountRoomsByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return (
      this.maxCountRoomsByQuota - this.usedRoomsCount <=
        COUNT_FOR_SHOWING_BAR &&
      this.usedRoomsCount >= this.maxCountRoomsByQuota
    );
  }

  get isStorageTariffAlmostLimit() {
    if (this.maxTotalSizeByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return (
      (this.usedTotalStorageSizeCount / this.maxTotalSizeByQuota) * 100 >=
        PERCENTAGE_FOR_SHOWING_BAR &&
      this.usedTotalStorageSizeCount < this.maxTotalSizeByQuota
    );
  }

  get isStorageTariffLimit() {
    if (this.maxTotalSizeByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return (
      (this.usedTotalStorageSizeCount / this.maxTotalSizeByQuota) * 100 >=
        PERCENTAGE_FOR_SHOWING_BAR &&
      this.usedTotalStorageSizeCount >= this.maxTotalSizeByQuota
    );
  }

  // For standalone mode
  get isStorageQuotaAlmostLimit() {
    if (!this.isTenantCustomQuotaSet || this.tenantCustomQuota === undefined)
      return false;

    if (+this.tenantCustomQuota === -1) return false;

    return (
      (this.usedTotalStorageSizeCount / this.tenantCustomQuota) * 100 >=
        PERCENTAGE_FOR_SHOWING_BAR &&
      this.tenantCustomQuota > this.usedTotalStorageSizeCount
    );
  }

  get isStorageQuotaLimit() {
    if (!this.isTenantCustomQuotaSet || this.tenantCustomQuota === undefined)
      return false;

    if (+this.tenantCustomQuota === -1) return false;

    return (
      (this.usedTotalStorageSizeCount / this.tenantCustomQuota) * 100 >=
        PERCENTAGE_FOR_SHOWING_BAR &&
      this.tenantCustomQuota <= this.usedTotalStorageSizeCount
    );
  }

  get isUserTariffAlmostLimit() {
    if (this.maxCountManagersByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return (
      this.addedManagersCount > 1 &&
      this.maxCountManagersByQuota - this.addedManagersCount <=
        COUNT_FOR_SHOWING_BAR &&
      this.maxCountManagersByQuota > this.addedManagersCount
    );
  }

  get isUserTariffLimit() {
    if (this.maxCountManagersByQuota === PortalFeaturesLimitations.Limitless)
      return false;

    return this.addedManagersCount >= this.maxCountManagersByQuota;
  }

  showWarningDialog = (type: number) => {
    if (
      type &&
      this.isUserTariffLimit &&
      type !== EmployeeType.Guest &&
      type !== EmployeeType.User
    )
      return true;

    return this.currentTariffStatusStore?.isGracePeriod;
  };

  get isWarningRoomsDialog() {
    return (
      this.currentTariffStatusStore?.isGracePeriod || this.isRoomsTariffLimit
    );
  }

  get isPersonalQuotaLimit() {
    const personalQuotaLimitReached = this.userStore?.personalQuotaLimitReached;

    if (!this.isDefaultUsersQuotaSet) return false;

    return personalQuotaLimitReached;
  }

  get isNonProfit() {
    return this.currentPortalQuota?.nonProfit;
  }

  get isDefaultRoomsQuotaSet() {
    return this.currentPortalQuota?.roomsQuota?.enableQuota;
  }

  get isDefaultUsersQuotaSet() {
    return this.currentPortalQuota?.usersQuota?.enableQuota;
  }

  get isTenantCustomQuotaSet() {
    return this.currentPortalQuota?.tenantCustomQuota?.enableQuota;
  }

  get defaultRoomsQuota() {
    return this.currentPortalQuota?.roomsQuota?.defaultQuota;
  }

  get defaultUsersQuota() {
    return this.currentPortalQuota?.usersQuota?.defaultQuota;
  }

  get tenantCustomQuota() {
    return this.currentPortalQuota?.tenantCustomQuota?.quota;
  }

  get showStorageInfo() {
    const user = this.userStore?.user;

    if (!user) return false;

    return this.isStatisticsAvailable && (user.isOwner || user.isAdmin);
  }

  updateTenantCustomQuota = (obj: {
    [key: string]: string | number | boolean | undefined;
  }) => {
    Object.keys(obj).forEach((key) => {
      // @ts-expect-error is always writable property
      this.currentPortalQuota.tenantCustomQuota[key] = obj[key];
    });
  };

  setPortalQuotaValue = (res: TPaymentQuota) => {
    this.currentPortalQuota = res;
    res.features.forEach((feature) => {
      this.currentPortalQuotaFeatures.set(feature.id, feature);
    });

    this.setIsLoaded(true);
  };

  updateQuotaUsedValue = (featureId: string, value: number) => {
    const feature = this.currentPortalQuotaFeatures.get(featureId);
    if (feature && feature.used) feature.used.value = value;
  };

  updateQuotaFeatureValue = (featureId: string, value: number) => {
    const feature = this.currentPortalQuotaFeatures.get(featureId);
    if (feature) feature.value = value;
  };

  fetchPortalQuota = async (refresh?: boolean) => {
    return api.portal.getPortalQuota(refresh).then((res) => {
      this.setPortalQuotaValue(res);

      this.setIsLoaded(true);
    });
  };

  setUserQuota = async (quota: string | number, t: (key: string) => string) => {
    const isEnable = +quota !== -1;

    try {
      await setDefaultUserQuota(isEnable, +quota);
      const toastrText = isEnable
        ? t("UserQuotaEnabled")
        : t("UserQuotaDisabled");

      toastr.success(toastrText);
    } catch (e: unknown) {
      toastr.error(e as TData);
    }
  };

  setRoomQuota = async (quota: string | number, t: (key: string) => string) => {
    const isEnable = +quota !== -1;

    try {
      await setDefaultRoomQuota(isEnable, +quota);
      const toastrText = isEnable
        ? t("RoomQuotaEnabled")
        : t("RoomQuotaDisabled");

      toastr.success(toastrText);
    } catch (e: unknown) {
      toastr.error(e as TData);
    }
  };
}

export { CurrentQuotasStore };
