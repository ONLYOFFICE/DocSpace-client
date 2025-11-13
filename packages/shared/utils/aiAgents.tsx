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

import { TCreatedBy } from "../types";
import { TAgent } from "../api/ai/types";

export type TAgentTagsParams = {
  id: string | number;
  name: string;
  isNew?: boolean;
  isDefault?: boolean;
};

export type TAgentIconParams = {
  uploadedFile: File | string | null;
  tmpFile: string;
  x: number;
  y: number;
  zoom: number;
};

export type TAgentParams = {
  agentId?: number;
  agentOwner?: TCreatedBy;
  canChangeAgentOwner?: boolean;
  title: string;
  tags: TAgentTagsParams[];
  isPrivate: boolean;
  icon: TAgentIconParams;
  withCover: boolean;
  previewIcon: string | null;
  isAvailable?: boolean;
  logo?: unknown;
  iconWasUpdated?: boolean;
  prompt?: string;
  providerId?: number;
  modelId?: string;
  mcpServers?: string[];
  mcpServersInitial?: string[];
  quota?: number;
  attachDefaultTools?: boolean;
};

export const getStartAgentParams = (title: string): TAgentParams => {
  return {
    title: title ?? "",
    tags: [],
    isPrivate: false,
    icon: {
      uploadedFile: null,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    withCover: false,
    previewIcon: null,
  };
};

export const getFetchedAgentParams = (
  item: TAgent,
  isDefaultAIAgentsQuotaSet?: boolean,
): TAgentParams => {
  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));

  return {
    agentId: item.id,
    title: item.title,
    tags: startObjTags,
    isPrivate: false,
    icon: {
      uploadedFile: item?.logo?.original,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    withCover: false,
    previewIcon: null,
    agentOwner: item.createdBy,
    canChangeAgentOwner: item?.security?.ChangeOwner || false,
    prompt: item.chatSettings?.prompt,
    providerId: item.chatSettings?.providerId,
    modelId: item.chatSettings?.modelId,
    ...(isDefaultAIAgentsQuotaSet && {
      quota: item.quotaLimit,
    }),
  };
};
