/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { makeAutoObservable, runInAction } from "mobx";

import {
  type WebSearchConfig,
  type KnowledgeConfig,
  type TAddNewServer,
  type TAiProvider,
  type TCreateAiProvider,
  type TServer,
  type TUpdateAiProvider,
  type TUpdateServer,
} from "@docspace/shared/api/ai/types";
import {
  addNewServer,
  createProvider,
  deleteProviders,
  deleteServers,
  getProviders,
  getServersList,
  updateProvider,
  updateServer,
  updateServerStatus,
  getWebSearchConfig,
  updateWebSearchConfig,
  updateKnowledgeConfig,
  getKnowledgeConfig,
  getProviderAvailabilityStatus,
} from "@docspace/shared/api/ai";
import {
  ServerType,
  WebSearchType,
  KnowledgeType,
} from "@docspace/shared/api/ai/enums";
import { toastr } from "@docspace/shared/components/toast";

class AISettingsStore {
  isInit = false;

  aiProviders: TAiProvider[] = [];

  mcpServers: TServer[] = [];

  webSearchConfig: WebSearchConfig | null = null;

  knowledgeConfig: KnowledgeConfig | null = null;

  aiProvidersInitied = false;

  knowledgeInitied = false;

  mcpServersInitied = false;

  webSearchInitied = false;

  unavailableProvidersIdsSet: Set<number> = new Set<number>();

  checkProvidersAbortController: AbortController | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setIsInit = (value: boolean) => {
    this.isInit = value;
  };

  setAiProvidersInitied = (value: boolean) => {
    this.aiProvidersInitied = value;
  };

  setKnowledgeInitied = (value: boolean) => {
    this.knowledgeInitied = value;
  };

  setMCPServersInitied = (value: boolean) => {
    this.mcpServersInitied = value;
  };

  setWebSearchInitied = (value: boolean) => {
    this.webSearchInitied = value;
  };

  setAIProviders = (providers: TAiProvider[]) => {
    this.aiProviders = providers;
  };

  setMCPServers = (servers: TServer[]) => {
    this.mcpServers = servers;
  };

  setWebSearchConfig = (config: WebSearchConfig | null) => {
    this.webSearchConfig = config;
  };

  setKnowledgeConfig = (config: KnowledgeConfig | null) => {
    this.knowledgeConfig = config;
  };

  addAIProvider = async (provider: TCreateAiProvider) => {
    const newProvider = await createProvider(provider);

    this.aiProviders.push(newProvider);
  };

  updateAIProvider = async (id: TAiProvider["id"], data: TUpdateAiProvider) => {
    const newProvider = await updateProvider(id, data);
    const index = this.aiProviders.findIndex((p) => p.id === id);

    if (index !== -1) {
      this.aiProviders[index] = newProvider;
    }

    if (this.unavailableProvidersIdsSet.has(id)) {
      const res = await getProviderAvailabilityStatus(id);

      if (res.available) {
        this.unavailableProvidersIdsSet.delete(id);
      }
    }
  };

  deleteAIProvider = async (id: TAiProvider["id"]) => {
    await deleteProviders({ ids: [id] });

    this.aiProviders = this.aiProviders.filter(
      (provider) => provider.id !== id,
    );
  };

  fetchAIProviders = async () => {
    try {
      const res = await getProviders();

      this.setAIProviders(res);
    } catch (e) {
      console.error(e);
      toastr.error(e as string);
    } finally {
      this.setAiProvidersInitied(true);
    }
  };

  fetchMCPServers = async () => {
    try {
      const res = await getServersList(0);
      this.setMCPServersInitied(true);

      if (!res) return;

      this.setMCPServers(res.items);
    } catch (e) {
      console.error(e);
    }
  };

  fetchWebSearch = async () => {
    try {
      const res = await getWebSearchConfig();

      this.setWebSearchInitied(true);

      if (res) this.setWebSearchConfig(res);
    } catch (e) {
      console.error(e);
    }
  };

  updateWebSearch = async (
    enabled: boolean,
    type: WebSearchType,
    key: string,
  ) => {
    await updateWebSearchConfig(enabled, type, key);
    this.setWebSearchConfig({ enabled, type, key });
  };

  restoreWebSearch = async () => {
    await updateWebSearchConfig(false, WebSearchType.None, "");
    this.setWebSearchConfig(null);
  };

  fetchKnowledge = async () => {
    try {
      const res = await getKnowledgeConfig();

      this.setKnowledgeInitied(true);

      if (res) this.setKnowledgeConfig(res);
    } catch (e) {
      console.error(e);
    }
  };

  updateKnowledge = async (type: KnowledgeType, key: string) => {
    await updateKnowledgeConfig(type, key);
    this.setKnowledgeConfig({ type, key });
  };

  restoreKnowledge = async () => {
    await updateKnowledgeConfig(KnowledgeType.None, "");
    this.setKnowledgeConfig(null);
  };

  addNewMCP = async (data: TAddNewServer) => {
    const newServer = await addNewServer(data);

    if (newServer) {
      this.mcpServers.push(newServer);
    }
  };

  updateMCP = async (id: TServer["id"], data: TUpdateServer) => {
    const newServer = await updateServer(id, data);

    const index = this.mcpServers.findIndex((p) => p.id === id);

    if (index !== -1) {
      this.mcpServers[index] = newServer;
    }
  };

  deleteMCP = async (id: TServer["id"]) => {
    await deleteServers([id]);

    this.mcpServers = this.mcpServers.filter((mcp) => mcp.id !== id);
  };

  updateMCPStatus = async (id: TServer["id"], enabled: boolean) => {
    const newMCP = await updateServerStatus(id, enabled);

    const index = this.mcpServers.findIndex((p) => p.id === id);

    if (index !== -1) {
      this.mcpServers[index] = newMCP;
    }
  };

  initAISettings = async (standalone: boolean) => {
    const actions = [this.fetchMCPServers()];

    if (standalone) {
      actions.push(this.fetchAIProviders());
    }

    await Promise.all(actions);

    this.setIsInit(true);
  };

  checkUnavailableProviders = async () => {
    if (this.aiProviders.length === 0) return;

    this.cancelAvailabilityCheck();
    const abortController = new AbortController();
    this.checkProvidersAbortController = abortController;

    const requests = this.aiProviders.map((provider) =>
      getProviderAvailabilityStatus(provider.id, abortController),
    );

    const res = await Promise.allSettled(requests);

    if (abortController.signal.aborted) {
      this.checkProvidersAbortController = null;
      return;
    }

    runInAction(() => {
      this.unavailableProvidersIdsSet.clear();

      res.forEach((p) => {
        if (p.status === "fulfilled" && !p.value.available) {
          this.unavailableProvidersIdsSet.add(p.value.id);
        }

        if (p.status === "rejected") {
          console.error(p.reason);
          return;
        }
      });
    });

    this.checkProvidersAbortController = null;
  };

  cancelAvailabilityCheck = () => {
    this.checkProvidersAbortController?.abort();
    this.checkProvidersAbortController = null;
  };

  isProviderAvailable = (id: number) => {
    return !this.unavailableProvidersIdsSet.has(id);
  };

  get systemMCPServers() {
    return this.mcpServers.filter(
      (mcp) => mcp.serverType !== ServerType.Custom,
    );
  }

  get customMCPServers() {
    return this.mcpServers.filter(
      (mcp) => mcp.serverType === ServerType.Custom,
    );
  }

  get hasAIProviders() {
    return this.aiProviders.length > 0;
  }
}

export default AISettingsStore;
