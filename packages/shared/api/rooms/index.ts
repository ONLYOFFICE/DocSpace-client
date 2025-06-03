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

// eslint-disable @typescript-eslint/default-param-last
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import moment from "moment";
import { FolderType, MembersSubjectType, ShareAccessRights } from "../../enums";
import {
  request,
  roomsClient,
  filesClient,
  sharingClient,
  filesSettingsClient,
} from "../client";
import { decodeDisplayName, toUrlParams } from "../../utils/common";
import RoomsFilter from "./filter";

import type {
  ExternalShareDto,
  RoomLinkRequest,
  RoomInvitationRequest,
  ShareFilterType,
  CreateRoomRequestDto,
  CreateThirdPartyRoom,
  UpdateRoomRequest,
  DeleteRoomRequest,
  ArchiveRoomRequest,
  LogoRequest,
  UserInvitation,
  LinkType,
  ExternalShareRequestParam,
  CoverRequestDto,
  RoomTemplateDto,
  CreateRoomFromTemplateDto,
  SetPublicDto,
  SettingsRequestDto,
} from "@onlyoffice/docspace-api-typescript";

export async function getRooms(filter?: RoomsFilter, signal?: AbortSignal) {
  const res = await roomsClient.getRoomsFolder(
    filter?.type,
    filter?.subjectId,
    filter?.searchArea,
    filter?.withoutTags,
    filter?.tags,
    filter?.excludeSubject,
    filter?.provider,
    filter?.subjectFilter,
    filter?.quotaFilter,
    filter?.storageFilter,
    { signal },
  );

  res.files = decodeDisplayName(res.files);
  res.folders = decodeDisplayName(res.folders);

  if (res.current.rootFolderType === FolderType.Archive) {
    res.folders.forEach((room) => {
      room.isArchive = true;
    });
  }

  return res;
}

export async function getRoomInfo(id: number) {
  const res = await roomsClient.getRoomInfo(id);

  if (res.rootFolderType === FolderType.Archive) res.isArchive = true;

  return res;
}

export async function getRoomMembers(id: number, filterType: ShareFilterType) {
  const res = await roomsClient.getRoomSecurityInfo(id, filterType);

  res.items.forEach((item) => {
    if (item.subjectType === MembersSubjectType.Group) {
      item.sharedTo.isGroup = true;
    }
  });

  return res;
}

export async function updateRoomMemberRole(
  id: number,
  data: RoomInvitationRequest,
) {
  const res = await roomsClient.setRoomSecurity(id, data);
  return res;
}

export async function getHistory(
  selectionType: "file" | "folder",
  id,
  requestToken,
  filter,
  signal = null,
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

  const res = await request(options);
  return res;
}

export async function createRoom(data: CreateRoomRequestDto) {
  const res = await roomsClient.createRoom(data);
  return res;
}

export async function createRoomInThirdpary(
  id: string,
  data: CreateThirdPartyRoom,
) {
  const res = await roomsClient.createRoomThirdParty(id, data);
  return res;
}

export async function editRoom(id: number, data: UpdateRoomRequest) {
  const res = await roomsClient.updateRoom(id, data);
  return res;
}

export async function pinRoom(id: number) {
  const res = await roomsClient.pinRoom(id);
  return res;
}

export async function unpinRoom(id: number) {
  const res = await roomsClient.unpinRoom(id);
  return res;
}

export async function deleteRoom(
  id: number,
  data: DeleteRoomRequest = { deleteAfter: false },
) {
  const res = await roomsClient.deleteRoom(id, data);
  return res;
}

export async function archiveRoom(
  id: number,
  data: ArchiveRoomRequest = { deleteAfter: false },
) {
  const res = await roomsClient.archiveRoom(id, data);
  return res;
}

export async function unarchiveRoom(id: number) {
  const res = await roomsClient.unarchiveRoom(id);
  return res;
}

export async function createTag(name: string) {
  const res = await roomsClient.createTag({ name });
  return res;
}

