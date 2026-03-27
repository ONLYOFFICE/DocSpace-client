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

import styles from "./PayerInformation.module.scss";

const PayerInformation = ({
  style,
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
          <div className={styles.payerInfoContainer}>
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
                    className={styles.payerInfoAccountLink}
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
                    className={[
                      styles.payerInfoRefreshData,
                      isDisabled ? styles.isDisabled : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    dataTestId="stripe_customer_refresh_data"
                  />
                ),
              }}
            />
            {isDisabled ? (
              <div className={styles.loaderContainer}>
                <Loader
                  color=""
                  size="16px"
                  type={LoaderTypes.track}
                  className={styles.refreshDataLoader}
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
              style={{ color: "var(--payment-warning-color)" }}
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
    <div className={styles.payerContainer} style={style}>
      <div className={styles.payerInfoAvatar}>
        <Avatar
          size="base"
          {...avatarUrl}
          isDefaultSource
          userName={payerInfo?.displayName}
        />
      </div>

      <div className={styles.payerInfoWrapper}>
        <div className={styles.payerInfoDescription}>{payerName()}</div>

        {!payerInfo ? unknownPayerInformation : payerInformation}
      </div>
    </div>
  );
};

export default inject(
  ({ paymentStore, userStore, currentTariffStatusStore }) => {
    const { accountLink, isStripePortalAvailable } = paymentStore;
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
