/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { inject, observer } from "mobx-react";
import { useLocation } from "react-router";
import { Trans, useTranslation } from "react-i18next";

import WarningComponent from "@docspace/ui-kit/components/navigation/sub-components/WarningComponent";
import { Link } from "@docspace/ui-kit/components/link";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { Text } from "@docspace/ui-kit/components/text";

type InjectedProps = {
  isPayer?: boolean;
  isPayerInfoLoaded?: boolean;
  walletCustomerEmail?: string;
  cardLinkedOnNonProfit?: boolean;
  cardLinkedOnFreeTariff?: boolean;
  isBackupPaid?: boolean;
  backupsCount?: number;
  maxFreeBackups?: number;
  isInited?: boolean;
  isBackupServiceOn?: boolean;
  isNotPaidPeriod?: boolean;
};

const Warning = ({
  isPayer,
  isPayerInfoLoaded,
  walletCustomerEmail,
  cardLinkedOnNonProfit,
  cardLinkedOnFreeTariff,
  isBackupPaid,
  backupsCount = 0,
  maxFreeBackups = 0,
  isInited,
  isBackupServiceOn,
  isNotPaidPeriod,
}: InjectedProps) => {
  const { t, ready } = useTranslation(["Services", "Common", "Payments"]);
  const { pathname } = useLocation();
  const [warningText, setWarningText] = React.useState<React.ReactNode>("");

  const onClickServiceUrl = () => {
    const servicePageUrl = combineUrl(
      "/portal-settings",
      "payments",
      "/services",
    );

    window.DocSpace.navigate(servicePageUrl);
  };

  const onClickLearnMore = () => {
    const servicePageUrl = combineUrl(
      "/portal-settings",
      "payments",
      "/payment-method",
    );

    window.DocSpace.navigate(servicePageUrl);
  };

  const isBackupRoute =
    typeof pathname === "string" && pathname.includes("portal-settings/backup");

  const isPaymentsServiceRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/services/");

  const isPortalPaymentsRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/portal-payments");

  const isWalletRoute =
    typeof pathname === "string" &&
    pathname.includes("portal-settings/payments/wallet");

  React.useEffect(() => {
    if (!isBackupPaid || isNotPaidPeriod) return;
    if (!isBackupRoute || !isInited) return;
    if (!ready) return;

    const setWarningTextFunc = () => {
      const connectServiceLink = (
        <Trans
          t={t}
          i18nKey="ConnectService"
          ns="Common"
          components={{
            1: (
              <Link
                key="connect-service-link"
                tag="a"
                onClick={onClickServiceUrl}
                color="accent"
              />
            ),
          }}
        />
      );

      const connectPayer = (
        <Trans
          t={t}
          i18nKey="ContactToPayer"
          ns="Services"
          values={{ email: walletCustomerEmail }}
          components={{
            1: (
              <Link
                key="contact-payer-link"
                tag="a"
                color="accent"
                href={`mailto:${walletCustomerEmail}`}
              />
            ),
          }}
        />
      );
      let resultText: React.ReactNode = "";

      if (maxFreeBackups > 0) {
        try {
          const backupText = t("Common:FreeBackupsPerMonth", {
            value:
              backupsCount >= maxFreeBackups ? maxFreeBackups : backupsCount,
            maxValue: maxFreeBackups,
          });

          resultText = backupText;

          if (backupsCount >= maxFreeBackups && !isBackupServiceOn) {
            const additionalInfo = isPayer ? connectServiceLink : connectPayer;
            resultText = (
              <>
                <Text key="backup-text" as="span" fontWeight={600}>
                  {backupText}
                </Text>{" "}
                <Text key="additional-info" as="span">
                  {additionalInfo}
                </Text>
              </>
            );
          }

          setWarningText(resultText);
        } catch (e) {
          console.error(e);
        }

        return;
      }

      resultText = connectServiceLink;

      if (cardLinkedOnNonProfit || cardLinkedOnFreeTariff) {
        if (isBackupServiceOn) {
          resultText = "";
        } else {
          resultText = isPayer ? connectServiceLink : connectPayer;
        }
      }

      setWarningText(resultText);
    };

    setWarningTextFunc();
  }, [
    ready,
    backupsCount,
    isInited,
    isBackupServiceOn,
    cardLinkedOnNonProfit,
    cardLinkedOnFreeTariff,
    isPayer,
    isBackupPaid,
    isNotPaidPeriod,
  ]);

  React.useEffect(() => {
    if (warningText) setWarningText("");
  }, [isBackupRoute]);

  if (
    (isPortalPaymentsRoute || isWalletRoute || isPaymentsServiceRoute) &&
    !isPayer
  ) {
    if (!isPayerInfoLoaded) return null;

    return (
      <WarningComponent
        title={
          <Trans
            t={t}
            i18nKey="OnlyPayerCanManageSection"
            ns="Common"
            components={{
              1: (
                <Link
                  key="learn-more-link"
                  tag="a"
                  color="accent"
                  onClick={onClickLearnMore}
                />
              ),
            }}
          />
        }
      />
    );
  }

  if (!isBackupPaid || !isBackupRoute || !warningText) return null;

  return <WarningComponent title={warningText} />;
};

export default inject(
  ({
    paymentStore,
    currentTariffStatusStore,
    currentQuotaStore,
    backup,
  }: TStore) => {
    const {
      isPayer,
      cardLinkedOnNonProfit,
      cardLinkedOnFreeTariff,
      isBackupServiceOn,
    } = paymentStore;
    const { walletCustomerEmail, isNotPaidPeriod, isPayerInfoLoaded } =
      currentTariffStatusStore;
    const { isBackupPaid, maxFreeBackups } = currentQuotaStore;
    const { backupsCount, isInited } = backup;
    return {
      isPayer,
      isPayerInfoLoaded,
      walletCustomerEmail,
      cardLinkedOnNonProfit,
      cardLinkedOnFreeTariff,
      isBackupPaid,
      backupsCount,
      isInited,
      isBackupServiceOn,
      maxFreeBackups,
      isNotPaidPeriod,
    };
  },
)(observer(Warning));

