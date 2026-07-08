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

import { useEffect, useRef } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import {
  ContextMenu,
  type ContextMenuRefType,
} from "@docspace/ui-kit/components/context-menu";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { toastr } from "@docspace/ui-kit/components/toast";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import TransactionHistory from "@docspace/ui-kit/billing/shared/transaction-history";
import ServiceToggleSection from "@docspace/ui-kit/billing/services/sub-components/ServiceToggleSection";
import StorageWarning from "@docspace/ui-kit/billing/services/panels/additional-storage/StorageWarning";
import { useServicesStore } from "@docspace/ui-kit/billing/store/ServicesStoreProvider";
import { DOCS_CONNECT_SERVICE } from "@docspace/ui-kit/billing/constants";
import { formatDateLocalized } from "@docspace/ui-kit/utils/date";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import { getBrandName } from "@docspace/shared/constants/brands";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import WalletIcon from "PUBLIC_DIR/images/icons/16/wallet.react.svg";
import SettingsIcon from "PUBLIC_DIR/images/icons/16/catalog-settings-common.svg";
import PencilIcon from "PUBLIC_DIR/images/pencil.react.svg";
import StatisticsIcon from "PUBLIC_DIR/images/icons/16/statistics.react.svg";
import CircleCrossIcon from "PUBLIC_DIR/images/icons/16/circle.cross.svg";

import {
  formatDocsConnectDate,
  getDocsConnectTrialState,
  isDocsConnectCanceled,
} from "../../developer-tools/DocsConnect/utils";
import { DOCS_CONNECT_ROUTE } from "../../developer-tools/DocsConnect/constants";
import { default as BackupPageLoader } from "@docspace/ui-kit/billing/services/pages/backup/BackupPageLoader";
import BuyPlanPanel from "../../developer-tools/DocsConnect/BuyPlanPanel";
import CancelPlanDialog from "../../developer-tools/DocsConnect/CancelPlanDialog";
import PromoPage from "../../developer-tools/DocsConnect/PromoPage";
import { PAYMENT_ROUTES } from "../utils";

import styles from "./DocsConnectPage.module.scss";

interface DocsConnectPageProps {
  info?: TDocsConnectInfo | null;
  isLoading?: boolean;
  buyPlanPanelVisible?: boolean;
  cancelPlanDialogVisible?: boolean;
  fetchInfo?: () => void;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  openCancelPlanDialog?: () => void;
  cancelScheduledChange?: () => Promise<void>;
}

