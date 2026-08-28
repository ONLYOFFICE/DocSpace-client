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

import type { TPathParts } from "../../types";
import type { TFile, TFolder } from "../files/types";
import type { TRoom } from "../rooms/types";
import { KnowledgeType, ProviderType } from "./enums";

import {
  TMessage,
  TChat,
  TAIConfig,
  TMCPTool,
  TServer,
  TModelCapabilities,
} from "@docspace/ui-kit/types/ai";

export type { TMessage, TChat, TAIConfig, TMCPTool, TServer, TModelCapabilities };

export type TAiProvider = {
  id: number;
  title: string;
  type: ProviderType;
  url: string;
  createdOn: string;
  modifiedOn: string;
  isDefault: boolean;
  needReset?: boolean;
};

export type TModel = {
  providerId: TAiProvider["id"];
  providerTitle: TAiProvider["title"];
  modelId: string;
  alias?: string;
  capabilities?: TModelCapabilities;
  price?: {
    prompt: number;
    completion: number;
  };
  currency?: {
    code: string;
    symbol: string;
  };
};


export type TProfile = {
  id: string;
  name: string;
  providerType: string;
  baseUrl: string;
  modelId: string;
  key?: string | null;
  headers?: Record<string, string>;
  reasoning?: boolean;
  capabilities?: number;
  canUseTool?: boolean;
  useResponsesApi?: boolean;
  createdAt?: number;
};

export type TProfilesList = TProfile[];

export type TVectorizeOperation = {
  error: string;
  id: string;
  isCompleted: boolean;
  percentage: number;
  status: number;
};

export type KnowledgeConfig = {
  type: KnowledgeType;
  key?: string;
  needReset?: boolean;
};

// `profileId` is injected by the Node AI service on GET /ai/agents/:id
// (resolved from the Chat-action assignment), so it isn't part of the base
// room contract.
export type TAgent = TRoom & { profileId?: string };

export type TAgentLogo = {
  tmpFile: string;
  height: number;
  width: number;
  x: number;
  y: number;
};

export type TChatSettings = {
  prompt?: string;
  providerId?: TAiProvider["id"];
  modelId?: TModel["modelId"];
};

export type TCreateAgentData = {
  title: string;
  cover?: string;
  color?: string;
  tags?: string[];
  logo?: TAgentLogo;
  chatSettings?: TChatSettings;
  quota?: number;
  attachDefaultTools?: boolean;
};

export type TGetAgents = {
  files: TFile[];
  folders: TAgent[];
  current: TFolder;
  pathParts: TPathParts[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
};

// Edit goes through the Node AI service (PUT /ai/agents/:id): room fields
// (incl. `chatSettings.prompt`) are forwarded to .NET, and an optional
// `profileId` rebinds the agent's Chat-action profile server-side.
export type TEditAgentData = Partial<TCreateAgentData> & {
  profileId?: string;
};

// Payload of the new agent-creation endpoint (POST /ai/agents, Node AI
// service). The service forwards everything except `profileId`/`prompt` to
// the .NET endpoint and binds the profile to the created agent itself, so
// `chatSettings` must not be sent by the caller.
export type TCreateAgentWithProfileData = Omit<
  TCreateAgentData,
  "chatSettings"
> & {
  profileId: string;
  prompt: string;
};

export type TAIUserConfig = {
  chatRecommendedModelVisible: boolean;
};

