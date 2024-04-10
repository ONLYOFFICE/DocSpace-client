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

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import React from "react";
import styled, { css } from "styled-components";
import { Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/shared/components/text";
import { size, desktop, mobile, Consumer } from "@docspace/shared/utils";

import { HelpButton } from "@docspace/shared/components/help-button";

import CurrentTariffContainer from "./CurrentTariffContainer";
import PriceCalculation from "./PriceCalculation";
import BenefitsContainer from "./BenefitsContainer";
import ContactContainer from "./ContactContainer";
import PayerInformationContainer from "./PayerInformationContainer";

const StyledBody = styled.div`
  max-width: 660px;

  .payment-info_suggestion,
  .payment-info_grace-period {
    margin-bottom: 12px;
  }

  .payment-info {
    margin-top: 18px;
    display: grid;
    grid-template-columns: repeat(2, minmax(100px, 320px));
    grid-gap: 20px;
    margin-bottom: 20px;

    @media ${mobile} {
      grid-template-columns: 1fr;

      grid-template-rows: 1fr max-content;

      .price-calculation-container,
      .benefits-container {
        max-width: 600px;
      }
      .select-users-count-container {
        max-width: 520px;
      }
    }

    ${(props) =>
      props.isChangeView &&
      css`
        grid-template-columns: 1fr;
        grid-template-rows: 1fr max-content;

        .price-calculation-container,
        .benefits-container {
          -webkit-transition: all 0.8s ease;
          transition: all 0.4s ease;
          max-width: 600px;
        }
        .select-users-count-container {
          -webkit-transition: all 0.8s ease;
          transition: all 0.4s ease;
          max-width: 520px;
        }

        @media ${desktop} {
          grid-template-columns: repeat(2, minmax(100px, 320px));
        }
      `}
  }
  .payment-info_wrapper {
    display: flex;

    margin-top: 11px;
    div {
      margin: auto 0;
    }
    .payment-info_managers-price {
      ${(props) =>
        props.theme.interfaceDirection === "rtl"
          ? css`
              margin-left: 6px;
            `
          : css`
              margin-right: 6px;
            `}
    }
  }
`;

const PaymentContainer = (props) => {
  const {
    isFreeTariff,
    isGracePeriod,
    theme,
    isNotPaidPeriod,
    payerEmail,
    isPaidPeriod,
    currencySymbol,
    startValue,
    currentTariffPlanTitle,
    tariffPlanTitle,
    expandArticle,
    gracePeriodEndDate,
    delayDaysCount,

    isAlreadyPaid,
    paymentDate,
    t,
    isNonProfit,
    isPaymentDateValid,
  } = props;
  const renderTooltip = () => {
    return (
      <>
        <HelpButton
          className="payment-tooltip"
          offsetRight={0}
          iconName={HelpReactSvgUrl}
          tooltipContent={
            <>
              <Text isBold>{t("ManagerTypesDescription")}</Text>
              <br />
              <Text isBold>{t("Common:DocSpaceAdmin")}</Text>
              <Text>{t("AdministratorDescription")}</Text>
              <br />
              <Text isBold>{t("Common:RoomAdmin")}</Text>
              <Text>{t("RoomManagerDescription")}</Text>
              <br />
              <Text isBold>{t("Common:PowerUser")}</Text>
              <Text>{t("Translations:RolePowerUserDescription")}</Text>
            </>
          }
        />
      </>
    );
  };

  const currentPlanTitle = () => {
    if (isFreeTariff) {
      return (
        <Text noSelect fontSize="16px" isBold>
          <Trans t={t} i18nKey="StartupTitle" ns="Payments">
            {{ planName: currentTariffPlanTitle }}
          </Trans>
        </Text>
      );
    }

    if (isPaidPeriod || isGracePeriod) {
      return (
        <Text noSelect fontSize="16px" isBold>
          <Trans t={t} i18nKey="BusinessTitle" ns="Payments">
            {{ planName: currentTariffPlanTitle }}
          </Trans>
        </Text>
      );
    }
  };

  const expiredTitleSubscriptionWarning = () => {
    return (
      <Text
        noSelect
        fontSize="16px"
        isBold
        color={theme.client.settings.payment.warningColor}
      >
        <Trans t={t} i18nKey="BusinessExpired" ns="Payments">
          {{ date: gracePeriodEndDate }} {{ planName: tariffPlanTitle }}
        </Trans>
      </Text>
    );
  };

  const planSuggestion = () => {
    if (isNonProfit) return;

    if (isFreeTariff) {
      return (
        <Text
          noSelect
          fontSize="16px"
          isBold
          className={"payment-info_suggestion"}
        >
          <Trans t={t} i18nKey="StartupSuggestion" ns="Payments">
            {{ planName: tariffPlanTitle }}
          </Trans>
        </Text>
      );
    }

    if (isPaidPeriod) {
      return (
        <Text
          noSelect
          fontSize="16px"
          isBold
          className={"payment-info_suggestion"}
        >
          <Trans t={t} i18nKey="BusinessSuggestion" ns="Payments">
            {{ planName: tariffPlanTitle }}
          </Trans>
        </Text>
      );
    }

    if (isNotPaidPeriod) {
      return (
        <Text
          noSelect
          fontSize="16px"
          isBold
          className={"payment-info_suggestion"}
        >
          <Trans t={t} i18nKey="RenewSubscription" ns="Payments">
            {{ planName: tariffPlanTitle }}
          </Trans>
        </Text>
      );
    }

    if (isGracePeriod) {
      return (
        <Text
          noSelect
          fontSize="16px"
          isBold
          className={"payment-info_grace-period"}
          color={theme.client.settings.payment.warningColor}
        >
          <Trans t={t} i18nKey="DelayedPayment" ns="Payments">
            {{ date: paymentDate }} {{ planName: currentTariffPlanTitle }}
          </Trans>
        </Text>
      );
    }

    return;
  };

  const planDescription = () => {
    if (isFreeTariff || isNonProfit) return;

    if (isGracePeriod)
      return (
        <Text noSelect fontSize={"14px"} lineHeight={"16px"}>
          <Trans t={t} i18nKey="GracePeriodActivatedInfo" ns="Payments">
            Grace period activated
            <strong>
              from {{ fromDate: paymentDate }} to
              {{ byDate: gracePeriodEndDate }}
            </strong>
            (days remaining: {{ delayDaysCount }})
          </Trans>{" "}
          <Text as="span" fontSize="14px" lineHeight="16px">
            {t("GracePeriodActivatedDescription")}
          </Text>
        </Text>
      );

    if (isPaidPeriod && isPaymentDateValid)
      return (
        <Text
          noSelect
          fontSize={"14px"}
          lineHeight={"16px"}
          className="payment-info_managers-price"
        >
          <Trans t={t} i18nKey="BusinessFinalDateInfo" ns="Payments">
            {{ finalDate: paymentDate }}
          </Trans>
        </Text>
      );
  };

  const isFreeAfterPaidPeriod = isFreeTariff && payerEmail?.length !== 0;

  return (
    <Consumer>
      {(context) => (
        <StyledBody
          isChangeView={context.sectionWidth <= size.mobile && expandArticle}
        >
          {isNotPaidPeriod
            ? expiredTitleSubscriptionWarning()
            : currentPlanTitle()}

          {!isNonProfit && isAlreadyPaid && (
            <PayerInformationContainer
              isFreeAfterPaidPeriod={isFreeAfterPaidPeriod}
            />
          )}

          <CurrentTariffContainer />

          {planSuggestion()}
          {planDescription()}

          {!isNonProfit &&
            !isGracePeriod &&
            !isNotPaidPeriod &&
            !isFreeAfterPaidPeriod && (
              <div className="payment-info_wrapper">
                <Text
                  noSelect
                  fontWeight={600}
                  fontSize={"14px"}
                  className="payment-info_managers-price"
                >
                  <Trans t={t} i18nKey="PerUserMonth" ns="Common">
                    From {{ currencySymbol }}
                    {{ price: startValue }} per admin/power user /month
                  </Trans>
                </Text>

                {renderTooltip()}
              </div>
            )}

          <div className="payment-info">
            {!isNonProfit && (
              <PriceCalculation
                t={t}
                isFreeAfterPaidPeriod={isFreeAfterPaidPeriod}
              />
            )}

            <BenefitsContainer t={t} />
          </div>
          <ContactContainer t={t} />
        </StyledBody>
      )}
    </Consumer>
  );
};

export default inject(
  ({
    settingsStore,
    currentQuotaStore,
    paymentStore,
    paymentQuotasStore,
    currentTariffStatusStore,
  }) => {
    const { showText: expandArticle, theme } = settingsStore;

    const { isFreeTariff, currentTariffPlanTitle, isNonProfit } =
      currentQuotaStore;

    const {
      isNotPaidPeriod,
      isPaidPeriod,
      isGracePeriod,
      customerId,
      portalTariffStatus,
      paymentDate,
      gracePeriodEndDate,
      delayDaysCount,
      isPaymentDateValid,
    } = currentTariffStatusStore;

    const { planCost, tariffPlanTitle, portalPaymentQuotas } =
      paymentQuotasStore;

    const { isAlreadyPaid } = paymentStore;

    return {
      paymentDate,
      isAlreadyPaid,

      gracePeriodEndDate,
      delayDaysCount,

      expandArticle,
      isFreeTariff,
      tariffPlanTitle,

      isGracePeriod,
      theme,
      currencySymbol: planCost.currencySymbol,
      startValue: planCost.value,
      isNotPaidPeriod,
      payerEmail: customerId,

      isPaidPeriod,
      currentTariffPlanTitle,
      portalTariffStatus,
      portalPaymentQuotas,
      isNonProfit,
      isPaymentDateValid,
    };
  },
)(observer(PaymentContainer));
