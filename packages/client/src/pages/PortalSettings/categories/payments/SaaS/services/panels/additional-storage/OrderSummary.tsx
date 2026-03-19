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

import React, { useState, useEffect, useRef } from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { Duration } from "luxon";

import { Text } from "@docspace/ui-kit/components/text";
import { useInterfaceDirection } from "@docspace/ui-kit/context/InterfaceDirectionContext";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";
import { toastr } from "@docspace/ui-kit/components/toast";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { now, formatDateLocalized } from "@docspace/ui-kit/utils/date";

import { calcalateWalletPayment } from "@docspace/shared/api/portal";

import { useServicesActions } from "../../hooks/useServicesActions";
import { usePaymentContext } from "../../context/PaymentContext";

import styles from "../../styles/OrderSummary.module.scss";
import { calculateDifference } from "../../hooks/resourceUtils";
import classNames from "classnames";

type OrderSummaryProps = {
  amount: number;
  currentStoragePlanSize?: number;
  storagePriceIncrement?: number;
  storageExpiryDate?: string;
  walletBalance?: number;
  formatWalletCurrency?: (amount?: number, fractionDigits?: number) => string;
  isUpgradeStoragePlan?: boolean;
  isDowngradeStoragePlan?: boolean;
  daysUntilStorageExpiry?: number;
  setPartialUpgradeFee?: (value: number) => void;
  partialUpgradeFee?: number;
  totalPrice?: number;
  reccomendedAmount?: number;
  hasMinError?: boolean;
  language?: string;
  hasStorageSubscription?: boolean;
};

