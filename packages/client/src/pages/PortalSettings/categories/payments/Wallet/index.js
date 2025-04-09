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
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import TransactionHistory from "./TransactionHistory";
import TopUpModal from "./TopUpModal";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  min-height: 72px;

  box-sizing: border-box;
  border-radius: 6px;

  .balance-wrapper {
    max-width: 152px;
    margin-bottom: 24px;
  }
`;

const Description = styled(Text)`
  font-size: 12px;
  line-height: 1.334em;
  color: #666666;
  margin-bottom: 20px;
`;

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const BalanceAmountContainer = styled.div`
  display: flex;
  align-items: baseline;
`;

const MainAmount = styled(Text)`
  font-size: 44px;
  font-weight: 700;
  line-height: 1.36em;
`;

const DecimalAmount = styled(Text)`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.36em;
`;

const Wallet = ({ balance, language, walletInit, isInitWalletPage }) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    walletInit();
  }, []);

  const formattedBalance = () => {
    const formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency: balance.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const parts = formatter.formatToParts(balance.amount || 0);
    const currencySymbol =
      parts.find((part) => part.type === "currency")?.value || "";
    const mainNumber =
      parts.find((part) => part.type === "integer")?.value || "0";
    const fraction =
      parts.find((part) => part.type === "fraction")?.value || "00";
    const decimal = parts.find((part) => part.type === "decimal")?.value || ".";

    const currencyIndex = parts.findIndex((part) => part.type === "currency");
    const isCurrencyAtEnd =
      currencyIndex > parts.findIndex((part) => part.type === "integer");

    const balanceValue = formatter.format(balance.amount);

    return {
      fraction: `${decimal}${fraction}`,
      balanceValue,
      isCurrencyAtEnd,
      mainNumber,
      currency: currencySymbol,
    };
  };

  const { fraction, balanceValue, isCurrencyAtEnd, mainNumber, currency } =
    formattedBalance();

  const onClose = () => {
    setVisible(false);
  };

  const onOpen = () => {
    setVisible(true);
  };

  if (!isInitWalletPage) return;

  return (
    <StyledContainer>
      <Description>
        {t("WalletDescription", { productName: t("Common:ProductName") })}
      </Description>
      <div className="balance-wrapper">
        <HeaderContainer>
          <Text isBold fontSize="16px">
            {t("BalanceText")}
          </Text>
        </HeaderContainer>

        <BalanceAmountContainer>
          <MainAmount>
            {!isCurrencyAtEnd ? currency : ""}
            {mainNumber}
          </MainAmount>
          <DecimalAmount>{fraction}</DecimalAmount>
          {isCurrencyAtEnd ? <MainAmount as="span">{currency}</MainAmount> : ""}
        </BalanceAmountContainer>

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
    </StyledContainer>
  );
};

export default inject(({ paymentStore, authStore }) => {
  const { language } = authStore;
  const {
    walletInit,
    walletBalance,
    isWalletCustomerExist,
    cardLinked,
    accountLink,
    setBalance,
    isInitWalletPage,
    setTransactionHistory,
  } = paymentStore;

  return {
    balance: walletBalance.subAccounts[0],
    language,
    walletInit,
    isWalletCustomerExist,
    cardLinked,
    setBalance,
    accountLink,
    isInitWalletPage,
    setTransactionHistory,
  };
})(observer(Wallet));
