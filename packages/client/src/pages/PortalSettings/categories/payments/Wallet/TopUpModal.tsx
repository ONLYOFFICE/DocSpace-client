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
// TopUpModal.tsx
import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";
import { ColorTheme, ThemeId } from "@docspace/shared/components/color-theme";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import { toastr } from "@docspace/shared/components/toast";

import { saveDeposite } from "@docspace/shared/api/portal";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import WalletInfo from "./sub-components/WalletInfo";
import PaymentMethod from "./sub-components/PaymentMethod";
import Amount from "./sub-components/Amount";
import AutomaticPaymentsBlock from "./sub-components/AutoPayments";

const StyledBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  max-width: 480px;
  margin: 20px auto 0 auto;
  padding: 0 0 24px;
`;

interface TStore {
  paymentStore: {
    walletBalance: {
      subAccounts: Array<{ currency: string }>;
    };
    isWalletCustomerExist: boolean;
    setBalance: () => Promise<void>;
    fetchTransactionHistory: () => Promise<void>;
    cardLinked: string;
    accountLink: string;
  };
  authStore: {
    language: string;
  };
}

type TopUpModalProps = {
  visible: boolean;
  currency: string;
  balanceValue: string;
  fetchTransactionHistory: () => Promise<void>;
  isWalletCustomerExist: boolean;
  setBalance: () => Promise<void>;
  onClose: () => void;
  language: string;
  cardLinked: string;
  accountLink: string;
};

const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  currency,
  balanceValue,
  fetchTransactionHistory,
  isWalletCustomerExist,
  setBalance,
  onClose,
  language,
  cardLinked,
  accountLink,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isButtonDisabled = !amount || !isWalletCustomerExist;

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

  const onTopUp = async () => {
    try {
      setIsLoading(true);
      await saveDeposite(+amount, currency);
      await Promise.allSettled([setBalance(), fetchTransactionHistory()]);
      toastr.success(t("Common:SuccessfullySaved"));
      onClose();
    } catch (e) {
      console.error(e);

      toastr.error(
        <Trans
          i18nKey="InsufficientFundsOnCard"
          ns="Payments"
          t={t}
          components={{
            1: (
              <ColorTheme
                themeId={ThemeId.Link}
                onClick={isWalletCustomerExist ? goStripeAccount : goLinkCard}
              />
            ),
          }}
        />,
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
    >
      <ModalDialog.Header>{t("TopUpWallet")}</ModalDialog.Header>
      <ModalDialog.Body>
        <StyledBody>
          <WalletInfo balance={balanceValue} />
          <Amount
            setAmount={setAmount}
            amount={amount}
            language={language}
            currency={currency}
          />
          <PaymentMethod
            isWalletCustomerExist={isWalletCustomerExist}
            cardLinked={cardLinked}
            accountLink={accountLink}
          />
          <AutomaticPaymentsBlock
            isWalletCustomerExist={isWalletCustomerExist}
            currency={currency}
          />
        </StyledBody>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("TopUp")}
          size={ButtonSize.normal}
          primary
          scale
          isDisabled={isButtonDisabled}
          onClick={onTopUp}
          isLoading={isLoading}
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ paymentStore, authStore }: TStore) => {
  const { language } = authStore;
  const {
    walletBalance,
    isWalletCustomerExist,
    setBalance,
    fetchTransactionHistory,
    cardLinked,
    accountLink,
  } = paymentStore;

  return {
    currency: walletBalance.subAccounts[0].currency,
    isWalletCustomerExist,
    setBalance,
    fetchTransactionHistory,
    language,
    cardLinked,
    accountLink,
  };
})(observer(TopUpModal));
