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

import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { HelpButton } from "@docspace/ui-kit/components/help-button";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import { toastr } from "@docspace/ui-kit/components/toast";
import StorageWarning from "@docspace/ui-kit/billing/services/panels/additional-storage/StorageWarning";
import { getDocsConnectScheduleFlags } from "@docspace/ui-kit/billing/utils/docs-connect";
import { formatDateLocalized } from "@docspace/ui-kit/utils/date";

import AlertIcon from "@docspace/ui-kit/assets/plugin.incompatible.react.svg";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import { getBrandName } from "@docspace/shared/constants/brands";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import { useReportPageLeft } from "SRC_DIR/Hooks/useReportPageLeft";
import { ReportType } from "SRC_DIR/store/DocumentBuilderReportStore";
import { IntegrationsCard } from "SRC_DIR/components/IntegrationsCard";

import {
  formatDocsConnectDate,
  getDocsConnectPricePerUser,
  getDocsConnectTrialState,
} from "../utils";

import InfoField from "./sub-components/InfoField";
import UsageBlock from "./sub-components/UsageBlock";

import styles from "./TenantPanel.module.scss";

interface StatisticsProps {
  info?: TDocsConnectInfo;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  openRemoveSubscriptionDialog?: () => void;
  cancelScheduledChange?: () => Promise<void>;
  copyToClipboard?: (value: string, t: TTranslation) => void;
  downloadReport?: () => void;
  isReportGenerating?: boolean;
}

