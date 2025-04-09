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
import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import styled from "styled-components";

import { ToggleButton } from "@docspace/shared/components/toggle-button";
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";

import { toastr } from "@docspace/shared/components/toast";

import { saveDeposite } from "@docspace/shared/api/portal";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";

import WalletInfo from "./sub-components/WalletInfo";
import PaymentMethod from "./sub-components/PaymentMethod";
import Amount from "./sub-components/Amount";

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

type TopUpModalProps = {
  visible: boolean;
  onClose: () => void;
  balanceValue: string;
  currency: string;
  language?: string;
  setTransactionHistory: () => Promise<any>;
  isWalletCustomerExist?: boolean;
  cardLinked?: string;
  accountLink?: string;
  setBalance: () => Promise<any>;
};

const TopUpModal: React.FC<TopUpModalProps> = ({
  visible,
  currency,
  balanceValue,
  setTransactionHistory,
  isWalletCustomerExist,
  setBalance,
  onClose,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [isAutomaticPaymentsEnabled, setIsAutomaticPaymentsEnabled] =
    useState(false);

  const onToggleClick = () => {
    setIsAutomaticPaymentsEnabled(!isAutomaticPaymentsEnabled);
  };

  const onTopUp = async () => {
    try {
      setIsLoading(true);
      await saveDeposite(+amount, currency);
      await Promise.allSettled([setBalance(), setTransactionHistory()]);
      onClose();
    } catch (e) {
      toastr.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = !isWalletCustomerExist || !amount;

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
          <Amount setAmount={setAmount} amount={amount} />
          <PaymentMethod />
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
          key="OkButton"
          label="Top up"
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

export default inject(({ paymentStore }: TStore) => {
  const {
    walletBalance,
    isWalletCustomerExist,
    setBalance,
    setTransactionHistory,
  } = paymentStore;

  return {
    currency: walletBalance.subAccounts[0].currency,
    isWalletCustomerExist,
    setBalance,
    setTransactionHistory,
  };
})(observer(TopUpModal));
