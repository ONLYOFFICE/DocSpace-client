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
import { updateWalletPayment } from "@docspace/shared/api/portal";
import QuantityPicker from "@docspace/shared/components/select-count-container";

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import styles from "./styles/index.module.scss";
import StorageSummary from "./sub-components/StorageSummary";
import TopUpModal from "../payments/Wallet/TopUpModal";
import { useServicesActions } from "./hooks/useServicesActions";

type StorageDialogProps = {
  visible: boolean;
  onClose: () => void;
  usedTotalStorageSizeCount?: number;
  maxTotalSizeByQuota?: number;
  usedTotalStorageSizeTitle?: string;
  walletBalance?: number;
  stepValue?: number;
  hasStorageSubscription?: boolean;
  currentStoragePlanSize?: number;
  fetchPortalTariff?: () => void;
  fetchBalance?: () => void;
  hasScheduledStorageChange?: boolean;
};

const StorageDialog: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  usedTotalStorageSizeCount = 0,
  maxTotalSizeByQuota,
  usedTotalStorageSizeTitle,
  hasStorageSubscription,
  currentStoragePlanSize,
  fetchPortalTariff,
  fetchBalance,
  hasScheduledStorageChange,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState<number>(currentStoragePlanSize);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleContainer, setIsVisible] = useState(false);

  const {
    maxStorageLimit,
    buttonTitle,
    isExceedingPlanLimit,
    isCurrentPlan,
    calculateDifferenceBetweenPlan,
  } = useServicesActions();

  const isExceedingStorageLimit = isExceedingPlanLimit(amount);
  const isCurrentStoragePlan = isCurrentPlan(amount);

  const handleStoragePlanChange = async (isCancellation = false) => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    const difference = calculateDifferenceBetweenPlan(amount);

    const productType = isCurrentStoragePlan ? 1 : 0;
    const value = isCancellation ? null : difference;

    try {
      const res = await updateWalletPayment(value, productType);

      if (res === false) {
        toastr.error(t("Common:UnexpectedError"));

        clearTimeout(timerId);
        setIsLoading(false);

        return;
      }

      const requests = [fetchPortalTariff!()];

      if (!isCancellation) requests.push(fetchBalance!());

      await Promise.all(requests);

      if (isCancellation) {
        setAmount(currentStoragePlanSize);

        fetchBalance!();
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      toastr.error(errorMessage);
    }

    clearTimeout(timerId);
    setIsLoading(false);
  };

  const onBuy = () => handleStoragePlanChange();
  const onCancelChange = () => handleStoragePlanChange(true);

  const onSendRequest = () => {};

  const onChangeNumber = (value: number) => {
    setAmount(value);
  };

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
            maxValue={maxStorageLimit}
            step={1}
            title={"Additional storage (GB)"}
            showPlusSign
            onChange={onChangeNumber}
            isDisabled={hasScheduledStorageChange}
            items={[
              { value: 100, name: `100 ${t("Common:Gigabyte")}` },
              { value: 200, name: `200 ${t("Common:Gigabyte")}` },
              { value: 500, name: `300 ${t("Common:Gigabyte")}` },
              { value: 800, name: `400 ${t("Common:Gigabyte")}` },
              { value: 1024, name: `1 ${t("Common:Terabyte")}` },
            ]}
          />

          {amount || hasStorageSubscription ? (
            <div className={styles.totalContainer}>
              <StorageSummary
                amount={amount}
                onTopUp={() => setIsVisible(true)}
                isExceedingStorageLimit={isExceedingStorageLimit}
                isCurrentStoragePlan={isCurrentStoragePlan}
                onCancelChange={onCancelChange}
              />
            </div>
          ) : null}
        </div>
      </ModalDialog.Body>
      <ModalDialog.Footer>
        <Button
          key="OkButton"
          label={buttonTitle(amount)}
          size={ButtonSize.normal}
          primary
          scale
          //  isDisabled={isButtonDisabled}
          onClick={isExceedingStorageLimit ? onSendRequest : onBuy}
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
    const {
      fetchPortalTariff,
      hasScheduledStorageChange,
      hasStorageSubscription,
      currentStoragePlanSize,
    } = currentTariffStatusStore;
    const {
      walletCodeCurrency,
      storageQuotaIncrementPrice,
      fetchBalance,
      walletBalance,
    } = paymentStore;
    const { value, isoCurrencySymbol } = storageQuotaIncrementPrice;
    const { language } = authStore;

    return {
      usedTotalStorageSizeCount,
      usedTotalStorageSizeTitle,
      maxTotalSizeByQuota,
      walletCodeCurrency,
      storageQuotaIncrementPrice,
      language,
      stepValue: value,
      hasStorageSubscription,
      currentStoragePlanSize,
      isoCurrencySymbol,
      fetchPortalTariff,
      fetchBalance,
      walletBalance,

      hasScheduledStorageChange,
    };
  },
)(observer(StorageDialog));
