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
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import { CollapsibleCard } from "@docspace/ui-kit/components/collapsible-card";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import EyeReactSvgUrl from "PUBLIC_DIR/images/eye.react.svg?url";
import EyeOffReactSvgUrl from "PUBLIC_DIR/images/eye.off.react.svg?url";
import ArrowSvg from "PUBLIC_DIR/images/arrow2.react.svg";

import { formatCurrencyValue } from "@docspace/shared/utils/common";
import type {
  TDocsConnectInfo,
  TDocsConnectStat,
} from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import {
  formatDocsConnectDate,
  getDocsConnectDaysLeft,
  isDocsConnectTrialExpired,
  getDocsConnectTrialPercent,
  isDocsConnectPaid,
} from "../utils";

import styles from "./TenantPanel.module.scss";

type UsageLevel = "positive" | "negative";

const usageLevelClass: Record<UsageLevel, string> = {
  positive: styles.usagePositive,
  negative: styles.usageNegative,
};

type Connector = { key: string; label: string; url?: string };

const getUsageLevel = (usage: TDocsConnectStat): UsageLevel =>
  usage.criticalRemaining ? "negative" : "positive";

interface StatisticsProps {
  info?: TDocsConnectInfo;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  copyToClipboard?: (value: string, t: TTranslation) => void;
  downloadReport?: () => void;
  nextcloudUrl?: string;
  owncloudUrl?: string;
  confluenceUrl?: string;
  alfrescoUrl?: string;
  moodleUrl?: string;
  odooUrl?: string;
  allConnectorsUrl?: string;
}

const InfoField = ({
  label,
  value,
  isSecret,
  onCopy,
  copyTitle,
}: {
  label: string;
  value: string;
  isSecret?: boolean;
  onCopy: (value: string) => void;
  copyTitle: string;
}) => {
  const [revealed, setRevealed] = useState(false);
  const displayValue = isSecret && !revealed ? "•".repeat(24) : value;

  return (
    <div className={styles.infoCard}>
      <div className={styles.infoLabelRow}>
        <Text fontSize="16px" fontWeight={700}>
          {label}
        </Text>
        {isSecret ? (
          <IconButton
            iconName={revealed ? EyeReactSvgUrl : EyeOffReactSvgUrl}
            size={16}
            onClick={() => setRevealed((prev) => !prev)}
            className={styles.eyeIcon}
          />
        ) : null}
      </div>
      <div className={styles.infoValueRow}>
        <Text fontSize="14px" fontWeight={600} truncate>
          {displayValue}
        </Text>
        <IconButton
          iconName={CopyReactSvgUrl}
          size={16}
          onClick={() => onCopy(value)}
          title={copyTitle}
          className={styles.copyIcon}
        />
      </div>
    </div>
  );
};

