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

import WalletInfo from "../payments/Wallet/sub-components/WalletInfo";
import { formatCurrencyValue } from "../payments/Wallet/utils";

import styles from "./styles/Total.module.scss";

type PlanInfoProps = {
  amount: number | string;
  walletCodeCurrency: string;
  language: string;
  totalPrice: number;
  t: (key: string, options?: any) => string;
  value: number;
};

const PlanInfo: React.FC<PlanInfoProps> = ({
  amount,
  walletCodeCurrency,
  language,
  totalPrice,
  t,
  value,
}) => {
  return (
    <div className={styles.planInfoContainer}>
      <div className={styles.planInfoIcon}>
        <PaymentSpeacialIcon />
      </div>
      <div className={styles.planInfoBody}>
        <Text className={styles.planInfoTitle} fontWeight="600" fontSize="14px">
          {t("Common:PortalAdmin", {
            productName: t("Common:ProductName"),
          })}
        </Text>
        <div className={styles.planInfoDetails}>
          <Text fontSize="12px" fontWeight="600">
            {t("QtyBilledMonthly", { amount })}
          </Text>
        </div>
      </div>
      <div className={styles.planInfoPrice}>
        <Text fontWeight="600" fontSize="14px" className={styles.totalPrice}>
          {formatCurrencyValue(
            language,
            totalPrice,
            walletCodeCurrency || "",
            2,
            2,
          )}
        </Text>
        <Text fontWeight="600" fontSize="11px" className={styles.priceForEach}>
          {t("PriceForEach", {
            amount: formatCurrencyValue(
              language,
              value,
              walletCodeCurrency || "",
              2,
              7,
            ),
          })}
        </Text>
      </div>
    </div>
  );
};

type TotalProps = {
  amount?: string | number;
  stepValue?: number;
  isInsufficientFunds?: boolean;
  totalPrice?: number;
  language?: string;
  walletBalance?: number;
  walletCodeCurrency?: string;
  onTopUp?: () => void;
};

const Total: React.FC<TotalProps> = ({
  language,
  walletCodeCurrency,
  amount,
  stepValue,
  isInsufficientFunds,
  totalPrice,
  walletBalance = 0,
  onTopUp,
}) => {
  const balanceValue = formatCurrencyValue(
    language || "en",
    walletBalance,
    walletCodeCurrency || "",
    2,
    2,
  );

  const { t } = useTranslation("Payments");

  return (
    <div className={styles.totalWrapper}>
      <Text isBold fontSize="16px" className={styles.totalTitle}>
        {t("Total")}
      </Text>
      <PlanInfo
        amount={amount || 0}
        walletCodeCurrency={walletCodeCurrency!}
        language={language!}
        totalPrice={totalPrice || 0}
        t={t}
        value={stepValue || 0}
      />
      <WalletInfo balance={balanceValue} onTopUp={onTopUp} />
      {isInsufficientFunds ? (
        <Text className={styles.balanceWarning} fontSize="12px">
          {t("BalanceNotEnough")}
        </Text>
      ) : null}
    </div>
  );
};

export default inject(({ paymentStore, authStore }: TStore) => {
  const { language } = authStore;
  const { walletBalance, walletCodeCurrency, storageQuotaIncrementPrice } =
    paymentStore;
  const { value } = storageQuotaIncrementPrice;
  return {
    walletBalance,
    walletCodeCurrency,
    language,
    stepValue: value,
  };
})(observer(Total));
