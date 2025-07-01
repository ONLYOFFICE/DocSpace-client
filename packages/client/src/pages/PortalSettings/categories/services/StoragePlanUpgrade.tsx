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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { updateWalletPayment } from "@docspace/shared/api/portal";
import { calculateTotalPrice } from "@docspace/shared/utils/common";

import { STORAGE_TARIFF_DEACTIVATED } from "@docspace/shared/constants";
import styles from "./styles/index.module.scss";
import StorageSummary from "./sub-components/StorageSummary";
import { useServicesActions } from "./hooks/useServicesActions";
import { PaymentProvider } from "./context/PaymentContext";
import ButtonContainer from "./sub-components/ButtonContainer";

import StorageInformation from "./sub-components/StorageInformation";
import WalletContainer from "./sub-components/WalletContainer";
import SalesDepartmentRequestDialog from "../../../../components/dialogs/SalesDepartmentRequestDialog";
import TopUpContainer from "./sub-components/TopUpContainer";
import SelectionAmount from "./sub-components/SelectionAmount";

type StorageDialogProps = {
  visible: boolean;
  onClose: () => void;
  storagePriceIncrement?: number;
  hasStorageSubscription?: boolean;
  currentStoragePlanSize?: number;
  fetchPortalTariff?: (
    force?: boolean,
  ) => Promise<{ walletQuotas: { quantity: number; nextQuantity?: number }[] }>;
  fetchBalance?: () => Promise<void>;
  isVisibleWalletSettings?: boolean;
  setVisibleWalletSetting?: (value: boolean) => void;
  partialUpgradeFee?: number;
  featureCountData?: number;
  setPartialUpgradeFee?: (value: number) => void;
  hasScheduledStorageChange?: number;
  previousValue?: number;
};

const MAX_ATTEMPTS = 30;
const MIN_VALUE = 100;

