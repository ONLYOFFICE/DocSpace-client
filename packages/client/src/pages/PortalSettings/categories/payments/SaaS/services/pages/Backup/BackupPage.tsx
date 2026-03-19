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

import React, { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";

import ServiceToggleSection from "../../sub-components/ServiceToggleSection";
import TransactionHistory from "../../../shared/transaction-history";
import styles from "./BackupPage.module.scss";
import { BACKUP_SERVICE } from "@docspace/shared/constants";
import { DeviceType } from "@docspace/ui-kit/enums";
import WalletInfo from "../../../shared/top-up-balance/sub-components/WalletInfo";
import { setServiceState } from "@docspace/shared/api/portal";
import { now, formatDateLocalized } from "@docspace/ui-kit/utils/date";
import { toastr } from "@docspace/ui-kit/components";
import ConfirmationDialog from "../../sub-components/ConfirmationDialog";
import TopUpModal from "../../../shared/top-up-balance/TopUpModal";
import BackupPageLoader from "./BackupPageLoader";

type BackupPageProps = {
  availableBackupsCount?: number;
  backupServicePrice?: number;
  isBackupServiceOn?: boolean;
  formatWalletCurrency?: (amount?: number, fractionDigits?: number) => string;
  changeServiceState?: (service: string) => void;
  setServiceState?: (service: string, enabled: boolean) => void;
  isFreeTariff?: boolean;
  maxFreeBackups?: number;
  usedBackupsCount?: number;
  isInitServicesData?: boolean;
};

const BackupPage: React.FC<BackupPageProps> = ({
  formatWalletCurrency,
  availableBackupsCount = 0,
  backupServicePrice = 0,
  changeServiceState,
  isBackupServiceOn,
  isFreeTariff,
  maxFreeBackups,
  usedBackupsCount,
  isInitServicesData,
}) => {
  const { t, ready } = useTranslation(["Payments", "Services", "Common"]);

  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmDialogVisible, setIsConfirmDialogVisible] = useState(false);
  const [isTopUpVisible, setIsTopUpVisible] = useState(false);

  const shouldShowLoader = !isInitServicesData || !ready;

  const handleToggleChange = () => {
    setIsConfirmDialogVisible(true);
  };

  const onCloseConfirmDialog = () => {
    setIsConfirmDialogVisible(false);
  };

  const onConfirm = async () => {
    const raw = {
      service: BACKUP_SERVICE,
      enabled: !isBackupServiceOn,
    };

    setIsLoading(true);
    setIsConfirmDialogVisible(false);
    changeServiceState!(BACKUP_SERVICE);

    try {
      await setServiceState!(raw);
    } catch (error) {
      console.error(error);
      toastr.error(t("Common:UnexpectedError"));
      changeServiceState!(BACKUP_SERVICE);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationDialogContent = {
    title: t("Common:Confirmation"),

    body: !isBackupServiceOn
      ? t("Services:EnableBackupConfirm", {
          productName: t("Common:ProductName"),
        })
      : isFreeTariff
        ? t("Services:DisableBackupConfirmWithoutQuota", {
            productName: t("Common:ProductName"),
          })
        : t("Services:DisableBackupConfirm", {
            productName: t("Common:ProductName"),
          }),
  };

  const onTopUp = () => {
    setIsTopUpVisible(true);
  };

  const onCloseTopUpModal = () => {
    setIsTopUpVisible(false);
  };

  const balance = formatWalletCurrency!();

  const isLowBalance = isBackupServiceOn && availableBackupsCount === 0;

  if (shouldShowLoader) return <BackupPageLoader />;

  return (
    <div className={styles.container}>
      <ServiceToggleSection
        isEnabled={isBackupServiceOn!}
        onToggle={handleToggleChange}
        title={t("Common:Backup")}
        description={t("Payments:BackupDescription")}
        isDisabled={isLoading}
      />
      <WalletInfo
        shortView
        withoutBackground
        balance={balance}
        onTopUp={isLowBalance ? onTopUp : undefined}
      />
      {isLowBalance ? (
        <Text className={styles.lowBalance} fontSize="15px" fontWeight={600}>
          {t("Services:NeedTopUpWallet")}
        </Text>
      ) : null}
      <div className={styles.backupsCard}>
        <div className={styles.backupsHeader}>
          <Text fontWeight="700" fontSize="14px">
            {isFreeTariff && !isBackupServiceOn
              ? t("Services:PaidBackupDisabled")
              : t("Payments:AvailableBackups")}
          </Text>
        </div>

        {!isFreeTariff ? (
          <div className={styles.freeBackupsAmountContainer}>
            <div className={styles.backupsCount}>
              <Text fontSize="28px" fontWeight="700">
                {usedBackupsCount}
              </Text>{" "}
              <Text fontSize="20px" fontWeight="700">
                /{maxFreeBackups}
              </Text>
            </div>
            <Text className={styles.grayText}>{t("Services:FreeMonthly")}</Text>
          </div>
        ) : null}
        {isBackupServiceOn ? (
          <>
            {!isFreeTariff ? <div className={styles.divider} /> : null}
            <div className={styles.backupsAmountContainer}>
              <Text fontSize="28px" fontWeight="700">
                {availableBackupsCount}
              </Text>
              <Text className={styles.grayText}>
                {t("Payments:PerBackupWithBracket", {
                  currency: `$${backupServicePrice}`,
                })}
              </Text>
            </div>
          </>
        ) : (
          <Button
            className={styles.backupButton}
            size={ButtonSize.small}
            label={t("Common:Enable")}
            onClick={handleToggleChange}
            primary
            scale
          />
        )}
      </div>
      {!isFreeTariff ? (
        <Text className={styles.backupPaidInfo}>
          <Trans
            t={t}
            ns="Services"
            i18nKey="FreeBackupsRenewsDate"
            values={{
              date: formatDateLocalized(
                now()
                  .setZone(window.timezone)
                  .startOf("month")
                  .plus({ months: 1 }),
                "DATE_MED",
              ),
            }}
            components={{
              1: <Text fontWeight="600" as="span" />,
            }}
          />
        </Text>
      ) : null}
      {isFreeTariff && !isBackupServiceOn ? (
        <Text className={styles.backupPaidInfo}>
          {t("Services:ActivateServiceToAllow")}
        </Text>
      ) : null}
      <div>
        <TransactionHistory serviceName={BACKUP_SERVICE} hideTypeFilter />
      </div>

      {isConfirmDialogVisible ? (
        <ConfirmationDialog
          visible={isConfirmDialogVisible}
          onClose={onCloseConfirmDialog}
          onConfirm={onConfirm}
          title={confirmationDialogContent.title}
          bodyText={confirmationDialogContent.body}
        />
      ) : null}
      {isTopUpVisible ? (
        <TopUpModal
          visible={isTopUpVisible}
          onClose={onCloseTopUpModal}
          serviceName={BACKUP_SERVICE}
        />
      ) : null}
    </div>
  );
};

export default inject(
  ({ paymentStore, servicesStore, currentQuotaStore }: TStore) => {
    const {
      formatWalletCurrency,
      availableBackupsCount,
      backupServicePrice,
      changeServiceState,
      isBackupServiceOn,
    } = paymentStore;

    const { isFreeTariff, isBackupPaid, maxFreeBackups } = currentQuotaStore;
    const { usedBackupsCount, isInitServicesData } = servicesStore;

    return {
      formatWalletCurrency,
      availableBackupsCount,
      backupServicePrice,
      changeServiceState,
      isBackupServiceOn,
      isFreeTariff,
      isBackupPaid,
      maxFreeBackups,
      usedBackupsCount,
      isInitServicesData,
    };
  },
)(observer(BackupPage));

