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
import { Text } from "@docspace/shared/components/text";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import PaymentSpeacialIcon from "PUBLIC_DIR/images/payment.special.react.svg";

import styles from "../styles/StorageSummary.module.scss";
import { formatCurrencyValue } from "../../payments/Wallet/utils";

type PlanInfoProps = {
  amount: number | string;
  walletCodeCurrency: string;
  language: string;
  totalPrice: number;
  value: number;
  maxValue?: number;
  moreThanLimit?: boolean;
  isCurrentTariff?: boolean;
  hasStorageSubscription?: boolean;
  nextStoragePlanSize?: number;
  currentStoragePlanSize?: number;
  hasScheduledStorageChange?: boolean;
  storageQuotaIncrement?: number;
};

const PlanInfo: React.FC<PlanInfoProps> = ({
  amount,
  walletCodeCurrency,
  language,
  totalPrice,
  value,
  moreThanLimit,
  maxValue,
  isCurrentTariff,
  hasStorageSubscription,
  nextStoragePlanSize,
  currentStoragePlanSize,
  hasScheduledStorageChange,
  storageQuotaIncrement,
}) => {
  const { t } = useTranslation("Payments");

  const getStorageStatusText = () => {
    if (!hasStorageSubscription) {
      return t("AdditionalStorage", {
        amount,
        storageUnit: t("Common:Gigabyte"),
      });
    }

    if (!isCurrentTariff) {
      return t("StorageUpgradeMessage", {
        fromSize: currentStoragePlanSize,
        toSize: amount,
        storageUnit: t("Common:Gigabyte"),
      });
    }

    if (hasScheduledStorageChange) {
      return t("StorageUpgradeMessage", {
        fromSize: currentStoragePlanSize,
        toSize: nextStoragePlanSize,
        storageUnit: t("Common:Gigabyte"),
      });
    }

    return `${amount} ${t("Common:Gigabyte")}`;
  };

  const getSubscriptionStatusText = () => {
    if (!amount || (hasScheduledStorageChange && nextStoragePlanSize === 0)) {
      return t("SubscriptionCancellation");
    }

    return t("BilledMonthly");
  };

  const formatWalletCurrency = (currency: number) => {
    return formatCurrencyValue(
      language,
      currency,
      walletCodeCurrency || "",
      2,
      7,
    );
  };

  return (
    <div className={styles.planInfoContainer}>
      <div className={styles.planInfoIcon}>
        <PaymentSpeacialIcon />
      </div>
      <div className={styles.planInfoBody}>
        {moreThanLimit ? (
          <Text fontWeight="600" fontSize="14px">
            {t("StorageUponRequest", {
              amount: maxValue,
              storageUnit: t("Common:Gigabyte"),
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
      {!moreThanLimit && amount ? (
        <div className={styles.planInfoPrice}>
          <Text fontWeight="600" fontSize="14px" className={styles.totalPrice}>
            {t("CurrencyPerMonth", {
              currency: formatWalletCurrency(totalPrice),
            })}
          </Text>
          <Text
            fontWeight="600"
            fontSize="11px"
            className={styles.priceForEach}
          >
            {t("PriceForEach", {
              currency: formatWalletCurrency(value),
              amount: storageQuotaIncrement,
              storageUnit: t("Common:Gigabyte"),
            })}
          </Text>
        </div>
      ) : null}
    </div>
  );
};

export default inject(
  ({ paymentStore, authStore, currentTariffStatusStore }: TStore) => {
    const { language } = authStore;
    const { walletBalance, walletCodeCurrency, storageQuotaIncrementPrice } =
      paymentStore;
    const {
      nextStoragePlanSize,
      hasStorageSubscription,
      currentStoragePlanSize,
      hasScheduledStorageChange,
    } = currentTariffStatusStore;

    const { value } = storageQuotaIncrementPrice;
    return {
      walletBalance,
      walletCodeCurrency,
      language,
      stepValue: value,
      nextStoragePlanSize,
      hasStorageSubscription,
      currentStoragePlanSize,
      hasScheduledStorageChange,
    };
  },
)(observer(PlanInfo));
