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

import type { TPathParts } from "../../types";
import type { TFile, TFolder } from "../files/types";
import type { TRoom } from "../rooms/types";
import { KnowledgeType, ProviderType, WebSearchType } from "./enums";

import {
  TMessage,
  TChat,
  TAIConfig,
  TMCPTool,
  TServer,
  TModelCapabilities,
} from "@docspace/ui-kit/types/ai";

export type { TMessage, TChat, TAIConfig, TMCPTool, TServer, TModelCapabilities };

export type TCreateAiProvider = {
  type: ProviderType;
  title: string;
  key: string;
  url: string;
  modelSettings?: TModelSettingsItem[];
};

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

export type TUpdateAiProvider = {
  title?: TCreateAiProvider["title"];
  key?: TCreateAiProvider["key"];
  url?: TCreateAiProvider["url"];
  modelSettings?: TModelSettingsItem[];
};

export type TDeleteAiProviders = { ids: TAiProvider["id"][] };

export type TProviderTypeWithUrl = Pick<TAiProvider, "type" | "url">;

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

export type TModelList = TModel[];

export type TVectorizeOperation = {
  error: string;
  id: string;
  isCompleted: boolean;
  percentage: number;
  status: number;
};

export type TAddNewServer = {
  endpoint: string;
  name: string;
  description: string;
  headers: Record<string, string>;
  icon: string;
};

export type TUpdateServer = {
  endpoint?: string;
  name?: string;
  description?: string;
  headers?: Record<string, string>;
  icon?: string;
  updateIcon?: boolean;
};

export type WebSearchConfig = {
  enabled: boolean;
  type: WebSearchType;
  key?: string;
  needReset?: boolean;
};

export type KnowledgeConfig = {
  type: KnowledgeType;
  key?: string;
  needReset?: boolean;
};

export type TAgent = TRoom;

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

export type TEditAgentData = Partial<TCreateAgentData>;

export type TDefaultProvider = {
  providerId: TAiProvider["id"];
  providerTitle: TAiProvider["title"];
  providerType?: ProviderType;
  defaultModel: TModel["modelId"];
  defaultModelAlias?: string;
};

export type TUpdateDefaultProviderData = {
  providerId: TAiProvider["id"];
  defaultModel: TModel["modelId"];
};

export type TModelSettingsItem = {
  modelId: string;
  isEnabled: boolean;
  alias?: string;
  capabilities?: TModelCapabilities;
};

export type TModelSettingsDto = {
  id: string;
  alias?: string;
  isEnabled: boolean;
  isRecommended: boolean;
  capabilities: TModelCapabilities;
};

export type TProviderModelInfo = {
  modelId: string;
  displayName: string;
  isRecommended: boolean;
  capabilities: TModelCapabilities;
};

export type TSelectedModelData = {
  modelId: string;
  displayName?: string;
  capabilities?: TModelCapabilities;
};

export type TPreviewModelsRequest = {
  type: ProviderType;
  key: string;
  url?: string;
};
