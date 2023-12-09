import { request } from "../client";

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

export const getGroups = (withMembers = true) => {
  return request({
    method: "get",
    url: `/group?withMembers=${withMembers}`,
  });
};

export const getGroupById = (groupId) => {
  return request({
    method: "get",
    url: `/group/${groupId}`,
  });
};

export const getGroupsByName = (groupName) => {
  return request({
    method: "get",
    url: `/group/search`,
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

// * Update

export const updateGroup = (groupId, groupName, groupManager, members) => {
  return request({
    method: "put",
    url: `/group/${groupId}`,
    data: { groupId, groupName, groupManager, members },
  });
};

export const addGroupMembers = (groupName, groupManager, members) => {
  return request({
    method: "put",
    url: `/group/${id}/members`,
    data: { groupName, groupManager, members },
  });
};

// * Delete

export const deleteGroup = (groupId) => {
  return request({
    method: "delete",
    url: `/group/${groupId}`,
  });
};
