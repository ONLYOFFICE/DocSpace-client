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

// @ts-nocheck

import { AxiosRequestConfig } from "axios";
import type { DateTime } from "luxon";
import { Nullable } from "types";
import {
  FolderType,
  MembersSubjectType,
  ShareAccessRights,
  ShareLinkType,
} from "../../enums";
import { request } from "../client";
import type { TFileLink } from "../files/types";
import {
  checkFilterInstance,
  decodeDisplayName,
  toUrlParams,
} from "../../utils/common";
import RoomsFilter from "./filter";
import {
  TGetRooms,
  TExportRoomIndexTask,
  TPublicRoomPassword,
  TValidateShareRoom,
  TRoom,
  TGetRoomMembers,
  TFeed,
  ExternalSyncDB,
} from "./types";

export async function getRooms(filter: RoomsFilter, signal?: AbortSignal) {
  let params;

  if (filter) {
    checkFilterInstance(filter, RoomsFilter);

    params = `?${filter.toApiUrlParams()}`;
  }

  const options: AxiosRequestConfig = {
    method: "get",
    url: `/files/rooms${params}`,
    signal,
  };

  const res = (await request(options)) as TGetRooms;

  res.files = decodeDisplayName(res.files);
  res.folders = decodeDisplayName(res.folders);

  if (res.current.rootFolderType === FolderType.Archive) {
    res.folders.forEach((room) => {
      room.isArchive = true;
    });
  }

  return res;
}

export function getRoomInfo(id) {
  const options = {
    method: "get",
    url: `/files/rooms/${id}`,
  };

  return request(options).then((res) => {
    if (res.rootFolderType === FolderType.Archive) res.isArchive = true;

    return res as TRoom;
  });
}

export async function getRoomMembers(
  id: string | number,
  filter: {
    filterType?: number;
    filterValue?: string;
    count?: number;
    startIndex?: number;
  },
  signal?: AbortSignal,
) {
  let params = "";

  const str = toUrlParams(filter);
  if (str) params = `?${str}`;

  const options = {
    method: "get",
    url: `/files/rooms/${id}/share${params}`,
    signal,
  };

  const res = (await request(options)) as TGetRoomMembers;

  res.items.forEach((item) => {
    if (item.subjectType === MembersSubjectType.Group) {
      item.sharedTo.isGroup = true;
    }
  });

  return res;
}

export function updateRoomMemberRole(id, data) {
  const options = {
    method: "put",
    url: `/files/rooms/${id}/share`,
    data,
  };

  return request(options).then((res) => {
    return res as { error?: RoomSecurityError };
  });
}
export function updateFileMemberAccess(id, data) {
  const options = {
    method: "put",
    url: `/files/file/${id}/share`,
    data,
  };

  return request(options).then((res) => {
    return res as { error?: RoomSecurityError };
  });
}

export function getHistory(
  selectionType: "file" | "folder",
  id: number | string,
  filter: { page: number; startIndex: number; count: number },
  signal: Nullable<AbortSignal> = null,
  requestToken?: string,
) {
  let params = "";

  const str = toUrlParams(filter, false);
  if (str) params = `?${str}`;

  const options = {
    method: "get",
    url: `/files/${selectionType}/${id}/log${params}`,
    signal,
  };

  if (requestToken) options.headers = { "Request-Token": requestToken };

  return request<TFeed>(options).then((res) => res);
}

export function createRoom(data) {
  const options = { method: "post", url: `/files/rooms`, data };

  return request(options).then((res) => {
    return res;
  });
}

