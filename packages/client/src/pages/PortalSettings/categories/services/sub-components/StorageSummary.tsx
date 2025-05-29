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
import { Text } from "@docspace/shared/components/text";
import { Link } from "@docspace/shared/components/link";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import WalletInfo from "../../payments/Wallet/sub-components/WalletInfo";
import { formatCurrencyValue } from "../../payments/Wallet/utils";

import styles from "../styles/StorageSummary.module.scss";
import PlanInfo from "./PlanInfo";

type StorageSummaryProps = {
  amount?: string | number;
  stepValue?: number;
  isInsufficientFunds?: boolean;
  totalPrice?: number;
  language?: string;
  walletBalance?: number;
  walletCodeCurrency?: string;
  onTopUp?: () => void;
  maxValue?: number;
  moreThanLimit?: boolean;
  isCurrentTariff?: boolean;
  walletDueDate?: string;
  hasScheduledStorageChange?: boolean;
  onCancelChange?: () => void;
  nextStoragePlanSize?: number;
  hasStorageSubscription?: boolean;
  currentStoragePlanSize?: number;
};

const StorageSummary: React.FC<StorageSummaryProps> = ({
  language,
  walletCodeCurrency,
  amount,
  stepValue,
  isInsufficientFunds,
  totalPrice,
  walletBalance = 0,
  onTopUp,
  maxValue,
  hasStorageSubscription,
  moreThanLimit,
  isCurrentTariff,
  walletDueDate,
  hasScheduledStorageChange,
  onCancelChange,
  nextStoragePlanSize,
  currentStoragePlanSize,
}) => {
  const balanceValue = formatCurrencyValue(
    language || "en",
    walletBalance,
    walletCodeCurrency || "",
    2,
    2,
  );

  const { t } = useTranslation("Payments");

  const getTitle = () => {
    if (isCurrentTariff) {
      if (hasScheduledStorageChange) return t("ChangeShedule");

      return t("YourCurrentPayment");
    }

    if (hasStorageSubscription) return t("StartingNextMonth");

    return t("Total");
  };

  const getDescription = () => {
    if (!hasStorageSubscription) return t("NewStorageImmidiatelyAvailable");

    if (hasScheduledStorageChange && nextStoragePlanSize === 0) {
      return t("SubscriptionAutoCancellation", {
        finalDate: walletDueDate,
      });
    }

    if (amount)
      return t("SubscriptionAutoRenewed", {
        finalDate: walletDueDate,
      });

    return t("SubscriptionAutoCancellation", {
      finalDate: walletDueDate,
    });
  };

  return (
    <div>
      {hasScheduledStorageChange ? (
        <div className={styles.warningBlock}>
          {t("Warning", {
            amount: currentStoragePlanSize,
            storageUnit: t("Common:Gigabyte"),
          })}
        </div>
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
          walletCodeCurrency={walletCodeCurrency!}
          language={language!}
          totalPrice={totalPrice}
          value={stepValue}
          maxValue={maxValue}
          moreThanLimit={moreThanLimit}
          isCurrentTariff={isCurrentTariff}
        />

        {!hasScheduledStorageChange ? (
          <WalletInfo
            balance={balanceValue}
            {...(isInsufficientFunds && { onTopUp })}
          />
        ) : (
          <Link textDecoration="underline dashed" onClick={onCancelChange}>
            {t("CancelChange")}
          </Link>
        )}

        {isInsufficientFunds && !moreThanLimit ? (
          <Text className={styles.balanceWarning} fontSize="12px">
            {t("BalanceNotEnough")}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default inject(
  ({ paymentStore, authStore, currentTariffStatusStore }: TStore) => {
    const { language } = authStore;
    const { walletBalance, walletCodeCurrency, storageQuotaIncrementPrice } =
      paymentStore;
    const {
      hasScheduledStorageChange,
      hasStorageSubscription,
      nextStoragePlanSize,
      currentStoragePlanSize,
      storageExpiryDate,
    } = currentTariffStatusStore;

    const { value } = storageQuotaIncrementPrice;
    return {
      walletBalance,
      walletCodeCurrency,
      language,
      stepValue: value,
      hasScheduledStorageChange,
      walletDueDate: storageExpiryDate,
      hasStorageSubscription,
      nextStoragePlanSize,
      currentStoragePlanSize,
    };
  },
)(observer(StorageSummary));
