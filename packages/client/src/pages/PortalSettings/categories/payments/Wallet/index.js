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

import React, { useState, useEffect } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import TransactionHistory from "./TransactionHistory";
import TopUpModal from "./TopUpModal";
import { formattedBalance } from "./utils";

import "./Wallet.scss";
import PayerInformation from "../PayerInformation";

const Wallet = ({ balance, language, walletInit, isInitWalletPage }) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    walletInit();
  }, []);

  const { fraction, balanceValue, isCurrencyAtEnd, mainNumber, currency } =
    formattedBalance(language, balance);

  const onClose = () => {
    setVisible(false);
  };

  const onOpen = () => {
    setVisible(true);
  };

  if (!isInitWalletPage) return;

  return (
    <div className="wallet-container">
      <Text className="description">
        {t("WalletDescription", { productName: t("Common:ProductName") })}
      </Text>

      <PayerInformation />

      <div className="balance-wrapper">
        <div className="header-container">
          <Text isBold fontSize="16px">
            {t("BalanceText")}
          </Text>
        </div>

        <div className="balance-amount-container">
          <Text className="main-amount">
            {!isCurrencyAtEnd ? currency : ""}
            {mainNumber}
          </Text>
          <Text className="decimal-amount">{fraction}</Text>
          {isCurrencyAtEnd ? (
            <Text className="main-amount" as="span">
              {currency}
            </Text>
          ) : (
            ""
          )}
        </div>

        <Button
          size={ButtonSize.normal}
          primary
          label={t("TopUpBalance")}
          onClick={onOpen}
        />
      </div>

      <TopUpModal
        visible={visible}
        onClose={onClose}
        balanceValue={balanceValue}
      />

      <TransactionHistory />
    </div>
  );
};

export default inject(({ paymentStore, authStore }) => {
  const { language } = authStore;
  const {
    walletInit,
    walletBalance,
    walletCustomerEmail,
    cardLinked,
    accountLink,
    setBalance,
    isInitWalletPage,
  } = paymentStore;

  return {
    balance: walletBalance.subAccounts[0],
    language,
    walletInit,
    walletCustomerEmail,
    cardLinked,
    setBalance,
    accountLink,
    isInitWalletPage,
  };
})(observer(Wallet));
