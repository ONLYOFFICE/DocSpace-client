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

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { TextInput, InputType } from "@docspace/ui-kit/components/text-input";
import { FieldContainer } from "@docspace/ui-kit/components/field-container";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/ui-kit/components/modal-dialog";
import { toastr } from "@docspace/ui-kit/components/toast";
import { updateWalletPayment } from "@docspace/shared/api/portal";
import { calculateTotalPrice } from "@docspace/shared/utils/common";
import {
  STORAGE_DEACTIVATION_VISITED,
  STORAGE_TARIFF_DEACTIVATED,
} from "@docspace/shared/constants";
import { useNavigate } from "react-router";

import SalesDepartmentRequestDialog from "SRC_DIR/components/dialogs/SalesDepartmentRequestDialog";

import styles from "../../styles/index.module.scss";

import { useServicesActions } from "../../hooks/useServicesActions";
import { PaymentProvider } from "../../context/PaymentContext";
import ButtonContainer from "./ButtonContainer";

import CurrentSubscription from "./CurrentSubscription";
import OrderSummary from "./OrderSummary";
import WalletContainer from "./WalletContainer";
import TopUpContainer from "./TopUpContainer";
import StorageWarning from "./StorageWarning";

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
  partialUpgradeFee?: number;
  featureCountData?: number;
  setPartialUpgradeFee?: (value: number) => void;
  hasScheduledStorageChange?: number;
  previousValue?: string;
  storageExpiryDate?: string;
  formatWalletCurrency?: (amount?: number, fractionDigits?: number) => string;
  walletBalance?: number;
};

const MAX_ATTEMPTS = 30;
const MIN_VALUE = 100;

