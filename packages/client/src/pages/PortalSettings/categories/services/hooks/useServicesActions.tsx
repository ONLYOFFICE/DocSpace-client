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

import { useTranslation } from "react-i18next";

import store from "../../../../../store";
import {
  calculateDifference,
  isDowngrade,
  isExceedingLimit,
  isSamePlan,
  isUpgrade,
} from "./resourceUtils";

export const useServicesActions = () => {
  const { t } = useTranslation(["Payments", "Common"]);

  const { currentTariffStatusStore, paymentStore } = store;
  const {
    currentStoragePlanSize,
    hasScheduledStorageChange,
    nextStoragePlanSize,
    hasStorageSubscription,
  } = currentTariffStatusStore;
  const { walletBalance } = paymentStore;

  const maxStorageLimit = 9999;

  const isWalletBalanceInsufficient = (totalPrice: number): boolean => {
    return walletBalance < totalPrice;
  };

  const isExceedingPlanLimit = (quantity: number, type = "storage") => {
    const limit = type === "storage" ? maxStorageLimit : 0;
    return isExceedingLimit(quantity, limit);
  };

  const isPlanUpgrade = (quantity: number, type = "storage") => {
    const plan = type === "storage" ? currentStoragePlanSize : 0;

    return isUpgrade(quantity, plan);
  };

  const isPlanDowngrade = (quantity: number, type = "storage") => {
    const plan = type === "storage" ? currentStoragePlanSize : 0;
    return isDowngrade(quantity, plan);
  };

  const isCurrentPlan = (quantity: number, type = "storage") => {
    const plan = type === "storage" ? currentStoragePlanSize : 0;
    const hasSub = type === "storage" ? hasStorageSubscription : false;
    return isSamePlan(quantity, hasSub, plan);
  };

  const calculateDifferenceBetweenPlan = (
    quantity: number,
    type = "storage",
  ) => {
    const plan = type === "storage" ? currentStoragePlanSize : 0;
    return calculateDifference(quantity, plan);
  };

  const isStorageCancellation = () => {
    return hasScheduledStorageChange && nextStoragePlanSize === 0;
  };

  const buttonTitle = (quantity: number, type: string = "storage"): string => {
    if (isExceedingPlanLimit(quantity)) return t("Common:SendRequest");

    let hasSubscription;

    switch (type) {
      case "storage":
        hasSubscription = hasStorageSubscription;
        break;
      default:
        hasSubscription = false;
        break;
    }

    if (!hasSubscription) return t("Buy");

    if (isPlanUpgrade(quantity) || isCurrentPlan(quantity)) return t("Upgrade");

    return t("Downgrade");
  };

  return {
    t,
    maxStorageLimit,
    isWalletBalanceInsufficient,
    isPlanUpgrade,
    isStorageCancellation,
    isExceedingPlanLimit,
    isCurrentPlan,
    isPlanDowngrade,
    calculateDifferenceBetweenPlan,
    buttonTitle,
  };
};
