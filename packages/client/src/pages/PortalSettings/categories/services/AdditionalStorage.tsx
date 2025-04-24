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
import { useTranslation } from "react-i18next";

import { Text } from "@docspace/shared/components/text";
import { ToggleButton } from "@docspace/shared/components/toggle-button";
import { getConvertedSize } from "@docspace/shared/utils/common";

import styles from "./styles/AdditionalStorage.module.scss";
import { formatCurrencyValue } from "../payments/Wallet/utils";

interface ServiceQuotaFeature {
  title: string;
  image: string;
  priceTitle: string;
}

type AdditionalStorageProps = {
  isEnabled?: boolean;
  // onToggle?: (enabled: boolean) => void;
  servicesQuotasFeatures?: Map<string, ServiceQuotaFeature>;
  storageQuotaIncrement?: number;
  isoCurrencySymbol?: string;
  onClick?: () => void;
  language?: string;
  value?: number;
};

const AdditionalStorage: React.FC<AdditionalStorageProps> = ({
  servicesQuotasFeatures,
  storageQuotaIncrement,
  isoCurrencySymbol,
  onClick,
  isEnabled,
  language,
  value,
}) => {
  // const [isChecked, setIsChecked] = useState(isEnabled);

  // const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const newValue = e.target.checked;
  //   setIsChecked(newValue);
  //   if (onToggle) {
  //     onToggle(newValue);
  //   }
  // };

  const { t } = useTranslation(["Payments", "Common"]);

  return (
    <div>
      <Text className={styles.storageDescription}>
        {t("SelectAndPayServices")}
      </Text>
      {Array.from(servicesQuotasFeatures?.values() || []).map((item) => {
        if (!item.title || !item.image) return null;

        return (
          <div
            key={item.title}
            className={styles.storageContainer}
            onClick={onClick}
          >
            <div className={styles.headerContainer}>
              <div className={styles.iconWrapper}>
                <div
                  dangerouslySetInnerHTML={{ __html: item.image }}
                  className={styles.iconsContainer}
                />
              </div>
              <ToggleButton
                isChecked={isEnabled}
                // onChange={handleToggle}
                className={styles.serviceToggle}
              />
            </div>
            <div className={styles.contentContainer}>
              <Text fontWeight={600} fontSize="14px">
                {item.title}
              </Text>
              <Text fontSize="12px" className={styles.priceDescription}>
                {item.priceTitle}
              </Text>
              <div className={styles.priceContainer}>
                <Text fontSize="12px" fontWeight={600}>
                  {t("PerStorage", {
                    currency: formatCurrencyValue(
                      language!,
                      value!,
                      isoCurrencySymbol!,
                      0,
                      7,
                    ),

                    amount: getConvertedSize(t, storageQuotaIncrement || 0),
                  })}
                </Text>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default inject(
  ({ paymentStore, currentTariffStatusStore, authStore }: TStore) => {
    const {
      servicesQuotasFeatures,
      storageQuotaIncrementPrice,
      storageQuotaIncrement,
    } = paymentStore;
    const { walletQuotas } = currentTariffStatusStore;
    const isEnabled = walletQuotas.length;
    const { language } = authStore;
    const { value, isoCurrencySymbol } = storageQuotaIncrementPrice;

    return {
      servicesQuotasFeatures,
      value,
      isoCurrencySymbol,
      storageQuotaIncrement,
      isEnabled,
      language,
    };
  },
)(observer(AdditionalStorage));
