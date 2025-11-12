// (c) Copyright Ascensio System SIA 2009-2025
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

import { toastr } from "../../components/toast";
import { getCookie } from "../../utils";

import { request } from "../client";
import type { TFile } from "../files/types";
import type { KnowledgeType, ToolsPermission, WebSearchType } from "./enums";
import RoomsFilter from "../rooms/filter";
import { checkFilterInstance } from "../../utils/common";

import type {
  TCreateAiProvider,
  TAiProvider,
  TUpdateAiProvider,
  TDeleteAiProviders,
  TModelList,
  TChat,
  TMessage,
  TMCPTool,
  TServer,
  TVectorizeOperation,
  TProviderTypeWithUrl,
  TAddNewServer,
  TUpdateServer,
  WebSearchConfig,
  KnowledgeConfig,
  TAIConfig,
  TAgent,
  TCreateAgentData,
  TEditAgentData,
  TGetAgents,
} from "./types";

const baseUrl = "/ai";

export const createProvider = async (provider: TCreateAiProvider) => {
  const res = (await request({
    method: "post",
    url: `${baseUrl}/providers`,
    data: provider,
  })) as TAiProvider;

  return res;
};

export const getProviders = async () => {
  const res = (await request({
    method: "get",
    url: `${baseUrl}/providers`,
  })) as { items: TAiProvider[]; total: number };

  return res.items;
};

export const updateProvider = async (
  providerId: TAiProvider["id"],
  data: TUpdateAiProvider,
) => {
  const res = (await request({
    method: "put",
    url: `${baseUrl}/providers/${providerId}`,
    data,
  })) as TAiProvider;

  return res;
};

export const deleteProviders = async (data: TDeleteAiProviders) => {
  const res = (await request({
    method: "delete",
    url: `${baseUrl}/providers`,
    data,
  })) as TDeleteAiProviders;

  return res;
};

export const getAvailableProviderUrls = async () => {
  const res = (await request({
    method: "get",
    url: `${baseUrl}/providers/available`,
  })) as TProviderTypeWithUrl[];

  return res;
};

export const getModels = async (
  providerId?: TAiProvider["id"],
  abortController?: AbortController | null,
) => {
  const searchParams = new URLSearchParams();
  if (providerId) {
    searchParams.append("provider", providerId.toString());
  }

  const strSearch = providerId ? `?${searchParams.toString()}` : "";

  const res = (await request({
    method: "get",
    url: `${baseUrl}/chats/models${strSearch}`,
    signal: abortController?.signal,
  })) as TModelList;

  return res;
};

export const getProviderAvailabilityStatus = async (
  id: number,
  abortController?: AbortController | null,
) => {
  return getModels(id, abortController)
    .then(() => ({
      id: id,
      available: true,
    }))
    .catch(() => ({
      id: id,
      available: false,
    }));
};

export const startNewChat = async (
  roomId: number | string,
  message: string,
  files: string[],
  abortController?: AbortController,
) => {
  const authHeader = getCookie("asc_auth_key")!;

  const response = await fetch(`/api/2.0${baseUrl}/rooms/${roomId}/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    signal: abortController?.signal,
    body: JSON.stringify({ message, files }),
  });

  return response.body;
};

export const sendMessageToChat = async (
  chatId: string,
  message: string,
  files: string[],
  abortController?: AbortController,
) => {
  const authHeader = getCookie("asc_auth_key")!;

  const response = await fetch(`/api/2.0${baseUrl}/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    signal: abortController?.signal,
    body: JSON.stringify({ message, files }),
  });

  return response.body;
};

export const getChats = async (
  roomId: number | string,
  startIndex: number = 0,
  count: number = 100,
) => {
  const searchParams = new URLSearchParams();
  searchParams.append("startIndex", startIndex.toString());
  searchParams.append("count", count.toString());
  const res = await request({
    method: "GET",
    url: `${baseUrl}/rooms/${roomId}/chats?${searchParams.toString()}`,
  });

  return res as { items: TChat[]; total: number };
};

