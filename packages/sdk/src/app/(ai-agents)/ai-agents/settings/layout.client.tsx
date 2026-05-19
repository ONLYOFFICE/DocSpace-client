// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

"use client";

import React from "react";
import { observer } from "mobx-react";
import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";

import { Tabs, type TTabItem } from "@docspace/ui-kit/components/tabs";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import useAiSettings from "../../_components/ai-settings/useAiSettings";
import { ProvidersLoader } from "../../_components/ai-settings/providers/ProvidersLoader";
import { ServersLoader } from "../../_components/ai-settings/servers/ServersLoader";
import { SearchLoader } from "../../_components/ai-settings/search/SearchLoader";
import { KnowledgeLoader } from "../../_components/ai-settings/knowledge/KnowledgeLoader";
import { useAgentLoadingStore } from "../../_store";
import styles from "../../_components/ai-settings/AISettings.module.scss";

const VALID_TABS = ["providers", "servers", "search", "knowledge"] as const;
type TabId = (typeof VALID_TABS)[number];

const getTabIdFromPath = (path: string | null): TabId => {
  if (!path) return "servers";
  const last = path.split("/").filter(Boolean).pop() ?? "";
  return (VALID_TABS as readonly string[]).includes(last)
    ? (last as TabId)
    : "servers";
};

const SettingsLayoutClient = ({ children }: { children: React.ReactNode }) => {
  const { t, ready } = useTranslation(["Common"]);
  const pathname = usePathname();
  const router = useRouter();
  const loadingStore = useAgentLoadingStore();

  // SDK is always running iframe-embedded; treat as standalone.
  const standalone = true;

  const currentTabId = getTabIdFromPath(pathname);

  const { initAIProviders, initMCPServers, initWebSearch, initKnowledge } =
    useAiSettings({ standalone });

  // Initialise data on direct deep-links + on tab changes. Mirrors the
  // per-tab `onClick` initialisers from the client implementation, but runs
  // on first render too so the URL alone is enough.
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
    providers: <ProvidersLoader />,
    servers: <ServersLoader />,
    search: <SearchLoader />,
    knowledge: <KnowledgeLoader />,
  };

  const serversItem: TTabItem = {
    id: "servers",
    name: t("Common:MCPSettingTitle"),
    content: children,
  };

  const items: TTabItem[] = standalone
    ? [
        {
          id: "providers",
          name: t("Common:AIProvider"),
          content: children,
        },
        serversItem,
        {
          id: "search",
          name: t("Common:WebSearchAI"),
          content: children,
        },
        {
          id: "knowledge",
          name: t("Common:Knowledge"),
          content: children,
        },
      ]
    : [serversItem];

  const onSelect = (element: TTabItem) => {
    router.push(`/ai-agents/settings/${element.id}`);
  };

  if (loadingStore.showBodyLoader || !ready) {
    return (
      <>
        <RectangleSkeleton className={styles.tabsLoader} />
        {loaders[currentTabId]}
      </>
    );
  }

  return (
    <Tabs
      items={items}
      selectedItemId={currentTabId}
      onSelect={onSelect}
      stickyTop="0"
    />
  );
};

export default observer(SettingsLayoutClient);
