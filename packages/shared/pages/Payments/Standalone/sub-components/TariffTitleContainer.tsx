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
import { Trans, useTranslation } from "react-i18next";
import classNames from "classnames";

import { Link } from "@docspace/ui-kit/components/link";
import { Text } from "@docspace/ui-kit/components/text";

import { getTwoDotsReplacing } from "../Standalone.helpers";
import { IPaymentsProps } from "../Standalone.types";
import styles from "../Standalone.module.scss";
import UserStatisticsDialog from "../../../../dialogs/UserStatisticsDialog";
import { useUserStatisticsDialog } from "./hooks/useUserStatisticsDialog";

export const TariffTitleContainer = ({
  isLicenseDateExpired,
  isTrial,
  trialDaysLeft,
  paymentDate,
  isDeveloper,
  logoText,
  docspaceFaqUrl,
  licenseQuota,
  openOnNewPage,
  isLifetimeLicense,
  isGracePeriod,
  isNotPaidPeriod,
  gracePeriodEndDate,
  delayDaysCount,
}: Partial<IPaymentsProps>) => {
  const { t } = useTranslation("Common");

  const {
    isUserStatisticsVisible,
    openUserStatistics,
    closeUserStatistics,
    downloadAndOpenReport,
    usersStatistics,
  } = useUserStatisticsDialog({ openOnNewPage, licenseQuota });

  const alertComponent = () => {
    if (isTrial) {
      return isLicenseDateExpired ? (
        <Text
          className={classNames(styles.paymentsSubscriptionExpired, {
            [styles.isTrial]: isTrial,
            [styles.isLicenseDateExpired]: isLicenseDateExpired,
          })}
          fontWeight={600}
          fontSize="14px"
        >
          {t("TrialExpired")}
        </Text>
      ) : (
        <Text
          className={classNames(styles.paymentsSubscriptionExpired, {
            [styles.isTrial]: isTrial,
          })}
          fontWeight={600}
          fontSize="14px"
        >
          {t("FreeDaysLeft", { count: Number(trialDaysLeft) })}
        </Text>
      );
    }

    if (!isLifetimeLicense && isGracePeriod) {
      return (
        <Text
          className={styles.paymentsSubscriptionExpired}
          isBold
          fontSize="16px"
        >
          <Trans
            i18nKey="LicenseHasExpiredGracePeriodStartedOn"
            ns="Common"
            t={t}
            values={{ date: paymentDate }}
            components={{
              1: <span data-testid="grace-period-start-date" />,
            }}
          />
        </Text>
      );
    }

    if (!isLifetimeLicense && isNotPaidPeriod) {
      return (
        <Text
          className={styles.paymentsSubscriptionExpired}
          isBold
          fontSize="16px"
        >
          {t("ActivateTariffLicenseExpired", {
            date: paymentDate,
          })}
        </Text>
      );
    }

    return (
      isLicenseDateExpired && (
        <Text
          className={styles.paymentsSubscriptionExpired}
          isBold
          fontSize="14px"
        >
          {t("SubscriptionExpired")}
        </Text>
      )
    );
  };

  const expiresDate = () => {
    if (isTrial) {
      return getTwoDotsReplacing(
        t("ActivateTariffLicenseTrialExpiration", {
          date: paymentDate,
        }),
      );
    }

    return getTwoDotsReplacing(
      t("ActivatePaidTariffExpiration", {
        date: paymentDate,
      }),
    );
  };

  const getDescription = () => {
    return (
      <Text fontWeight={600} fontSize="13px" as="span">
        {usersStatistics ? (
          <Trans
            i18nKey="ActivateTariffDescrUsers"
            values={{
              productName: t("Common:ProductName"),
              organizationName: logoText,
              license: isDeveloper
                ? t("Common:DeveloperLicense")
                : t("Common:EnterpriseLicense"),
              editingCount: usersStatistics.totalUsers ?? 0,
              limit: usersStatistics.limitUsers ?? 0,
            }}
            t={t}
            ns="Common"
            components={{
              1: (
                <Link
                  color="accent"
                  onClick={openUserStatistics}
                  fontWeight="600"
                  dataTestId="open_user_statistics_link"
                />
              ),
            }}
          />
        ) : (
          t("ActivateTariffDescrConnections", {
            productName: t("Common:ProductName"),
            organizationName: logoText,
            license: isDeveloper
              ? t("Common:DeveloperLicense")
              : t("Common:EnterpriseLicense"),
          })
        )}
      </Text>
    );
  };

  const getSubDescription = () => {
    if (!isLifetimeLicense && isGracePeriod) {
      return (
        <Text className={styles.gracePeriodInfo} fontSize="14px">
          <Trans
            i18nKey="LicenseGracePeriodActivatedInfo"
            ns="Common"
            t={t}
            values={{
              fromDate: paymentDate,
              byDate: gracePeriodEndDate,
              delayDaysCount,
              productName: t("ProductName"),
            }}
            components={{
              1: <Text as="span" isBold dataTestId="grace-period-date-range" />,
              2: <span data-testid="grace-period-days-remaining" />,
            }}
          />
        </Text>
      );
    }

    return null;
  };

  return (
    <div
      className={classNames(styles.titleComponent, {
        [styles.limitedWidth]: isTrial,
        [styles.isLicenseDateExpired]: isLicenseDateExpired,
      })}
    >
      <div className={styles.paymentsSubscription}>
        {isLifetimeLicense ||
        isGracePeriod ||
        isTrial ||
        !isLicenseDateExpired ? (
          <div className={styles.title}>
            {getDescription()}

            {!isLicenseDateExpired ? (
              <Text
                fontSize="13px"
                as="span"
                dataTestId="license_expires_date_text"
              >
                {expiresDate()}
              </Text>
            ) : null}
          </div>
        ) : null}
        {alertComponent()}
      </div>
      {getSubDescription()}
      <UserStatisticsDialog
        docspaceFaqUrl={docspaceFaqUrl}
        isVisible={isUserStatisticsVisible}
        statistics={usersStatistics}
        onClose={closeUserStatistics}
        onDownloadAndReport={downloadAndOpenReport}
      />
    </div>
  );
};
