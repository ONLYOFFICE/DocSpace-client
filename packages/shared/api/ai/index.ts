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

import { toastr } from "@docspace/ui-kit/components/toast";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
import { checkFilterInstance } from "../../utils/common";
import { isOAuthFrame } from "../../utils/oauthToken";

import {
  request,
  getAuthToken,
  resolveOAuthToken,
  refreshOAuthToken,
} from "../client";
import type { TFile } from "../files/types";
import type { KnowledgeType } from "./enums";
import RoomsFilter from "../rooms/filter";

import type {
  TAiProvider,
  TModelList,
  TChat,
  TVectorizeOperation,
  KnowledgeConfig,
  TAIConfig,
  TAgent,
  TCreateAgentData,
  TCreateAgentWithProfileData,
  TEditAgentData,
  TGetAgents,
  TDefaultProvider,
  TAIUserConfig,
  TProfilesList,
} from "./types";

const baseUrl = "/ai";

// A 403 on an AI read means the caller has no access to this agent/room's AI
// (e.g. an owner opening an agent created by another admin). That "no access"
// state is already surfaced by the agent view's NoAccessContainer, so a generic
// error toast on top is noise — several AI reads race on open and each would
// fire one (Bug 83181). Callers that self-toast skip it for 403 via this check.
const isForbiddenError = (e: unknown): boolean =>
  (e as { response?: { status?: number } })?.response?.status === 403;

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

  return res.map((m) => ({
    ...m,
  })) as TModelList;
};

const getAuthHeaders = async (): Promise<Record<string, string>> => {
  if (typeof window === "undefined") return {};

  if (isOAuthFrame()) {
    const oauthToken = await resolveOAuthToken();
    return oauthToken ? { Authorization: `Bearer ${oauthToken}` } : {};
  }

  const cookie = getCookie("asc_auth_key");
  if (cookie) return { Authorization: cookie };

  const token = getAuthToken();
  if (token) return { Authorization: token };

  const publicRoomKey = new URLSearchParams(window.location.search).get(
    "share",
  );

  if (publicRoomKey)
    return {
      "Request-Token": publicRoomKey,
    };

  return {};
};

const authFetch = async (
  url: string,
  init: RequestInit = {},
): Promise<Response> => {
  const send = async () => {
    const headers = new Headers(init.headers);
    for (const [name, value] of Object.entries(await getAuthHeaders()))
      headers.set(name, value);
    return {
      hadAuth: headers.has("Authorization"),
      response: await fetch(url, { ...init, headers }),
    };
  };

  const first = await send();
  let { response } = first;

  if (
    response.status === 401 &&
    first.hadAuth &&
    typeof window !== "undefined" &&
    isOAuthFrame() &&
    !init.signal?.aborted &&
    (await refreshOAuthToken())
  ) {
    ({ response } = await send());
  }

  return response;
};

