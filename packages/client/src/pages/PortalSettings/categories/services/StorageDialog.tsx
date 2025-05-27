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
import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import { Text } from "@docspace/shared/components/text";
import { getConvertedSize } from "@docspace/shared/utils/common";
import { toastr } from "@docspace/shared/components/toast";
import { buyStorage } from "@docspace/shared/api/portal";
import QuantityPicker from "@docspace/shared/components/select-count-container";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import styles from "./styles/index.module.scss";
import Amount from "./Amount";
import Total from "./Total";
import TopUpModal from "../payments/Wallet/TopUpModal";

import { formatCurrencyValue } from "../payments/Wallet/utils";

type StorageDialogProps = {
  visible: boolean;
  onClose: () => void;
  usedTotalStorageSizeCount?: number;
  maxTotalSizeByQuota?: number;
  usedTotalStorageSizeTitle?: string;
  walletBalance?: number;
  stepValue?: number;
  isTariffExist?: boolean;
  currentStorageQuantity?: number;
  isoCurrencySymbol?: string;
  language?: string;
  fetchPortalTariff?: () => void;
  fetchBalance?: () => void;
};

const StorageDialog: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  usedTotalStorageSizeCount = 0,
  maxTotalSizeByQuota,
  usedTotalStorageSizeTitle,
  walletBalance = 0,
  stepValue = 0,
  isTariffExist,
  currentStorageQuantity,
  isoCurrencySymbol,
  language,
  fetchPortalTariff,
  fetchBalance,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleContainer, setIsVisible] = useState(false);

  const maxValue = 9999;
  const moreThanLimit = amount > maxValue;
  const isUpgrade = amount >= currentStoragePlanSize;

  const onBuy = async () => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    try {
      const res = await buyStorage(amount, 1);

      if (res === false) {
        toastr.error(t("Common:UnexpectedError"));

        clearTimeout(timerId);
        setIsLoading(false);

        return;
      }

      await Promise.all([fetchPortalTariff!(), fetchBalance!()]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      toastr.error(errorMessage);
    }

    clearTimeout(timerId);
    setIsLoading(false);
  };

  const totalPrice = () => {
    return (parseFloat(amount || "0") * stepValue).toFixed(2);
  };

  const currentPrice = () => {
    return (currentStorageQuantity! * stepValue).toFixed(2);
  };

  const isInsufficientFunds = (walletBalance || 0) < parseFloat(totalPrice());
  const totalStoragePrice = totalPrice();
  const isButtonDisabled = !amount || isInsufficientFunds;

  const container = (
    <TopUpModal
      visible={isVisibleContainer}
      onClose={() => setIsVisible(false)}
      headerProps={{
        isBackButton: true,
        onBackClick: () => setIsVisible(false),
        onCloseClick: () => setIsVisible(false),
      }}
    />
  );

  const onChangeNumber = (value: number) => {
    setAmount(value);
  };


  return (
    <ModalDialog
      visible={visible}
      onClose={onClose}
      displayType={ModalDialogType.aside}
      containerVisible={isVisibleContainer}
    >
      <ModalDialog.Container>{container}</ModalDialog.Container>
      <ModalDialog.Header>{t("DiskStorage")}</ModalDialog.Header>
      <ModalDialog.Body>
        <div className={styles.dialogBody}>
          <div className={styles.storageInfo}>
            <Text isBold noSelect fontSize="14px">
              {usedTotalStorageSizeTitle}{" "}
              <Text
                className={styles.currentTariffCount}
                as="span"
                isBold
                fontSize="14px"
              >
                {getConvertedSize(t, usedTotalStorageSizeCount)}
                {maxTotalSizeByQuota
                  ? `/${getConvertedSize(t, maxTotalSizeByQuota)}`
                  : ""}
              </Text>
            </Text>
          </div>

          <QuantityPicker
            className="select-users-count-container"
            value={amount}
            minValue={0}
            maxValue={maxValue}
            step={1}
            title={"Additional storage (GB)"}
            showPlusSign
            onChange={onChangeNumber}
          />

          {amount || hasStorageSubscription ? (
            <div className={styles.totalContainer}>
              <Total
                amount={amount}
                isInsufficientFunds={isInsufficientFunds}
                totalPrice={parseFloat(totalStoragePrice)}
                onTopUp={() => setIsVisible(true)}
              />
            </div>
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={t("Buy")}
          size={ButtonSize.normal}
          primary
          scale
          isDisabled={isButtonDisabled}
          onClick={onBuy}
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

export default inject(
  ({
    currentQuotaStore,
    paymentStore,
    currentTariffStatusStore,
    authStore,
  }: TStore) => {
    const {
      usedTotalStorageSizeCount,
      usedTotalStorageSizeTitle,
      maxTotalSizeByQuota,
    } = currentQuotaStore;
    const { walletQuotas, fetchPortalTariff } = currentTariffStatusStore;
    const {
      walletCodeCurrency,
      storageQuotaIncrementPrice,
      fetchBalance,
      walletBalance,
    } = paymentStore;
    const { value, isoCurrencySymbol } = storageQuotaIncrementPrice;
    const { language } = authStore;
    const isTariffExist = walletQuotas?.length > 0;
    const currentStorageQuantity =
      (isTariffExist && walletQuotas[0]?.quantity) || 0;

    return {
      usedTotalStorageSizeCount,
      usedTotalStorageSizeTitle,
      maxTotalSizeByQuota,
      walletCodeCurrency,
      storageQuotaIncrementPrice,
      language,
      stepValue: value,
      isTariffExist,
      currentStorageQuantity,
      isoCurrencySymbol,
      fetchPortalTariff,
      fetchBalance,
      walletBalance,
    };
  },
)(observer(StorageDialog));
