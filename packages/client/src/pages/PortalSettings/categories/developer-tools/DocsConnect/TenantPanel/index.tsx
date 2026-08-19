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

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { inject, observer } from "mobx-react";
import { useNavigate } from "react-router";

import config from "PACKAGE_FILE";

import { combineUrl } from "@docspace/shared/utils/combineUrl";

import { Text } from "@docspace/ui-kit/components/text";
import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";
import { AnimationEvents } from "@docspace/ui-kit/hooks/useAnimation";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import KeyReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.devtools-api-keys.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import HistoryReactSvgUrl from "PUBLIC_DIR/images/history.react.svg?url";
import CircleCrossReactSvgUrl from "PUBLIC_DIR/images/icons/16/circle.cross.svg?url";
import PaymentReactSvgUrl from "PUBLIC_DIR/images/icons/16/price.react.svg?url";

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import { getDocsConnectTrialState } from "../utils";
import { DOCS_CONNECT_ROUTE, type TDocsConnectTab } from "../constants";
import { PAYMENT_ROUTES } from "../../../payments/utils";

import Statistics from "./Statistics";
import Settings from "./Settings";
import Preview from "./Preview";

import styles from "./TenantPanel.module.scss";

interface TenantPanelProps {
  info?: TDocsConnectInfo;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  copySecretKey?: (t: TTranslation) => void;
  openCancelPlanDialog?: () => void;
  isStatisticsRefreshing?: boolean;
  refreshStatistics?: () => Promise<void>;
  abortStatisticsRefresh?: () => void;
}

const getTabFromLocation = (): TDocsConnectTab => {
  const segment = window.location.pathname.split("/").filter(Boolean).pop();
  return segment === "settings" || segment === "preview"
    ? segment
    : "statistics";
};

const TenantPanel = ({
  info,
  openBuyPlan,
  copySecretKey,
  openCancelPlanDialog,
  isStatisticsRefreshing = false,
  refreshStatistics,
  abortStatisticsRefresh,
}: TenantPanelProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] =
    useState<TDocsConnectTab>(getTabFromLocation);

  useEffect(() => {
    return () => abortStatisticsRefresh?.();
  }, [abortStatisticsRefresh]);

  useEffect(() => {
    if (!isStatisticsRefreshing) {
      window.dispatchEvent(new CustomEvent(AnimationEvents.END_ANIMATION));
    }
  }, [selectedTab, isStatisticsRefreshing]);

  if (!info) return null;

  const { isTrial, expired, daysLeft, totalDays } =
    getDocsConnectTrialState(info);
  const trialLow = !expired && totalDays > 0 && daysLeft / totalDays < 0.5;

  const hasScheduledChange = info.scheduledChange != null;

  const getTrialContextMenuItems = (): ContextMenuModel[] => [
    {
      key: "copy-secret-key",
      label: t("DocsConnect:CopySecretKey"),
      icon: KeyReactSvgUrl,
      onClick: () => copySecretKey?.(t),
    },
    {
      key: "upgrade-subscription",
      label: t("Common:UpgradeSubscription"),
      icon: PaymentReactSvgUrl,
      onClick: () => openBuyPlan?.("trial"),
    },
    {
      key: "transaction-history",
      label: t("Common:TransactionHistory"),
      icon: HistoryReactSvgUrl,
      onClick: () => navigate(PAYMENT_ROUTES.docsConnect),
    },
  ];

  const getContextMenuItems = (): ContextMenuModel[] => [
    {
      key: "copy-secret-key",
      label: t("DocsConnect:CopySecretKey"),
      icon: KeyReactSvgUrl,
      onClick: () => copySecretKey?.(t),
    },
    ...(hasScheduledChange
      ? []
      : ([
          {
            key: "edit-plan",
            label: t("Common:EditSubscription"),
            icon: SettingsReactSvgUrl,
            onClick: () => openBuyPlan?.("edit"),
          },
        ] as ContextMenuModel[])),
    {
      key: "transaction-history",
      label: t("Common:TransactionHistory"),
      icon: HistoryReactSvgUrl,
      onClick: () => navigate(PAYMENT_ROUTES.docsConnect),
    },
    ...(hasScheduledChange
      ? []
      : ([
          {
            key: "separator",
            isSeparator: true,
          },
          {
            key: "cancel-plan",
            label: t("Common:CancelSubscription"),
            icon: CircleCrossReactSvgUrl,
            onClick: () => openCancelPlanDialog?.(),
          },
        ] as ContextMenuModel[])),
  ];

  const tabs: TTabItem[] = [
    {
      id: "statistics",
      name: t("DocsConnect:TabStatistics"),
      content: <Statistics />,
      onClick: () => refreshStatistics?.(),
    },
    {
      id: "settings",
      name: t("DocsConnect:TabSettings"),
      content: <Settings />,
    },
    {
      id: "preview",
      name: t("DocsConnect:TabPreview"),
      content: <Preview />,
    },
  ];

  return (
    <div className={styles.panel} data-testid="docs_connect_panel">
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Text fontSize="18px" fontWeight={700} lineHeight="24px">
            {t("DocsConnect:DocsConnect")}
          </Text>
          {isTrial ? (
            <>
              <ContextMenuButton
                displayType={ContextMenuButtonDisplayType.dropdown}
                getData={getTrialContextMenuItems}
                size={16}
                directionX="right"
                testId="docs_connect_context_menu_button"
              />
              <span
                className={`${styles.trialBadge} ${
                  expired
                    ? styles.trialBadgeExpired
                    : trialLow
                      ? styles.trialBadgeWarning
                      : ""
                }`}
                data-testid="docs_connect_trial_badge"
              >
                {expired
                  ? t("Common:TrialExpired")
                  : t("Common:FreeDaysLeft", { count: daysLeft })}
              </span>
            </>
          ) : (
            <ContextMenuButton
              displayType={ContextMenuButtonDisplayType.dropdown}
              getData={getContextMenuItems}
              size={16}
              directionX="right"
              testId="docs_connect_context_menu_button"
            />
          )}
        </div>
      </div>

      <Tabs
        withoutStickyIntend
        withAnimation
        items={tabs}
        selectedItemId={selectedTab}
        onSelect={(item) => {
          const tab = item.id as TDocsConnectTab;

          if (tab !== "statistics") abortStatisticsRefresh?.();

          setSelectedTab(tab);
          window.history.replaceState(
            "",
            "",
            combineUrl(
              window.ClientConfig?.proxy?.url,
              config.homepage,
              `${DOCS_CONNECT_ROUTE}/${tab}`,
            ),
          );
        }}
      />
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  openBuyPlan: docsConnectStore.openBuyPlan,
  copySecretKey: docsConnectStore.copySecretKey,
  openCancelPlanDialog: docsConnectStore.openCancelPlanDialog,
  isStatisticsRefreshing: docsConnectStore.isStatisticsRefreshing,
  refreshStatistics: docsConnectStore.refreshStatistics,
  abortStatisticsRefresh: docsConnectStore.abortStatisticsRefresh,
}))(observer(TenantPanel));
