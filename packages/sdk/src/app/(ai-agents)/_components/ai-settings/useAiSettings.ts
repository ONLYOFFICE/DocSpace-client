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

import React from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAISettingsStore } from "../../_store";

type UseAiSettingsProps = {
  standalone?: boolean;
};

const useAISettings = ({ standalone }: UseAiSettingsProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const aiSettingsStore = useAISettingsStore();
  const {
    fetchAIProviders,
    fetchMCPServers,
    fetchWebSearch,
    fetchKnowledge,
    initDefaultProvider,
  } = aiSettingsStore;

  // Consult the store's initied flags before re-firing the fetchers — a
  // tab switch (Providers → MCP → Providers) used to refetch on every
  // mount because `initAIProviders` etc. ran unconditionally.
  const fetchAIProvidersIfNeeded = React.useCallback(async () => {
    if (aiSettingsStore.aiProvidersInitied) return;
    await fetchAIProviders?.();
  }, [aiSettingsStore, fetchAIProviders]);

  const initAIProviders = React.useCallback(async () => {
    await fetchAIProvidersIfNeeded();
    if (!aiSettingsStore.defaultProviderInitied) {
      await initDefaultProvider?.();
    }
  }, [aiSettingsStore, fetchAIProvidersIfNeeded, initDefaultProvider]);

  const initMCPServers = React.useCallback(async () => {
    const tasks: Promise<unknown>[] = [];
    if (!aiSettingsStore.mcpServersInitied && fetchMCPServers)
      tasks.push(fetchMCPServers());
    tasks.push(fetchAIProvidersIfNeeded());
    await Promise.all(tasks);
  }, [aiSettingsStore, fetchMCPServers, fetchAIProvidersIfNeeded]);

  const initWebSearch = React.useCallback(async () => {
    const tasks: Promise<unknown>[] = [];
    if (!aiSettingsStore.webSearchInitied && fetchWebSearch)
      tasks.push(fetchWebSearch());
    tasks.push(fetchAIProvidersIfNeeded());
    await Promise.all(tasks);
  }, [aiSettingsStore, fetchWebSearch, fetchAIProvidersIfNeeded]);

  const initKnowledge = React.useCallback(async () => {
    const tasks: Promise<unknown>[] = [];
    if (!aiSettingsStore.knowledgeInitied && fetchKnowledge)
      tasks.push(fetchKnowledge());
    tasks.push(fetchAIProvidersIfNeeded());
    await Promise.all(tasks);
  }, [aiSettingsStore, fetchKnowledge, fetchAIProvidersIfNeeded]);

  const getAiSettingsInitialValue = React.useCallback(async () => {
    const path = pathname ?? "";
    const isProviders = path.includes("providers");
    const isServers = path.includes("servers");
    const isSearch = path.includes("search");
    const isKnowledge = path.includes("knowledge");

    if (!standalone && !isServers) {
      router.push("/ai-agents/settings/servers");
      await initMCPServers();

      return;
    }

    if (isProviders) await initAIProviders();
    if (isServers) await initMCPServers();
    if (isSearch) await initWebSearch();
    if (isKnowledge) await initKnowledge();
  }, [
    initAIProviders,
    initMCPServers,
    initWebSearch,
    initKnowledge,
    router,
    pathname,
    standalone,
  ]);

  return {
    initAIProviders,
    initMCPServers,
    initWebSearch,
    initKnowledge,
    getAiSettingsInitialValue,
  };
};

export default useAISettings;
