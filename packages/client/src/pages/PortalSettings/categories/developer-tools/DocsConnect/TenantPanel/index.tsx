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
import { Tabs, TTabItem } from "@docspace/ui-kit/components/tabs";
import { toastr } from "@docspace/ui-kit/components/toast";
import {
  ContextMenuButton,
  ContextMenuButtonDisplayType,
} from "@docspace/ui-kit/components/context-menu-button";
import type { ContextMenuModel } from "@docspace/ui-kit/components/context-menu";

import CopyReactSvgUrl from "PUBLIC_DIR/images/copyTo.react.svg?url";
import SettingsReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.settings.react.svg?url";
import PlusReactSvgUrl from "PUBLIC_DIR/images/actions.header.touch.react.svg?url";

import type { TDocsConnectInfo } from "@docspace/shared/api/docs-connect/types";
import type { TTranslation } from "@docspace/shared/types";

import Statistics from "./Statistics";

import styles from "./TenantPanel.module.scss";

interface TenantPanelProps {
  info?: TDocsConnectInfo;
  openBuyPlan?: (mode: "trial" | "edit") => void;
  copySecretKey?: (t: TTranslation) => void;
  buyTenant?: () => void;
}

const TenantPanel = ({
  info,
  openBuyPlan,
  copySecretKey,
  buyTenant,
}: TenantPanelProps) => {
  const { t } = useTranslation(["DocsConnect", "Common"]);
  const [selectedTab, setSelectedTab] = useState<string>("statistics");

  if (!info) return null;

  const isTrial = info.status === "trial";

  const getContextMenuItems = (): ContextMenuModel[] => [
    {
      key: "copy-secret-key",
      label: t("DocsConnect:CopySecretKey"),
      icon: CopyReactSvgUrl,
      onClick: () => copySecretKey?.(t),
    },
    {
      key: "edit-plan",
      label: t("DocsConnect:EditPlan"),
      icon: SettingsReactSvgUrl,
      onClick: () => openBuyPlan?.("edit"),
    },
    {
      key: "buy-tenant",
      label: t("DocsConnect:BuyTenant"),
      icon: PlusReactSvgUrl,
      onClick: () => {
        buyTenant?.();
        toastr.info(t("DocsConnect:BuyTenantInProgress"));
      },
    },
  ];

  const tabs: TTabItem[] = [
    {
      id: "statistics",
      name: t("DocsConnect:TabStatistics"),
      content: <Statistics />,
    },
    {
      id: "settings",
      name: t("DocsConnect:TabSettings"),
      content: (
        <div className={styles.stubTab}>
          <Text className={styles.muted}>{t("Common:ComingSoon")}</Text>
        </div>
      ),
    },
    {
      id: "preview",
      name: t("DocsConnect:TabPreview"),
      content: (
        <div className={styles.stubTab}>
          <Text className={styles.muted}>{t("Common:ComingSoon")}</Text>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <Text fontSize="18px" fontWeight={700} lineHeight="24px">
            {t("DocsConnect:DocsConnect")}
          </Text>
          {isTrial ? (
            <span className={styles.trialBadge}>
              {t("Common:FreeDaysLeft", { count: info.trial.daysLeft })}
            </span>
          ) : (
            <ContextMenuButton
              displayType={ContextMenuButtonDisplayType.dropdown}
              getData={getContextMenuItems}
              size={16}
              testId="docs_connect_context_menu_button"
            />
          )}
        </div>
      </div>

      <Tabs
        items={tabs}
        selectedItemId={selectedTab}
        onSelect={(tab) => setSelectedTab(tab.id)}
      />
    </div>
  );
};

export default inject(({ docsConnectStore }: TStore) => ({
  info: docsConnectStore.info,
  openBuyPlan: docsConnectStore.openBuyPlan,
  copySecretKey: docsConnectStore.copySecretKey,
  buyTenant: docsConnectStore.buyTenant,
}))(observer(TenantPanel));