const StoragePlanUpgrade: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  hasStorageSubscription,
  currentStoragePlanSize,
  fetchPortalTariff,
  fetchBalance,
  storagePriceIncrement,
  isVisibleWalletSettings,
  setVisibleWalletSetting,
  partialUpgradeFee,
  featureCountData,
  setPartialUpgradeFee,
  hasScheduledStorageChange,
  previousValue,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState<number>(
    isVisibleWalletSettings
      ? featureCountData
      : previousValue || currentStoragePlanSize,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleContainer, setIsVisibleContainer] = useState(
    isVisibleWalletSettings,
  );
  const [isRequestDialog, setIsRequestDialog] = useState(false);

  const {
    isExceedingPlanLimit,
    isCurrentPlan,
    calculateDifferenceBetweenPlan,
    isWalletBalanceInsufficient,
    isPlanUpgrade,
    buttonTitle,
    isPlanDowngrade,
  } = useServicesActions();

  const isExceedingStorageLimit = isExceedingPlanLimit(amount);
  const isCurrentStoragePlan = isCurrentPlan(amount);
  const totalPrice = calculateTotalPrice(amount, storagePriceIncrement);

  const isUpgradeStoragePlan = isPlanUpgrade(amount);
  const isDowngradeStoragePlan = isPlanDowngrade(amount);
  const newStorageSizeOnUpgrade =
    isUpgradeStoragePlan && currentStoragePlanSize > 0;

  const isPaymentBlockedByBalance = newStorageSizeOnUpgrade
    ? isWalletBalanceInsufficient(partialUpgradeFee)
    : isWalletBalanceInsufficient(totalPrice);

  const buttonMainTitle = buttonTitle(amount);
  const isPaymentBlocked =
    !hasScheduledStorageChange && amount < MIN_VALUE && amount !== 0;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWaitingRef = useRef(false);

  const amountRef = useRef(amount);
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPartialUpgradeFee(0);
    };
  }, []);

  const onCloseDialog = useCallback(() => {
    onClose();
  }, []);

  const resetIntervalSuccess = async (isCancellation: boolean) => {
    if (isUpgradeStoragePlan) onCloseDialog();

    if (isCancellation || !isUpgradeStoragePlan)
      setAmount(currentStoragePlanSize);

    if (intervalRef.current) {
      toastr.success(t("StorageCapacityUpdated"));
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (localStorage.getItem(STORAGE_TARIFF_DEACTIVATED) !== null) {
      localStorage.removeItem(STORAGE_TARIFF_DEACTIVATED);
    }

    setIsLoading(false);
  };

  const isUpdatedTariff = (
    walletQuotas: { quantity: number; nextQuantity?: number }[],
    isCancellation: boolean,
  ) => {
    const walletQuantity =
      isUpgradeStoragePlan || isCancellation
        ? walletQuotas[0]?.quantity
        : walletQuotas[0]?.nextQuantity;

    const updated = isCancellation
      ? !walletQuotas[0]?.nextQuantity
      : walletQuantity === amountRef.current;

    return updated;
  };

  const waitingForTariff = useCallback(
    (isCancellation: boolean) => {
      isWaitingRef.current = false;
      let requestsCount = 0;

      intervalRef.current = setInterval(async () => {
        try {
          if (requestsCount === MAX_ATTEMPTS) {
            setIsLoading(false);
            toastr.error(t("ErrorNotification"));
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            return;
          }

          requestsCount++;

          if (isWaitingRef.current) return;
          isWaitingRef.current = true;

          const { walletQuotas } = await fetchPortalTariff(true);

          if (isUpdatedTariff(walletQuotas, isCancellation)) {
            resetIntervalSuccess(isCancellation);
          }
        } catch (e) {
          setIsLoading(false);
          toastr.error(e);
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } finally {
          isWaitingRef.current = false;
        }
      }, 2000);
    },
    [isUpgradeStoragePlan],
  );

  const handleStoragePlanChange = useCallback(
    async (isCancellation: boolean = false) => {
      if (isLoading) return;

      setIsLoading(true);

      const amountValue = amountRef.current;
      const difference = calculateDifferenceBetweenPlan(amountValue);
      const productType = isUpgradeStoragePlan && !isCancellation ? 1 : 0;
      const quantity = isUpgradeStoragePlan ? difference : amountValue;
      const value = isCancellation ? null : quantity;

      try {
        const res = await updateWalletPayment(value, productType);

        if (res === false) {
          throw new Error(t("Common:UnexpectedError"));
        }

        if (isUpgradeStoragePlan) fetchBalance!();
        const { walletQuotas } = await fetchPortalTariff(true);

        if (isUpdatedTariff(walletQuotas, isCancellation)) {
          resetIntervalSuccess(isCancellation);
        } else {
          waitingForTariff(isCancellation);
        }
      } catch (e) {
        toastr.error(e);
        setIsLoading(false);
      }
    },
    [isLoading, isUpgradeStoragePlan],
  );

  const onBuy = useCallback(
    () => handleStoragePlanChange(),
    [handleStoragePlanChange],
  );

  const onCancelChange = useCallback(
    () => handleStoragePlanChange(true),
    [handleStoragePlanChange],
  );

  const onSendRequest = useCallback(() => {
    setIsRequestDialog(true);
  }, []);

  const onTopUpClick = useCallback(() => {
    setIsVisibleContainer(true);
  }, []);

  const onChangeNumber = (value: number) => {
    setAmount(value);
  };

  const onCloseTopUpModal = () => {
    setIsVisibleContainer(false);
    if (isVisibleWalletSettings) setVisibleWalletSetting(false);
  };

  const container = isVisibleContainer ? (
    <TopUpContainer
      isVisibleContainer={isVisibleContainer}
      onCloseTopUpModal={onCloseTopUpModal}
    />
  ) : null;

  if (isRequestDialog) {
    return (
      <SalesDepartmentRequestDialog
        visible={isRequestDialog}
        onClose={() => setIsRequestDialog(false)}
      />
    );
  }

  return (
    <PaymentProvider>
      <ModalDialog
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.aside}
        containerVisible={isVisibleContainer}
        withBodyScroll
      >
        <ModalDialog.Container>{container}</ModalDialog.Container>
        <ModalDialog.Header>{t("DiskStorage")}</ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.dialogBody}>
            <StorageInformation />

            <SelectionAmount
              amount={amount}
              onChangeNumber={onChangeNumber}
              isLoading={isLoading}
              isPaymentBlockedByBalance={isPaymentBlockedByBalance}
              totalPrice={totalPrice}
              newStorageSizeOnUpgrade={newStorageSizeOnUpgrade}
              isUpgradeStoragePlan={isUpgradeStoragePlan}
            />

            {!isPaymentBlocked && (amount || hasStorageSubscription) ? (
              <div className={styles.totalContainer}>
                <StorageSummary
                  amount={amount}
                  totalPrice={totalPrice}
                  isExceedingStorageLimit={isExceedingStorageLimit}
                  isCurrentStoragePlan={isCurrentStoragePlan}
                  onCancelChange={onCancelChange}
                  isUpgradeStoragePlan={isUpgradeStoragePlan}
                />
              </div>
            ) : null}

            {!isPaymentBlocked && (amount || hasStorageSubscription) ? (
              <WalletContainer
                onTopUp={onTopUpClick}
                isPaymentBlockedByBalance={isPaymentBlockedByBalance}
                isExceedingStorageLimit={isExceedingStorageLimit}
                isCurrentStoragePlan={isCurrentStoragePlan}
                isDowngradeStoragePlan={isDowngradeStoragePlan}
                isLoading={isLoading}
              />
            ) : null}
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ButtonContainer
            title={buttonMainTitle}
            isCurrentStoragePlan={isCurrentStoragePlan}
            isExceedingStorageLimit={isExceedingStorageLimit}
            onClose={onCloseDialog}
            isLoading={isLoading}
            onBuy={onBuy}
            onSendRequest={onSendRequest}
            isNullAmount={amount === 0}
            isPaymentBlockedByBalance={isPaymentBlockedByBalance}
            isDowngradeStoragePlan={isDowngradeStoragePlan}
            isPaymentBlocked={isPaymentBlocked}
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </PaymentProvider>
  );
};

export default inject(
  ({ paymentStore, currentTariffStatusStore, servicesStore }: TStore) => {
    const {
      fetchPortalTariff,
      hasStorageSubscription,
      currentStoragePlanSize,
      hasScheduledStorageChange,
    } = currentTariffStatusStore;

    const { fetchBalance, storagePriceIncrement } = paymentStore;
    const {
      isVisibleWalletSettings,
      setVisibleWalletSetting,
      partialUpgradeFee,
      featureCountData,
      setPartialUpgradeFee,
    } = servicesStore;

    return {
      hasStorageSubscription,
      currentStoragePlanSize,
      fetchPortalTariff,
      fetchBalance,
      storagePriceIncrement,
      setVisibleWalletSetting,
      isVisibleWalletSettings,
      partialUpgradeFee,
      featureCountData,
      setPartialUpgradeFee,
      hasScheduledStorageChange,
    };
  },
)(observer(StoragePlanUpgrade));
