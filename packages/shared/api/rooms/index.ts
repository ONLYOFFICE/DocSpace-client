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
import { request, roomsClient } from "../client";
import { decodeDisplayName, toUrlParams } from "../../utils/common";
import RoomsFilter from "./filter";
import {
  TExportRoomIndexTask,
  TPublicRoomPassword,
  TValidateShareRoom,
  TRoom,
} from "./types";

export async function getRooms(filter?: RoomsFilter, signal?: AbortSignal) {
  const response = await roomsClient.getRoomsFolder(
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

  const res = response.data.response;

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
  return roomsClient.getRoomInfo(id).then((response) => {
    const res = response.data.response;

    if (res.rootFolderType === FolderType.Archive) res.isArchive = true;

    return res as TRoom;
  });
}

export function getRoomMembers(id, filter) {
  return roomsClient
    .getRoomSecurityInfo(id, filter.filterType)
    .then((response) => {
      const res = response.data.response;

      res.forEach((item) => {
        if (item.subjectType === MembersSubjectType.Group) {
          item.sharedTo.isGroup = true;
        }
      });

      return res;
    });
}

export function updateRoomMemberRole(id, data) {
  return roomsClient.setRoomSecurity(id, data).then((response) => {
    return response.data.response;
  });
}

export function getHistory(
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

  return request(options).then((res) => res);
}

export function getRoomHistory(id) {
  const options = {
    method: "get",
    url: `/feed/filter?module=rooms&withRelated=true&id=${id}`,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function getFileHistory(id) {
  const options = {
    method: "get",
    url: `/feed/filter?module=files&withRelated=true&id=${id}`,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function createRoom(data) {
  return roomsClient.createRoom(data).then((response) => {
    return response.data.response;
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
  return roomsClient.updateRoom(id, data).then((response) => {
    return response.data.response;
  });
}

export function pinRoom(id) {
  return roomsClient.pinRoom(id).then((response) => {
    return response.data.response;
  });
}

export function unpinRoom(id) {
  return roomsClient.unpinRoom(id).then((response) => {
    return response.data.response;
  });
}

export function deleteRoom(id, deleteAfter = false) {
  return roomsClient.deleteRoom(id, deleteAfter).then((response) => {
    return response.data.response;
  });
}

export function archiveRoom(id, deleteAfter = false) {
  return roomsClient.archiveRoom(id, deleteAfter).then((response) => {
    return response.data.response;
  });
}

export function unarchiveRoom(id) {
  return roomsClient.unarchiveRoom(id).then((response) => {
    return response.data.response;
  });
}

export function createTag(name) {
  return roomsClient.createTag({ name }).then((response) => {
    return response.data.response;
  });
}

export function addTagsToRoom(id, tagArray) {
  return roomsClient
    .updateRoomTags(id, { names: tagArray })
    .then((response) => {
      return response.data.response;
    });
}

export function removeTagsFromRoom(id, tagArray) {
  return roomsClient.deleteRoomTag(id, { names: tagArray }).then((response) => {
    return response.data.response;
  });
}

export function getTags() {
  return roomsClient.getTagsInfo().then((response) => {
    return response.data.response;
  });
}

export function uploadRoomLogo(data) {
  return roomsClient.uploadLogo(data).then((response) => {
    return response.data.response;
  });
}

export function addLogoToRoom(id, data) {
  return roomsClient.addLogoToRoom(id, data).then((response) => {
    return response.data.response;
  });
}

export function removeLogoFromRoom(id) {
  return roomsClient.removeLogoFromRoom(id).then((response) => {
    return response.data.response;
  });
}

export const setInvitationLinks = async (roomId, title, access, linkId) => {
  return roomsClient
    .setLink(roomId, {
      linkId,
      title,
      access,
    })
    .then((response) => {
      return response.data.response;
    });
};

export const resendEmailInvitations = async (id, resendAll = true) => {
  return roomsClient.resendRoomInvites(id, { resendAll }).then((response) => {
    return response.data.response;
  });
};

export const getRoomSecurityInfo = async (id) => {
  return roomsClient.getRoomSecurityInfo(id, 1).then((response) => {
    return response.data.response;
  });
};

export const setRoomSecurity = async (id, data) => {
  return roomsClient.setRoomSecurity(id, data).then((response) => {
    const res = response.data.response;

    res.members.forEach((item) => {
      if (item.subjectType === MembersSubjectType.Group) {
        item.sharedTo.isGroup = true;
      }
    });

    return res;
  });
};

export const acceptInvitationByLink = async () => {
  return roomsClient.acceptInvitation().then((response) => {
    return response.data.response;
  });
};

export function editExternalLink(
  roomId: number | string,
  linkId: number | string,
  title: string,
  access: ShareAccessRights,
  expirationDate: moment.Moment,
  linkType: number,
  password: string,
  disabled: boolean,
  denyDownload: boolean,
) {
  return roomsClient
    .setLink(roomId, {
      linkId,
      title,
      access,
      expirationDate,
      linkType,
      password,
      disabled,
      denyDownload,
    })
    .then((response) => {
      return response.data.response;
    });
}

export function getExternalLinks(roomId, type) {
  return roomsClient.getRoomLinks(roomId, type).then((response) => {
    return response.data.response;
  });
}

export function getPrimaryLink(roomId) {
  return roomsClient.getRoomsPrimaryExternalLink(roomId).then((response) => {
    return response.data.response;
  });
}

export function validatePublicRoomKey(key) {
  return roomsClient.validatePublicRoomKey(key).then((response) => {
    return response.data.response as TValidateShareRoom;
  });
}

export async function validatePublicRoomPassword(
  key: string,
  passwordHash: string,
  signal?: AbortSignal,
) {
  return roomsClient
    .validatePublicRoomPassword(key, { password: passwordHash }, signal)
    .then((response) => {
      return response.data.response as TPublicRoomPassword;
    });
}

export function setCustomRoomQuota(roomIds, quota) {
  return roomsClient.setRoomQuota({ roomIds, quota }).then((response) => {
    return response.data.response;
  });
}

export function resetRoomQuota(roomIds) {
  return roomsClient.resetRoomQuota({ roomIds }).then((response) => {
    return response.data.response;
  });
}

export function getRoomCovers() {
  return roomsClient.getRoomCovers().then((response) => {
    return response.data.response;
  });
}

export function exportRoomIndex(roomId: number) {
  return roomsClient.exportRoomIndex(roomId).then((response) => {
    return response.data.response as TExportRoomIndexTask;
  });
}

export function getExportRoomIndexProgress() {
  return roomsClient.getExportRoomIndexProgress().then((response) => {
    return response.data.response as TExportRoomIndexTask;
  });
}

export function setRoomCover(roomId, cover) {
  return roomsClient
    .setRoomCover(roomId, {
      Color: cover.color,
      Cover: cover.cover,
    })
    .then((response) => {
      return response.data.response;
    });
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
  return roomsClient.createRoomTemplate(data).then((response) => {
    return response.data.response;
  });
}

export function getCreateTemplateProgress() {
  return roomsClient.getRoomTemplateProgress().then((response) => {
    return response.data.response;
  });
}

export function createRoomFromTemplate(data) {
  return roomsClient.createRoomFromTemplate(data).then((response) => {
    return response.data.response;
  });
}

export function getCreateRoomFromTemplateProgress() {
  return roomsClient.getRoomFromTemplateProgress().then((response) => {
    return response.data.response;
  });
}

export function getTemplateAvailable(id: number) {
  return roomsClient.getTemplateAvailable(id).then((response) => {
    return response.data.response;
  });
}

export function setTemplateAvailable(id: number, isAvailable: boolean) {
  return roomsClient
    .setTemplateAvailable({
      id,
      public: isAvailable,
    })
    .then((response) => {
      return response.data.response;
    });
}

export function hideConfirmRoomLifetime(val: boolean) {
  return roomsClient.hideConfirmRoomLifetime({ set: val }).then((response) => {
    return response.data.response;
  });
}
