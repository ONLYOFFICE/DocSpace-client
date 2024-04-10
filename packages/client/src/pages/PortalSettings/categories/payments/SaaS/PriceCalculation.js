// (c) Copyright Ascensio System SIA 2009-2024
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

import React, { useEffect, useRef } from "react";
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { inject, observer } from "mobx-react";
import SelectUsersCountContainer from "./sub-components/SelectUsersCountContainer";
import TotalTariffContainer from "./sub-components/TotalTariffContainer";
import ButtonContainer from "./sub-components/ButtonContainer";
import { Trans } from "react-i18next";
import CurrentUsersCountContainer from "./sub-components/CurrentUsersCount";

const StyledBody = styled.div`
  border-radius: 12px;
  border: ${(props) =>
    props.theme.client.settings.payment.priceContainer.border};
  background: ${(props) =>
    props.theme.client.settings.payment.priceContainer.background};
  max-width: 320px;

  padding: 23px;
  box-sizing: border-box;

  .payment_main-title {
    margin-bottom: 24px;
    ${(props) =>
      props.isDisabled &&
      css`
        color: ${props.theme.client.settings.payment.priceContainer
          .disableColor};
      `}
  }
  .payment_price_user {
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${(props) =>
      props.theme.client.settings.payment.priceContainer.backgroundText};
    margin-top: 24px;
    min-height: 38px;
    border-radius: 6px;

    p {
      margin-bottom: 5px;
      margin-top: 5px;
      padding-left: 16px;
      padding-right: 16px;
    }
  }
`;

let timeout = null,
  controller;
const PriceCalculation = ({
  t,
  theme,
  setIsLoading,
  maxAvailableManagersCount,
  canUpdateTariff,
  isGracePeriod,
  isNotPaidPeriod,

  priceManagerPerMonth,
  currencySymbol,
  isAlreadyPaid,
  isFreeAfterPaidPeriod,
  managersCount,
  getPaymentLink,
}) => {
  const didMountRef = useRef(false);

  useEffect(() => {
    didMountRef.current && !isAlreadyPaid && setShoppingLink();
  }, [managersCount]);

  useEffect(() => {
    didMountRef.current = true;
    return () => {
      timeout && clearTimeout(timeout);
      timeout = null;
    };
  }, []);

  const setShoppingLink = () => {
    if (managersCount > maxAvailableManagersCount) {
      timeout && clearTimeout(timeout);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    timeout && clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (controller) controller.abort();

      controller = new AbortController();

      getPaymentLink(controller.signal).finally(() => {
        setIsLoading(false);
      });
    }, 1000);
  };

  const isDisabled = !canUpdateTariff;

  const priceInfoPerManager = (
    <div className="payment_price_user">
      <Text
        noSelect
        fontSize={"13px"}
        color={
          isDisabled
            ? theme.client.settings.payment.priceContainer.disablePriceColor
            : theme.client.settings.payment.priceColor
        }
        fontWeight={600}
      >
        <Trans t={t} i18nKey="PerUserMonth" ns="Common">
          ""
          <Text
            fontSize="16px"
            isBold
            as="span"
            fontWeight={600}
            color={
              isDisabled
                ? theme.client.settings.payment.priceContainer.disablePriceColor
                : theme.client.settings.payment.priceColor
            }
          >
            {{ currencySymbol }}
          </Text>
          <Text fontSize="16px" isBold as="span" fontWeight={600}>
            {{ price: priceManagerPerMonth }}
          </Text>
          per manager/month
        </Trans>
      </Text>
    </div>
  );

  const isNeedPlusSign = managersCount > maxAvailableManagersCount;

  return (
    <StyledBody className="price-calculation-container" isDisabled={isDisabled}>
      <Text
        fontSize="16px"
        fontWeight={600}
        noSelect
        className="payment_main-title"
      >
        {isGracePeriod || isNotPaidPeriod || isFreeAfterPaidPeriod
          ? t("YourPrice")
          : t("PriceCalculation")}
      </Text>
      {isGracePeriod || isNotPaidPeriod || isFreeAfterPaidPeriod ? (
        <CurrentUsersCountContainer
          isNeedPlusSign={isNeedPlusSign}
          t={t}
          isDisabled={isDisabled}
        />
      ) : (
        <SelectUsersCountContainer
          isNeedPlusSign={isNeedPlusSign}
          isDisabled={isDisabled}
        />
      )}

      {priceInfoPerManager}

      <TotalTariffContainer t={t} isDisabled={isDisabled} />
      <ButtonContainer
        isDisabled={isDisabled}
        t={t}
        isFreeAfterPaidPeriod={isFreeAfterPaidPeriod}
      />
    </StyledBody>
  );
};

export default inject(
  ({
    settingsStore,
    paymentStore,
    paymentQuotasStore,
    currentTariffStatusStore,
  }) => {
    const {
      tariffsInfo,
      setIsLoading,
      setManagersCount,
      maxAvailableManagersCount,

      managersCount,
      isAlreadyPaid,
      getPaymentLink,
      canUpdateTariff,
    } = paymentStore;
    const { theme } = settingsStore;

    const { planCost } = paymentQuotasStore;
    const { isNotPaidPeriod, isGracePeriod } = currentTariffStatusStore;

    return {
      canUpdateTariff,
      isAlreadyPaid,
      managersCount,

      setManagersCount,
      tariffsInfo,
      theme,
      setIsLoading,
      maxAvailableManagersCount,

      isGracePeriod,
      isNotPaidPeriod,

      priceManagerPerMonth: planCost.value,
      currencySymbol: planCost.currencySymbol,
      getPaymentLink,
    };
  },
)(observer(PriceCalculation));
