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

import { Text } from "@docspace/shared/components/text";
import { calcalateWalletPayment } from "@docspace/shared/api/portal";
import { toastr } from "@docspace/shared/components/toast";
import { Loader, LoaderTypes } from "@docspace/shared/components/loader";

import UpgradeWalletIcon from "PUBLIC_DIR/images/icons/16/upgrade.react.svg";

import styles from "../styles/StorageSummary.module.scss";
import { useServicesActions } from "../hooks/useServicesActions";
import {
  getDaysUntilPayment,
  calculateDifference,
} from "../hooks/resourceUtils";
import { usePaymentContext } from "../context/PaymentContext";

let timeout: NodeJS.Timeout | null;
let controller: AbortController;

type PlanUpgradePreviewProps = {
  currentStoragePlanSize?: number;
  amount: number;
  daysUtilPayment?: number;
};

const PlanUpgradePreview = (props: PlanUpgradePreviewProps) => {
  const { currentStoragePlanSize, amount, daysUtilPayment } = props;
  const { setFuturePayment, futurePayment, setIsWaitingCalculation } =
    usePaymentContext();
  const { t } = useTranslation("Payments");
  const [isLoading, setIsLoading] = useState(false);

  const { formatWalletCurrency, calculateDifferenceBetweenPlan } =
    useServicesActions();

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

          if (!currentWriteOff) return;

          const paymentAmount = currentWriteOff.amount;
          setFuturePayment(paymentAmount);
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

  return (
    <>
      <Text fontWeight={700} fontSize="16px">
        {t("DueToday")}
      </Text>
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
            {t("RemainingDays", { count: daysUtilPayment })}
          </Text>
        </div>

        <div className={styles.planInfoPrice}>
          {isLoading ? (
            <Loader color="" size="20px" type={LoaderTypes.track} />
          ) : (
            <>
              <Text fontWeight="600" fontSize="14px">
                {formatWalletCurrency(futurePayment)}
              </Text>
              <Text
                fontWeight="600"
                fontSize="11px"
                className={styles.priceForEach}
              >
                {t("ForDays", { count: daysUtilPayment })}
              </Text>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default inject(({ currentTariffStatusStore }: TStore) => {
  const { currentStoragePlanSize, storageSubscriptionExpiryDate } =
    currentTariffStatusStore;

  return {
    currentStoragePlanSize,
    daysUtilPayment: getDaysUntilPayment(storageSubscriptionExpiryDate!),
  };
})(observer(PlanUpgradePreview));
