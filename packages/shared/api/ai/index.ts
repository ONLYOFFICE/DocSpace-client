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

import { getCookie } from "../../utils";

import { request } from "../client";
import { TFile } from "../files/types";

import {
  TCreateAiProvider,
  TAiProvider,
  TUpdateAiProviders,
  TDeleteAiProviders,
  TModelList,
  TChat,
  TMessage,
  TMCPTool,
  TServer,
  TVectorizeOperation,
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
  data: TUpdateAiProviders,
) => {
  const res = (await request({
    method: "put",
    url: `${baseUrl}/providers/${providerId}`,
    data,
  })) as TAiProvider;

  return res;
};

export const deleteProvider = async (data: TDeleteAiProviders) => {
  const res = (await request({
    method: "delete",
    url: `${baseUrl}/providers`,
    data,
  })) as TDeleteAiProviders;

  return res;
};

export const getModels = async (providerId?: TAiProvider["id"]) => {
  const searchParams = new URLSearchParams();
  if (providerId) {
    searchParams.append("provider", providerId.toString());
  }

  const strSearch = providerId ? `?${searchParams.toString()}` : "";

  const res = (await request({
    method: "get",
    url: `${baseUrl}/chats/models${strSearch}`,
  })) as TModelList;

  return res;
};

export const startNewChat = async (
  roomId: number | string,
  message: string,
  files: string[],
  abortController?: AbortController,
) => {
  const authHeader = getCookie("asc_auth_key")!;

  try {
    const response = await fetch(`/api/2.0${baseUrl}/rooms/${roomId}/chats`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      signal: abortController?.signal,
      body: JSON.stringify({ message, files }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start new chat: ${response.status}`);
    }

    return response.body;
  } catch (e) {
    console.log(e);
  }
};

export const sendMessageToChat = async (
  chatId: string,
  message: string,
  files: string[],
  abortController?: AbortController,
) => {
  const authHeader = getCookie("asc_auth_key")!;

  try {
    const response = await fetch(
      `/api/2.0${baseUrl}/chats/${chatId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        signal: abortController?.signal,
        body: JSON.stringify({ message, files }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to send message to chat: ${response.status}`);
    }

    return response.body;
  } catch (e) {
    console.log(e);
  }
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

export const getServersList = async (startIndex: number, count: number) => {
  try {
    const res = await request({
      method: "get",
      url: `${baseUrl}/servers?startIndex=${startIndex}&count=${count}`,
    });

    return res as { items: TServer[]; total: number };
  } catch (e) {
    console.log(e);
  }
};

export const addNewServer = async (
  endpoint: string,
  name: string,
  description: string,
  headers: Record<string, string>,
) => {
  try {
    return (await request({
      method: "post",
      url: `${baseUrl}/servers`,
      data: { endpoint, name, description, headers },
    })) as TServer;
  } catch (e) {
    console.log(e);
  }
};

export const updateServer = async (
  serverId: string,
  endpoint: string,
  name: string,
  description: string,
  headers: Record<string, string>,
  enabled: boolean,
) => {
  try {
    await request({
      method: "put",
      url: `${baseUrl}/servers/${serverId}`,
      data: { endpoint, name, description, headers, enabled },
    });
  } catch (e) {
    console.log(e);
  }
};

export const deleteServers = async (servers: string[]) => {
  try {
    await request({
      method: "delete",
      url: `${baseUrl}/servers`,
      data: { servers },
    });
  } catch (e) {
    console.log(e);
  }
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
  }
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

export const exportChat = async (chatId: string) => {
  try {
    return (await request({
      method: "POST",
      url: `${baseUrl}/chats/${chatId}/messages/export`,
    })) as TFile;
  } catch (e) {
    console.log(e);
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
  }
};

export const moveFilesToKnowledge = async (
  knowledgeFolderId: number,
  files: (string | number)[],
) => {
  try {
    const res = await request({
      method: "POST",
      url: `${baseUrl}/vectorization/tasks`,
      data: { files, knowledgeFolderId },
    });

    return res as TVectorizeOperation;
  } catch (e) {
    console.log(e);
  }
};

export const getVectorizationTasksById = async (id: string) => {
  try {
    const res = await request({
      method: "GET",
      url: `${baseUrl}/vectorization/tasks/${id}`,
    });

    return res;
  } catch (e) {
    console.log(e);
  }
};

export const getVectorizationTasks = async () => {
  try {
    const res = await request({
      method: "GET",
      url: `${baseUrl}/vectorization/tasks`,
    });

    return res;
  } catch (e) {
    console.log(e);
  }
};

export const removeVectorizationTasks = async (id: string) => {
  try {
    await request({
      method: "DELETE",
      url: `${baseUrl}/vectorization/tasks/${id}`,
    });
  } catch (e) {
    console.log(e);
  }
};
