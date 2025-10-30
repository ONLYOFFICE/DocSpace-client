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

import { makeAutoObservable } from "mobx";

import {
  WebSearchConfig,
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
} from "@docspace/shared/api/ai";
import { ServerType, WebSearchType } from "@docspace/shared/api/ai/enums";
import { toastr } from "@docspace/shared/components/toast";

class AISettingsStore {
  isInit = false;

  aiProviders: TAiProvider[] = [];

  mcpServers: TServer[] = [];

  webSearchConfig: WebSearchConfig | null = null;

  aiProvidersInitied = false;

  mcpServersInitied = false;

  webSearchInitied = false;

  constructor() {
    makeAutoObservable(this);
  }

  setIsInit = (value: boolean) => {
    this.isInit = value;
  };

  setAiProvidersInitied = (value: boolean) => {
    this.aiProvidersInitied = value;
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
    try {
      await updateWebSearchConfig(enabled, type, key);
      this.setWebSearchConfig({ enabled, type, key });
    } catch {
      //ignore
    }
  };

  restoreWebSearch = async () => {
    try {
      await updateWebSearchConfig(false, WebSearchType.None, "");
      this.setWebSearchConfig(null);
    } catch {
      //ignore
    }
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
