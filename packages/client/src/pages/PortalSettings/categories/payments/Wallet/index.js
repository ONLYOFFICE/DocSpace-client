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

import React, { useState, useMemo, useEffect } from "react";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Tabs, TabsTypes } from "@docspace/shared/components/tabs";
import { TextInput } from "@docspace/shared/components/text-input";
import { toastr } from "@docspace/shared/components/toast";
import CheckReactSvg from "PUBLIC_DIR/images/check.edit.react.svg";
import { Link } from "@docspace/shared/components/link";
import { saveDeposite } from "@docspace/shared/api/portal";

import PlusIcon from "PUBLIC_DIR/images/icons/12/payment.plus.react.svg";

import WalletInfo from "./sub-components/WalletInfo";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  min-height: 72px;

  box-sizing: border-box;
  border-radius: 6px;

  .balance-wrapper {
    max-width: 152px;
  }
`;

const AutomaticPaymentsBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .header {
    display: flex;
    align-items: center;

    .toggle-button {
      margin-inline: auto 28px;
    }
  }

  .description {
    max-width: 420px;
    margin-inline-end: 28px;
    color: ${(props) => props.theme.editLink.text.color};
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

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 20px;

  .amount-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .add-payment-method {
    padding: 20px 0px;
    .payment-method-description {
      display: flex;
      flex-direction: column;
      gap: 8px;
      p:first-child {
        max-width: 404px;
      }
    }
    border-bottom: #eceef1 solid 1px;
  }
`;

const AddPaymentMethodContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding-top: 8px;
`;

const PlusIconWrapper = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.client.settings.payment.rectangleColor};
  border: 1px solid
    ${(props) => props.theme.client.settings.payment.rectangleColor};

  svg {
    width: 12px;
    height: 24px;
  }
`;

const AddPaymentText = styled(Text)`
  font-size: 14px;
  line-height: 16px;
  color: #a3a9ae;
`;

const CardLinked = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 16px;
  .ticked-wrapper {
    display: flex;
    gap: 8px;
    align-items: baseline;
  }
`;

const Wallet = ({
  balance,
  language,
  walletInit,
  isWalletCustomerExist,
  cardLinked,
  accountLink,
  setBalance,
}) => {
  const tooltipContent =
    "Your current wallet balance. This amount can be used for purchases and subscriptions.";
  const { t } = useTranslation(["Payments", "Common"]);

  const [isLoading, setIsLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [amount, setAmount] = useState("");
  const [isAutomaticPaymentsEnabled, setIsAutomaticPaymentsEnabled] =
    useState(false);

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

  const formattedAmount = (value) => {
    const formatter = new Intl.NumberFormat(language, {
      style: "currency",
      currency: balance.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    return formatter.format(value);
  };

  const amountTabs = useMemo(
    () => [
      { name: formattedAmount(10), id: "10", value: 10 },
      { name: formattedAmount(20), id: "20", value: 20 },
      { name: formattedAmount(30), id: "30", value: 30 },
      { name: formattedAmount(50), id: "50", value: 50 },
      { name: formattedAmount(100), id: "100", value: 100 },
    ],
    [language, balance.currency],
  );

  const onSelectAmount = (data) => {
    setSelectedAmount(data.id);
    setAmount(data.value.toString());
  };

  const onChangeTextInput = (e) => {
    const { value, validity } = e.target;

    if (validity.valid) {
      setAmount(value);
      setSelectedAmount(value);
    }
  };

  const goLinkCard = () => {
    cardLinked
      ? window.open(cardLinked, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  const goStripeAccount = () => {
    accountLink
      ? window.open(accountLink, "_blank")
      : toastr.error(t("ErrorNotification"));
  };

  const onToggleClick = () => {
    setIsAutomaticPaymentsEnabled(!isAutomaticPaymentsEnabled);
  };

  const onClose = () => {
    setVisible(false);
  };

  const onTopUp = async () => {
    try {
      setIsLoading(true);
      await saveDeposite(+amount, balance.currency);
      await setBalance();

      onClose();
    } catch (e) {
      toastr.error(e);
    }

    setIsLoading(false);
  };

  const { fraction, balanceValue, isCurrencyAtEnd, mainNumber, currency } =
    formattedBalance();

  const isButtonDisabled = !isWalletCustomerExist || !amount;

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
          <HelpButton tooltipContent={tooltipContent} />
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
          onClick={() => setVisible(true)}
        />
      </div>

      <ModalDialog
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.aside}
      >
        <ModalDialog.Header>{t("TopUpWallet")}</ModalDialog.Header>
        <ModalDialog.Body>
          <StyledBody>
            <WalletInfo balance={balanceValue} />
            <div className="amount-container">
              <Text fontWeight="700" fontSize="16px">
                {t("AmountSelection")}
              </Text>
              <Tabs
                items={amountTabs}
                selectedItemId={selectedAmount}
                onSelect={onSelectAmount}
                type={TabsTypes.Secondary}
                allowNoSelection
              />
              <Text fontWeight={600}>{t("Amount")}</Text>
              <TextInput
                value={amount}
                onChange={onChangeTextInput}
                pattern="^\d+(?:\.\d{0,2})?"
                scale
                withBorder
                placeholder={t("EnterAmount")}
              />
            </div>
            <div className="add-payment-method">
              <div className="payment-method-description">
                <Text isBold fontSize="16px">
                  {t("PaymentMethod")}
                </Text>
                <Text fontSize="12px">{t("YouHaveNotAddedAnyPayment")}</Text>
              </div>
              {isWalletCustomerExist ? (
                <CardLinked>
                  <div className="ticked-wrapper">
                    <CheckReactSvg />
                    <Text fontWeight={600} fontSize="14px">
                      {t("CardLinked")}
                    </Text>
                  </div>
                  <Link fontWeight={600} onClick={goStripeAccount}>
                    {t("GoToStripe")}
                  </Link>
                </CardLinked>
              ) : (
                <AddPaymentMethodContainer onClick={goLinkCard}>
                  <PlusIconWrapper>
                    <PlusIcon className="payment-score" />
                  </PlusIconWrapper>
                  <AddPaymentText>{t("AddPaymentMethod")}</AddPaymentText>
                </AddPaymentMethodContainer>
              )}
            </div>

            <AutomaticPaymentsBlock>
              <div className="header">
                <Text noSelect isBold fontSize="16px">
                  {t("AutomaticPayments")}
                </Text>
                <ToggleButton
                  isChecked={isAutomaticPaymentsEnabled}
                  onChange={onToggleClick}
                  className="toggle-button"
                  isDisabled={!isWalletCustomerExist}
                />
              </div>
              <Text fontSize="12px" className="description" noSelect>
                {t("AutomaticallyTopUpCard")}
              </Text>
            </AutomaticPaymentsBlock>
          </StyledBody>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            id="delete-file-modal_submit"
            key="OkButton"
            label="Top up"
            size="normal"
            primary
            scale
            isDisabled={isButtonDisabled}
            onClick={onTopUp}
            isLoading={isLoading}
          />
          <Button
            id="delete-file-modal_cancel"
            key="CancelButton"
            label={t("Common:CancelButton")}
            size="normal"
            scale
            onClick={onClose}
          />
        </ModalDialog.Footer>
      </ModalDialog>
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
  } = paymentStore;

  console.log("walletBalance.subAccounts", walletBalance.subAccounts);
  return {
    balance: walletBalance.subAccounts[0],
    language,
    walletInit,
    isWalletCustomerExist,
    cardLinked,
    setBalance,
    accountLink,
  };
})(observer(Wallet));
