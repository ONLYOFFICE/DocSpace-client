// (c) Copyright Ascensio System SIA 2009-2026
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

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { toastr } from "@docspace/ui-kit/components/toast";

import { Text } from "@docspace/ui-kit/components/text";

import { useAmountValue } from "../../../wallet/context";
import styles from "../styles/TopUpModal.module.scss";
import { AI_TOOLS } from "@docspace/shared/constants";
import { inject, observer } from "mobx-react";
import { DateTime } from "luxon";

interface TopUpButtonsProps {
  currency: string;
  setIsLoading: (value: boolean) => void;
  isLoading: boolean;
  fetchBalance?: () => Promise<void>;
  fetchServiceBalance?: () => Promise<void>;
  fetchTransactionHistory?: (
    startDate: DateTime | null,
    endDate: DateTime | null,
    credit: boolean,
    debit: boolean,
    participantName?: string,
    serviceName?: string,
  ) => Promise<void>;
  onClose: (isTopUp: boolean) => void;
  walletCustomerEmail?: string;
  walletCustomerStatusNotActive?: boolean;
  onTopUpBalance: (amount: number, currency: string) => Promise<string>;
  serviceName?: string;
  afterTopUp?: () => void;
  logoText?: string;
  handleServicesQuotas?: (serviceName: string) => Promise<void>;
}

const TopUpButtons: React.FC<TopUpButtonsProps> = ({
  currency,
  fetchBalance,
  fetchServiceBalance,
  fetchTransactionHistory,
  onClose,
  walletCustomerEmail,
  setIsLoading,
  isLoading,
  walletCustomerStatusNotActive,
  onTopUpBalance,
  serviceName,
  afterTopUp,
  logoText,
  handleServicesQuotas,
}) => {
  const { t } = useTranslation(["Payments", "Services", "Common"]);

  const { amount, isBalanceInsufficient, hasError } = useAmountValue();

  const isButtonDisabled =
    walletCustomerStatusNotActive ||
    !amount ||
    !walletCustomerEmail ||
    isBalanceInsufficient ||
    hasError;

  const onTopUp = async () => {
    try {
      setIsLoading(true);

      const res = await onTopUpBalance(+amount, serviceName ?? currency);

      if (!res) {
        throw new Error(t("Common:UnexpectedError"));
      }

      const requests = [
        fetchBalance!(),
        fetchTransactionHistory!(null, null, true, true, "", serviceName),
      ];

      if (serviceName) {
        requests.push(fetchServiceBalance!());
        requests.push(handleServicesQuotas!(AI_TOOLS));
      }

      await Promise.allSettled(requests);

      const toastMessage =
        serviceName === AI_TOOLS
          ? t("Services:AIServiceToppedUp", { organizationName: logoText })
          : t("WalletToppedUp");

      toastr.success(toastMessage);
      afterTopUp ? afterTopUp() : onClose(true);
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
          onClick={() => onClose(false)}
          isDisabled={isLoading}
          testId="cancel_top_up_button"
        />
      </div>
    </div>
  );
};

export default inject(({ settingsStore, paymentStore }: TStore) => {
  const { logoText } = settingsStore;
  const { handleServicesQuotas } = paymentStore!;
  return {
    logoText,
    handleServicesQuotas,
  };
})(observer(TopUpButtons));

