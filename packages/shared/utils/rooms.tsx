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

import { TCreatedBy, ValueOf } from "../types";
import { TRoom, TRoomLifetime, TWatermark } from "../api/rooms/types";
import { TConnectingStorage } from "../api/files/types";
import type RoomsFilter from "../api/rooms/filter";

import {
  FolderType,
  RoomPrivacyFilter,
  RoomSearchArea,
  RoomsType,
  RoomsTypePrivate,
} from "../enums";
import { CategoryType } from "../constants";

import { RoomsTypeValues } from "./common";

/**
 * Room types the "AI rooms" section lists, filters by and creates through
 * `files/rooms`: the Instructions room (skills), the Knowledge room
 * (knowledge base) and the AI project. The server keeps them under the
 * `FolderType.AiHub` root (`searchArea=AiHub`), never in Rooms.
 */
export const AI_HUB_SECTION_TYPES: RoomsType[] = [
  RoomsType.InstructionsRoom,
  RoomsType.KnowledgeRoom,
  RoomsType.AiProjectRoom,
];

/**
 * The settings the server refuses (400) when an "AI rooms" type is created
 * or edited: none of them applies to those types. A project takes no quota
 * either.
 */
const AI_HUB_REFUSED_SETTINGS = [
  "indexing",
  "denyDownload",
  "lifetime",
  "watermark",
  "chatSettings",
  "sendFormToExternalDB",
  "saveFormAsXLSX",
] as const;

/** The create / edit body of a room without the settings its "AI rooms" type refuses. */
export const withoutSettingsRefusedForAiRooms = <T extends object>(
  params: T,
  roomType?: number,
): T => {
  if (roomType === undefined || !AI_HUB_SECTION_TYPES.includes(roomType)) return params;
  const allowed = { ...params } as Record<string, unknown>;
  AI_HUB_REFUSED_SETTINGS.forEach((key) => delete allowed[key]);
  if (roomType === RoomsType.AiProjectRoom) delete allowed.quota;
  return allowed as T;
};

/**
 * `FolderType` values of the "AI rooms" section's rooms, for the `folderType`
 * scope of its Recent/Favorites/Trash slots (see ROOMS_SECTION_FOLDER_TYPES).
 */
export const AI_HUB_SECTION_FOLDER_TYPES = [
  FolderType.InstructionsRoom,
  FolderType.KnowledgeRoom,
  FolderType.AiProjectRoom,
];

/**
 * Room types offered as filter options in the "Rooms" section dropdown.
 *
 * Form Filling Rooms are excluded because they live in their own "Forms"
 * section (the backend serves them via `searchArea=Forms` and never returns
 * them in the Active rooms listing), so filtering the Rooms section by that
 * type would never match anything.
 *
 * `RoomsTypePrivate` is excluded too: it is a client-only synthetic value used
 * by the create flow, not a real backend room type (the API rejects it). A
 * private room is stored under its real type, so it still shows via that type.
 *
 * This is a UI-options list only — it no longer scopes any API request; the
 * Rooms/Forms split is enforced server-side by the room's folder type.
 */
export const ROOMS_SECTION_TYPES = RoomsTypeValues.filter(
  (type) =>
    type !== RoomsType.FormRoom &&
    type !== RoomsTypePrivate &&
    !AI_HUB_SECTION_TYPES.includes(type),
);

/**
 * `FolderType` values of the rooms that make up the "Rooms" section, for the
 * `folderType` scope filter of the Recent/Favorites/Trash aggregates
 * (`GET files/{folderId}?folderType=...`, bound to `List<FolderType>` on the
 * server). Mirrors ROOMS_SECTION_TYPES: form-filling rooms belong to the
 * "Forms" section and the AI room types to "AI rooms", so both are excluded
 * here.
 */
export const ROOMS_SECTION_FOLDER_TYPES = [
  FolderType.EditingRoom,
  FolderType.CustomRoom,
  FolderType.PublicRoom,
  FolderType.VirtualDataRoom,
];

/**
 * Room types the create-room chooser of the Rooms section may offer, in
 * catalog order. The AI room types are created from the "AI rooms" section's
 * own chooser (AI_HUB_SECTION_TYPES).
 * Spec: private-rooms/sidebar-section, "Generic chooser does not offer the Private type"
 */
export const getCreateRoomTypes = () =>
  RoomsTypeValues.filter(
    (type) => !AI_HUB_SECTION_TYPES.includes(type) && type !== RoomsTypePrivate,
  );

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

const getStartRoomParams = (startRoomType: RoomsType, title: string) => {
  const startRoomParams = {
    type: startRoomType,
    title: title ?? "",
    tags: [],
    isPrivate: startRoomType === RoomsTypePrivate,
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
    sendFormToExternalDB: true,
    ...getRoomCreationAdditionalParams(startRoomType),
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
    isPrivate: !!item.private,
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

export type TRoomsRequestScope = {
  /** The filter the request carries; `null` sends none. */
  privacyFilter: RoomPrivacyFilter | null;
  searchArea?: RoomSearchArea;
  /** Whether the list holds the private rooms or the others. */
  lists: "private" | "notPrivate";
};

/**
 * What a rooms-list request must carry for the address it was made from. The
 * Private section is the server's `PrivateRooms` area, and its Archive the
 * shared Archive with the private filter. The Rooms area never returns a
 * private room, so Rooms sends no filter, and Rooms -> Archive, which holds
 * both, sends the non-private one. Templates, Forms and AI agents searches
 * are left alone.
 */
const getRoomsRequestScope = (
  categoryType: ValueOf<typeof CategoryType>,
  searchArea: RoomSearchArea | string | undefined,
): TRoomsRequestScope | null => {
  switch (categoryType) {
    // Spec: private-rooms/sidebar-section, "Section lists only private rooms"
    case CategoryType.PrivateRooms:
    case CategoryType.PrivateRoom:
      return {
        privacyFilter: null,
        searchArea: RoomSearchArea.PrivateRooms,
        lists: "private",
      };
    case CategoryType.PrivateArchive:
      return {
        privacyFilter: RoomPrivacyFilter.Private,
        searchArea: RoomSearchArea.Archive,
        lists: "private",
      };
    case CategoryType.Shared:
    case CategoryType.SharedRoom:
    case CategoryType.Archive:
    case CategoryType.ArchivedRoom: {
      const isRoomsArea =
        !searchArea ||
        searchArea === RoomSearchArea.Active ||
        searchArea === RoomSearchArea.Archive;
      if (!isRoomsArea) return null;

      // Spec: private-rooms/sidebar-section, "Rooms section never lists private rooms"
      const isArchive =
        searchArea === RoomSearchArea.Archive ||
        (!searchArea &&
          (categoryType === CategoryType.Archive ||
            categoryType === CategoryType.ArchivedRoom));

      return {
        privacyFilter: isArchive ? RoomPrivacyFilter.NotPrivate : null,
        lists: "notPrivate",
      };
    }
    default:
      return null;
  }
};

/** A copy of the filter for the request; the filter itself stays as the address has it. */
const withRoomsRequestScope = (
  filter: RoomsFilter,
  scope: TRoomsRequestScope | null,
): RoomsFilter => {
  if (!scope) return filter;
  const scoped = filter.clone();
  scoped.privacyFilter = scope.privacyFilter;
  if (scope.searchArea) scoped.searchArea = scope.searchArea;
  return scoped;
};

export {
  getRoomsRequestScope,
  withRoomsRequestScope,
  getStartRoomParams,
  getRoomCreationAdditionalParams,
  getFetchedRoomParams,
};
