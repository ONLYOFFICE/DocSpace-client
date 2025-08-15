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

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import classNames from "classnames";
import moment from "moment";

import { Text } from "@docspace/shared/components/text";
import { calcalateWalletPayment } from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";
import { useInterfaceDirection } from "@docspace/shared/hooks/useInterfaceDirection";
import { HelpButton } from "@docspace/shared/components/help-button";

import UpgradeWalletIcon from "PUBLIC_DIR/images/icons/16/upgrade.react.svg";

import styles from "../../styles/StorageSummary.module.scss";
import { useServicesActions } from "../../hooks/useServicesActions";
import { calculateDifference } from "../../hooks/resourceUtils";
import { usePaymentContext } from "../../context/PaymentContext";

let timeout: NodeJS.Timeout | null;
let controller: AbortController;

type PlanUpgradePreviewProps = {
  amount: number;
  currentStoragePlanSize?: number;
  daysUntilStorageExpiry?: number;
  setPartialUpgradeFee?: (amount: number) => void;
  partialUpgradeFee?: number;
  storageExpiryDate?: string;
  formatWalletCurrency?: (amount: number, decimalPlaces?: number) => string;
};

const getDirectionalText = (isRTL: boolean) => {
  return isRTL ? `>1` : `<1`;
};

const PlanUpgradePreview: React.FC<PlanUpgradePreviewProps> = (props) => {
  const {
    currentStoragePlanSize,
    amount,
    daysUntilStorageExpiry,
    setPartialUpgradeFee,
    partialUpgradeFee,
    storageExpiryDate,
    formatWalletCurrency,
  } = props;
  const { isRTL } = useInterfaceDirection();

  const { setIsWaitingCalculation } = usePaymentContext();
  const { t } = useTranslation(["Payments", "Common"]);
  const [isLoading, setIsLoading] = useState(false);

  const { calculateDifferenceBetweenPlan } = useServicesActions();

  const tooltipText = () => {
    return (
      <>
        <Text as="span">
          {daysUntilStorageExpiry === 0
            ? t("PartialPaymentNoDate")
            : t("PartialPaymentWithDate", {
                startDate: moment().tz(window.timezone).format("LL"),
                endDate: storageExpiryDate,
              })}
        </Text>{" "}
        <Text as="span">{t("PartialPaymentDescription")}</Text>
      </>
    );
  };

  useEffect(() => {
    const calcalatePayment = () => {
      setIsLoading(true);
      setIsWaitingCalculation(true);

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (controller) controller.abort();

        controller = new AbortController();

        const quantity = calculateDifferenceBetweenPlan(amount);
        try {
          const currentWriteOff = await calcalateWalletPayment(
            quantity,
            1,
            controller.signal,
          );

          if (!currentWriteOff) {
            toastr.error(t("Common:UnexpectedError"));
            return;
          }

          const paymentAmount = currentWriteOff.amount;
          setPartialUpgradeFee!(paymentAmount);
          setIsLoading(false);
          setIsWaitingCalculation(false);
        } catch (e) {
          toastr.error(e as unknown as string);
        }
      }, 1000);
    };

    calcalatePayment();
  }, [amount]);

  useEffect(() => {
    return () => {
      if (timeout) clearTimeout(timeout);
      setIsWaitingCalculation(false);
      timeout = null;
    };
  }, []);

  const days = daysUntilStorageExpiry || getDirectionalText(isRTL);

  return (
    <>
      <div className={styles.planInfoHeader}>
        <Text fontWeight={700} fontSize="16px">
          {t("DueToday")}
        </Text>
        <HelpButton
          size={12}
          offsetRight={0}
          place={isRTL ? "left" : "right"}
          tooltipContent={tooltipText()}
          dataTestId="partial_payment_help_button"
        />
      </div>
      <div className={classNames(styles.planInfoContainer, styles.withBottom)}>
        <div className={styles.planInfoIcon}>
          <UpgradeWalletIcon />
        </div>
        <div className={styles.planInfoBody}>
          <Text fontWeight={600}>
            {t("AdditionalStorage", {
              amount: `${calculateDifference(amount, currentStoragePlanSize!)} ${t("Common:Gigabyte")}`,
            })}
          </Text>
          <Text
            fontWeight="600"
            fontSize="11px"
            className={styles.priceForEach}
          >
            {t("RemainingDays", { count: Number(days) })}
          </Text>
        </div>

        <div className={styles.planInfoPrice}>
          {isLoading ? (
            <Loader color="" size="20px" type={LoaderTypes.track} />
          ) : (
            <>
              <Text fontWeight="600" fontSize="14px">
                {formatWalletCurrency!(partialUpgradeFee!)}
              </Text>
              <Text
                fontWeight="600"
                fontSize="11px"
                className={styles.priceForEach}
              >
                {t("ForDays", { count: Number(days) })}
              </Text>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default inject(
  ({ currentTariffStatusStore, servicesStore, paymentStore }: TStore) => {
    const {
      currentStoragePlanSize,
      daysUntilStorageExpiry,
      storageExpiryDate,
    } = currentTariffStatusStore;
    const { setPartialUpgradeFee, partialUpgradeFee } = servicesStore;
    const { formatWalletCurrency } = paymentStore;
    return {
      currentStoragePlanSize,
      daysUntilStorageExpiry,
      setPartialUpgradeFee,
      partialUpgradeFee,
      storageExpiryDate,
      formatWalletCurrency,
    };
  },
)(observer(PlanUpgradePreview));
