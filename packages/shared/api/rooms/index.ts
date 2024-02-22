/* eslint-disable @typescript-eslint/default-param-last */
import { AxiosRequestConfig } from "axios";

import { FolderType } from "../../enums";
import { request } from "../client";
import {
  checkFilterInstance,
  decodeDisplayName,
  toUrlParams,
} from "../../utils/common";
import RoomsFilter from "./filter";
import { TGetRooms } from "./types";

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

    return res;
  });
}

export function getRoomMembers(id, filter) {
  let params = "";

  const str = toUrlParams(filter);
  if (str) params = `?${str}`;

  const options = {
    method: "get",
    url: `/files/rooms/${id}/share${params}`,
  };

  return request(options).then((res) => {
    res.items.forEach((item) => {
      if (item.sharedTo.manager) {
        item.sharedTo.isGroup = true;
      }
    });

    return res;
  });
}

export function updateRoomMemberRole(id, data) {
  const options = {
    method: "put",
    url: `/files/rooms/${id}/share`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function getHistory(module, id, signal = null, requestToken) {
  const options = {
    method: "get",
    url: `/feed/filter?module=${module}&withRelated=true&id=${id}`,
    signal,
  };

  if (requestToken) {
    options.headers = { "Request-Token": requestToken };
  }

  return request(options).then((res) => {
    return res;
  });
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

  return request(options).then((res) => {
    return res;
  });
}

export function pinRoom(id) {
  const options = { method: "put", url: `/files/rooms/${id}/pin` };

  return request(options).then((res) => {
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

export function addTagsToRoom(id, tagArray) {
  const data = { names: tagArray };
  const options = {
    method: "put",
    url: `/files/rooms/${id}/tags`,
    data,
  };

  return request(options).then((res) => {
    return res;
  });
}

export function removeTagsFromRoom(id, tagArray) {
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

  return request(options).then((res) => {
    return res;
  });
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

export const setInvitationLinks = async (roomId, linkId, title, access) => {
  const options = {
    method: "put",
    url: `/files/rooms/${roomId}/links`,
    data: {
      linkId,
      title,
      access,
    },
  };

  const res = await request(options);

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

  const res = await request(options);

  res.members.forEach((item) => {
    if (item.sharedTo.manager) {
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
  roomId,
  linkId,
  title,
  access,
  expirationDate,
  linkType,
  password,
  disabled,
  denyDownload,
) {
  return request({
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
    },
  });
}

export function getExternalLinks(roomId, type) {
  const linkType = `?type=${type}`;

  return request({
    method: "get",
    url: `files/rooms/${roomId}/links${linkType}`,
  });
}

export function getPrimaryLink(roomId) {
  return request({
    method: "get",
    url: `files/rooms/${roomId}/link`,
  });
}

export function validatePublicRoomKey(key) {
  return request({
    method: "get",
    url: `files/share/${key}`,
  });
}

export function validatePublicRoomPassword(key, passwordHash) {
  return request({
    method: "post",
    url: `files/share/${key}/password`,
    data: { password: passwordHash },
  });
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
