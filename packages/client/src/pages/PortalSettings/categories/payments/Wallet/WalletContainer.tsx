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

import React, { useState } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import TransactionHistory from "./TransactionHistory";
import TopUpModal from "./TopUpModal";
import { formattedBalanceTokens } from "./utils";

import "./styles/Wallet.scss";

import PayerInformation from "../PayerInformation";
import AutoPaymentInfo from "./sub-components/AutoPaymentInfo";

type WalletProps = {
  walletBalance: number;
  language: string;
  walletCodeCurrency: string;
  isPayer: boolean;
  cardLinkedOnFreeTariff: boolean;
  isFreeTariff: boolean;
  isNonProfit: boolean;
  isVisibleWalletSettings: boolean;
};

const typeClassMap: Record<string, string> = {
  integer: "integer",
  group: "group",
  decimal: "decimal",
  fraction: "fraction",
  currency: "currency",
  literal: "literal",
};

const Wallet = (props: WalletProps) => {
  const {
    walletBalance,
    language,
    walletCodeCurrency,
    isPayer,
    cardLinkedOnFreeTariff,
    isFreeTariff,
    isNonProfit,
    isVisibleWalletSettings,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);

  const [visible, setVisible] = useState(isVisibleWalletSettings);
  const [isEditAutoPayment, setIsEditAutoPayment] = useState(false);

  const tokens = formattedBalanceTokens(
    language,
    walletBalance,
    walletCodeCurrency || "",
  );

  const onClose = () => {
    setVisible(false);
  };

  const onOpen = () => {
    setVisible(true);
    setIsEditAutoPayment(false);
  };

  const onOpenLink = () => {
    setVisible(true);
    setIsEditAutoPayment(true);
  };

  const isDisbled = cardLinkedOnFreeTariff || !isFreeTariff ? !isPayer : false;

  return (
    <div className="wallet-container">
      <Text className="wallet-description">
        {t("WalletDescription", { productName: t("Common:ProductName") })}
      </Text>
      {!isNonProfit && (cardLinkedOnFreeTariff || !isFreeTariff) ? (
        <PayerInformation />
      ) : null}

      <div className="balance-wrapper">
        <div className="header-container">
          <Text isBold fontSize="16px">
            {t("BalanceText")}
          </Text>
        </div>

        <div className="balance-amount-container">
          {tokens.map((token) => (
            <Text
              key={`${token.type}-${token.value}`}
              className={typeClassMap[token.type] || ""}
            >
              {token.value}
            </Text>
          ))}
        </div>

        <Button
          size={ButtonSize.normal}
          primary
          label={t("TopUpBalance")}
          onClick={onOpen}
          isDisabled={isDisbled}
        />
      </div>

      <AutoPaymentInfo onOpen={onOpenLink} />

      {visible ? (
        <TopUpModal
          visible={visible}
          onClose={onClose}
          isEditAutoPayment={isEditAutoPayment}
        />
      ) : null}

      <TransactionHistory />
    </div>
  );
};

export default inject(
  ({ paymentStore, authStore, currentQuotaStore }: TStore) => {
    const { language } = authStore;
    const {
      walletBalance,
      cardLinked,
      cardLinkedOnFreeTariff,
      walletCodeCurrency,
      isPayer,
      isVisibleWalletSettings,
    } = paymentStore;
    const { isFreeTariff, isNonProfit } = currentQuotaStore;

    return {
      walletBalance,
      walletCodeCurrency,
      language,
      cardLinked,
      isPayer,
      cardLinkedOnFreeTariff,
      isFreeTariff,
      isNonProfit,
      isVisibleWalletSettings,
    };
  },
)(observer(Wallet));