const StoragePlanUpgrade: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  hasStorageSubscription,
  currentStoragePlanSize = 0,
  fetchPortalTariff,
  fetchBalance,
  storagePriceIncrement,
  isVisibleWalletSettings,
  partialUpgradeFee,
  featureCountData = 0,
  setPartialUpgradeFee,
  hasScheduledStorageChange,
  previousValue = "",
  formatWalletCurrency,
  walletBalance = 0,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);
  const [amount, setAmount] = useState<string>(
    isVisibleWalletSettings
      ? featureCountData.toString()
      : previousValue
        ? previousValue
        : "",
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isVisibleContainer, setIsVisibleContainer] = useState(
    isVisibleWalletSettings,
  );
  const [isRequestDialog, setIsRequestDialog] = useState(false);
  const [debouncedAmount, setDebouncedAmount] = useState(amount);

  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      (setDebouncedAmount(amount), setIsWaiting(false));
    }, 1000);
    return () => clearTimeout(timer);
  }, [amount]);

  const {
    isExceedingPlanLimit,
    isCurrentPlan,
    calculateDifferenceBetweenPlan,
    isWalletBalanceInsufficient,
    isPlanUpgrade,
    isPlanDowngrade,
  } = useServicesActions();

  const isExceedingStorageLimit = isExceedingPlanLimit(+debouncedAmount);
  const isCurrentStoragePlan = isCurrentPlan(+debouncedAmount);
  const totalPrice = calculateTotalPrice(
    +debouncedAmount,
    storagePriceIncrement!,
  );

  const isUpgradeStoragePlan = isPlanUpgrade(+debouncedAmount);
  const isDowngradeStoragePlan = isPlanDowngrade(+debouncedAmount);
  const hasMinError = +debouncedAmount > 0 && +debouncedAmount < MIN_VALUE;
  const newStorageSizeOnUpgrade =
    isUpgradeStoragePlan && currentStoragePlanSize! > 0;

  const isPaymentBlockedByBalance =
    isDowngradeStoragePlan || isExceedingStorageLimit
      ? false
      : newStorageSizeOnUpgrade
        ? isWalletBalanceInsufficient(partialUpgradeFee!)
        : isWalletBalanceInsufficient(totalPrice);

  const isPaymentBlocked =
    (!hasScheduledStorageChange && +amount < MIN_VALUE && amount === "") ||
    +amount < MIN_VALUE;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWaitingRef = useRef(false);

  const reccomendedAmount = isPaymentBlockedByBalance
    ? hasStorageSubscription && isUpgradeStoragePlan
      ? Math.ceil(partialUpgradeFee! - walletBalance)
      : Math.ceil(totalPrice - walletBalance)
    : 0;

  const amountRef = useRef(amount);
  useEffect(() => {
    amountRef.current = amount;
  }, [amount]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setPartialUpgradeFee!(0);
    };
  }, []);

  const onCloseDialog = useCallback(() => {
    onClose();
  }, []);

  const resetIntervalSuccess = async (isCancellation: boolean) => {
    if (isUpgradeStoragePlan) onCloseDialog();

    if (isCancellation || !isUpgradeStoragePlan)
      setAmount(String(currentStoragePlanSize ?? ""));

    if (intervalRef.current) {
      toastr.success(t("StorageCapacityUpdated"));
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (localStorage.getItem(STORAGE_TARIFF_DEACTIVATED) !== null) {
      localStorage.removeItem(STORAGE_TARIFF_DEACTIVATED);
    }

    if (localStorage.getItem(STORAGE_DEACTIVATION_VISITED) !== null) {
      localStorage.removeItem(STORAGE_DEACTIVATION_VISITED);
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
      : walletQuantity === +amountRef.current;

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

          const { walletQuotas } = await fetchPortalTariff!(true);

          if (isUpdatedTariff(walletQuotas, isCancellation)) {
            resetIntervalSuccess(isCancellation);
          }
        } catch (e) {
          setIsLoading(false);
          toastr.error(e as unknown as string);
          clearInterval(intervalRef.current!);
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

      const amountValue = +amountRef.current;
      const difference = calculateDifferenceBetweenPlan(amountValue);
      const productType = isUpgradeStoragePlan && !isCancellation ? 1 : 0;
      const quantity = isUpgradeStoragePlan ? difference : amountValue;
      const value = isCancellation ? null : quantity;

      const isNewSubscription = !hasStorageSubscription;

      try {
        const res = await updateWalletPayment(value, productType);

        if (res === false) {
          throw new Error(t("Common:UnexpectedError"));
        }

        if (isNewSubscription) {
          const targetPath =
            "/portal-settings/payments/services/disk-storage?complete=true";

          if (!window.location.pathname.includes("/disk-storage")) {
            navigate(targetPath);
          }
          return;
        }

        if (isUpgradeStoragePlan) fetchBalance!();
        const { walletQuotas } = await fetchPortalTariff!(true);

        if (!walletQuotas) return;

        if (isUpdatedTariff(walletQuotas, isCancellation)) {
          resetIntervalSuccess(isCancellation);
        } else {
          waitingForTariff(isCancellation);
        }

        onClose();
      } catch (e) {
        toastr.error(e as Error);
        setIsLoading(false);
      }
    },
    [isLoading, isUpgradeStoragePlan],
  );

  const onBuy = useCallback(
    () => handleStoragePlanChange(),
    [handleStoragePlanChange],
  );

  const onSendRequest = useCallback(() => {
    setIsRequestDialog(true);
  }, []);

  const onTopUpClick = useCallback(() => {
    setIsVisibleContainer(true);
  }, []);

  const onChangeNumber = (value: string) => {
    setAmount(value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, validity } = e.target;

    if (!validity.valid) return;

    onChangeNumber(value);
    setIsWaiting(true);
  };

  const onCloseTopUpModal = () => {
    setIsVisibleContainer(false);
  };

  const container = isVisibleContainer ? (
    <TopUpContainer
      isVisibleContainer={isVisibleContainer}
      onCloseTopUpModal={onCloseTopUpModal}
      amount={+amount}
      initialAmount={reccomendedAmount}
    />
  ) : null;

  if (isRequestDialog) {
    return (
      <SalesDepartmentRequestDialog
        visible={isRequestDialog}
        onClose={() => setIsRequestDialog(false)}
        sendPaymentRequest={undefined}
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
        <ModalDialog.Header>
          {hasStorageSubscription
            ? t("Services:EditSubscription")
            : t("AdditionalDiskStorage")}
        </ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.dialogBody}>
            <WalletContainer
              onTopUp={onTopUpClick}
              isPaymentBlockedByBalance={isPaymentBlockedByBalance}
              isExceedingStorageLimit={isExceedingStorageLimit}
              isCurrentStoragePlan={isCurrentStoragePlan}
              isDowngradeStoragePlan={isDowngradeStoragePlan}
              isLoading={isLoading}
              hasMinError={hasMinError}
            />

            <div className={styles.inputSection}>
              <Text fontWeight={600}>
                {!hasStorageSubscription
                  ? t("Services:AmoutWithStorageUnit", {
                      storageUnit: t("Common:Gigabyte"),
                    })
                  : t("Services:NewTotalStorage", {
                      storageUnit: t("Common:Gigabyte"),
                    })}
              </Text>
              <FieldContainer
                isVertical
                errorMessage={
                  hasMinError
                    ? t("MinCurrency", {
                        currency: `${MIN_VALUE} ${t("Common:Gigabyte")}`,
                      })
                    : ""
                }
                hasError={hasMinError}
                removeMargin
              >
                <TextInput
                  className={styles.storageInput}
                  value={amount}
                  type={InputType.text}
                  onChange={handleInputChange}
                  onFocus={(e) => e.target.select()}
                  isDisabled={!!hasScheduledStorageChange || isLoading}
                  isAutoFocussed
                  hasError={hasMinError}
                  pattern="^(?!^0(?:\.\d{0,2})?$)\d+(?:\.\d{0,2})?$"
                  scale
                />
              </FieldContainer>
              {!hasMinError ? (
                <Text className={styles.perStorageInfo} fontSize="12px">
                  <Trans
                    t={t}
                    ns="Payments"
                    i18nKey="PerStorageWitnMinValue"
                    values={{
                      currency: formatWalletCurrency!(
                        storagePriceIncrement!,
                        2,
                      ),
                      amount: `1 ${t("Common:Gigabyte")}`,
                      minValue: MIN_VALUE,
                      storageUnit: t("Common:Gigabyte"),
                    }}
                    components={{
                      1: <Text as="span" fontSize="12px" fontWeight={600} />,
                    }}
                  />
                </Text>
              ) : null}
            </div>
            <div className={styles.dialogBodyContent}>
              {hasStorageSubscription && currentStoragePlanSize ? (
                <CurrentSubscription />
              ) : null}
              {(!isCurrentStoragePlan && debouncedAmount && !hasMinError) ||
              !hasStorageSubscription ? (
                <OrderSummary
                  amount={+debouncedAmount}
                  totalPrice={totalPrice}
                  isUpgradeStoragePlan={isUpgradeStoragePlan}
                  isDowngradeStoragePlan={isDowngradeStoragePlan}
                  reccomendedAmount={reccomendedAmount}
                  hasMinError={hasMinError}
                  isExceedingStorageLimit={isExceedingStorageLimit}
                />
              ) : null}
            </div>
            {isDowngradeStoragePlan && debouncedAmount && !hasMinError ? (
              <div className={styles.warningContainer}>
                <StorageWarning />
              </div>
            ) : null}
          </div>
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <ButtonContainer
            isDowngradeStoragePlan={isDowngradeStoragePlan}
            totalPrice={totalPrice}
            isCurrentStoragePlan={isCurrentStoragePlan}
            isExceedingStorageLimit={isExceedingStorageLimit}
            onClose={onCloseDialog}
            isLoading={isLoading}
            onBuy={onBuy}
            onSendRequest={onSendRequest}
            isPaymentBlockedByBalance={isPaymentBlockedByBalance}
            isPaymentBlocked={isPaymentBlocked}
            isDisabled={isWaiting}
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
      storageExpiryDate,
    } = currentTariffStatusStore;

    const {
      fetchBalance,
      storagePriceIncrement,
      formatWalletCurrency,
      walletBalance,
    } = paymentStore;
    const {
      isVisibleWalletSettings,
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
      isVisibleWalletSettings,
      partialUpgradeFee,
      featureCountData,
      setPartialUpgradeFee,
      hasScheduledStorageChange,
      storageExpiryDate,
      formatWalletCurrency,
      walletBalance,
    };
  },
)(observer(StoragePlanUpgrade));

