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
