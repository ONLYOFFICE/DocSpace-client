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

import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";

import { Text } from "@docspace/ui-kit/components/text";
import { Heading, HeadingLevel } from "@docspace/ui-kit/components/heading";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { IconButton } from "@docspace/ui-kit/components/icon-button";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import { toastr } from "@docspace/ui-kit/components/toast";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";

import type {
  TDocsConnectInfo,
  TDocsConnectUsage,
} from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import styles from "./TenantPanel.module.scss";

interface StatisticsProps {
  info?: TDocsConnectInfo;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  copyToClipboard?: (value: string, t: TTranslation) => void;
}

const InfoField = ({
  label,
  value,
  displayValue,
  onCopy,
  copyTitle,
}: {
  label: string;
  value: string;
  displayValue?: string;
  onCopy: (value: string) => void;
  copyTitle: string;
}) => (
  <div className={styles.infoCard}>
    <Text fontSize="13px" fontWeight={600} className={styles.muted}>
      {label}
    </Text>
    <div className={styles.infoValueRow}>
      <Text fontSize="13px" truncate>
        {displayValue ?? value}
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

const StatColumn = ({ value, label }: { value: number; label: string }) => (
  <div className={styles.statColumn}>
    <Text fontSize="18px" fontWeight={700}>
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
  t,
}: {
  title: string;
  subtitle: string;
  usageLabel: string;
  usage: TDocsConnectUsage;
  t: TTranslation;
}) => {
  const percent = usage.limit > 0 ? (usage.active / usage.limit) * 100 : 0;

  return (
    <div className={styles.usageBlock}>
      <Text fontSize="16px" fontWeight={600}>
        {title}
      </Text>
      <Text fontSize="12px" className={styles.muted}>
        {subtitle}
      </Text>
      <div className={styles.usageBarRow}>
        <Text fontSize="13px">{usageLabel}</Text>
        <Text fontSize="13px">{`${usage.active} / ${usage.limit}`}</Text>
      </div>
      <ProgressBar percent={percent} />
      <div className={styles.statRow}>
        <StatColumn value={usage.active} label={t("DocsConnect:Active")} />
        <StatColumn value={usage.internal} label={t("DocsConnect:Internal")} />
        <StatColumn value={usage.external} label={t("DocsConnect:External")} />
        <StatColumn
          value={usage.remaining}
          label={t("DocsConnect:Remaining")}
        />
      </div>
    </div>
  );
};