export const getChatMessages = async (
  chatId: string,
  startIndex: number,
  count: number = 100,
) => {
  const searchParams = new URLSearchParams();
  searchParams.append("startIndex", startIndex.toString());
  searchParams.append("count", count.toString());
  const res = await request({
    method: "GET",
    url: `${baseUrl}/chats/${chatId}/messages?${searchParams.toString()}`,
  });

  return res as { items: TMessage[]; total: number };
};

export const getChat = async (chatId: string) => {
  const res = (await request({
    method: "get",
    url: `${baseUrl}/chats/${chatId}`,
  })) as TChat;

  return res;
};

export const renameChat = async (chatId: string, name: string) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/chats/${chatId}`,
    data: { name },
  });

  return res as TChat;
};

export const deleteChat = async (chatId: string) => {
  await request({
    method: "DELETE",
    url: `${baseUrl}/chats/${chatId}`,
  });
};

export const getServersList = async (startIndex: number, count?: number) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/servers`,
      params: {
        startIndex,
        count,
      },
    });

    return res as { items: TServer[]; total: number };
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const getAvailableServersList = async (
  startIndex: number,
  count: number,
) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/servers/available?startIndex=${startIndex}&count=${count}`,
    });

    return res as { items: TServer[]; total: number };
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const addNewServer = async (data: TAddNewServer) => {
  return (await request({
    method: "post",
    url: `${baseUrl}/servers`,
    data,
  })) as TServer;
};

export const updateServer = async (serverId: string, data: TUpdateServer) => {
  const res = await request({
    method: "put",
    url: `${baseUrl}/servers/${serverId}`,
    data,
  });

  return res as TServer;
};

export const deleteServers = async (servers: string[]) => {
  await request({
    method: "delete",
    url: `${baseUrl}/servers`,
    data: { servers },
  });
};

export const addServersForRoom = async (roomId: number, servers: string[]) => {
  try {
    await request({
      method: "post",
      url: `${baseUrl}/rooms/${roomId}/servers`,
      data: { servers },
    });
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const getServersListForRoom = async (roomId: number) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/rooms/${roomId}/servers`,
    });

    return res as TServer[];
  } catch (e) {
    console.log(e);
  }
};

