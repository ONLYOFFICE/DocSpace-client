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
import { inject, observer } from "mobx-react";

import { Button, ButtonSize } from "@docspace/shared/components/button";

import { useServicesActions } from "../hooks/useServicesActions";
import { usePaymentContext } from "../context/PaymentContext";

interface ButtonContainerProps {
  onClose: () => void;
  onBuy: () => void;
  onSendRequest: () => void;
  isLoading: boolean;
  isExceedingStorageLimit: boolean;
  amount: number;
  insufficientFunds: boolean;
  isCurrentStoragePlan?: boolean;
  isUpgradeStoragePlan: boolean;
  currentStoragePlanSize?: boolean;
  hasStorageSubscription?: boolean;
}

const ButtonContainer: React.FC<ButtonContainerProps> = (props) => {
  const {
    isExceedingStorageLimit,
    onClose,
    isLoading,
    amount,
    insufficientFunds,
    isCurrentStoragePlan,
    isUpgradeStoragePlan,
    onBuy,
    onSendRequest,
    currentStoragePlanSize,
    hasStorageSubscription,
  } = props;

  const { buttonTitle, isWalletBalanceInsufficient, t } = useServicesActions();
  const { futurePayment, isWaitingCalculation } = usePaymentContext();

  const isPaymentUnavalable =
    isUpgradeStoragePlan && currentStoragePlanSize
      ? isWalletBalanceInsufficient(futurePayment)
      : insufficientFunds;

  return (
    <>
      <Button
        key="OkButton"
        label={buttonTitle(amount)}
        size={ButtonSize.normal}
        primary
        scale
        onClick={isExceedingStorageLimit ? onSendRequest : onBuy}
        isLoading={isLoading || isWaitingCalculation}
        isDisabled={
          !isExceedingStorageLimit
            ? (!hasStorageSubscription && amount === 0) ||
              isPaymentUnavalable ||
              isCurrentStoragePlan
            : false
        }
      />
      <Button
        key="CancelButton"
        label={t("Common:CancelButton")}
        size={ButtonSize.normal}
        scale
        onClick={onClose}
      />
    </>
  );
};

export default inject(({ currentTariffStatusStore }: TStore) => {
  const { hasStorageSubscription, currentStoragePlanSize } =
    currentTariffStatusStore;

  return {
    hasStorageSubscription,
    currentStoragePlanSize,
  };
})(observer(ButtonContainer));