const Statistics = ({
  info,
  openBuyPlan,
  copyToClipboard,
}: StatisticsProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);

  if (!info) return null;

  const isTrial = info.status === "trial";
  const { wallet } = info;

  const onCopy = (value: string) => copyToClipboard?.(value, t);

  const onDownloadReport = () => {
    // TODO(docs-connect): wire to the real report download endpoint.
    toastr.info(t("DocsConnect:ReportInProgress"));
  };

  return (
    <div className={styles.statistics}>
      {isTrial ? (
        <div className={styles.trialBanner}>
          <div className={styles.trialBannerText}>
            <Text fontSize="13px" fontWeight={600}>
              {t("DocsConnect:TrialBannerTitle")}
            </Text>
            <Text fontSize="12px" className={styles.muted}>
              {t("DocsConnect:TrialBannerDescription")}
            </Text>
          </div>
          <Button
            primary
            size={ButtonSize.small}
            label={t("DocsConnect:BuyAPlan")}
            onClick={() => openBuyPlan?.("trial")}
          />
        </div>
      ) : null}

      <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
        {t("DocsConnect:SystemOverview")}
      </Heading>
      <div className={styles.overviewGrid}>
        <InfoField
          label={t("DocsConnect:Address")}
          value={info.address}
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
        <InfoField
          label={t("DocsConnect:JwtHeader")}
          value={info.jwtHeader}
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
        <InfoField
          label={t("DocsConnect:SecretKey")}
          value={info.secretKey}
          displayValue={"•".repeat(24)}
          onCopy={onCopy}
          copyTitle={t("Common:CopyToClipboard")}
        />
      </div>

      <div className={styles.twoCards}>
        {isTrial ? (
          <div className={styles.detailCard}>
            <Text fontSize="16px" fontWeight={600}>
              {t("DocsConnect:License")}
            </Text>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("DocsConnect:Start")}</Text>
              <Text fontWeight={600}>{info.trial.start}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>
                {t("DocsConnect:ValidUntil")}
              </Text>
              <Text fontWeight={600}>{info.trial.validUntil}</Text>
            </div>
            <ProgressBar
              percent={Math.max(0, ((30 - info.trial.daysLeft) / 30) * 100)}
            />
            <Text fontSize="12px" className={styles.muted}>
              {t("DocsConnect:DaysRemaining", { count: info.trial.daysLeft })}
            </Text>
          </div>
        ) : (
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <Text fontSize="16px" fontWeight={600}>
                {t("DocsConnect:TariffPlan")}{" "}
                <Text as="span" fontSize="12px" className={styles.muted}>
                  {t("DocsConnect:RenewsOn", { date: info.plan.renewsOn })}
                </Text>
              </Text>
              <Link
                type={LinkType.action}
                color="accent"
                fontSize="13px"
                fontWeight={600}
                onClick={() => openBuyPlan?.("edit")}
              >
                {t("DocsConnect:EditPlan")}
              </Link>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("DocsConnect:Users")}</Text>
              <Text fontWeight={600}>{info.plan.users}</Text>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>{t("DocsConnect:Price")}</Text>
              <Text fontWeight={600}>
                {t("DocsConnect:PricePerUser", {
                  price: `${wallet.currency}${info.plan.pricePerUser}`,
                })}
              </Text>
            </div>
            <div className={styles.detailRow}>
              <Text className={styles.muted}>
                {t("DocsConnect:MonthlyCharge")}
              </Text>
              <Text fontWeight={600}>
                {`${wallet.currency}${info.plan.monthlyCharge}`}
              </Text>
            </div>
          </div>
        )}

        <div className={styles.detailCard}>
          <Text fontSize="16px" fontWeight={600}>
            {t("DocsConnect:Build")}
          </Text>
          <div className={styles.detailRow}>
            <Text className={styles.muted}>{t("DocsConnect:BuildType")}</Text>
            <Text fontWeight={600}>{info.build.type}</Text>
          </div>
          <div className={styles.detailRow}>
            <Text className={styles.muted}>{t("DocsConnect:Version")}</Text>
            <Text fontWeight={600}>{info.build.version}</Text>
          </div>
          <div className={styles.detailRow}>
            <Text className={styles.muted}>{t("DocsConnect:Released")}</Text>
            <Text fontWeight={600}>{info.build.released}</Text>
          </div>
        </div>
      </div>

      <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
        {t("DocsConnect:UserActivity")}
      </Heading>
      <Text fontSize="12px" className={styles.muted}>
        {t("DocsConnect:UserActivitySubtitle")}
      </Text>
      <div className={styles.twoCards}>
        <UsageBlock
          title={t("DocsConnect:Editors")}
          subtitle={t("DocsConnect:EditorsSubtitleStat")}
          usageLabel={t("DocsConnect:EditorUsage")}
          usage={info.usage.editors}
          t={t}
        />
        <UsageBlock
          title={t("DocsConnect:LiveViewer")}
          subtitle={t("DocsConnect:LiveViewerSubtitle")}
          usageLabel={t("DocsConnect:ViewerUsage")}
          usage={info.usage.viewer}
          t={t}
        />
      </div>

      <div>
        <Button
          size={ButtonSize.small}
          label={t("DocsConnect:DownloadReport")}
          onClick={onDownloadReport}
        />
      </div>

      {!isTrial ? (
        <div className={styles.integrations}>
          <Heading level={HeadingLevel.h2} className={styles.sectionTitle}>
            {t("DocsConnect:IntegrationOptions")}
          </Heading>
          <Text fontSize="12px" className={styles.muted}>
            {t("DocsConnect:IntegrationOptionsSubtitle")}
          </Text>
          <div className={styles.connectorsGrid}>
            {info.connectors.map((connector) => (
              <a
                key={connector.key}
                className={styles.connectorCard}
                href={connector.url}
                target="_blank"
                rel="noreferrer"
              >
                <Text fontSize="13px" fontWeight={600}>
                  {connector.label}
                </Text>
                <Link
                  type={LinkType.action}
                  color="accent"
                  fontSize="13px"
                  fontWeight={600}
                >
                  {t("DocsConnect:Connect")}
                </Link>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  openBuyPlan: docsConnectStore.openBuyPlan,
  copyToClipboard: docsConnectStore.copyToClipboard,
}))(observer(Statistics));
