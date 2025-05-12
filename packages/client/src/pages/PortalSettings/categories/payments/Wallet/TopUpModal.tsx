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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

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
import { formatCurrencyValue } from "./utils";
import styles from "./styles/TopUpModal.module.scss";

type TopUpModalProps = {
  visible: boolean;
  currency?: string;
  balanceValue?: string;
  fetchTransactionHistory?: () => Promise<void>;
  walletCustomerEmail?: boolean;
  fetchBalance?: () => Promise<void>;
  onClose: () => void;
  language?: string;
  cardLinked?: string;
  accountLink?: string;
  isEditAutoPayment?: boolean;
  headerProps?: {
    isBackButton: boolean;
    onBackClick: () => void;
    onCloseClick: () => void;
  };
  walletBalance?: number;
  wasFirstTopUp?: boolean;
};

const TopUpModal = (props: TopUpModalProps) => {
  const {
    visible,
    currency = "",
    fetchTransactionHistory,
    walletCustomerEmail,
    fetchBalance,
    onClose,
    language,
    cardLinked,
    accountLink,
    isEditAutoPayment,
    headerProps,
    walletBalance = 0,
    wasFirstTopUp,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isButtonDisabled = !amount || !walletCustomerEmail;

  const onTopUp = async () => {
    try {
      setIsLoading(true);

      const res = await saveDeposite(+amount, currency);

      if (!res) return;
      if (!res.includes("ok")) throw new Error(res);

      await Promise.allSettled([fetchBalance!(), fetchTransactionHistory!()]);

      onClose();
    } catch (e) {
      console.error(e);

      toastr.error(e instanceof Error ? e.message : String(e));
    } finally {
      setIsLoading(false);
    }
  };

  const balanceValue = formatCurrencyValue(
    language!,
    walletBalance,
    currency,
    2,
    2,
  );

  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      {...headerProps}
    >
      <ModalDialog.Header>{t("TopUpWallet")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.modalBody}>
          <WalletInfo balance={balanceValue} />
          <PaymentMethod
            walletCustomerEmail={walletCustomerEmail!}
            cardLinked={cardLinked!}
            accountLink={accountLink!}
          />
          <Amount
            setAmount={setAmount}
            amount={amount}
            language={language!}
            currency={currency}
            walletCustomerEmail={walletCustomerEmail}
          />

          {wasFirstTopUp && walletCustomerEmail ? (
            <AutomaticPaymentsBlock isEditAutoPayment={isEditAutoPayment!} />
          ) : null}
        </div>
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
    walletCustomerEmail,
    fetchBalance,
    fetchTransactionHistory,
    cardLinked,
    accountLink,
    walletBalance,
    walletCodeCurrency,
    wasFirstTopUp,
  } = paymentStore;

  return {
    currency: walletCodeCurrency,
    walletCustomerEmail,
    fetchBalance,
    fetchTransactionHistory,
    language,
    cardLinked,
    accountLink,
    walletBalance,
    wasFirstTopUp,
  };
})(observer(TopUpModal));
