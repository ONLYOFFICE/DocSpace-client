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
import { useTranslation } from "react-i18next";

import { Button, ButtonSize } from "@docspace/shared/components/button";
import { toastr } from "@docspace/shared/components/toast";
import { saveDeposite } from "@docspace/shared/api/portal";
import { Text } from "@docspace/shared/components/text";

import { useAmountValue } from "../context";
import styles from "../styles/TopUpModal.module.scss";

interface TopUpButtonsProps {
  currency: string;
  setIsLoading: (value: boolean) => void;
  isLoading: boolean;
  fetchBalance?: () => Promise<void>;
  fetchTransactionHistory?: () => Promise<void>;
  onClose: () => void;
  walletCustomerEmail?: boolean;
  walletCustomerStatusNotActive?: boolean;
}

const TopUpButtons: React.FC<TopUpButtonsProps> = ({
  currency,
  fetchBalance,
  fetchTransactionHistory,
  onClose,
  walletCustomerEmail,
  setIsLoading,
  isLoading,
  walletCustomerStatusNotActive,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const { amount } = useAmountValue();

  const isButtonDisabled =
    walletCustomerStatusNotActive || !amount || !walletCustomerEmail;

  const onTopUp = async () => {
    try {
      setIsLoading(true);

      const res = await saveDeposite(+amount, currency);

      if (!res) {
        throw new Error(t("Common:UnexpectedError"));
      }

      await Promise.allSettled([fetchBalance!(), fetchTransactionHistory!()]);

      toastr.success(t("WalletToppedUp"));
      onClose();
    } catch (e) {
      toastr.error(e as unknown as string);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.buttonContainerWrapper}>
      {isLoading ? <Text>{t("TopUpTakeSomeTimeToComplete")}</Text> : null}
      <div className={styles.buttonContainer}>
        <Button
          key="OkButton"
          label={t("TopUp")}
          size={ButtonSize.normal}
          primary
          scale
          isDisabled={isButtonDisabled}
          onClick={onTopUp}
          isLoading={isLoading}
          testId="top_up_button"
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="cancel_top_up_button"
        />
      </div>
    </div>
  );
};

export default TopUpButtons;
