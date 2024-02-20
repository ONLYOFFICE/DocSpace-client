import { AxiosRequestConfig } from "axios";

import { request } from "../client";
// import axios from "axios";
import Filter from "./filter";

import { Encoder } from "../../utils/encoder";
import { checkFilterInstance } from "../../utils/common";
import { TChangeTheme, TGetUserList, TUser } from "./types";

import { TReqOption } from "../../utils/axiosClient";
import { EmployeeActivationStatus, ThemeKeys } from "../../enums";

export async function getUserList(filter = Filter.getDefault()) {
  let params = "";
  // if (fake) {
  //   return fakePeople.getUserList(filter);
  // }

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `/filter?${filter.toApiUrlParams()}`;
  }

  const res = (await request({
    method: "get",
    url: `/people${params}`,
  })) as TGetUserList;

  res.items = res.items.map((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
    }
    return user;
  });

  return res;
}

export async function getUser(userName = null, headers = null) {
  const options: AxiosRequestConfig & TReqOption = {
    method: "get",
    url: `/people/${userName || "@self"}`,
    skipUnauthorized: true,
  };

  if (headers) options.headers = headers;

  const user = (await request(options)) as TUser;

  if (user && user.displayName) {
    user.displayName = Encoder.htmlDecode(user.displayName);
  }

  return user;
}

export async function getUserByEmail(userEmail: string, confirmKey = null) {
  const options = {
    method: "get",
    url: `/people/email?email=${userEmail}`,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const user = (await request(options)) as TUser;

  if (user && user.displayName) {
    user.displayName = Encoder.htmlDecode(user.displayName);
  }
  return user;
}
export function getUserFromConfirm(userId, confirmKey = null) {
  const options = {
    method: "get",
    url: `/people/${userId}`,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options).then((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
    }
    return user;
  });
}

export function getUserPhoto(userId) {
  return request({
    method: "get",
    url: `/people/${userId}/photo`,
  });
}

export function createUser(data, confirmKey = null) {
  const options = {
    method: "post",
    url: "/people",
    data,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options).then((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
    }
    return user;
  });
}

export function changePassword(userId, passwordHash, key) {
  const data = { passwordHash };

  return request({
    method: "put",
    url: `/people/${userId}/password`,
    data,
    headers: { confirm: key },
  });
}

export async function changeEmail(userId: string, email: string, key: string) {
  const data = { email };

  const res = (await request({
    method: "put",
    url: `/people/${userId}/password`,
    data,
    headers: { confirm: key },
  })) as TUser;

  return res;
}

export async function updateActivationStatus(
  activationStatus: EmployeeActivationStatus,
  userId: string,
  key: string,
) {
  const res = (await request({
    method: "put",
    url: `/people/activationstatus/${activationStatus}`,
    data: { userIds: [userId] },
    headers: { confirm: key },
  })) as TUser;

  return res;
}

export function updateUser(data) {
  return request({
    method: "put",
    url: `/people/${data.id}`,
    data,
  }).then((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
    }
    return user;
  });
}

export function deleteSelf(key) {
  return request({
    method: "delete",
    url: "/people/@self",
    headers: { confirm: key },
  });
}

export function sendInstructionsToChangePassword(email) {
  return request({
    method: "post",
    url: "/people/password",
    data: { email },
  });
}

export function getListAdmins(filter = Filter.getDefault()) {
  const filterParams = filter.toApiUrlParams(
    "fields=id,displayName,groups,name,avatar,avatarSmall,isOwner,isAdmin,profileUrl,listAdminModules",
  );

  return request({
    method: "get",
    url: `/people/filter?isadministrator=true&${filterParams}`,
  });
}

export function getAdmins(isParams) {
  let params = "&fields";
  if (isParams) {
    params =
      "fields=id,displayName,groups,name,avatar,avatarSmall,isOwner,isAdmin,profileUrl,listAdminModules";
  }
  return request({
    method: "get",
    url: `/people/filter?isadministrator=true&${params}`,
  });
}