export const connectServer = async (
  roomId: number,
  serverId: string,
  code: string,
) => {
  try {
    await request({
      method: "post",
      url: `${baseUrl}/rooms/${roomId}/servers/${serverId}/connect`,
      data: { code },
    });
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const disconnectServer = async (roomId: number, serverId: string) => {
  try {
    await request({
      method: "post",
      url: `${baseUrl}/rooms/${roomId}/servers/${serverId}/disconnect`,
    });
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const deleteServersForRoom = async (
  roomId: number,
  servers: string[],
) => {
  try {
    await request({
      method: "delete",
      url: `${baseUrl}/rooms/${roomId}/servers`,
      data: { servers },
    });
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const updateServerStatus = async (
  serverId: TServer["id"],
  enabled: boolean,
) => {
  const res = await request({
    method: "put",
    url: `${baseUrl}/servers/${serverId}/status`,
    data: { enabled },
  });

  return res as TServer;
};

export const getMCPToolsForRoom = async (room: number, mcpId: string) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/rooms/${room}/servers/${mcpId}/tools`,
    });

    return res as TMCPTool[];
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const changeMCPToolsForRoom = async (
  room: number,
  mcpId: string,
  disabledTools: string[],
) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/rooms/${room}/servers/${mcpId}/tools`,
    data: { disabledTools },
  });

  return res;
};

export const exportChat = async (
  chatId: string,
  folderId: string | number,
  title: string,
) => {
  try {
    return (await request({
      method: "POST",
      url: `${baseUrl}/chats/${chatId}/messages/export`,
      data: { folderId, title },
    })) as TFile;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const exportChatMessage = async (
  messageId: number,
  folderId: string | number,
  title: string,
) => {
  try {
    return (await request({
      method: "POST",
      url: `${baseUrl}/messages/${messageId}/export`,
      data: { folderId, title },
    })) as TFile;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const retryVectorization = async (fileIds: TFile["id"][]) => {
  const res = await request({
    method: "POST",
    url: `${baseUrl}/vectorization/tasks`,
    data: { files: fileIds },
  });

  return res as TVectorizeOperation;
};

export const updateToolsPermission = async (
  callId: string,
  decision: ToolsPermission,
) => {
  try {
    await request({
      method: "POST",
      url: `${baseUrl}/chats/tool-permissions/${callId}/decision`,
      data: { decision },
    });
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const getWebSearchInRoom = async (roomId: number) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/rooms/${roomId}/chats/config`,
    });

    return res as { webSearchEnabled: boolean };
  } catch (e) {
    console.log(e);
  }
};

export const updateWebSearchInRoom = async (
  roomId: number,
  webSearchEnabled: boolean,
) => {
  try {
    const res = await request({
      method: "put",
      url: `${baseUrl}/rooms/${roomId}/chats/config`,
      data: { webSearchEnabled },
    });

    return res;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const getAIConfig = async () => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/config`,
    });

    return res as TAIConfig;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const getWebSearchConfig = async () => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/config/web-search`,
    });

    return res as WebSearchConfig;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const updateWebSearchConfig = async (
  enabled: boolean,
  type: WebSearchType,
  key: string,
) => {
  try {
    const res = await request({
      method: "put",
      url: `${baseUrl}/config/web-search`,
      data: { enabled, type, key },
    });

    return res;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
    throw e;
  }
};

export const getKnowledgeConfig = async () => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/config/vectorization`,
    });

    return res as KnowledgeConfig;
  } catch (e) {
    console.log(e);
    toastr.error(e as string);
  }
};

export const updateKnowledgeConfig = async (
  type: KnowledgeType,
  key: string,
) => {
  const res = await request({
    method: "put",
    url: `${baseUrl}/config/vectorization`,
    data: { type, key },
  });

  return res as KnowledgeConfig;
};

export const createAIAgent = async (data: TCreateAgentData) => {
  const res = await request({ method: "POST", url: `${baseUrl}/agents`, data });

  return res as TAgent;
};

export const editAIAgent = async (id: TAgent["id"], data: TEditAgentData) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/agents/${id}`,
    data,
  });

  return res as TAgent;
};

export const getAIAgent = async (id: TAgent["id"]) => {
  const res = await request({ method: "GET", url: `${baseUrl}/agents/${id}` });

  return res as TAgent;
};

export const getAIAgents = async (
  filter: RoomsFilter,
  signal?: AbortSignal,
) => {
  let params: string = "";

  if (filter) {
    checkFilterInstance(filter, RoomsFilter);

    params = `?${filter.toApiUrlParams()}`;
  }

  const res = await request({
    method: "GET",
    url: `${baseUrl}/agents${params}`,
    signal,
  });

  return res as TGetAgents;
};

export const deleteAIAgent = async (id: TAgent["id"]) => {
  await request({ method: "DELETE", url: `${baseUrl}/agents/${id}` });
};

export const resetAIAgentQuota = async (roomIds: TAgent["id"]) => {
  const data = {
    roomIds,
  };
  const options = {
    method: "put",
    url: `${baseUrl}/agents/resetquota`,
    data,
  };

  return request(options);
};

export function setCustomAIAgentQuota(roomIds: TAgent["id"], quota: number) {
  const data = {
    roomIds,
    quota,
  };

  const options = {
    method: "put",
    url: `${baseUrl}/agents/agentquota`,
    data,
  };

  return request(options);
}

export const getMCPServerById = async (id: string) => {
  const options = {
    method: "get",
    url: `${baseUrl}/servers/${id}`,
  };

  const res = await request(options);

  return res as TServer;
};
