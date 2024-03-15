import Filter from "./filter";

import { request } from "../client";
import { checkFilterInstance } from "../../utils/common";
import { TGroup } from "./types";

// * Create

export const createGroup = (
  groupName: string,
  groupManager: string,
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
  });
};

// * Read

export const getGroups = (filter = Filter.getDefault()) => {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `?${filter.toApiUrlParams()}`;
  }

  return request({
    method: "get",
    url: `/group${params}`,
  });
};

export const getGroupById = (groupId: string, signal: AbortSignal) => {
  return request({
    method: "get",
    url: `/group/${groupId}`,
    signal,
  });
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
) => {
  return request({
    method: "get",
    url: `/files/folder/${folderId}/group/${groupId}/share`,
  });
};

// * Update

export const updateGroup = (
  groupId: string,
  groupName: string,
  groupManager: string,
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

// * Delete

export const deleteGroup = (groupId: string) => {
  return request({
    method: "delete",
    url: `/group/${groupId}`,
  });
};