export function changeProductAdmin(userId, productId, administrator) {
  return request({
    method: "put",
    url: "/settings/security/administrator",
    data: {
      productId,
      userId,
      administrator,
    },
  });
}

export async function getUserById(userId: string) {
  const res = (await request({
    method: "get",
    url: `/people/${userId}`,
  })) as TUser;

  return res;
}

export const inviteUsers = async (data) => {
  const options = {
    method: "post",
    url: "/people/invite",
    data,
  };

  const res = await request(options);

  return res;
};

export async function resendUserInvites(userIds: string[]) {
  await request({
    method: "put",
    url: "/people/invite",
    data: { userIds },
  });
}

export function resendInvitesAgain() {
  return request({
    method: "put",
    url: "/people/invite",
    data: { userIds: [], resendAll: true },
  });
}

export function updateUserCulture(id, cultureName) {
  return request({
    method: "put",
    url: `/people/${id}/culture`,
    data: { cultureName },
  }).then((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
    }
    return user;
  });
}

export function loadAvatar(profileId, data) {
  return request({
    method: "post",
    url: `/people/${profileId}/photo`,
    data,
  });
}

export function createThumbnailsAvatar(profileId, data) {
  return request({
    method: "post",
    url: `/people/${profileId}/photo/thumbnails`,
    data,
  });
}

export function deleteAvatar(profileId) {
  return request({
    method: "delete",
    url: `/people/${profileId}/photo`,
  });
}

export function updateUserStatus(status, userIds) {
  return request({
    method: "put",
    url: `/people/status/${status}`,
    data: { userIds },
  });
}

export function updateUserType(type, userIds) {
  return request({
    method: "put",
    url: `/people/type/${type}`,
    data: { userIds },
  });
}

export function linkOAuth(serializedProfile) {
  return request({
    method: "put",
    url: "people/thirdparty/linkaccount",
    data: { serializedProfile },
  });
}

export function signupOAuth(signupAccount) {
  return request({
    method: "post",
    url: "people/thirdparty/signup",
    data: signupAccount,
  });
}

export function unlinkOAuth(provider) {
  return request({
    method: "delete",
    url: `people/thirdparty/unlinkaccount?provider=${provider}`,
  });
}

export function sendInstructionsToDelete() {
  return request({
    method: "put",
    url: "/people/self/delete",
  });
}

export function sendInstructionsToChangeEmail(userId, email) {
  return request({
    method: "post",
    url: "/people/email",
    data: { userId, email },
  });
}

export function deleteUser(userId) {
  return request({
    method: "delete",
    url: `/people/${userId}`,
  });
}

export function deleteUsers(userIds) {
  return request({
    method: "put",
    url: "/people/delete",
    data: { userIds },
  });
}

export function getSelectorUserList() {
  return request({
    method: "get",
    url: "/people/filter?fields=id,displayName,groups",
  });
}

export async function changeTheme(key: ThemeKeys) {
  const data = { Theme: key };

  const res = (await request({
    method: "put",
    url: `/people/theme`,
    data,
  })) as TChangeTheme;

  return res;
}

export function getUsersByQuery(query) {
  return request({
    method: "get",
    url: `/people/search?query=${query}`,
  });
}

export function getMembersList(roomId, filter = Filter.getDefault()) {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `?${filter.toApiUrlParams(
      "id,email,avatar,icon,displayName,hasAvatar,isOwner,isAdmin,isVisitor,isCollaborator,",
    )}`;
  }

  const excludeShared = filter.excludeShared ? filter.excludeShared : false;

  if (params) {
    params += `&excludeShared=${excludeShared}`;
  } else {
    params = `excludeShared=${excludeShared}`;
  }

  return request({
    method: "get",
    url: `people/room/${roomId}${params}`,
  }).then((res) => {
    res.items = res.items.map((user) => {
      if (user && user.displayName) {
        user.displayName = Encoder.htmlDecode(user.displayName);
      }
      return user;
    });
    return res;
  });
}
