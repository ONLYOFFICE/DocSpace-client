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

import HelpReactSvgUrl from "PUBLIC_DIR/images/help.react.svg?url";
import styled from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { HelpButton } from "@docspace/shared/components/help-button";
import { Avatar } from "@docspace/shared/components/avatar";
import { toastr } from "@docspace/shared/components/toast";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { Link } from "@docspace/shared/components/link";

const StyledContainer = styled.div`
  display: flex;
  background: ${(props) => props.theme.client.settings.payment.backgroundColor};
  min-height: 72px;
  padding: 16px;
  box-sizing: border-box;
  margin-top: 16px;
  border-radius: 6px;
  max-width: 660px;
  .payer-info {
    margin-inline-start: 3px;
  }

  .payer-info_avatar {
    margin-inline-end: 16px;
  }
  .payer-info {
    margin-inline-end: 3px;
  }
  .payer-info_wrapper {
    height: max-content;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: max-content max-content;
    grid-gap: 4px;

    .payer-info_description {
      display: flex;
      align-items: center;

      p {
        margin-inline-end: 4px;
      }
      div {
        display: inline-block;
        margin: auto 0;
      }
    }
    .payer-info_account-link {
      cursor: pointer;
      text-decoration: underline;
    }
  }
`;

const PayerInformation = ({
  style,
  theme,
  user,
  accountLink,
  payerInfo,
  email,
  isNotPaidPeriod,

  isStripePortalAvailable,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const goToStripePortal = () => {
    accountLink
      ? window.open(accountLink, "_blank")
      : toastr.error(t("Common:UnexpectedError"));
  };

  const renderTooltip = (
    <HelpButton
      className="payer-tooltip"
      iconName={HelpReactSvgUrl}
      style={{ height: "15px", margin: "0" }}
      tooltipContent={
        <>
          <Text isBold>{t("Payer")}</Text>
          <Text>
            {t("PayerDescription", { productName: t("Common:ProductName") })}
          </Text>
        </>
      }
      dataTestId="payer_info_help_button"
    />
  );

  const unknownPayerDescription = () => {
    const userNotFound = `${t("UserNotFoundMatchingEmail")} `;

    let invalidEmailDescription = user.isOwner
      ? t("InvalidEmailWithActiveSubscription", {
          productName: t("Common:ProductName"),
        })
      : t("InvalidEmailWithActiveSubscriptionForAdmin", {
          productName: t("Common:ProductName"),
        });

    if (isNotPaidPeriod) {
      invalidEmailDescription = user.isOwner
        ? t("InvalidEmailWithoutActiveSubscription", {
            productName: t("Common:ProductName"),
          })
        : t("InvalidEmailWithoutActiveSubscriptionByAdmin", {
            productName: t("Common:ProductName"),
          });

      return userNotFound + invalidEmailDescription;
    }

    return userNotFound + invalidEmailDescription;
  };

  const unknownPayerInformation = (
    <div>
      <Text as="span" fontSize="13px" noSelect>
        {unknownPayerDescription()}
      </Text>
      <div>
        {isStripePortalAvailable ? (
          <Link
            noSelect
            fontWeight={600}
            tag="a"
            target="_blank"
            className="payer-info_account-link"
            color="accent"
            onClick={goToStripePortal}
            dataTestId="stripe_customer_portal_link"
          >
            {t("ChooseNewPayer")}
          </Link>
        ) : null}
      </div>
    </div>
  );

  const payerInformation = isStripePortalAvailable ? (
    <Link
      noSelect
      fontWeight={600}
      className="payer-info_account-link"
      tag="a"
      target="_blank"
      color="accent"
      onClick={goToStripePortal}
      dataTestId="stripe_customer_portal_link"
    >
      {t("StripeCustomerPortal")}
    </Link>
  ) : (
    <Link
      fontWeight={600}
      href={`mailto:${email}`}
      tag="a"
      color="accent"
      dataTestId="payer_email_link"
    >
      {email}
    </Link>
  );

  const payerName = () => {
    let emailUnfoundedUser;

    if (email) emailUnfoundedUser = `«${email}»`;

    return (
      <Text as="span" fontWeight={600} noSelect fontSize="14px">
        {payerInfo ? (
          payerInfo.displayName
        ) : (
          <Trans t={t} i18nKey="UserNotFound" ns="Payments">
            User
            <Text
              as="span"
              color={theme.client.settings.payment.warningColor}
              fontWeight={600}
              fontSize="14px"
            >
              {{ email: emailUnfoundedUser }}
            </Text>
            is not found
          </Trans>
        )}
      </Text>
    );
  };

  const avatarUrl = payerInfo
    ? { source: payerInfo.hasAvatar ? payerInfo.avatar : DefaultUserPhoto }
    : {};

  return (
    <StyledContainer style={style}>
      <div className="payer-info_avatar">
        <Avatar
          size="base"
          {...avatarUrl}
          isDefaultSource
          userName={payerInfo?.displayName}
        />
      </div>

      <div className="payer-info_wrapper">
        <div className="payer-info_description">
          {payerName()}

          <Text as="span" className="payer-info">
            {` (${t("Payer")}) `}
          </Text>

          {renderTooltip}
        </div>

        {!payerInfo ? unknownPayerInformation : payerInformation}
      </div>
    </StyledContainer>
  );
};

export default inject(
  ({ settingsStore, paymentStore, userStore, currentTariffStatusStore }) => {
    const { accountLink, isStripePortalAvailable } = paymentStore;
    const { theme } = settingsStore;
    const {
      isGracePeriod,
      isNotPaidPeriod,
      walletCustomerEmail,
      walletCustomerInfo,
    } = currentTariffStatusStore;
    const { user } = userStore;

    return {
      isStripePortalAvailable,
      theme,
      user,
      accountLink,
      isGracePeriod,
      isNotPaidPeriod,
      email: walletCustomerEmail,
      payerInfo: walletCustomerInfo,
    };
  },
)(observer(PayerInformation));