export function createRoomInThirdpary(id, data) {
  const options = {
    method: "post",
    url: `/files/rooms/thirdparty/${id}`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function editRoom(id, data) {
  const options = { method: "put", url: `/files/rooms/${id}`, data };

  return request<TRoom>(options).then((res) => {
    return res;
  });
}

export function pinRoom(id) {
  const options = { method: "put", url: `/files/rooms/${id}/pin` };

  const skipRedirect = true;

  return request(options, skipRedirect).then((res) => {
    return res;
  });
}

export function unpinRoom(id) {
  const options = { method: "put", url: `/files/rooms/${id}/unpin` };

  return request(options).then((res) => {
    return res;
  });
}

export function deleteRoom(id, deleteAfter = false) {
  const data = { deleteAfter };

  const options = {
    method: "delete",
    url: `/files/rooms/${id}`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function archiveRoom(id, deleteAfter = false) {
  const data = { deleteAfter };

  const options = {
    method: "put",
    url: `/files/rooms/${id}/archive`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function unarchiveRoom(id) {
  const data = { deleteAfter: false };
  const options = {
    method: "put",
    url: `/files/rooms/${id}/unarchive`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function createTag(name) {
  const data = { name };
  const options = {
    method: "post",
    url: "/files/tags",
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}
export async function removeTagRequest(names: string[]) {
  const data = { names };
  const options = {
    method: "delete",
    url: "/files/tags",
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}
export function updateTagName(oldName: string, newName: string) {
  const data = { oldName, newName };
  const options = {
    method: "PUT",
    url: "/files/tags",
    data,
  };

  return request(options)!;
}

export function addTagsToRoom(id: string | number, tagArray: string[]) {
  const data = { names: tagArray };
  const options = {
    method: "put",
    url: `/files/rooms/${id}/tags`,
    data,
  };

  return request(options).then((res) => {
    return res as TRoom;
  });
}

export function removeTagsFromRoom(id: string | number, tagArray: string[]) {
  const data = { names: tagArray };
  const options = {
    method: "delete",
    url: `/files/rooms/${id}/tags`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function getTags() {
  const options = {
    method: "get",
    url: "/files/tags",
  };

  return request<string[]>(options);
}

export function uploadRoomLogo(data) {
  const options = {
    method: "post",
    url: `/files/logos`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function addLogoToRoom(id, data) {
  const options = {
    method: "post",
    url: `/files/rooms/${id}/logo`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function removeLogoFromRoom(id) {
  const options = {
    method: "delete",
    url: `/files/rooms/${id}/logo`,
  };

  return request(options).then((res) => {
    return res;
  });
}

export const setInvitationLinks = async (
  roomId,
  title,
  access,
  linkId,
  expirationDate,
  maxUseCount,
) => {
  const options = {
    method: "put",
    url: `/files/rooms/${roomId}/links`,
    data: {
      linkId,
      title,
      access,
      expirationDate,
      maxUseCount,
    },
  };
  const skipRedirect = true;
  const res = await request(options, skipRedirect);

  return res;
};

export const resendEmailInvitations = async (id, resendAll = true) => {
  const options = {
    method: "post",
    url: `/files/rooms/${id}/resend`,
    data: {
      resendAll,
    },
  };

  const res = await request(options);

  return res;
};

// 1 (Invitation link)
export const getRoomSecurityInfo = async (id) => {
  const options = {
    method: "get",
    url: `/files/rooms/${id}/share?filterType=1`,
  };

  const res = await request(options);

  return res;
};

export const setRoomSecurity = async (id, data) => {
  const options = {
    method: "put",
    url: `/files/rooms/${id}/share`,
    data,
  };

  const skipRedirect = true;
  const res = await request(options, skipRedirect);

  res.members.forEach((item) => {
    if (item.subjectType === MembersSubjectType.Group) {
      item.sharedTo.isGroup = true;
    }
  });

  return res;
};

export const acceptInvitationByLink = async () => {
  const options = {
    method: "post",
    url: `/files/rooms/accept`,
  };

  const res = await request(options);

  return res;
};

export function editExternalLink(
  roomId: number | string,
  linkId: number | string,
  title: string,
  access: ShareAccessRights,
  expirationDate: DateTime | string | string | null,
  linkType: number,
  password: string | undefined,
  disabled: boolean,
  denyDownload: boolean,
  internal: boolean,
) {
  const skipRedirect = true;

  return request<TFileLink>(
    {
      method: "put",

      url: `/files/rooms/${roomId}/links`,
      data: {
        linkId,
        title,
        access,
        expirationDate,
        linkType,
        password,
        disabled,
        denyDownload,
        internal,
      },
    },
    skipRedirect,
  );
}
export function createExternalLink(
  roomId: number | string,
  link: Partial<{
    title: string;
    access: ShareAccessRights;
    expirationDate: DateTime | string | string | null;
    linkType: number;
    password: string | undefined;
    denyDownload: boolean;
    internal: boolean;
  }> = {},
) {
  const skipRedirect = true;

  const data = {
    internal: false,
    linkType: ShareLinkType.External,
    access: ShareAccessRights.ReadOnly,
    ...link,
  };

  return request(
    {
      method: "put",
      url: `/files/rooms/${roomId}/links`,
      data,
    },
    skipRedirect,
  ) as Promise<TFileLink>;
}

export function getExternalLinks(roomId, type) {
  const linkType = `?type=${type}`;

  return request({
    method: "get",
    url: `files/rooms/${roomId}/links${linkType}`,
  });
}

export function getPrimaryLink(roomId: number | string) {
  return request(
    {
      method: "get",
      url: `files/rooms/${roomId}/link`,
    },
    true,
  ) as Promise<TFileLink>;
}

export function validatePublicRoomKey(
  key: string,
  searchParams?: URLSearchParams,
) {
  return request<TValidateShareRoom>({
    method: "get",
    url: `files/share/${key}${searchParams && searchParams.size > 0 ? `?${searchParams.toString()}` : ""}`,
  });
}

export async function validatePublicRoomPassword(
  key: string,
  passwordHash: string,
  signal?: AbortSignal,
) {
  const res = (await request({
    method: "post",
    url: `files/share/${key}/password`,
    data: { password: passwordHash },
    signal,
  })) as TPublicRoomPassword;

  return res;
}

export function setCustomRoomQuota(roomIds, quota) {
  const data = {
    roomIds,
    quota,
  };
  const options = {
    method: "put",
    url: "files/rooms/roomquota",
    data,
  };

  return request(options);
}

export function resetRoomQuota(roomIds) {
  const data = {
    roomIds,
  };
  const options = {
    method: "put",
    url: "files/rooms/resetquota",
    data,
  };

  return request(options);
}

export function getRoomCovers() {
  const options = {
    method: "get",
    url: "files/rooms/covers",
  };

  return request(options);
}

export function exportRoomIndex(roomId: number) {
  return request({
    method: "post",
    url: `files/rooms/${roomId}/indexexport`,
  }) as Promise<TExportRoomIndexTask>;
}

export function getExportRoomIndexProgress() {
  return request({
    method: "get",
    url: `files/rooms/indexexport`,
  }) as Promise<TExportRoomIndexTask>;
}

export function setRoomCover(roomId, cover) {
  const data = {
    Color: cover.color,
    Cover: cover.cover,
  };
  const options = {
    method: "post",
    url: `files/rooms/${roomId}/cover`,
    data,
  };

  return request(options);
}

export function createTemplate(data: {
  roomId: number;
  title: string;
  logo: TRoom["logo"];
  share;
  tags: TRoom["tags"];
  public: boolean;
  quota: number;
}) {
  const options = {
    method: "post",
    url: `/files/roomtemplate`,
    data,
  };

  return request(options);
}

export function getCreateTemplateProgress() {
  const options = {
    method: "get",
    url: `/files/roomtemplate/status`,
  };

  return request(options);
}

export function createRoomFromTemplate(data) {
  const options = {
    method: "post",
    url: `/files/rooms/fromTemplate`,
    data,
  };

  return request(options);
}

export function getCreateRoomFromTemplateProgress() {
  const options = {
    method: "get",
    url: `/files/rooms/fromTemplate/status`,
  };

  return request(options);
}

export function getTemplateAvailable(id: number) {
  const options = {
    method: "get",
    url: `/files/roomtemplate/${id}/public`,
  };

  return request(options) as Promise<boolean>;
}

export function setTemplateAvailable(id: number, isAvailable: boolean) {
  const options = {
    method: "put",
    url: `/files/roomtemplate/public`,
    data: { id, public: isAvailable },
  };

  return request(options);
}

export function hideConfirmRoomLifetime(val: boolean) {
  const options = {
    method: "put",
    url: "/files/hideconfirmroomlifetime",
    data: { set: val },
  };

  return request(options);
}

export function createGroupRooms(newGroup) {
  const options = {
    method: "post",
    url: "/files/group",
    data: newGroup,
  };

  return request(options);
}

export function getRoomGroups() {
  const options = {
    method: "get",
    url: "/files/group?includeMembers=false",
  };

  return request(options);
}

export function getGroupById(groupId) {
  const options = {
    method: "get",
    url: `/files/group/${groupId}?includeMembers=true`,
  };

  return request(options);
}

export function updateGroupIcon(groupId, icon) {
  const options = {
    method: "post",
    url: `/files/group/${groupId}/icon`,
    data: { icon },
  };

  return request(options);
}

export function updateRoomGroup(groupId, data) {
  const options = {
    method: "put",
    url: `/files/group/${groupId}`,
    data,
  };

  return request(options);
}

export function deleteRoomGroup(groupId) {
  const options = {
    method: "delete",
    url: `/files/group/${groupId}`,
  };

  return request(options);
}

export async function externalDbSync(itemId: string | number) {
  return request<ExternalSyncDB>({
    method: "GET",
    url: `/files/rooms/${itemId}/externalDbSync`,
  });
}
export async function startDbSync(itemId: string | number) {
  return request<ExternalSyncDB>({
    method: "POST",
    url: `/files/rooms/${itemId}/externalDbSync`,
  });
}
