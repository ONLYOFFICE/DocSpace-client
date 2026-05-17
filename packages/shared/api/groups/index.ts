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

import Filter from "./filter";

import { request } from "../client";
import { checkFilterInstance, toUrlParams } from "../../utils/common";
import { Encoder } from "@docspace/ui-kit/utils/encoder";

import {
  TGetGroupList,
  TGetGroupMembersInRoom,
  TGetGroupMembersInRoomFilter,
  TGroup,
} from "./types";

const decodeGroup = (group: TGroup) => {
  const newGroup = { ...group };
  if (newGroup.manager)
    newGroup.manager = {
      ...newGroup.manager,
      displayName: Encoder.htmlDecode(newGroup.manager?.displayName ?? ""),
    };

  if (newGroup.members)
    newGroup.members = newGroup.members.map((m) => ({
      ...m,
      displayName: Encoder.htmlDecode(m.displayName),
    }));

  return newGroup;
};

const decodeGroups = (groups: TGroup[]) => {
  return groups.map((group) => decodeGroup(group));
};

// * Create

export const createGroup = async (
  groupName: string,
  groupManager: string | undefined,
  members: string[],
) => {
  const res = (await request({
    method: "post",
    url: "/group",
    data: {
      groupName,
      groupManager,
      members,
    },
  })) as TGroup;

  return decodeGroup(res);
};

// * Read

export const getGroups = async (
  filter = Filter.getDefault(),
  signal?: AbortSignal,
) => {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `?${filter.toApiUrlParams()}`;
  }

  const res = (await request({
    method: "get",
    url: `/group${params}`,
    signal,
  })) as TGetGroupList;

  res.items = decodeGroups(res.items);

  return res;
};

export const getGroupById = async (
  groupId: string,
  includeMembers: boolean = false,
  signal?: AbortSignal,
) => {
  const res = (await request({
    method: "get",
    url: `/group/${groupId}?includeMembers=${includeMembers}`,
    signal,
  })) as TGroup;

  if (res.manager)
    res.manager = {
      ...res.manager,
      displayName: Encoder.htmlDecode(res.manager?.displayName ?? ""),
    };

  if (res.members)
    res.members = res.members.map((m) => ({
      ...m,
      displayName: Encoder.htmlDecode(m.displayName),
    }));

  return res;
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

  res.items = decodeGroups(res.items);

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

export const getGroupMembersInRoom = async (
  folderId: string | number,
  groupId: string,
  filter: TGetGroupMembersInRoomFilter,
) => {
  const url = `/files/folder/${folderId}/group/${groupId}/share?${toUrlParams(filter, false)}`;

  const res = (await request({
    method: "get",
    url,
  })) as TGetGroupMembersInRoom;

  return res;
};

export const getGroupMembersShareFile = async (
  fileId: string | number,
  groupId: string,
  filter: TGetGroupMembersInRoomFilter,
) => {
  const url = `/files/file/${fileId}/group/${groupId}/share?${toUrlParams(filter, false)}`;

  const res = (await request({
    method: "get",
    url,
  })) as TGetGroupMembersInRoom;

  return res;
};

// * Update

export const updateGroup = async (
  groupId: string,
  groupName: string,
  groupManager: string | undefined,
  membersToAdd: string[],
  membersToRemove: string[],
) => {
  const res = (await request({
    method: "put",
    url: `/group/${groupId}`,
    data: { groupName, groupManager, membersToAdd, membersToRemove },
  })) as TGroup;

  return decodeGroup(res);
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
