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
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Text } from "@docspace/shared/components/text";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";

import AutomaticPaymentsBlock from "../../../../../components/panels/TopUpBalance/sub-components/AutoPayments";

import styles from "./styles/Wallet.module.scss";

type WalletRefilledModalProps = {
  visible: boolean;
  updateAutoPayments?: () => Promise<void>;
  isAutomaticPaymentsEnabled?: boolean;
  minBalanceError?: boolean;
  upToBalanceError?: boolean;
  upToBalance?: string;
  minBalance?: string;
  updatePreviousBalance?: () => void;
  formatWalletCurrency?: (item?: number, fractionDigits?: number) => string;
};

const WalletRefilledModal = (props: WalletRefilledModalProps) => {
  const {
    visible,
    updateAutoPayments,
    isAutomaticPaymentsEnabled,
    minBalanceError,
    upToBalanceError,
    upToBalance,
    minBalance,
    updatePreviousBalance,
    formatWalletCurrency,
  } = props;

  const { t } = useTranslation(["Payments", "Common"]);

  const [isLoading, setIsLoading] = useState(false);

  const formattedBalance = formatWalletCurrency!();

  const onCloseDialog = () => {
    updatePreviousBalance!();
  };

  const onAdditionalSave = async () => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    try {
      await updateAutoPayments!();

      setIsLoading(false);
    } catch (error) {
      toastr.error(error as string);
    }

    clearTimeout(timerId);
    setIsLoading(false);
    onCloseDialog();
  };

  return (
    <ModalDialog
      visible={visible}
      onClose={onCloseDialog}
      displayType={ModalDialogType.modal}
      autoMaxHeight
    >
      <ModalDialog.Header>{t("WalletRefilled")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.modalContent}>
          <div>
            <Text as="span">{t("ToppedUpWallet")}</Text>
            <br />
            <Text as="span">
              <Trans
                i18nKey="CurrentBalance"
                t={t}
                values={{ balance: formattedBalance }}
                components={{
                  1: <span style={{ fontWeight: 600 }} />,
                }}
              />
            </Text>
          </div>
          <Text>{t("WouldYouLikeToEnableAutoTopUps")}</Text>

          <AutomaticPaymentsBlock
            onAdditionalSave={onAdditionalSave}
            noMargin
          />
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="EnableButton"
          label={t("Common:SaveButton")}
          size={ButtonSize.normal}
          primary
          scale
          onClick={onAdditionalSave}
          isDisabled={
            !isAutomaticPaymentsEnabled ||
            minBalanceError ||
            upToBalanceError ||
            !minBalance ||
            !upToBalance
          }
          isLoading={isLoading}
          testId="wallet_refilled_save_button"
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onCloseDialog}
          testId="wallet_refilled_cancel_button"
        />
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default inject(({ paymentStore }: TStore) => {
  const {
    updateAutoPayments,
    isAutomaticPaymentsEnabled,
    upToBalanceError,
    minBalanceError,
    upToBalance,
    minBalance,
    updatePreviousBalance,
    formatWalletCurrency,
  } = paymentStore;

  return {
    updateAutoPayments,
    isAutomaticPaymentsEnabled,
    upToBalanceError,
    minBalanceError,
    upToBalance,
    minBalance,
    updatePreviousBalance,
    formatWalletCurrency,
  };
})(observer(WalletRefilledModal));