const Statistics = ({
  info,
  openBuyPlan,
  openRemoveSubscriptionDialog,
  cancelScheduledChange,
  copyToClipboard,
  downloadReport,
  isReportGenerating,
}: StatisticsProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const [isCancelChangeLoading, setIsCancelChangeLoading] = useState(false);

  useReportPageLeft(ReportType.DocsConnect);

  if (!info) return null;

  const { tenant, config, tenantInfo, wallet } = info;
  const {
    isTrial,
    startDate: trialStart,
    endDate: trialEnd,
    daysLeft,
    totalDays,
    expired,
    percent: trialPercent,
  } = getDocsConnectTrialState(info);
  const trialLow = !expired && totalDays > 0 && daysLeft / totalDays < 0.5;

  const currency = wallet?.currency ?? "USD";
  const { devPackEnabled } = info;
  const pricePerUser = getDocsConnectPricePerUser(info);
  const planUsers = tenant.payment?.quantity ?? 0;
  const monthlyCharge = planUsers * pricePerUser;
  const scheduledChange = isTrial ? null : (info.scheduledChange ?? null);
  const deactivated = !isTrial && (info.deactivated ?? false);

  const nextDevPackEnabled =
    scheduledChange?.nextDevPackEnabled ?? devPackEnabled;
  const nextPricePerUser = getDocsConnectPricePerUser(info, nextDevPackEnabled);
  const { isCancellation, devPackDisabling, usersAdjusting } =
    getDocsConnectScheduleFlags({
      hasSubscription: !isTrial,
      currentUsers: planUsers,
      scheduledUsers: scheduledChange?.nextUsers ?? null,
      scheduledOnDevPack: scheduledChange?.scheduledOnDevPack ?? false,
      nextDevPackEnabled,
    });

  const nextMonthlyPrice = formatCurrencyValue(
    i18n.language,
    (scheduledChange?.nextUsers ?? 0) * nextPricePerUser,
    currency,
    2,
  );
  const scheduledChangeDate = formatDateLocalized(
    scheduledChange?.dueDate ?? "",
    "DATE_MED",
    { locale: i18n.language },
  );

  const getScheduledChangeTitle = () => {
    if (isCancellation) return t("Common:SubscriptionCancellation");

    if (devPackDisabling)
      return usersAdjusting
        ? t("Common:TariffUserAdjustmentDevPackDisableScheduledWithPrice", {
            fromCount: planUsers,
            toCount: scheduledChange?.nextUsers,
            price: nextMonthlyPrice,
          })
        : t("Common:TariffDevPackDisableScheduledWithPrice", {
            price: nextMonthlyPrice,
          });

    if (!usersAdjusting) return t("Common:ChangeShedule");

    return t("Common:TariffUserAdjustmentScheduledWithPrice", {
      fromCount: planUsers,
      toCount: scheduledChange?.nextUsers,
      price: nextMonthlyPrice,
    });
  };

  const scheduledChangeTitle = getScheduledChangeTitle();

  const getSubscriptionNote = () => {
    if (!scheduledChange)
      return t("Common:RenewsOnDate", {
        date: formatDocsConnectDate(tenant.endDate),
      });

    if (isCancellation)
      return t("DocsConnect:CancellationOn", { date: scheduledChangeDate });

    if (devPackDisabling)
      return t("Common:RenewsOnDate", { date: scheduledChangeDate });

    return t("DocsConnect:RenewsOnWithUpdate", {
      date: scheduledChangeDate,
      price: nextMonthlyPrice,
      count: scheduledChange.nextUsers,
    });
  };

  const subscriptionNote = getSubscriptionNote();

  const onCopy = (value: string) => copyToClipboard?.(value, t);

  const onCancelChange = async () => {
    if (isCancelChangeLoading) return;

    setIsCancelChangeLoading(true);
    try {
      await cancelScheduledChange?.();
    } catch (e) {
      toastr.error(e as Error);
    } finally {
      setIsCancelChangeLoading(false);
    }
  };

  const onTopUpAndPay = () => openBuyPlan?.("edit");

  return (
    <div className={styles.statistics}>
      {deactivated ? (
        <div
          className={styles.deactivatedBanner}
          data-testid="docs_connect_deactivated_banner"
        >
          <div className={styles.deactivatedBannerHeader}>
            <span className={styles.deactivatedBannerIcon} aria-hidden="true">
              <AlertIcon />
            </span>
            <Text
              fontSize="13px"
              fontWeight={600}
              className={styles.deactivatedTitle}
            >
              {t("Common:SubscriptionDeactivated")}
            </Text>
          </div>
          <Text fontSize="12px" className={styles.muted}>
            {t("Common:SubscriptionDeactivatedDescription")}
          </Text>
          <div className={styles.deactivatedBannerActions}>
            <Link
              type={LinkType.action}
              color="accent"
              fontSize="13px"
              fontWeight={600}
              textDecoration="underline dashed"
              onClick={onTopUpAndPay}
            >
              {t("Common:TopUpAndRenew")}
            </Link>
            <span
              className={styles.deactivatedBannerDivider}
              aria-hidden="true"
            >
              |
            </span>
            <Link
              type={LinkType.action}
              fontSize="13px"
              fontWeight={600}
              textDecoration="underline dashed"
              onClick={openRemoveSubscriptionDialog}
            >
              {t("Common:Remove")}
            </Link>
          </div>
        </div>
      ) : null}

      {isTrial ? (
        <div
          className={styles.trialBanner}
          data-testid="docs_connect_trial_banner"
        >
          <div className={styles.trialBannerText}>
            {expired ? (
              <>
                <Text
                  fontSize="13px"
                  fontWeight={600}
                  className={styles.trialExpiredTitle}
                >
                  {t("DocsConnect:TrialExpiredTitle")}
                </Text>
                <Text fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:TrialExpiredDescription")}
                </Text>
              </>
            ) : (
              <>
                <Text fontSize="13px" fontWeight={600}>
                  {t("DocsConnect:TrialBannerTitle", {
                    organizationName: getBrandName("OrganizationName"),
                  })}
                </Text>
                <Text fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:TrialBannerDescription", {
                    count: daysLeft,
                  })}
                </Text>
              </>
            )}
          </div>
          <Button
            primary
            className={styles.bannerButton}
            size={ButtonSize.small}
            label={t("Common:Subscribe")}
            onClick={() => openBuyPlan?.("trial")}
            testId="docs_connect_trial_upgrade_button"
          />
        </div>
      ) : null}

      {scheduledChange ? (
        <StorageWarning
          title={scheduledChangeTitle}
          body={
            isCancellation
              ? t("Common:PlanCancellationBillingPeriodNote", {
                  date: scheduledChangeDate,
                  service: t("DocsConnect:DocsConnect"),
                })
              : t("Common:ScheduledChangeBillingPeriodNote", {
                  date: scheduledChangeDate,
                })
          }
          onCancelChange={onCancelChange}
          isCancelLoading={isCancelChangeLoading}
        />
      ) : null}

      <Heading
        level={HeadingLevel.h2}
        className={styles.sectionTitle}
        fontSize="18px"
        fontWeight={700}
      >
        {t("DocsConnect:SystemOverview")}
      </Heading>
      <div className={styles.overviewGrid}>
        <InfoField
          label={t("Common:Address")}
          value={tenant.address ?? ""}
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
        <InfoField
          label={t("DocsConnect:JwtHeader")}
          value={config.security.header}
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
        <InfoField
          label={t("DocsConnect:SecretKeyLabel")}
          value={config.security.secret}
          isSecret
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
      </div>

      <div className={styles.twoCards}>
        {isTrial ? (
          <div className={styles.detailCard}>
            <Text
              className={styles.detailCardTitle}
              fontSize="16px"
              fontWeight={700}
            >
              {t("DocsConnect:LicenseTitle")}
            </Text>
            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>{t("Common:Start")}</Text>
                <Text fontWeight={600}>
                  {formatDocsConnectDate(trialStart)}
                </Text>
              </div>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>{t("Common:ValidUntil")}</Text>
                <Text fontWeight={600}>{formatDocsConnectDate(trialEnd)}</Text>
              </div>
            </div>
            <div
              className={`${styles.licenseProgress} ${
                expired
                  ? styles.licenseProgressExpired
                  : trialLow
                    ? styles.licenseProgressLow
                    : ""
              }`}
            >
              <ProgressBar percent={trialPercent} />
              <Text fontSize="12px" className={styles.muted}>
                {expired
                  ? t("DocsConnect:TrialDaysRemainingExpired", {
                      count: daysLeft,
                    })
                  : t("DocsConnect:TrialDaysRemaining", { count: daysLeft })}
              </Text>
            </div>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              {deactivated ? (
                <div className={styles.subscriptionTitleRow}>
                  <Text fontSize="16px" fontWeight={700}>
                    {t("Common:PreviousSubscription")}
                  </Text>
                  <span className={styles.inactiveBadge}>
                    {t("Common:Inactive")}
                  </span>
                </div>
              ) : (
                <Text fontSize="16px" fontWeight={700}>
                  {t("DocsConnect:Subscription")}{" "}
                  <Text
                    as="span"
                    fontSize="16px"
                    fontWeight={400}
                    className={styles.tariffNote}
                  >
                    {subscriptionNote}
                  </Text>
                </Text>
              )}
              {deactivated ? null : scheduledChange ? null : (
                <Link
                  type={LinkType.action}
                  color="accent"
                  fontSize="13px"
                  fontWeight={600}
                  textDecoration="underline dashed"
                  onClick={() => openBuyPlan?.("edit")}
                  dataTestId="docs_connect_edit_subscription_link"
                >
                  {t("Common:EditButton")}
                </Link>
              )}
            </div>
            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>
                  <Text className={styles.muted}>
                    {t("DocsConnect:PlanUsers")}
                  </Text>
                  <HelpButton
                    size={12}
                    tooltipContent={t("DocsConnect:PlanUsersTooltip", {
                      count: planUsers,
                    })}
                    tooltipMaxWidth="320px"
                  />
                </div>
                <Text fontWeight={600}>{planUsers}</Text>
              </div>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>{t("DocsConnect:Price")}</Text>
                <Text fontWeight={600}>
                  {devPackEnabled ? (
                    <Trans
                      t={t}
                      i18nKey="DocsConnect:PricePerUserDevPackShortRich"
                      values={{
                        price: formatCurrencyValue(
                          i18n.language,
                          pricePerUser,
                          currency,
                          2,
                        ),
                      }}
                      components={{ 1: <Text as="span" fontWeight={400} /> }}
                    />
                  ) : (
                    t("DocsConnect:PricePerUserShort", {
                      price: formatCurrencyValue(
                        i18n.language,
                        pricePerUser,
                        currency,
                        2,
                      ),
                    })
                  )}
                </Text>
              </div>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>
                  {t("Common:MonthlyCharge")}
                </Text>
                <Text fontWeight={600}>
                  {formatCurrencyValue(
                    i18n.language,
                    monthlyCharge,
                    currency,
                    2,
                  )}
                </Text>
              </div>
            </div>
          </div>
        )}

        <div className={styles.detailCard}>
          <Text
            className={styles.detailCardTitle}
            fontSize="16px"
            fontWeight={700}
          >
            {t("DocsConnect:Build")}
          </Text>
          <div className={styles.detailRows}>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("DocsConnect:BuildType")}</Text>
              <Text fontWeight={600}>{tenantInfo.server.packageType}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("Common:Version")}</Text>
              <Text fontWeight={600}>{tenantInfo.server.version}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("DocsConnect:Released")}</Text>
              <Text fontWeight={600}>
                {formatDocsConnectDate(tenantInfo.license.buildDate)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.activityHeader}>
        <Heading
          level={HeadingLevel.h2}
          className={styles.sectionTitle}
          fontSize="18px"
          fontWeight={700}
        >
          {t("DocsConnect:ActivityForPeriod")}
        </Heading>
        <Text fontSize="13px" className={styles.muted}>
          {t("DocsConnect:UserActivitySubtitle")}
        </Text>
      </div>
      <div className={styles.twoCards}>
        <UsageBlock
          title={t("DocsConnect:Editors")}
          subtitle={t("DocsConnect:EditorsSubtitleStat")}
          usageLabel={t("DocsConnect:EditorUsage")}
          usage={tenantInfo.stats.editor}
          limit={tenantInfo.usersLimit.edit}
          t={t}
        />
        <UsageBlock
          title={t("DocsConnect:LiveViewer")}
          subtitle={t("DocsConnect:LiveViewerSubtitle")}
          usageLabel={t("DocsConnect:ViewerUsage")}
          usage={tenantInfo.stats.viewer}
          limit={tenantInfo.usersLimit.view}
          t={t}
        />
      </div>

      <div className={styles.downloadReport}>
        <Button
          className={styles.downloadButton}
          size={ButtonSize.normal}
          label={t("DocsConnect:DownloadReport")}
          onClick={() => downloadReport?.()}
          isLoading={isReportGenerating}
        />
        {isReportGenerating ? (
          <Text fontSize="13px" className={styles.muted}>
            {t("DocsConnect:ReportGenerationHint", {
              sectionName: t("Common:Files"),
            })}
          </Text>
        ) : null}
      </div>

      <IntegrationsCard hideInstanceAction />
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  openBuyPlan: docsConnectStore.openBuyPlan,
  openRemoveSubscriptionDialog: docsConnectStore.openRemoveSubscriptionDialog,
  cancelScheduledChange: docsConnectStore.cancelScheduledChange,
  copyToClipboard: docsConnectStore.copyToClipboard,
  downloadReport: docsConnectStore.downloadReport,
  isReportGenerating: docsConnectStore.isReportGenerating,
}))(observer(Statistics));