const DocsConnectPage = ({
  info,
  isLoading,
  buyPlanPanelVisible,
  cancelPlanDialogVisible,
  fetchInfo,
  openBuyPlan,
  openCancelPlanDialog,
  cancelScheduledChange,
}: DocsConnectPageProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const navigate = useNavigate();
  const { initServiceData } = useServicesStore();
  const contextMenuRef = useRef<ContextMenuRefType>(null);

  useEffect(() => {
    if (!info) fetchInfo?.();
  }, [info, fetchInfo]);

  useEffect(() => {
    initServiceData(t, DOCS_CONNECT_SERVICE);
  }, []);

  if (isLoading) return <BackupPageLoader />;

  if (!info) return <PromoPage />;

  const {
    endDate,
    daysLeft,
    totalDays,
    percent: spentPercent,
    isPaid,
    expired,
  } = getDocsConnectTrialState(info);

  const trialLow =
    !isPaid && !expired && totalDays > 0 && daysLeft / totalDays < 0.5;

  const currency = info.wallet?.currency ?? "USD";
  const credits = info.wallet?.availableCredits ?? 0;
  const planUsers = info.tenant?.payment?.quantity ?? 0;
  const pricePerUser =
    (info.prices?.pricePerUser ?? 0) +
    (info.devPackEnabled ? (info.prices?.devPackPrice ?? 0) : 0);
  const monthlyCharge = planUsers * pricePerUser;
  const scheduledChange = isPaid ? (info.scheduledChange ?? null) : null;
  const isCancellation =
    scheduledChange != null && scheduledChange.nextUsers === 0;
  const scheduledDevPackOff = scheduledChange?.devPackDisabled ?? false;
  const scheduledUsersChanged =
    scheduledChange != null && scheduledChange.nextUsers !== planUsers;
  const scheduledPerUser = scheduledDevPackOff
    ? (info.prices?.pricePerUser ?? 0)
    : pricePerUser;
  const deactivated = isPaid && (info.deactivated ?? false);
  const canceled = isDocsConnectCanceled(info);

  const onTopUp = () => navigate(PAYMENT_ROUTES.wallet);
  const onViewUsage = () => navigate(PAYMENT_ROUTES.usage);
  const onBuyPlan = () => openBuyPlan?.("trial");
  const onEditPlan = () => openBuyPlan?.("edit");
  const onGoToTenant = () => navigate(DOCS_CONNECT_ROUTE);

  const onCancelPlan = () => openCancelPlanDialog?.();

  const onCancelChange = async () => {
    try {
      await cancelScheduledChange?.();
    } catch (e) {
      toastr.error(e as Error);
    }
  };

  const contextMenuItems = scheduledChange
    ? [
        {
          key: "usage",
          label: t("Common:ViewUsage"),
          iconNode: <StatisticsIcon />,
          onClick: onViewUsage,
        },
      ]
    : [
        {
          key: "edit",
          label: t("Common:EditSubscription"),
          iconNode: <PencilIcon />,
          onClick: onEditPlan,
        },
        {
          key: "usage",
          label: t("Common:ViewUsage"),
          iconNode: <StatisticsIcon />,
          onClick: onViewUsage,
        },
        {
          key: "separator",
          isSeparator: true,
        },
        {
          key: "cancel",
          label: t("Common:CancelSubscription"),
          iconNode: <CircleCrossIcon />,
          onClick: onCancelPlan,
        },
      ];

  const docsName = `${getBrandName("OrganizationName")} ${getBrandName("ProductEditorsName")}`;

  return (
    <div className={styles.container}>
      <ServiceToggleSection
        isEnabled={deactivated || canceled ? false : isPaid || !expired}
        isDisabled={(!isPaid && !expired) || scheduledChange != null}
        onToggle={
          canceled
            ? onEditPlan
            : deactivated
              ? onTopUp
              : isPaid
                ? onCancelPlan
                : onBuyPlan
        }
        title={t("DocsConnect:DocsConnect")}
        priceText={t("DocsConnect:FromPricePerUserMonthNote", {
          price: formatCurrencyValue(
            i18n.language,
            info.prices?.pricePerUser ?? 0,
            currency,
            0,
          ),
        })}
        description={t("DocsConnect:ServiceToggleDescription", {
          productName: docsName,
        })}
      />

      {scheduledChange ? (
        <StorageWarning
          title={
            isCancellation
              ? t("Common:SubscriptionCancellation")
              : scheduledDevPackOff && scheduledUsersChanged
                ? t("Common:TariffDevPackUserAdjustmentScheduled", {
                    fromCount: planUsers,
                    toCount: scheduledChange.nextUsers,
                  })
                : scheduledDevPackOff
                  ? t("Common:TariffDevPackDeactivationScheduled")
                  : t("Common:TariffUserAdjustmentScheduled", {
                      fromCount: planUsers,
                      toCount: scheduledChange.nextUsers,
                    })
          }
          body={
            isCancellation
              ? t("Common:PlanCancellationBillingPeriodNote", {
                  date: formatDateLocalized(
                    scheduledChange.dueDate,
                    "DATE_MED",
                    { locale: i18n.language },
                  ),
                })
              : t("Common:ScheduledChangeBillingPeriodNote", {
                  date: formatDateLocalized(
                    scheduledChange.dueDate,
                    "DATE_MED",
                    { locale: i18n.language },
                  ),
                })
          }
          onCancelChange={onCancelChange}
        />
      ) : null}

      <div className={styles.walletCard}>
        <div className={styles.walletLeft}>
          <span className={styles.walletIcon} aria-hidden="true">
            <WalletIcon />
          </span>
          <div className={styles.walletText}>
            <Text className={styles.walletTitle}>{t("Common:Wallet")}</Text>
            <Text className={styles.walletCredits}>
              {t("Common:AvailableCredits")}:{" "}
              <span className={styles.creditsValue}>
                {formatCurrencyValue(i18n.language, credits, currency, 2)}
              </span>
            </Text>
          </div>
        </div>
        <Button
          size={ButtonSize.small}
          label={t("Common:TopUp")}
          onClick={onTopUp}
        />
      </div>

      {isPaid && canceled ? (
        <>
          <Text className={styles.sectionTitle}>
            {t("Common:CurrentSubscription")}
          </Text>
          <div className={styles.noPlanCard}>
            <Text className={styles.noPlanTitle}>
              {t("Common:NoActiveSubscription")}
            </Text>
            <Button
              primary
              scale
              size={ButtonSize.normal}
              label={t("DocsConnect:BuyAPlan")}
              onClick={onEditPlan}
            />
          </div>
        </>
      ) : isPaid ? (
        <>
          <div className={styles.tariffHeader}>
            {deactivated ? (
              <Text
                className={`${styles.sectionTitle} ${styles.sectionTitleError}`}
              >
                {t("Common:SubscriptionDeactivated")}
              </Text>
            ) : (
              <Text className={styles.sectionTitle}>
                {t("Common:CurrentSubscription")}
              </Text>
            )}
            <IconButton
              iconNode={<SettingsIcon />}
              size={16}
              onClick={(e) => contextMenuRef.current?.show(e)}
            />
            <ContextMenu ref={contextMenuRef} model={contextMenuItems} />
          </div>

          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <Text className={styles.cardLabel}>
                {t("Common:MonthlyCharge")}
              </Text>
              <Text className={styles.cardValue}>
                {formatCurrencyValue(i18n.language, monthlyCharge, currency, 2)}
              </Text>
              <Text className={styles.cardCaption}>
                {info.devPackEnabled
                  ? t("DocsConnect:PricePerUserDevPackShort", {
                      price: formatCurrencyValue(
                        i18n.language,
                        pricePerUser,
                        currency,
                        0,
                      ),
                    })
                  : t("DocsConnect:PricePerUserShort", {
                      price: formatCurrencyValue(
                        i18n.language,
                        pricePerUser,
                        currency,
                        0,
                      ),
                    })}
              </Text>
            </div>

            <div className={styles.summaryCard}>
              <Text className={styles.cardLabel}>{t("Common:Quantity")}</Text>
              <Text className={styles.cardValue}>{planUsers}</Text>
              <Text className={styles.cardCaption}>
                {t("DocsConnect:PlanUsers")}
              </Text>
            </div>
          </div>

          {deactivated ? (
            <div className={styles.actionsRow}>
              <Button
                primary
                size={ButtonSize.small}
                label={t("Common:TopUpAndPay")}
                onClick={onEditPlan}
              />
            </div>
          ) : scheduledChange ? (
            <Text className={styles.renewalText}>
              {isCancellation ? (
                <Trans
                  t={t}
                  i18nKey="DocsConnect:TariffPlanAutoCanceled"
                  values={{
                    date: formatDateLocalized(
                      scheduledChange.dueDate,
                      "DATE_MED",
                      { locale: i18n.language },
                    ),
                  }}
                  components={{ 1: <Text as="span" fontWeight={600} /> }}
                />
              ) : (
                <Trans
                  t={t}
                  i18nKey="Common:SubscriptionAutoRenewedWithUpdate"
                  values={{
                    finalDate: formatDateLocalized(
                      scheduledChange.dueDate,
                      "DATE_MED",
                      { locale: i18n.language },
                    ),
                    price: formatCurrencyValue(
                      i18n.language,
                      scheduledChange.nextUsers * scheduledPerUser,
                      currency,
                      2,
                    ),
                    amount: `${t("DocsConnect:PlanUsers")}: ${scheduledChange.nextUsers}`,
                  }}
                  components={{ 1: <Text as="span" fontWeight={600} /> }}
                />
              )}
            </Text>
          ) : (
            <div className={styles.actionsRow}>
              <Button
                primary
                size={ButtonSize.small}
                label={t("Common:EditSubscription")}
                onClick={onEditPlan}
              />
              <Button
                size={ButtonSize.small}
                label={t("DocsConnect:GoToTenant")}
                onClick={onGoToTenant}
              />
              <Text className={styles.renewalText}>
                <Trans
                  t={t}
                  i18nKey="DocsConnect:TariffPlanAutoRenewed"
                  values={{
                    date: formatDateLocalized(endDate, "DATE_MED", {
                      locale: i18n.language,
                    }),
                  }}
                  components={{ 1: <Text as="span" fontWeight={600} /> }}
                />
              </Text>
            </div>
          )}
        </>
      ) : (
        <>
          {expired ? (
            <div className={styles.expiredBanner}>
              <div className={styles.expiredBannerText}>
                <Text className={styles.expiredTitle}>
                  {t("DocsConnect:TrialExpiredTitle")}
                </Text>
                <Text className={styles.expiredDescription}>
                  {t("DocsConnect:TrialExpiredDescription")}
                </Text>
              </div>
              <Button
                primary
                size={ButtonSize.small}
                label={t("DocsConnect:Upgrade")}
                onClick={onBuyPlan}
              />
            </div>
          ) : (
            <Text className={styles.sectionTitle}>
              {t("DocsConnect:FreeTrialTitle")}
            </Text>
          )}

          <div className={styles.trialCard}>
            <Text className={styles.trialLabel}>
              {t("DocsConnect:DaysLeft")}
            </Text>
            <Text className={styles.trialDays}>{daysLeft}</Text>
            <Text className={styles.trialTotal}>
              {t("DocsConnect:OfDays", { count: totalDays })}
            </Text>
            <div
              className={`${styles.progress} ${
                expired
                  ? styles.progressExpired
                  : trialLow
                    ? styles.progressLow
                    : ""
              }`}
            >
              <ProgressBar percent={spentPercent} />
            </div>
          </div>

          {expired ? null : (
            <div className={styles.actionsRow}>
              <Button
                primary
                size={ButtonSize.small}
                label={t("DocsConnect:Upgrade")}
                onClick={onBuyPlan}
              />
              <Button
                size={ButtonSize.small}
                label={t("DocsConnect:GoToTenant")}
                onClick={onGoToTenant}
              />
              <Text className={styles.trialEnds}>
                {t("DocsConnect:TrialEndsOn", {
                  date: formatDocsConnectDate(endDate),
                })}
              </Text>
            </div>
          )}
        </>
      )}

      <div className={styles.history}>
        <TransactionHistory
          serviceName={DOCS_CONNECT_SERVICE}
          hideTypeFilter
          hideContactFilter
        />
      </div>

      {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
      {cancelPlanDialogVisible ? <CancelPlanDialog /> : null}
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  isLoading: docsConnectStore.isLoading,
  buyPlanPanelVisible: docsConnectStore.buyPlanPanelVisible,
  cancelPlanDialogVisible: docsConnectStore.cancelPlanDialogVisible,
  fetchInfo: docsConnectStore.fetchInfo,
  openBuyPlan: docsConnectStore.openBuyPlan,
  openCancelPlanDialog: docsConnectStore.openCancelPlanDialog,
  cancelScheduledChange: docsConnectStore.cancelScheduledChange,
}))(observer(DocsConnectPage));

