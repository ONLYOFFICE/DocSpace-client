// (c) Copyright Ascensio System SIA 2009-2024
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

import Filter from "./filter";

import { request } from "../client";
import { checkFilterInstance, toUrlParams } from "../../utils/common";
import {
  TGetGroupList,
  TGetGroupMembersInRoom,
  TGetGroupMembersInRoomFilter,
  TGroup,
} from "./types";

// * Create

export const createGroup = (
  groupName: string,
  groupManager: string | undefined,
  members: string[],
) => {
  return request({
    method: "post",
    url: "/group",
    data: {
      groupName,
      groupManager,
      members,
    },
  }) as Promise<TGroup>;
};

// * Read

export const getGroups = async (filter = Filter.getDefault()) => {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `?${filter.toApiUrlParams()}`;
  }

  const res = (await request({
    method: "get",
    url: `/group${params}`,
  })) as TGetGroupList;

  return res;
};

export const getGroupById = (
  groupId: string,
  includeMembers: boolean = false,
  signal?: AbortSignal,
) => {
  return request({
    method: "get",
    url: `/group/${groupId}?includeMembers=${includeMembers}`,
    signal,
  }) as Promise<TGroup>;
};

export const getGroupsByName = async (
  groupName: string,
  startIndex = 0,
  pageCount = 100,
) => {
  const res = (await request({
    method: "get",
    url: `/group?filterValue=${groupName}&startIndex=${startIndex}&count=${pageCount}`,
    data: { groupName },
  })) as { items: TGroup[]; total: number };

  return res;
};

export const getGroupsFull = () => {
  return request({
    method: "get",
    url: `/group/full`,
  });
};

export const getGroupsByUserId = (userId: string) => {
  return request({
    method: "get",
    url: `/group/user/${userId}`,
  });
};

export const getGroupMembersInRoom = (
  folderId: string | number,
  groupId: string,
  filter: TGetGroupMembersInRoomFilter,
) => {
  const url = `/files/folder/${folderId}/group/${groupId}/share?${toUrlParams(filter, false)}`;

  return request({
    method: "get",
    url,
  }) as Promise<TGetGroupMembersInRoom>;
};

// * Update

export const updateGroup = (
  groupId: string,
  groupName: string,
  groupManager: string | undefined,
  membersToAdd: string[],
  membersToRemove: string[],
) => {
  return request({
    method: "put",
    url: `/group/${groupId}`,
    data: { groupName, groupManager, membersToAdd, membersToRemove },
  }) as Promise<TGroup>;
};

export const addGroupMembers = (groupId: string, members: string) => {
  return request({
    method: "put",
    url: `/group/${groupId}/members`,
    data: { members },
  });
};

export const removeGroupMembers = (groupId: string, membersIds: string[]) => {
  return request({
    method: "delete",
    url: `/group/${groupId}/members`,
    data: { id: groupId, members: membersIds },
  }) as Promise<TGroup>;
};

// * Delete

export const deleteGroup = (groupId: string) => {
  return request({
    method: "delete",
    url: `/group/${groupId}`,
  });
};
