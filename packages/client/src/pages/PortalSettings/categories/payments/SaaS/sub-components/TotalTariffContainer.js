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

import React from "react";
import styled, { css } from "styled-components";
import { Trans } from "react-i18next";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import { mobile } from "@docspace/shared/utils";

const StyledBody = styled.div`
  max-width: 272px;
  margin: 0 auto;
  word-break: break-word;
  text-align: center;

  @media ${mobile} {
    max-width: 520px;
  }

  .payment_price_total-price {
    display: flex;
    justify-content: center;
    min-height: 65px;
    margin-top: 16px;
    margin-bottom: 16px;

    .lagerFontSize {
      font-size: 48px;
    }

    ${(props) =>
      props.isDisabled &&
      css`
        color: ${props.theme.client.settings.payment.priceContainer
          .disableColor};
      `};

    .payment_price_price-text,
    .total-tariff_description {
    }

    .total-tariff_description {
      margin: auto;
    }
    p {
      margin-bottom: 0;
    }
  }

  button {
    width: 100%;
  }
`;

const TotalTariffContainer = ({
  t,
  maxAvailableManagersCount,
  isDisabled,
  theme,
  totalPrice,
  isNeedRequest,
  isYearTariff,
  formatPaymentCurrency,
}) => {
  return (
    <StyledBody isDisabled={isDisabled} theme={theme}>
      <div className="payment_price_total-price">
        {isNeedRequest ? (
          <Text
            fontSize="14"
            textAlign="center"
            fontWeight={600}
            className="total-tariff_description"
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
                  2: <span className="lagerFontSize" />,
                  3: <Text fontWeight={600} />,
                }}
              />
            ) : (
              <Trans
                t={t}
                i18nKey="TotalPricePerMonth"
                ns="Payments"
                values={{ price: formatPaymentCurrency(totalPrice) }}
                components={{
                  2: <span className="lagerFontSize" />,
                  3: <Text fontWeight={600} />,
                }}
              />
            )}
          </Text>
        )}
      </div>
    </StyledBody>
  );
};

export default inject(({ settingsStore, paymentStore, currentQuotaStore }) => {
  const { theme } = settingsStore;
  const {
    isLoading,
    totalPrice,
    isNeedRequest,
    maxAvailableManagersCount,
    formatPaymentCurrency,
  } = paymentStore;

  const { isYearTariff } = currentQuotaStore;

  return {
    theme,
    totalPrice,
    isLoading,
    isNeedRequest,
    maxAvailableManagersCount,
    isYearTariff,
    formatPaymentCurrency,
  };
})(observer(TotalTariffContainer));
