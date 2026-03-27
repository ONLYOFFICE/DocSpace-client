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
import { Trans } from "react-i18next";
import { Text } from "@docspace/ui-kit/components/text";
import { inject, observer } from "mobx-react";

import styles from "../styles/MainTariff.module.scss";

const TotalTariffContainer = ({
  t,
  maxAvailableManagersCount,
  isDisabled,
  totalPrice,
  isNeedRequest,
  isYearTariff,
  formatPaymentCurrency,
}) => {
  return (
    <div className={styles.totalTariffBody}>
      <div
        className={[
          styles.paymentPriceTotalPrice,
          isDisabled ? styles.isDisabled : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {isNeedRequest ? (
          <Text
            fontSize="14"
            textAlign="center"
            fontWeight={600}
            className={styles.totalTariffDescription}
          >
            <Trans t={t} i18nKey="BusinessRequestDescription" ns="Payments">
              {{ peopleNumber: maxAvailableManagersCount }}
            </Trans>
          </Text>
        ) : (
          <Text fontWeight={600} fontSize="16px">
            {isYearTariff ? (
              <Trans
                t={t}
                i18nKey="TotalPricePerYear"
                ns="Payments"
                values={{ price: formatPaymentCurrency(totalPrice) }}
                components={{
                  2: <span key="large-font-year" className={styles.lagerFontSize} />,
                  3: <Text fontWeight={600} as="span" key="bold-text-year" />,
                }}
              />
            ) : (
              <Trans
                t={t}
                i18nKey="TotalPricePerMonth"
                ns="Payments"
                values={{ price: formatPaymentCurrency(totalPrice) }}
                components={{
                  2: <span key="large-font-month" className={styles.lagerFontSize} />,
                  3: <Text fontWeight={600} as="span" key="bold-text-month" />,
                }}
              />
            )}
          </Text>
        )}
      </div>
    </div>
  );
};

export default inject(({ paymentStore, currentQuotaStore }) => {
  const {
    isLoading,
    totalPrice,
    isNeedRequest,
    maxAvailableManagersCount,
    formatPaymentCurrency,
  } = paymentStore;

  const { isYearTariff } = currentQuotaStore;

  return {
    totalPrice,
    isLoading,
    isNeedRequest,
    maxAvailableManagersCount,
    isYearTariff,
    formatPaymentCurrency,
  };
})(observer(TotalTariffContainer));
