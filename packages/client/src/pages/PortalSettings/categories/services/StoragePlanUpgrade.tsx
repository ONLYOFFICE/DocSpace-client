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
import QuantityPicker from "@docspace/shared/components/quantity-picker";
import { useInterfaceDirection } from "@docspace/shared/hooks/useInterfaceDirection";
import { getConvertedSize } from "@docspace/shared/utils/common";

import styles from "./styles/index.module.scss";
import StorageSummary from "./sub-components/StorageSummary";
import TopUpModal from "../payments/Wallet/TopUpModal";
import { useServicesActions } from "./hooks/useServicesActions";
import { PaymentProvider } from "./context/PaymentContext";
import ButtonContainer from "./sub-components/ButtonContainer";
import { calculateTotalPrice } from "./hooks/resourceUtils";
import StorageInformation from "./sub-components/StorageInformation";
import WalletContainer from "./sub-components/WalletContainer";
import SalesDepartmentRequestDialog from "../../../../components/dialogs/SalesDepartmentRequestDialog";

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
  handleServicesQuotas?: () => Promise<void>;
  hasScheduledStorageChange?: boolean;
  nextStoragePlanSize?: number;
  storageSizeIncrement?: number;
  isVisibleWalletSettings?: boolean;
};

const MAX_ATTEMPTS = 30;

