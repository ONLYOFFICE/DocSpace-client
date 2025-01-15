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
import { makeAutoObservable } from "mobx";

import { setDefaultUserQuota, setDefaultRoomQuota } from "../api/settings";

import { toastr } from "../components/toast";
import { TData } from "../components/toast/Toast.type";
import { EmployeeType, PortalFeaturesLimitations } from "../enums";
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
import { Nullable } from "../types";
import { UserStore } from "./UserStore";
import { CurrentTariffStatusStore } from "./CurrentTariffStatusStore";

class CurrentQuotasStore {
  currentPortalQuota: Nullable<TPaymentQuota> = null;

  userStore: UserStore | null = null;

  currentTariffStatusStore: CurrentTariffStatusStore | null = null;

  currentPortalQuotaFeatures: TPaymentFeature[] = [];

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

  get isCustomizationAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "customization",
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

  get isLdapAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "ldap",
    );

    return result?.value;
  }

  get isStatisticsAvailable() {
    const result = this.currentPortalQuotaFeatures.find(
      (obj) => obj.id === "statistic",
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
    return this.currentPortalQuota?.title;
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
