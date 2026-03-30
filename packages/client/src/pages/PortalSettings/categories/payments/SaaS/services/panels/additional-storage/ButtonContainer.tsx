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
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import { useServicesActions } from "../../hooks/useServicesActions";
import { usePaymentContext } from "../../context/PaymentContext";

import styles from "../../styles/index.module.scss";
import { Text } from "@docspace/ui-kit/components";
interface ButtonContainerProps {
  onClose: () => void;
  onBuy: () => void;
  onSendRequest: () => void;
  isLoading: boolean;
  isExceedingStorageLimit: boolean;
  isPaymentBlockedByBalance: boolean;
  isCurrentStoragePlan?: boolean;
  hasStorageSubscription?: boolean;
  isPaymentBlocked?: boolean;
  formatWalletCurrency?: (amount?: number, fractionDigits?: number) => string;
  storageExpiryDate?: string;
  totalPrice?: number;
  isDisabled?: boolean;
  currentStoragePlanSize?: number;
  isDowngradeStoragePlan?: boolean;
}

const ButtonContainer: React.FC<ButtonContainerProps> = (props) => {
  const {
    isExceedingStorageLimit,
    onClose,
    isLoading,
    onBuy,
    onSendRequest,
    isPaymentBlockedByBalance,
    isCurrentStoragePlan,
    hasStorageSubscription,
    isPaymentBlocked,
    storageExpiryDate,
    totalPrice = 0,
    formatWalletCurrency,
    isDowngradeStoragePlan,
    isDisabled,
  } = props;

  const { t } = useServicesActions();
  const { isWaitingCalculation } = usePaymentContext();

  const title = !hasStorageSubscription
    ? t("Buy")
    : isExceedingStorageLimit
      ? t("Common:SendRequest")
      : t("Common:Update");

  return (
    <div className={styles.buttonWrapper}>
      {hasStorageSubscription &&
      !isDowngradeStoragePlan &&
      !isCurrentStoragePlan &&
      !isPaymentBlocked &&
      !isExceedingStorageLimit &&
      totalPrice > 0 ? (
        <Text>
          {t("Services:NextMonthBillDate", {
            currency: formatWalletCurrency!(totalPrice, 2),
            date: storageExpiryDate,
          })}
        </Text>
      ) : null}

      <div className={styles.buttonContainer}>
        <Button
          key="OkButton"
          label={title}
          size={ButtonSize.normal}
          primary
          scale
          onClick={isExceedingStorageLimit ? onSendRequest : onBuy}
          isLoading={isLoading}
          isDisabled={
            isPaymentBlocked ||
            isPaymentBlockedByBalance ||
            isCurrentStoragePlan ||
            isDisabled ||
            isWaitingCalculation
          }
          testId="storage_plan_upgrade_ok_button"
        />
        <Button
          key="CancelButton"
          label={t("Common:CancelButton")}
          size={ButtonSize.normal}
          scale
          onClick={onClose}
          isDisabled={isLoading}
          testId="storage_plan_upgrade_cancel_button"
        />
      </div>
    </div>
  );
};

export default inject(({ currentTariffStatusStore, paymentStore }: TStore) => {
  const { hasStorageSubscription, storageExpiryDate } =
    currentTariffStatusStore;
  const { formatWalletCurrency } = paymentStore;
  return {
    hasStorageSubscription,
    storageExpiryDate,
    formatWalletCurrency,
  };
})(observer(ButtonContainer));

