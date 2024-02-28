import Filter from "./filter";

import { request } from "../client";
import { checkFilterInstance } from "../../utils/common";

// * Create

export const createGroup = (groupName, groupManager, members) => {
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

export const getGroupById = (groupId, signal) => {
  return request({
    method: "get",
    url: `/group/${groupId}`,
    signal,
  });
};

export const getGroupsByName = (groupName, startIndex = 0, pageCount = 100) => {
  return request({
    method: "get",
    url: `/group?filterValue=${groupName}&startIndex=${startIndex}&count=${pageCount}`,
    data: { groupName },
  });
};

export const getGroupsFull = () => {
  return request({
    method: "get",
    url: `/group/full`,
  });
};

export const getGroupsByUserId = (userId) => {
  return request({
    method: "get",
    url: `/group/user/${userId}`,
  });
};

export const getGroupMembersInRoom = (folderId, groupId) => {
  return request({
    method: "get",
    url: `/files/folder/${folderId}/group/${groupId}/share`,
  });
};

// * Update

export const updateGroup = (groupId, groupName, groupManager, members) => {
  return request({
    method: "put",
    url: `/group/${groupId}`,
    data: { groupName, groupManager, members },
  });
};

export const addGroupMembers = (groupId, members) => {
  return request({
    method: "put",
    url: `/group/${groupId}/members`,
    data: { members },
  });
};

// * Delete

export const deleteGroup = (groupId) => {
  return request({
    method: "delete",
    url: `/group/${groupId}`,
  });
};