const StoragePlanUpgrade: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  hasStorageSubscription,
  currentStoragePlanSize,
  fetchPortalTariff,
  fetchBalance,
  hasScheduledStorageChange,
  storagePriceIncrement,
  nextStoragePlanSize,
  handleServicesQuotas,
  storageSizeIncrement,
  isVisibleWalletSettings,
  setVisibleWalletSetting,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState<number>(currentStoragePlanSize);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisibleContainer, setIsVisibleContainer] = useState(
    isVisibleWalletSettings,
  );
  const [isRequestDialog, setIsRequestDialog] = useState(false);

  const {
    maxStorageLimit,
    isExceedingPlanLimit,
    isCurrentPlan,
    calculateDifferenceBetweenPlan,
    isWalletBalanceInsufficient,
    isPlanUpgrade,
    formatWalletCurrency,
    buttonTitle,
  } = useServicesActions();

  const { isRTL } = useInterfaceDirection();

  const isExceedingStorageLimit = isExceedingPlanLimit(amount);
  const isCurrentStoragePlan = isCurrentPlan(amount);
  const totalPrice = calculateTotalPrice(amount, storagePriceIncrement);
  const insufficientFunds = isWalletBalanceInsufficient(totalPrice);
  const isUpgradeStoragePlan = isPlanUpgrade(amount);
  const buttonMainTitle = buttonTitle(amount);

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
    };
  }, []);

  const onCloseDialog = useCallback(() => {
    onClose();
  }, []);

  const resetIntervalSuccess = async (isCancellation) => {
    await handleServicesQuotas()!;

    if (isCancellation || !isUpgradeStoragePlan)
      setAmount(currentStoragePlanSize);

    if (intervalRef.current) {
      toastr.success(t("StorageCapacityUpdated"));
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsLoading(false);
  };

  const waitingForTariff = useCallback(
    (isCancellation) => {
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

          const walletQuantity =
            isUpgradeStoragePlan || isCancellation
              ? walletQuotas[0]?.quantity
              : walletQuotas[0]?.nextQuantity;

          const updated = isCancellation
            ? !walletQuotas[0]?.nextQuantity
            : walletQuantity === amountRef.current;

          if (updated) {
            resetIntervalSuccess(isCancellation);
            if (isUpgradeStoragePlan) onCloseDialog();
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
    async (isCancellation = false) => {
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
          toastr.error(t("Common:UnexpectedError"));

          setIsLoading(false);

          return;
        }

        if (isUpgradeStoragePlan) fetchBalance!();
        waitingForTariff(isCancellation);
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        toastr.error(errorMessage);
      }
    },
    [isLoading, isUpgradeStoragePlan],
  );

  const onBuy = useCallback(
    () => handleStoragePlanChange(),
    [handleStoragePlanChange],
  );

  const onCancelChange = () => handleStoragePlanChange(true);

  const onSendRequest = useCallback(() => {
    setIsRequestDialog(true);
  }, []);

  const onChangeNumber = (value: number) => {
    setAmount(value);
  };

  const onCloseTopUpModal = () => {
    setIsVisibleContainer(false);
    if (isVisibleWalletSettings) setVisibleWalletSetting(false);
  };

  const container = isVisibleContainer ? (
    <TopUpModal
      visible={isVisibleContainer}
      onClose={onCloseTopUpModal}
      headerProps={{
        isBackButton: true,
        onBackClick: onCloseTopUpModal,
        onCloseClick: onCloseTopUpModal,
      }}
    />
  ) : null;

  const amountTabs = () => {
    const amounts = [100, 200, 500, 1024];
    return amounts.map((item) => {
      const name =
        item > 800
          ? `1 ${t("Common:Terabyte")}`
          : `${item} ${t("Common:Gigabyte")}`;
      return { value: item, name };
    });
  };

  if (isRequestDialog) {
    return (
      <SalesDepartmentRequestDialog
        visible={isRequestDialog}
        onClose={() => setIsRequestDialog(false)}
      />
    );
  }

  const getDirectionalText = (from: number, to: number) => {
    return isRTL ? `${from} ← ${to}` : `${from} → ${to}`;
  };

  const disableValueProps = hasScheduledStorageChange
    ? {
        disableValue: getDirectionalText(
          currentStoragePlanSize,
          nextStoragePlanSize,
        ),
      }
    : {};

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

            <QuantityPicker
              className="select-users-count-container"
              value={amount}
              minValue={0}
              maxValue={maxStorageLimit}
              step={1}
              title={t("ExtraStorage", { storageUnit: t("Common:Gigabyte") })}
              showPlusSign
              onChange={onChangeNumber}
              isDisabled={hasScheduledStorageChange || isLoading}
              items={amountTabs()}
              withoutContorls={hasScheduledStorageChange}
              underContorlsTitle={t("PerStorage", {
                currency: formatWalletCurrency(storagePriceIncrement),
                amount: getConvertedSize(t, storageSizeIncrement || 0),
              })}
              {...disableValueProps}
              isLarge
            />

            {amount || hasStorageSubscription ? (
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

            {amount || hasStorageSubscription ? (
              <WalletContainer
                onTopUp={() => setIsVisibleContainer(true)}
                insufficientFunds={insufficientFunds}
                isExceedingStorageLimit={isExceedingStorageLimit}
                isUpgradeStoragePlan={isUpgradeStoragePlan}
              />
            ) : null}
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ButtonContainer
            title={buttonMainTitle}
            isCurrentStoragePlan={isCurrentStoragePlan}
            isUpgradeStoragePlan={isUpgradeStoragePlan}
            insufficientFunds={insufficientFunds}
            isExceedingStorageLimit={isExceedingStorageLimit}
            onClose={onCloseDialog}
            isLoading={isLoading}
            onBuy={onBuy}
            onSendRequest={onSendRequest}
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
      hasScheduledStorageChange,
      hasStorageSubscription,
      currentStoragePlanSize,
      nextStoragePlanSize,
    } = currentTariffStatusStore;

    const { fetchBalance, walletBalance } = paymentStore;
    const {
      storageSizeIncrement,
      storagePriceIncrement,
      handleServicesQuotas,
      isVisibleWalletSettings,
      setVisibleWalletSetting,
    } = servicesStore;

    return {
      storageSizeIncrement,
      hasStorageSubscription,
      currentStoragePlanSize,
      fetchPortalTariff,
      fetchBalance,
      walletBalance,
      hasScheduledStorageChange,
      storagePriceIncrement,
      nextStoragePlanSize,
      handleServicesQuotas,
      setVisibleWalletSetting,
      isVisibleWalletSettings,
    };
  },
)(observer(StoragePlanUpgrade));
