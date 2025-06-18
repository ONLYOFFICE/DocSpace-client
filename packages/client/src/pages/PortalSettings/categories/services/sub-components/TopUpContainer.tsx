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

import { inject, observer } from "mobx-react";

import { useEffect } from "react";

import TopUpModal from "../../payments/Wallet/TopUpModal";
import { useServicesActions } from "../hooks/useServicesActions";

type TopUpContainerTypes = {
  totalPrice: number;
  isVisibleContainer: boolean;
  onCloseTopUpModal: () => void;
  newStorageSizeOnUpgrade: boolean;
  partialUpgradeFee?: number;
  walletBalance?: number;
  setReccomendedAmount?: (amount: number) => void;
  reccomendedAmount?: number;
  isVisibleWalletSettings?: boolean;
};

const TopUpContainer = (props: TopUpContainerTypes) => {
  const {
    isVisibleContainer,
    onCloseTopUpModal,
    newStorageSizeOnUpgrade,
    partialUpgradeFee,
    totalPrice,
    walletBalance,
    setReccomendedAmount,
    reccomendedAmount,
    isVisibleWalletSettings,
  } = props;
  const { formatWalletCurrency } = useServicesActions();
  const amountValue = newStorageSizeOnUpgrade ? partialUpgradeFee : totalPrice;
  const difference = Math.abs(walletBalance - amountValue);

  useEffect(() => {
    if (isVisibleContainer && !isVisibleWalletSettings) {
      setReccomendedAmount(Math.ceil(difference));
    }
  }, [isVisibleContainer, difference, setReccomendedAmount]);

  return isVisibleContainer ? (
    <TopUpModal
      visible={isVisibleContainer}
      onClose={onCloseTopUpModal}
      headerProps={{
        isBackButton: true,
        onBackClick: onCloseTopUpModal,
        onCloseClick: onCloseTopUpModal,
      }}
      reccomendedAmount={formatWalletCurrency(reccomendedAmount, 0, 0)}
    />
  ) : null;
};

export default inject(
  ({ servicesStore, currentTariffStatusStore, paymentStore }: TStore) => {
    const {
      partialUpgradeFee,
      setReccomendedAmount,
      reccomendedAmount,
      isVisibleWalletSettings,
    } = servicesStore;
    const { currentStoragePlanSize } = currentTariffStatusStore;
    const { walletBalance } = paymentStore;
    return {
      partialUpgradeFee,
      currentStoragePlanSize,
      walletBalance,
      setReccomendedAmount,
      reccomendedAmount,
      isVisibleWalletSettings,
    };
  },
)(observer(TopUpContainer));
