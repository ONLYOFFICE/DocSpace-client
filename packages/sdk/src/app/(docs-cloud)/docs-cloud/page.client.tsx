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

"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import AppLoader from "@docspace/ui-kit/components/app-loader";
import { Badge } from "@docspace/ui-kit/components/badge";
import { Tabs } from "@docspace/ui-kit/components/tabs";
import { Text } from "@docspace/ui-kit/components/text";
import type { TTabItem } from "@docspace/ui-kit/components/tabs";

import {
  getTenantConfiguration,
  getTenantInfo,
} from "@docspace/shared/api/docs-cloud";
import type {
  TTenantConfig,
  TTenantInfo,
} from "@docspace/shared/api/docs-cloud";

import { getBrandName } from "@docspace/shared/constants/brands";

import { useDocsCloudFrameBridge } from "./_hooks/useDocsCloudFrameBridge";
import { InformationTab } from "./_tabs/Information";
import { SettingsTab } from "./_tabs/Settings";
import type { TabId } from "./types";
import styles from "./TenantInfo.module.scss";

const DocsCloudPage = () => {
  const { t } = useTranslation(["DocsCloud"]);

  const [isLoading, setIsLoading] = useState(true);
  const [tenantInfo, setTenantInfo] = useState<TTenantInfo | null>(null);
  const [tenantConfig, setTenantConfig] = useState<TTenantConfig | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("information");

  useDocsCloudFrameBridge({ isReady: !isLoading });

  useEffect(() => {
    Promise.all([getTenantInfo(), getTenantConfiguration()])
      .then(([info, config]) => {
        setTenantInfo(info);
        setTenantConfig(config);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const tabs: TTabItem[] = [
    { id: "information", name: t("DocsCloud:Statistic"), content: null },
    { id: "settings", name: t("Settings"), content: null },
  ];

  if (isLoading) return <AppLoader />;
  if (!tenantInfo || !tenantConfig) return null;

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <div className={styles.logo}>
            {(tenantInfo.name || tenantInfo.alias).charAt(0).toUpperCase()}
          </div>
          <div>
            <Text fontSize="20px" fontWeight={700} noSelect>
              {tenantInfo.name || tenantInfo.alias}
            </Text>
            <Text fontSize="12px" color="var(--text-secondary-color)" noSelect>
              {t("DocsCloud:DocsConnectorSubtitle", {
                organizationName: getBrandName("OrganizationName"),
                productEditorsName: getBrandName("ProductEditorsName"),
              })}
            </Text>
          </div>
          <div className={styles.badges}>
            {tenantInfo.isTrial && (
              <Badge
                label={t("DocsCloud:Trial")}
                borderRadius="100px"
                noHover
              />
            )}
            {tenantInfo.isDeveloperPack && (
              <Badge
                label={t("DocsCloud:DeveloperPack")}
                borderRadius="100px"
                noHover
              />
            )}
          </div>
        </div>
        {!tenantInfo.isActive && !tenantInfo.isTrial && (
          <div className={styles.expiredBanner}>
            <Text fontSize="13px">{t("DocsCloud:YourLicenseExpired")}</Text>
          </div>
        )}
        <Tabs
          items={tabs}
          selectedItemId={activeTab}
          onSelect={(tab) => setActiveTab(tab.id as TabId)}
          withoutStickyIntend
        />
      </div>
      <div className={styles.tabContent}>
        {activeTab === "information" && <InformationTab info={tenantInfo} />}
        {activeTab === "settings" && (
          <SettingsTab config={tenantConfig} onConfigChange={setTenantConfig} />
        )}
      </div>
    </div>
  );
};

export default DocsCloudPage;

