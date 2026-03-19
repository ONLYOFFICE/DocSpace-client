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

import React from "react";
import { inject, observer } from "mobx-react";
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/ui-kit/components/text";
import DiskStorageIcon from "PUBLIC_DIR/images/icons/16/catalog-settings-storage-management.svg";

import styles from "../../styles/CurrentSubscription.module.scss";

type CurrentSubscriptionProps = {
  currentStoragePlanSize?: number;
  storageExpiryDate?: string;
  formatWalletCurrency?: (amount?: number, fractionDigits?: number) => string;
  storagePriceIncrement?: number;
};

const CurrentSubscription: React.FC<CurrentSubscriptionProps> = ({
  currentStoragePlanSize,
  storageExpiryDate,
  formatWalletCurrency,
  storagePriceIncrement,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const totalPrice =
    (currentStoragePlanSize || 0) * (storagePriceIncrement || 0);

  return (
    <div className={styles.currentSubscriptionWrapper}>
      <Text fontWeight="700" fontSize="16px">
        {t("CurrentSubscription")}
      </Text>
      <div className={styles.subscriptionCard}>
        <div className={styles.subscriptionContent}>
          <div className={styles.storageInfo}>
            <div className={styles.storageIcon}>
              <DiskStorageIcon />
            </div>
            <div className={styles.storageDetails}>
              <Text
                fontWeight="600"
                fontSize="14px"
                className={styles.storageName}
              >
                {currentStoragePlanSize} {t("Common:Gigabyte")}
              </Text>
            </div>
          </div>
          <div className={styles.priceInfo}>
            <Text fontWeight="600" fontSize="14px">
              {t("CurrencyPerMonth", {
                currency: formatWalletCurrency!(totalPrice, 2),
              })}
            </Text>
          </div>
        </div>
        <Text fontSize="12px" className={styles.renewalInfo}>
          {t("SubscriptionAutoRenewedOn", { finalDate: storageExpiryDate })}
        </Text>
      </div>
    </div>
  );
};

export default inject(({ paymentStore, currentTariffStatusStore }: TStore) => {
  const { formatWalletCurrency, storagePriceIncrement } = paymentStore;
  const { currentStoragePlanSize, storageExpiryDate } =
    currentTariffStatusStore;

  return {
    formatWalletCurrency,
    storagePriceIncrement,
    currentStoragePlanSize,
    storageExpiryDate,
  };
})(observer(CurrentSubscription));
