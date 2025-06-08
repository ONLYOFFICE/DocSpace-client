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
import classNames from "classnames";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import styles from "../styles/StorageSummary.module.scss";
import PlanInfo from "./PlanInfo";
import { useServicesActions } from "../hooks/useServicesActions";
import PlanUpgradePreview from "./PlanUpgradePreview";

import StorageWarning from "./StorageWarning";

type StorageSummaryProps = {
  amount: number;
  totalPrice: number;
  onCancelChange: () => void;
  isExceedingStorageLimit?: boolean;
  isCurrentStoragePlan?: boolean;
  storageExpiryDate?: string;
  hasScheduledStorageChange?: boolean;
  hasStorageSubscription?: boolean;
  currentStoragePlanSize?: number;
  isUpgradeStoragePlan?: boolean;
};

const StorageSummary: React.FC<StorageSummaryProps> = (props) => {
  const {
    amount,
    hasStorageSubscription,
    isExceedingStorageLimit,
    isCurrentStoragePlan,
    storageExpiryDate,
    hasScheduledStorageChange,
    onCancelChange,
    currentStoragePlanSize,
    isUpgradeStoragePlan,
    totalPrice,
  } = props;

  const { t, isStorageCancellation } = useServicesActions();

  const getTitle = () => {
    if (isCurrentStoragePlan) {
      if (hasScheduledStorageChange) return t("ChangeShedule");

      return t("YourCurrentPayment");
    }

    if (hasStorageSubscription) return t("StartingNextMonth");

    return t("Total");
  };

  const getDescription = () => {
    if (!hasStorageSubscription) return t("NewStorageImmidiatelyAvailable");

    if (isStorageCancellation()) {
      return t("SubscriptionAutoCancellation", {
        finalDate: storageExpiryDate,
      });
    }

    if (amount)
      return t("SubscriptionAutoRenewed", {
        finalDate: storageExpiryDate,
      });

    return t("SubscriptionAutoCancellation", {
      finalDate: storageExpiryDate,
    });
  };

  return (
    <div>
      {hasScheduledStorageChange ? <StorageWarning /> : null}

      {currentStoragePlanSize &&
      isUpgradeStoragePlan &&
      !isExceedingStorageLimit ? (
        <PlanUpgradePreview amount={amount} />
      ) : null}

      <div
        className={classNames(styles.totalWrapper, {
          [styles.withBackground]: hasScheduledStorageChange,
        })}
      >
        <Text isBold fontSize="16px" className={styles.totalTitle}>
          {getTitle()}
        </Text>
        <Text className={styles.totalTitle} fontSize="12px">
          {getDescription()}
        </Text>
        <PlanInfo
          amount={amount}
          totalPrice={totalPrice}
          isExceedingStorageLimit={isExceedingStorageLimit}
          isCurrentStoragePlan={isCurrentStoragePlan}
          isUpgradeStoragePlan={isUpgradeStoragePlan}
        />

        {hasScheduledStorageChange ? (
          <ColorTheme
            textDecoration="underline dashed"
            onClick={onCancelChange}
            themeId={ThemeId.Link}
            $isUnderline
            fontWeight={600}
          >
            {t("CancelChange")}
          </ColorTheme>
        ) : null}
      </div>
    </div>
  );
};

export default inject(({ currentTariffStatusStore }: TStore) => {
  const {
    hasScheduledStorageChange,
    hasStorageSubscription,
    currentStoragePlanSize,
    storageExpiryDate,
  } = currentTariffStatusStore;

  return {
    hasScheduledStorageChange,
    storageExpiryDate,
    hasStorageSubscription,
    currentStoragePlanSize,
  };
})(observer(StorageSummary));
