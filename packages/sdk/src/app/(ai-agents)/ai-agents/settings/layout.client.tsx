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

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";

import { RectangleSkeleton } from "@docspace/shared/skeletons";

import useAiSettings from "../../_components/ai-settings/useAiSettings";
import { ProvidersLoader } from "../../_components/ai-settings/providers/ProvidersLoader";
import { ServersLoader } from "../../_components/ai-settings/servers/ServersLoader";
import { SearchLoader } from "../../_components/ai-settings/search/SearchLoader";
import { KnowledgeLoader } from "../../_components/ai-settings/knowledge/KnowledgeLoader";
import { useAgentLoadingStore } from "../../_store";
import { useAgentsUserStore } from "../../_store/AgentsUserStore";
import { useAgentsCommonData } from "../../_store/AgentsCommonDataContext";
import styles from "../../_components/ai-settings/AISettings.module.scss";

const VALID_TABS = [
  "billing",
  "providers",
  "servers",
  "search",
  "knowledge",
] as const;
type TabId = (typeof VALID_TABS)[number];

const getTabIdFromPath = (path: string | null, defaultTab: TabId): TabId => {
  if (!path) return defaultTab;
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return (VALID_TABS as readonly string[]).includes(last)
    ? (last as TabId)
    : defaultTab;
};

const SettingsLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { ready } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();
  const loadingStore = useAgentLoadingStore();
  const { user } = useAgentsUserStore();
  const { portalSettings } = useAgentsCommonData();
  const standalone = Boolean(portalSettings?.standalone);
  const canSeeBilling = !standalone && Boolean(user?.isAdmin || user?.isOwner);

  const defaultTab: TabId = standalone ? "providers" : "billing";
  const currentTabId = getTabIdFromPath(pathname, defaultTab);

  // Non-admins land on /billing via the server-side redirect default. Once
  // the user store hydrates and we know they can't see billing, bounce them
  // forward to the first allowed tab so the URL matches the visible tabs.
  // In standalone mode billing is hidden entirely, so any /billing URL is
  // bounced regardless of role.
  React.useEffect(() => {
    if (!user) return;
    if (currentTabId === "billing" && !canSeeBilling) {
      router.replace("/ai-agents/settings/providers");
    }
  }, [user, currentTabId, canSeeBilling, router]);

  const { initAIProviders, initMCPServers, initWebSearch, initKnowledge } =
    useAiSettings({ standalone });

  // Initialise data on direct deep-links + on tab changes.
  React.useEffect(() => {
    if (currentTabId === "providers") void initAIProviders();
    else if (currentTabId === "servers") void initMCPServers();
    else if (currentTabId === "search") void initWebSearch();
    else if (currentTabId === "knowledge") void initKnowledge();
  }, [
    currentTabId,
    initAIProviders,
    initMCPServers,
    initWebSearch,
    initKnowledge,
  ]);

  const loaders: Record<TabId, React.ReactNode> = {
    billing: null,
    providers: <ProvidersLoader />,
    servers: <ServersLoader />,
    search: <SearchLoader />,
    knowledge: <KnowledgeLoader />,
  };

  if (loadingStore.showBodyLoader || !ready) {
    return (
      <>
        <RectangleSkeleton className={styles.tabsLoader} />
        {loaders[currentTabId]}
      </>
    );
  }

  return <>{children}</>;
};

export default observer(SettingsLayoutClient);