const StatColumn = ({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) => (
  <div className={styles.statColumn}>
    <Text
      fontSize="18px"
      fontWeight={700}
      className={highlight ? styles.statValueHighlight : undefined}
    >
      {value}
    </Text>
    <Text fontSize="12px" className={styles.muted}>
      {label}
    </Text>
  </div>
);

const UsageBlock = ({
  title,
  subtitle,
  usageLabel,
  usage,
  limit,
  t,
}: {
  title: string;
  subtitle: string;
  usageLabel: string;
  usage: TDocsConnectStat;
  limit: number;
  t: TTranslation;
}) => {
  const percent = limit > 0 ? (usage.active / limit) * 100 : 0;
  const level = getUsageLevel(usage);

  return (
    <div className={`${styles.usageBlock} ${usageLevelClass[level]}`}>
      <Text fontSize="16px" fontWeight={700}>
        {title}
      </Text>
      <Text fontSize="12px" className={styles.muted}>
        {subtitle}
      </Text>
      <div className={styles.usageBarRow}>
        <Text fontSize="13px">{usageLabel}</Text>
        <Text fontSize="13px" fontWeight={600} className={styles.usageCount}>
          {`${usage.active} / ${limit}`}
        </Text>
      </div>
      <ProgressBar percent={percent} />
      <div className={styles.statRow}>
        <StatColumn value={usage.active} label={t("Common:Active")} />
        <StatColumn value={usage.internal} label={t("DocsConnect:Internal")} />
        <StatColumn value={usage.external} label={t("DocsConnect:External")} />
        <StatColumn
          value={usage.remaining}
          label={t("DocsConnect:Remaining")}
          highlight
        />
      </div>
    </div>
  );
};

const Statistics = ({
  info,
  openBuyPlan,
  copyToClipboard,
  downloadReport,
  nextcloudUrl,
  owncloudUrl,
  confluenceUrl,
  alfrescoUrl,
  moodleUrl,
  odooUrl,
  allConnectorsUrl,
}: StatisticsProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);

  if (!info) return null;

  const { tenant, config, tenantInfo, prices, wallet } = info;
  const isTrial = !isDocsConnectPaid(info);
  const trialStart = tenant.modifiedDate ?? "";
  const trialEnd = tenant.endDate ?? "";
  const daysLeft = getDocsConnectDaysLeft(trialEnd);
  const expired = isDocsConnectTrialExpired(trialEnd);
  const trialPercent = getDocsConnectTrialPercent(trialStart, trialEnd);

  const connectors: Connector[] = [
    { key: "nextcloud", label: "Nextcloud", url: nextcloudUrl },
    { key: "owncloud", label: "ownCloud", url: owncloudUrl },
    { key: "confluence", label: "Confluence", url: confluenceUrl },
    { key: "alfresco", label: "Alfresco", url: alfrescoUrl },
    { key: "moodle", label: "Moodle", url: moodleUrl },
    { key: "seafile", label: "Seafile", url: allConnectorsUrl },
    { key: "odoo", label: "Odoo", url: odooUrl },
  ];

  const currency = wallet?.currency ?? "USD";
  const { devPackEnabled } = info;
  const pricePerUser =
    (prices?.pricePerUser ?? 0) +
    (devPackEnabled ? (prices?.devPackPrice ?? 0) : 0);
  const planUsers = tenant.payment?.quantity ?? 0;
  const monthlyCharge = planUsers * pricePerUser;

  const onCopy = (value: string) => copyToClipboard?.(value, t);

  return (
    <div className={styles.statistics}>
      {isTrial ? (
        <div className={styles.trialBanner}>
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
                  {t("DocsConnect:TrialBannerTitle")}
                </Text>
                <Text fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:TrialBannerDescription", {
                    count: daysLeft,
                  })}
                </Text>
                <Text fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:TrialBannerDescriptionSecond")}
                </Text>
              </>
            )}
          </div>
          <Button
            primary
            className={styles.bannerButton}
            size={ButtonSize.small}
            label={t("DocsConnect:BuyAPlan")}
            onClick={() => openBuyPlan?.("trial")}
          />
        </div>
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
                expired ? styles.licenseProgressExpired : ""
              }`}
            >
              <ProgressBar percent={trialPercent} />
              <Text fontSize="12px" className={styles.muted}>
                {t("DocsConnect:TrialDaysRemaining", { count: daysLeft })}
              </Text>
            </div>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <Text fontSize="16px" fontWeight={700}>
                {t("Common:TariffPlan")}{" "}
                <Text as="span" fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:RenewsOn", {
                    date: formatDocsConnectDate(tenant.endDate),
                  })}
                </Text>
              </Text>
              <Link
                type={LinkType.action}
                color="accent"
                fontSize="13px"
                fontWeight={600}
                onClick={() => openBuyPlan?.("edit")}
              >
                {t("Common:EditPlan")}
              </Link>
            </div>
            <div className={styles.detailRows}>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>
                  {t("DocsConnect:PlanUsers")}
                </Text>
                <Text fontWeight={600}>{planUsers}</Text>
              </div>
              <div className={styles.detailRow}>
                <Text className={styles.muted}>{t("DocsConnect:Price")}</Text>
                <Text fontWeight={600}>
                  {devPackEnabled
                    ? t("DocsConnect:PricePerUserDevPack", {
                        price: formatCurrencyValue(
                          i18n.language,
                          pricePerUser,
                          currency,
                          2,
                        ),
                      })
                    : t("DocsConnect:PricePerUser", {
                        price: formatCurrencyValue(
                          i18n.language,
                          pricePerUser,
                          currency,
                          2,
                        ),
                      })}
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
          {t("DocsConnect:ActivityForPeriod", {
            day: tenantInfo.stats.periodDay,
          })}
        </Heading>
        <Text fontSize="12px" className={styles.muted}>
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
          onClick={downloadReport}
        />
      </div>

      <CollapsibleCard
        title={t("DocsConnect:IntegrationOptions")}
        description={t("DocsConnect:IntegrationOptionsSubtitle")}
        defaultOpen
      >
        <div className={styles.integrationsGrid}>
          {connectors.map((connector) => (
            <a
              key={connector.key}
              className={styles.integrationTile}
              href={connector.url}
              target="_blank"
              rel="noreferrer"
            >
              <Text as="p" className={styles.integrationName}>
                {connector.label}
              </Text>
              <span className={styles.integrationLink}>
                {t("Common:Connect")}
                <ArrowSvg aria-hidden className={styles.integrationArrow} />
              </span>
            </a>
          ))}
          <a
            className={`${styles.integrationTile} ${styles.integrationTileMore}`}
            href={allConnectorsUrl}
            target="_blank"
            rel="noreferrer"
          >
            <Text as="p" className={styles.integrationName}>
              {t("Common:PlusMore", { count: 20 })}
            </Text>
            <span className={styles.integrationLink}>
              {t("Common:ViewAll")}
              <ArrowSvg aria-hidden className={styles.integrationArrow} />
            </span>
          </a>
        </div>
      </CollapsibleCard>
    </div>
  );
};

export default inject(({ docsConnectStore, settingsStore }: TStore) => ({
  info: docsConnectStore.info,
  openBuyPlan: docsConnectStore.openBuyPlan,
  copyToClipboard: docsConnectStore.copyToClipboard,
  downloadReport: docsConnectStore.downloadReport,
  nextcloudUrl: settingsStore.nextcloudUrl,
  owncloudUrl: settingsStore.owncloudUrl,
  confluenceUrl: settingsStore.confluenceUrl,
  alfrescoUrl: settingsStore.alfrescoUrl,
  moodleUrl: settingsStore.moodleUrl,
  odooUrl: settingsStore.odooUrl,
  allConnectorsUrl: settingsStore.allConnectorsUrl,
}))(observer(Statistics));