export const startNewChat = async (
  roomId: number | string,
  message: string,
  files: string[],
  abortController?: AbortController,
) => {
  const response = await authFetch(`/api/2.0${baseUrl}/rooms/${roomId}/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const response = await authFetch(
    `/api/2.0${baseUrl}/chats/${chatId}/messages`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: abortController?.signal,
      body: JSON.stringify({ message, files }),
    },
  );

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

export const deleteChat = async (chatId: string) => {
  await request({
    method: "DELETE",
    url: `${baseUrl}/chats/${chatId}`,
  });
};

export const retryVectorization = async (fileIds: TFile["id"][]) => {
  const res = await request({
    method: "POST",
    url: `${baseUrl}/vectorization/tasks`,
    data: { files: fileIds },
  });

  return res as TVectorizeOperation;
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
    if (!isForbiddenError(e)) toastr.error(e as string);
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
    if (!isForbiddenError(e)) toastr.error(e as string);
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

// New agent creation flow: the Node AI service (mounted at /ai) creates
// the agent via the .NET endpoint and binds the selected AI profile to it.
export const createAIAgentWithProfile = async (
  data: TCreateAgentWithProfileData,
) => {
  const res = await request({
    method: "POST",
    url: `/ai/agents`,
    data,
  });

  return res as TAgent;
};

// The Node AI service (mounted at /ai) owns the profile<->agent binding: it
// injects `profileId` (GET :id), rebinds the profile when a `profileId` is
// sent (PUT) and keeps the prompt in `chatSettings`.
export const editAIAgent = async (id: TAgent["id"], data: TEditAgentData) => {
  const res = await request({
    method: "PUT",
    url: `${baseUrl}/agents/${id}`,
    data,
  });

  return res as TAgent;
};

// `profileId` is injected by the Node AI service (resolved from the
// Chat-action assignment) — the list endpoint below never carries it.
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
  await request({ method: "DELETE", url: `${baseUrl}/agents/${id}`, data: {} });
};

export const resetAIAgentQuota = async (
  roomIds: TAgent["id"] | TAgent["id"][],
) => {
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

export function setCustomAIAgentQuota(
  roomIds: TAgent["id"] | TAgent["id"][],
  quota: number,
) {
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

export const getDefaultProvider = async () => {
  const options = {
    method: "get",
    url: `${baseUrl}/providers/default`,
  };

  const res = await request(options);

  return res as TDefaultProvider;
};

export const getProfilesList = async () => {
  const response = await authFetch(`/api/2.0/ai/profiles/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return [] as TProfilesList;

  return (await response.json()) as TProfilesList;
};

export const getWebSearchConfigured = async () => {
  const response = await authFetch(`/api/2.0/ai/web-search/is-configured`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return false;

  return (await response.json()) as boolean;
};

export const getProfileAssignments = async (entityId?: string) => {
  const params = entityId ? `?entityId=${encodeURIComponent(entityId)}` : "";

  const response = await authFetch(
    `/api/2.0/ai/assignments/get-all-assignments${params}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) return {} as Record<string, string>;

  return (await response.json()) as Record<string, string>;
};

// --- MCP servers (chat-lib model) ------------------------------------------
// Entity-scoped custom MCP servers of the Node AI service (`tools/*`
// routes). For an agent the per-entity map doubles as its MCP whitelist:
// the agent create/edit dialog manages the set here. The service resolves
// the stored config itself — system servers are pinned to the canonical
// config from the Node AI service config file, portal-level servers are
// copied.

/** Name → config map of MCP servers scoped to an entity (portal scope
 * when `entityId` is omitted). */
export const getEntityMcpServers = async (entityId?: string) => {
  const params = entityId ? `?entityId=${encodeURIComponent(entityId)}` : "";

  const response = await authFetch(
    `/api/2.0/ai/tools/list-custom-servers${params}`,
    { method: "GET", headers: { "Content-Type": "application/json" } },
  );

  if (!response.ok) return {} as Record<string, unknown>;

  return (await response.json()) as Record<string, unknown>;
};

/** Names of the system MCP servers configured on the Node AI service. */
export const getSystemMcpServerNames = async () => {
  const response = await authFetch(`/api/2.0/ai/tools/list-system-tools`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) return [] as string[];

  const grouped = (await response.json()) as Record<string, unknown>;
  return Object.keys(grouped);
};

/** Enable an MCP server (by name) for an entity. The config is resolved
 * server-side: canonical for system servers, copied from the portal scope
 * for portal-level servers. */
export const addEntityMcpServer = async (name: string, entityId: string) => {
  const response = await authFetch(
    `/api/2.0/ai/tools/add-custom-server`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, config: null, entityId }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to enable MCP server "${name}": ${response.status} ${response.statusText}`,
    );
  }
};

/** Disable an MCP server (by name) for an entity. */
export const removeEntityMcpServer = async (name: string, entityId: string) => {
  const response = await authFetch(
    `/api/2.0/ai/tools/remove-custom-server`,
    {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, entityId }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to disable MCP server "${name}": ${response.status} ${response.statusText}`,
    );
  }
};

export const getAIUserConfig = async () => {
  const options = {
    method: "get",
    url: `${baseUrl}/config/user`,
  };

  const res = await request(options);

  return res as TAIUserConfig;
};

export const updateAIUserConfig = async (data: TAIUserConfig) => {
  const options = {
    method: "put",
    url: `${baseUrl}/config/user`,
    data,
  };

  const res = await request(options);

  return res as TAIUserConfig;
};