const OrderSummary: React.FC<OrderSummaryProps> = ({
  amount,
  currentStoragePlanSize,
  storagePriceIncrement,
  storageExpiryDate,
  walletBalance = 0,
  formatWalletCurrency,
  totalPrice = 0,
  isUpgradeStoragePlan,
  daysUntilStorageExpiry,
  setPartialUpgradeFee,
  partialUpgradeFee,
  isDowngradeStoragePlan,
  reccomendedAmount,
  hasMinError,
  language = "en",
  hasStorageSubscription,
}) => {
  const { t } = useTranslation(["Services", "Payments", "Common"]);
  const { isRTL } = useInterfaceDirection();
  const { setIsWaitingCalculation } = usePaymentContext();
  const {
    calculateDifferenceBetweenPlan,
    isExceedingPlanLimit,
    maxStorageLimit,
  } = useServicesActions();

  const [isPriceLoading, setIsPriceLoading] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const isNewSubscription = !hasStorageSubscription;

  useEffect(() => {
    if (isNewSubscription || isDowngradeStoragePlan) return;

    setIsPriceLoading(true);
    setIsWaitingCalculation(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      if (controllerRef.current) controllerRef.current.abort();
      controllerRef.current = new AbortController();

      const quantity = calculateDifferenceBetweenPlan(amount);
      try {
        const result = await calcalateWalletPayment(
          quantity,
          1,
          controllerRef.current.signal,
        );

        if (!result) {
          toastr.error(t("Common:UnexpectedError"));
          return;
        }

        setPartialUpgradeFee!(result.amount);
        setIsPriceLoading(false);
        setIsWaitingCalculation(false);
      } catch (e) {
        toastr.error(e as unknown as string);
      }
    }, 1000);
  }, [amount, isUpgradeStoragePlan]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setIsWaitingCalculation(false);
    };
  }, []);

  const isExceedingStorageLimit = isExceedingPlanLimit(amount);

  const tooltipText = () => (
    <>
      <Text as="span">
        {daysUntilStorageExpiry === 0
          ? t("Payments:PartialPaymentNoDate", {
              storageUnit: t("Common:Gigabyte"),
            })
          : t("Payments:PartialPaymentWithDate", {
              startDate: formatDateLocalized(
                now().setZone(window.timezone),
                "DATE_MED",
              ),
              endDate: storageExpiryDate,
              storageUnit: t("Common:Gigabyte"),
            })}
      </Text>{" "}
      <Text as="span">{t("Payments:PartialPaymentDescription")}</Text>
    </>
  );

  const additionalStorage = calculateDifference(
    amount,
    currentStoragePlanSize!,
  );
  const remainingBalance = partialUpgradeFee
    ? walletBalance - partialUpgradeFee
    : walletBalance - totalPrice;
  const daysDisplay = daysUntilStorageExpiry
    ? Duration.fromObject(
        { days: daysUntilStorageExpiry },
        { locale: language },
      ).toHuman()
    : t("Services:LessThanOneDay");

  return (
    <div className={styles.orderSummaryWrapper}>
      <Text fontWeight="700" fontSize="16px" className={styles.sectionTitle}>
        {t("OrderSummary")}
      </Text>
      <div className={styles.summaryCard}>
        <div className={styles.summaryContent}>
          {!isNewSubscription ? (
            <div className={styles.summaryRow}>
              <Text fontSize="14px" className={styles.rowLabel}>
                {t("StorageAdjustment")}
              </Text>
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.rowValue}
              >
                {t("Payments:StorageUpgradeMessage", {
                  fromSize: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
                  toSize: isExceedingStorageLimit
                    ? `${maxStorageLimit}+ ${t("Common:Gigabyte")}`
                    : `${amount} ${t("Common:Gigabyte")}`,
                })}
              </Text>
            </div>
          ) : null}
          {!isExceedingStorageLimit ? (
            <div className={styles.summaryRow}>
              <Text fontSize="14px" className={styles.rowLabel}>
                {isDowngradeStoragePlan
                  ? t("ReducedStorage")
                  : t("AdditionalStorageInfo")}
              </Text>
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.rowValue}
              >
                {(isNewSubscription && !amount) || hasMinError
                  ? `0 ${t("Common:Gigabyte")}`
                  : `${isDowngradeStoragePlan ? "-" : isNewSubscription ? "" : "+"}${additionalStorage} ${t("Common:Gigabyte")}`}
              </Text>
            </div>
          ) : null}
          <div className={styles.summaryRow}>
            <Text fontSize="14px" className={styles.rowLabel}>
              {t("PricePerGB")}
            </Text>
            <Text fontWeight="600" fontSize="14px" className={styles.rowValue}>
              {formatWalletCurrency!(storagePriceIncrement, 2)}
            </Text>
          </div>
          {!isExceedingStorageLimit && !isNewSubscription ? (
            <div className={styles.summaryRow}>
              <Text fontSize="14px" className={styles.rowLabel}>
                {isDowngradeStoragePlan
                  ? t("EffectiveDate")
                  : t("RemainingPeriod")}
              </Text>
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.rowValue}
              >
                {isDowngradeStoragePlan ? (
                  storageExpiryDate
                ) : (
                  <>
                    {daysDisplay}{" "}
                    <Text
                      as="span"
                      fontSize="14px"
                      className={styles.rowSubtext}
                    >
                      ({t("UntilDate", { date: storageExpiryDate })})
                    </Text>
                  </>
                )}
              </Text>
            </div>
          ) : null}
          <div className={styles.divider} />
          <div className={styles.summaryRow}>
            {isExceedingStorageLimit ? (
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.rowLabel}
              >
                {t("Payments:StorageUponRequest", {
                  amount: `${maxStorageLimit} ${t("Common:Gigabyte")}`,
                })}
              </Text>
            ) : (
              <div
                className={classNames(styles.rowLabel, styles.planInfoHeader)}
              >
                <Text fontWeight="600" fontSize="14px">
                  {t("TotalDueToday")}
                </Text>
                {isUpgradeStoragePlan && !isNewSubscription && (
                  <HelpButton
                    size={12}
                    offsetRight={0}
                    place={isRTL ? "left" : "right"}
                    tooltipContent={tooltipText()}
                    dataTestId="total_due_today_help_button"
                  />
                )}
              </div>
            )}
            {!isExceedingStorageLimit ? (
              <div className={styles.rowValue}>
                {isUpgradeStoragePlan && isPriceLoading ? (
                  <Loader
                    color=""
                    size="16px"
                    type={LoaderTypes.track}
                    style={{ height: "16px" }}
                  />
                ) : (
                  <Text fontWeight="600" fontSize="14px">
                    {formatWalletCurrency!(
                      !amount || hasMinError
                        ? 0
                        : isNewSubscription
                          ? totalPrice
                          : isDowngradeStoragePlan
                            ? 0
                            : partialUpgradeFee!,

                      2,
                    )}
                  </Text>
                )}
              </div>
            ) : null}
          </div>
        </div>
        {!isExceedingStorageLimit &&
        !isDowngradeStoragePlan &&
        !isPriceLoading &&
        amount &&
        !hasMinError ? (
          <Text
            fontSize="12px"
            className={classNames(styles.balanceInfo, {
              [styles.warningColor]: reccomendedAmount,
            })}
          >
            {reccomendedAmount
              ? t("WalletTopUpRequired", {
                  currency: formatWalletCurrency!(reccomendedAmount, 2),
                })
              : t("RemainingBalanceAfterPurchase", {
                  currency: formatWalletCurrency!(remainingBalance, 2),
                })}
          </Text>
        ) : null}
      </div>
    </div>
  );
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    servicesStore,
    authStore,
  }: TStore) => {
    const { formatWalletCurrency, storagePriceIncrement, walletBalance } =
      paymentStore;
    const { language } = authStore;
    const {
      currentStoragePlanSize,
      storageExpiryDate,
      daysUntilStorageExpiry,
      hasStorageSubscription,
    } = currentTariffStatusStore;
    const { setPartialUpgradeFee, partialUpgradeFee } = servicesStore;

    return {
      formatWalletCurrency,
      storagePriceIncrement,
      walletBalance,
      currentStoragePlanSize,
      storageExpiryDate,
      daysUntilStorageExpiry,
      setPartialUpgradeFee,
      partialUpgradeFee,
      language,
      hasStorageSubscription,
    };
  },
)(observer(OrderSummary));