export async function addTagsToRoom(id: number, tags: Array<string>) {
  const res = await roomsClient.addTags(id, { names: tags });
  return res;
}

export async function removeTagsFromRoom(id: number, tags: Array<string>) {
  const res = await roomsClient.deleteTags(id, { names: tags });
  return res;
}

export async function getTags() {
  const res = await roomsClient.getTagsInfo();
  return res;
}

export async function uploadRoomLogo(
  data: Array<KeyValuePairStringStringValues>,
) {
  const res = await roomsClient.uploadRoomLogo(data);
  return res;
}

export async function addLogoToRoom(id: number, data: LogoRequest) {
  const res = await roomsClient.createRoomLogo(id, data);
  return res;
}

export async function removeLogoFromRoom(id: number) {
  const res = await roomsClient.deleteRoomLogo(id);
  return res;
}

export async function setInvitationLinks(
  roomId: number,
  title: RoomLinkRequest["title"],
  access: RoomLinkRequest["access"],
  linkId: RoomLinkRequest["linkId"],
) {
  const res = await roomsClient.setLink(roomId, {
    linkId,
    title,
    access,
  });
  return res;
}

export async function resendEmailInvitations(
  id: number,
  data: UserInvitation = { resendAll: true },
) {
  const res = await roomsClient.resendEmailInvitations(id, data);
  return res;
}

export async function getRoomSecurityInfo(id: number) {
  const res = await roomsClient.getRoomSecurityInfo(id, 1);
  return res;
}

export async function setRoomSecurity(id: number, data: RoomInvitationRequest) {
  const res = await roomsClient.setRoomSecurity(id, data);

  res.members.forEach((item) => {
    if (item.subjectType === MembersSubjectType.Group) {
      item.sharedTo.isGroup = true;
    }
  });

  return res;
}

export async function editExternalLink(id: number, data: RoomLinkRequest) {
  const res = await roomsClient.setLink(roomId, data);
  return res;
}

export async function getExternalLinks(id: number, type: LinkType) {
  const res = await roomsClient.getRoomLinks(id, type);
  return res;
}

export async function getPrimaryLink(id: number) {
  const res = await roomsClient.getRoomsPrimaryExternalLink(id);
  return res;
}

export function validatePublicRoomKey(key: string) {
  const res = sharingClient.getExternalShareData(key);
  return res;
}

export function validatePublicRoomPassword(
  key: string,
  data: ExternalShareRequestParam,
  signal?: AbortSignal,
) {
  const res = sharingClient.applyExternalSharePassword(key, data, { signal });
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

export async function getRoomCovers() {
  const res = await roomsClient.getCovers();
  return res;
}

export async function exportRoomIndex(id: number) {
  const res = await roomsClient.startRoomIndexExport(id);
  return res;
}

export async function getExportRoomIndexProgress() {
  const res = await roomsClient.getRoomIndexExport();
  return res;
}

export async function setRoomCover(id: number, cover: CoverRequestDto) {
  const res = await roomsClient.changeRoomCover(id, cover);
  return res;
}

export async function createTemplate(data: RoomTemplateDto) {
  const res = await roomsClient.createTemplate(data);
  return res;
}

export async function getCreateTemplateProgress() {
  const res = await roomsClient.getTemplateCreatingStatus();
  return res;
}

export async function createRoomFromTemplate(data: CreateRoomFromTemplateDto) {
  const res = await roomsClient.createRoomFromTemplate(data);
  return res;
}

export async function getCreateRoomFromTemplateProgress() {
  const res = await roomsClient.getRoomCreatingStatus();
  return res;
}

export async function getTemplateAvailable(id: number) {
  const res = await roomsClient.isPublic(id);
  return res;
}

export async function setTemplateAvailable(
  id: SetPublicDto["id"],
  isPublic: SetPublicDto["public"],
) {
  const res = await roomsClient.setPublic({
    id,
    isPublic,
  });
  return res;
}

export function hideConfirmRoomLifetime(data: SettingsRequestDto) {
  const res = filesSettingsClient.hideConfirmRoomLifetime(data);
  return res;
}
