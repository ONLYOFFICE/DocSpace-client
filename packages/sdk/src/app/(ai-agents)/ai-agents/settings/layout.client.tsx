// (c) Copyright Ascensio System SIA 2009-2026
//
// SPDX-License-Identifier: AGPL-3.0-only

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
