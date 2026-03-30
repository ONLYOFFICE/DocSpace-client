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

import styled from "styled-components";

import { toAbsoluteUrl } from "../../../utils/index";
import { Text } from "@docspace/ui-kit/components/text";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { Avatar } from "@docspace/ui-kit/components/avatar";
import { toastr } from "@docspace/ui-kit/components/toast";
import DefaultUserPhoto from "PUBLIC_DIR/images/default_user_photo_size_82-82.png";
import { Link } from "@docspace/ui-kit/components/link";
import { useState } from "react";
import { Loader, LoaderTypes } from "@docspace/ui-kit/components/loader";

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
    
  .payer-info_container{
    display: flex;
    gap:8px;
    flex-wrap:wrap;
    align-items: center;

    .loader_container{
      .refresh-data_loader{
        height:16px;
      }
    }
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

    .payer-info_refresh-data {
      cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
      color: ${(props) =>
        props.isDisabled
          ? props.theme.client.settings.payment.payerInfo.disableColor
          : "inherit"};
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
  fetchPayerInfo = async () => {},
  isStripePortalAvailable,
}) => {
  const { t } = useTranslation(["Payments", "Common"]);

  const [isDisabled, setDisabled] = useState(false);
  const goToStripePortal = () => {
    accountLink
      ? window.open(toAbsoluteUrl(accountLink), "_blank")
      : toastr.error(t("Common:UnexpectedError"));
  };

  const onRefreshData = async () => {
    setDisabled(true);
    try {
      await fetchPayerInfo(true);
    } catch (error) {
      let errorMessage = "";

      if (typeof error === "object") {
        errorMessage =
          error?.response?.data?.error?.message ||
          error?.statusText ||
          error?.message ||
          "";
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toastr.error(errorMessage || t("Common:UnexpectedError"));
    }
    setDisabled(false);
  };

  const unknownPayerDescription = () => {
    const userNotFound = `${t("UserNotFoundMatchingEmail")} `;

    let invalidEmailDescription = user.isOwner
      ? t("UnknownPayerForOwner", {
          productName: t("Common:ProductName"),
        })
      : t("UnknownPayerForAdmin", {
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
      <Text as="span" fontSize="13px">
        {unknownPayerDescription()}
      </Text>
      <div>
        {isStripePortalAvailable ? (
          <div className="payer-info_container">
            <Trans
              t={t}
              i18nKey="ChooseNewPayerOrRefrashData"
              components={{
                1: (
                  <Link
                    noSelect
                    fontWeight={600}
                    tag="a"
                    target="_blank"
                    className="payer-info_account-link"
                    color="accent"
                    onClick={goToStripePortal}
                    dataTestId="stripe_customer_portal_link"
                  />
                ),
                2: (
                  <Link
                    noSelect
                    fontWeight={600}
                    onClick={isDisabled ? () => {} : onRefreshData}
                    textDecoration="underline dotted"
                    className="payer-info_refresh-data"
                    dataTestId="stripe_customer_refresh_data"
                  />
                ),
              }}
            />
            {isDisabled ? (
              <div className="loader_container">
                <Loader
                  color=""
                  size="16px"
                  type={LoaderTypes.track}
                  className="refresh-data_loader"
                />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );

  const payerInformation = (
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
    let emailUnfoundedUser = "";

    if (email) emailUnfoundedUser = `"${email}"`;

    return (
      <Text as="span" fontWeight={600} fontSize="14px">
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
    <StyledContainer style={style} isDisabled={isDisabled}>
      <div className="payer-info_avatar">
        <Avatar
          size="base"
          {...avatarUrl}
          isDefaultSource
          userName={payerInfo?.displayName}
        />
      </div>

      <div className="payer-info_wrapper">
        <div className="payer-info_description">{payerName()}</div>

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
      fetchPayerInfo,
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
      fetchPayerInfo,
    };
  },
)(observer(PayerInformation));
