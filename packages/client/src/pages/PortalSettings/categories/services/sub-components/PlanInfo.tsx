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

import React from "react";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";

import UpgradeWalletIcon from "PUBLIC_DIR/images/icons/16/upgrade.react.svg";
import DowngradeWalletIcon from "PUBLIC_DIR/images/icons/16/downgrade.react.svg";
import DiskStorageIcon from "PUBLIC_DIR/images/icons/16/catalog-settings-storage-management.svg";
import styles from "../styles/StorageSummary.module.scss";
import { useServicesActions } from "../hooks/useServicesActions";

type PlanInfoProps = {
  amount: number | string;
  totalPrice: number;
  isExceedingStorageLimit?: boolean;
  isCurrentStoragePlan?: boolean;
  hasStorageSubscription?: boolean;
  nextStoragePlanSize?: number;
  currentStoragePlanSize?: number;
  hasScheduledStorageChange?: boolean;
  storageSizeIncrement?: number;
  storagePriceIncrement?: number;
  isUpgradeStoragePlan?: boolean;
  formatWalletCurrency?: (amount: number, fractionDigits?: number) => string;
};

const PlanInfo: React.FC<PlanInfoProps> = ({
  amount,
  totalPrice,
  isExceedingStorageLimit,
  isCurrentStoragePlan,
  hasStorageSubscription,
  nextStoragePlanSize,
  currentStoragePlanSize,
  hasScheduledStorageChange,
  storageSizeIncrement,
  storagePriceIncrement,
  isUpgradeStoragePlan,
  formatWalletCurrency,
}) => {
  const { maxStorageLimit, t, isStorageCancellation } = useServicesActions();

  const getStorageStatusText = () => {
    if (!hasStorageSubscription) {
      return t("AdditionalStorage", {
        amount: `${amount} ${t("Common:Gigabyte")}`,
      });
    }

    if (!isCurrentStoragePlan) {
      return t("StorageUpgradeMessage", {
        fromSize: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
        toSize: `${amount} ${t("Common:Gigabyte")}`,
      });
    }

    if (hasScheduledStorageChange) {
      return t("StorageUpgradeMessage", {
        fromSize: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
        toSize: `${nextStoragePlanSize} ${t("Common:Gigabyte")}`,
      });
    }

    return `${amount} ${t("Common:Gigabyte")}`;
  };

  const getSubscriptionStatusText = () => {
    if (!amount || isStorageCancellation()) {
      return t("SubscriptionCancellation");
    }

    return t("BilledMonthly");
  };

  return (
    <div className={styles.planInfoContainer}>
      <div className={styles.planInfoIcon}>
        {isCurrentStoragePlan ? (
          <DiskStorageIcon />
        ) : isUpgradeStoragePlan ? (
          <UpgradeWalletIcon />
        ) : (
          <DowngradeWalletIcon />
        )}
      </div>
      <div className={styles.planInfoBody}>
        {isExceedingStorageLimit ? (
          <Text fontWeight="600" fontSize="14px">
            {t("StorageUponRequest", {
              amount: `${maxStorageLimit} ${t("Common:Gigabyte")}`,
            })}
          </Text>
        ) : (
          <>
            <Text
              className={styles.planInfoTitle}
              fontWeight="600"
              fontSize="14px"
            >
              {getStorageStatusText()}
            </Text>
            <div className={styles.planInfoDetails}>
              <Text fontSize="12px" fontWeight="600">
                {getSubscriptionStatusText()}
              </Text>
            </div>
          </>
        )}
      </div>
      {!isStorageCancellation() && !isExceedingStorageLimit && amount ? (
        <div className={styles.planInfoPrice}>
          <Text fontWeight="600" fontSize="14px" className={styles.totalPrice}>
            {t("CurrencyPerMonth", {
              currency: formatWalletCurrency(totalPrice, 2),
            })}
          </Text>
          <Text
            fontWeight="600"
            fontSize="11px"
            className={styles.priceForEach}
          >
            {t("PriceForEach", {
              currency: formatWalletCurrency(storagePriceIncrement, 2),
              amount: getConvertedSize(t, storageSizeIncrement),
            })}
          </Text>
        </div>
      ) : null}
    </div>
  );
};

export default inject(({ paymentStore, currentTariffStatusStore }: TStore) => {
  const {
    walletBalance,
    storageSizeIncrement,
    storagePriceIncrement,
    formatWalletCurrency,
  } = paymentStore;
  const {
    nextStoragePlanSize,
    hasStorageSubscription,
    currentStoragePlanSize,
    hasScheduledStorageChange,
  } = currentTariffStatusStore;
  return {
    walletBalance,
    nextStoragePlanSize,
    hasStorageSubscription,
    currentStoragePlanSize,
    hasScheduledStorageChange,
    storageSizeIncrement,
    storagePriceIncrement,
    formatWalletCurrency,
  };
})(observer(PlanInfo));
