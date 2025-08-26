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
import { inject, observer } from "mobx-react";
import { Trans } from "react-i18next";

import {
  ModalDialog,
  ModalDialogType,
} from "@docspace/shared/components/modal-dialog";
import { toastr } from "@docspace/shared/components/toast";
import { updateWalletPayment } from "@docspace/shared/api/portal";
import { Button, ButtonSize } from "@docspace/shared/components/button";
import {
  calculateTotalPrice,
  getConvertedSize,
} from "@docspace/shared/utils/common";
import { Text } from "@docspace/shared/components/text";

import { useServicesActions } from "./hooks/useServicesActions";
import { PaymentProvider } from "./context/PaymentContext";

import styles from "./styles/index.module.scss";
import StorageWarning from "./sub-components/StorageWarning";

type StorageDialogProps = {
  visible: boolean;
  onClose: () => void;
  currentStoragePlanSize?: number;
  fetchPortalTariff?: () => void;
  fetchBalance?: () => void;
  totalPrice?: number;
  usedTotalStorageSizeCount?: number;
  handleServicesQuotas?: () => void;
  formatWalletCurrency?: (amount: number, fractionDigits?: number) => string;
};

const StoragePlanCancel: React.FC<StorageDialogProps> = ({
  visible,
  onClose,
  currentStoragePlanSize,
  fetchPortalTariff,
  fetchBalance,
  totalPrice,
  usedTotalStorageSizeCount,
  handleServicesQuotas,
  formatWalletCurrency,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const { t } = useServicesActions();

  const handleStoragePlanChange = async () => {
    const timerId = setTimeout(() => {
      setIsLoading(true);
    }, 200);

    try {
      const res = await updateWalletPayment(0, 0);

      if (res === false) {
        toastr.error(t("Common:UnexpectedError"));

        clearTimeout(timerId);
        setIsLoading(false);

        return;
      }

      await Promise.all([fetchPortalTariff!(), handleServicesQuotas!()]);

      onClose();
      fetchBalance!();
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      toastr.error(errorMessage);
    }

    clearTimeout(timerId);
    setIsLoading(false);
  };

  return (
    <PaymentProvider>
      <ModalDialog
        visible={visible}
        onClose={onClose}
        displayType={ModalDialogType.modal}
        autoMaxHeight
        isLarge
      >
        <ModalDialog.Header>{t("SubscriptionCancellation")}</ModalDialog.Header>
        <ModalDialog.Body>
          <div className={styles.cancelDialog}>
            <Text>{t("WantToCancelStoragePlan")}</Text>
            <br />
            <Text as="span">
              <Trans
                t={t}
                ns="Payments"
                i18nKey="YourCurrentPlan"
                values={{
                  amount: `${currentStoragePlanSize} ${t("Common:Gigabyte")}`,
                  price: formatWalletCurrency!(totalPrice!, 2),
                }}
                components={{
                  1: <Text fontWeight={600} as="span" />,
                  2: <Text className={styles.monthPayment} as="span" />,
                }}
              />
            </Text>
            <Text>
              <Trans
                t={t}
                ns="Payments"
                i18nKey="StorageUsed"
                values={{
                  amount: getConvertedSize(t, usedTotalStorageSizeCount!),
                }}
                components={{
                  1: <Text fontWeight={600} as="span" />,
                }}
              />
            </Text>
          </div>
          <StorageWarning />
        </ModalDialog.Body>
        <ModalDialog.Footer>
          <Button
            key="OkButton"
            label={t("Common:Yes")}
            size={ButtonSize.normal}
            primary
            onClick={handleStoragePlanChange}
            isLoading={isLoading}
            testId="storage_plan_cancel_ok_button"
          />
          <Button
            key="CancelButton"
            label={t("Common:No")}
            size={ButtonSize.normal}
            onClick={onClose}
            testId="storage_plan_cancel_no_button"
          />
        </ModalDialog.Footer>
      </ModalDialog>
    </PaymentProvider>
  );
};

export default inject(
  ({ paymentStore, currentTariffStatusStore, currentQuotaStore }: TStore) => {
    const { fetchPortalTariff, currentStoragePlanSize } =
      currentTariffStatusStore;
    const {
      fetchBalance,
      storageSizeIncrement,
      storagePriceIncrement,
      handleServicesQuotas,
      formatWalletCurrency,
    } = paymentStore;

    const { usedTotalStorageSizeCount } = currentQuotaStore;

    const totalPrice = calculateTotalPrice(
      currentStoragePlanSize,
      storagePriceIncrement,
    );

    return {
      storageSizeIncrement,
      fetchPortalTariff,
      fetchBalance,
      usedTotalStorageSizeCount,
      totalPrice,
      currentStoragePlanSize,
      handleServicesQuotas,
      formatWalletCurrency,
    };
  },
)(observer(StoragePlanCancel));
