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

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import { Text } from "@docspace/ui-kit/components/text";
import { Button, ButtonSize } from "@docspace/ui-kit/components/button";
import { Link, LinkType } from "@docspace/ui-kit/components/link";
import { ProgressBar } from "@docspace/ui-kit/components/progress-bar";
import TransactionHistory from "@docspace/ui-kit/billing/shared/transaction-history";
import { useServicesStore } from "@docspace/ui-kit/billing/store/ServicesStoreProvider";
import { DOCS_CONNECT_SERVICE } from "@docspace/ui-kit/billing/constants";
import { formatCurrencyValue } from "@docspace/shared/utils/common";
import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";

import WalletIcon from "PUBLIC_DIR/images/icons/16/wallet.react.svg";

import {
  formatDocsConnectDate,
  getDocsConnectTrialState,
} from "../../developer-tools/DocsConnect/utils";
import { DOCS_CONNECT_ROUTE } from "../../developer-tools/DocsConnect/constants";
import { default as BackupPageLoader } from "@docspace/ui-kit/billing/services/pages/backup/BackupPageLoader";
import BuyPlanPanel from "../../developer-tools/DocsConnect/BuyPlanPanel";
import PromoPage from "../../developer-tools/DocsConnect/PromoPage";
import { PAYMENT_ROUTES } from "../utils";

import styles from "./DocsConnectPage.module.scss";

interface DocsConnectPageProps {
  info?: TDocsConnectInfo | null;
  isLoading?: boolean;
  buyPlanPanelVisible?: boolean;
  fetchInfo?: () => void;
  openBuyPlan?: (mode: "trial" | "edit") => void;
}

const DocsConnectPage = ({
  info,
  isLoading,
  buyPlanPanelVisible,
  fetchInfo,
  openBuyPlan,
}: DocsConnectPageProps) => {
  const { t, i18n } = useTranslation(["DocsConnect", "Common"]);
  const navigate = useNavigate();
  const { initServiceData } = useServicesStore();

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
  const activeTenants = planUsers > 0 ? 1 : 0;

  const onTopUp = () => navigate(PAYMENT_ROUTES.wallet);
  const onViewMore = () => navigate(PAYMENT_ROUTES.usage);
  const onManage = () => navigate(DOCS_CONNECT_ROUTE);
  const onBuyPlan = () => openBuyPlan?.("trial");
  const onGoToTenant = () => {
    const address = info.tenant?.address;
    if (address) window.open(address, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.container}>
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

      {isPaid ? (
        <>
          <div className={styles.usageHeader}>
            <Text className={styles.sectionTitle}>{t("Common:Usage")}</Text>
            <Link
              type={LinkType.action}
              color="accent"
              fontSize="13px"
              fontWeight={600}
              className={styles.viewMoreLink}
              onClick={onViewMore}
            >
              {t("Common:ViewMore")}
            </Link>
          </div>

          <div className={styles.spendCard}>
            <Text className={styles.spendLabel}>{t("Common:MonthSpend")}</Text>
            <Text className={styles.spendValue}>
              {formatCurrencyValue(i18n.language, monthlyCharge, currency, 2)}
            </Text>
            <Text className={styles.spendTenants}>
              {t("DocsConnect:ActiveTenants", { count: activeTenants })}
            </Text>
          </div>

          <div className={styles.actionsRow}>
            <Button
              primary
              size={ButtonSize.small}
              label={t("DocsConnect:ManageDocsConnect")}
              onClick={onManage}
            />
          </div>
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
                label={t("DocsConnect:BuyAPlan")}
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
                label={t("DocsConnect:BuyAPlan")}
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
        <TransactionHistory serviceName={DOCS_CONNECT_SERVICE} hideTypeFilter />
      </div>

      {buyPlanPanelVisible ? <BuyPlanPanel /> : null}
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  isLoading: docsConnectStore.isLoading,
  buyPlanPanelVisible: docsConnectStore.buyPlanPanelVisible,
  fetchInfo: docsConnectStore.fetchInfo,
  openBuyPlan: docsConnectStore.openBuyPlan,
}))(observer(DocsConnectPage));

