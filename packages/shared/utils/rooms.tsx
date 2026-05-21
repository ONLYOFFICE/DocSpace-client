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
import { TRoom, TRoomLifetime, TWatermark } from "../api/rooms/types";
import { TConnectingStorage } from "../api/files/types";

import { RoomsType } from "../enums";

const getStartRoomParams = (startRoomType: RoomsType, title: string) => {
  const startRoomParams = {
    type: startRoomType,
    title: title ?? "",
    tags: [],
    isPrivate: false,
    storageLocation: {
      isThirdparty: false,
      provider: null,
      thirdpartyAccount: null,
      storageFolderId: "",
      isSaveThirdpartyAccount: false,
    },
    icon: {
      uploadedFile: null,
      tmpFile: "",
      x: 0.5,
      y: 0.5,
      zoom: 1,
    },
    withCover: false,
    previewIcon: null,
    saveFormAsXLSX: true,
    sendFormToExternalDB: false,
  };

  return startRoomParams;
};

export type TRoomStorageLocation = {
  title: string;
  parentId: number;
  providerKey?: string;
  iconSrc: string;
  thirdpartyAccount?: unknown;
  storageFolderId?: string;
  isThirdparty?: boolean;
  provider?: TConnectingStorage;
};

export type TRoomTagsParams = {
  id: string | number;
  name: string;
  isNew?: boolean;
  isDefault?: boolean;
};

export type TRoomIconParams = {
  uploadedFile: string | null;
  tmpFile: string;
  x: number;
  y: number;
  zoom: number;
};

export type TRoomParams = {
  roomId: number;
  type: RoomsType;
  title: string;
  tags: TRoomTagsParams[];
  isPrivate: boolean;
  storageLocation: TRoomStorageLocation;
  icon: TRoomIconParams;
  withCover: boolean;
  previewIcon: string | null;
  roomOwner: TCreatedBy;
  canChangeRoomOwner: boolean;
  indexing?: boolean;
  lifetime?: TRoomLifetime;
  denyDownload?: boolean;
  watermark?: TWatermark;
  quota?: number;
  invitations?: unknown[];
  isAvailable?: boolean;
  roomType?: RoomsType;
  logo?: unknown;
  createAsNewFolder?: boolean;
  isTemplate?: boolean;
  copyLogo?: boolean;
  prompt?: string;
  providerId?: number;
  modelId?: string;
  mcpServers?: string[];
  mcpServersInitial?: string[];
  saveFormAsXLSX?: boolean;
  sendFormToExternalDB?: boolean;
};

const getFetchedRoomParams = (
  item: TRoom,
  getThirdPartyIcon: (provider: string) => string,
  isDefaultRoomsQuotaSet: boolean,
): TRoomParams => {
  const startTags = Object.values(item.tags);
  const startObjTags = startTags.map((tag, i) => ({ id: i, name: tag }));

  const fetchedRoomParams = {
    roomId: item.id,
    type: item.roomType,
    title: item.title,
    tags: startObjTags,
    isThirdparty: !!item.providerKey,
    storageLocation: {
      title: item.title,
      parentId: item.parentId,
      providerKey: item.providerKey,
      iconSrc: getThirdPartyIcon(item.providerKey || ""),
    },
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
    roomOwner: item.createdBy,
    canChangeRoomOwner: item?.security?.ChangeOwner || false,
    indexing: item.indexing,
    lifetime: item.lifetime,
    denyDownload: item.denyDownload,
    watermark: item.watermark,
    prompt: item.chatSettings?.prompt,
    providerId: item.chatSettings?.providerId,
    modelId: item.chatSettings?.modelId,
    saveFormAsXLSX: item.saveFormAsXLSX,
    sendFormToExternalDB: item.sendFormToExternalDB,
    ...(isDefaultRoomsQuotaSet && {
      quota: item.quotaLimit,
    }),
    logo: item.logo,
  };
  return fetchedRoomParams;
};

const getRoomCreationAdditionalParams = (roomType: RoomsType) => {
  const additionalParams = {
    indexing: roomType === RoomsType.VirtualDataRoom ? true : undefined,
    denyDownload: roomType === RoomsType.VirtualDataRoom ? true : undefined,
    lifetime: undefined, // Skip lifetime for now
    watermark:
      roomType === RoomsType.VirtualDataRoom
        ? { rotate: -45, additions: 1 }
        : undefined,
  };

  return additionalParams;
};

export {
  getStartRoomParams,
  getRoomCreationAdditionalParams,
  getFetchedRoomParams,
};
