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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { AxiosRequestConfig } from "axios";

import { Encoder } from "../../utils/encoder";
import { checkFilterInstance } from "../../utils/common";
import { TReqOption } from "../../utils/axiosClient";
import {
  EmployeeActivationStatus,
  ThemeKeys,
  AccountsSearchArea,
  EmployeeStatus,
  EmployeeType,
  RecaptchaType,
} from "../../enums";
import { Nullable } from "../../types";

import { TGroup } from "../groups/types";
import { request } from "../client";

import Filter from "./filter";
import { TChangeTheme, TGetUserList, TUser } from "./types";
import { TOperation } from "../files/filter";

export async function getUserList(
  filter = Filter.getDefault(),
  signal?: AbortSignal,
) {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    const search = filter.toApiUrlParams();

    params = `/filter?${search}`;
  }

  const url = `/people${params}`;

  const res = (await request({
    method: "get",
    url,
    signal,
  })) as TGetUserList;

  res.items = res.items.map((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);

      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
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

    if ("createdBy" in user && user.createdBy?.displayName) {
      user.createdBy = {
        ...user.createdBy,
        displayName: Encoder.htmlDecode(user.createdBy.displayName),
      };
    }
  }

  return user;
}

export async function getUserByEmail(
  userEmail: string,
  confirmKey: Nullable<string> = null,
  culture?: string,
) {
  const urlEmail = `/people/email?email=${userEmail}`;

  const url = culture ? `${urlEmail}&culture=${culture}` : urlEmail;

  const options = {
    method: "get",
    url,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const user = (await request(options)) as TUser;

  if (user && user.displayName) {
    user.displayName = Encoder.htmlDecode(user.displayName);
    if ("createdBy" in user && user.createdBy?.displayName) {
      user.createdBy = {
        ...user.createdBy,
        displayName: Encoder.htmlDecode(user.createdBy.displayName),
      };
    }
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
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
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

export async function startEmptyPersonal() {
  const res = (await request({
    method: "post",
    url: "/people/delete/personal/start",
  })) as TOperation[];
  return res;
}

export async function getEmptyPersonalProgress() {
  const res = (await request({
    method: "get",
    url: "/people/delete/personal/progress",
  })) as TOperation[];
  return res;
}

export function createUser(data, confirmKey: Nullable<string> = null) {
  const options = {
    method: "post",
    url: "/people",
    data,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options).then((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
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

export async function changeEmail(
  userId: string,
  email: string,
  encemail: string,
  key: string,
) {
  const data = encemail ? { encemail } : { email };

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
  })) as TUser[];

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
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
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

export function sendInstructionsToChangePassword(
  email: string,
  recaptchaResponse?: string,
  recaptchaType?: RecaptchaType,
) {
  const data: Record<string, unknown> = { email };

  if (recaptchaResponse) {
    data.recaptchaResponse = recaptchaResponse;

    if (typeof recaptchaType !== "undefined") {
      data.recaptchaType = recaptchaType;
    }
  }

  return request({
    method: "post",
    url: "/people/password",
    data,
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

export async function getUserById(userId: string, signal?: AbortSignal) {
  const res = (await request({
    method: "get",
    url: `/people/${userId}`,
    signal,
  })) as TUser;

  res.displayName = Encoder.htmlDecode(res.displayName);

  if (res.createdBy?.displayName) {
    res.createdBy = {
      ...res.createdBy,
      displayName: Encoder.htmlDecode(res.createdBy.displayName),
    };
  }

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

export async function resendInvitesAgain() {
  await request({
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
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
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

export async function updateUserStatus(
  status: EmployeeStatus,
  userIds: string[],
) {
  const users = (await request({
    method: "put",
    url: `/people/status/${status}`,
    data: { userIds },
  })) as TUser[];

  const res = users.map((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
    }

    return user;
  });

  return res;
}

export async function updateUserType(type: EmployeeType, userIds: string[]) {
  const users = (await request({
    method: "put",
    url: `/people/type/${type}`,
    data: { userIds },
  })) as TUser[];

  const res = users.map((user) => {
    if (user && user.displayName) {
      user.displayName = Encoder.htmlDecode(user.displayName);
      if ("createdBy" in user && user.createdBy?.displayName) {
        user.createdBy = {
          ...user.createdBy,
          displayName: Encoder.htmlDecode(user.createdBy.displayName),
        };
      }
    }

    return user;
  });

  return res;
}

export async function downgradeUserType(
  type: EmployeeType,
  userId: number | string,
  reassignUserId?: number | string,
) {
  return request({
    method: "post",
    url: "people/type",
    data: { type, userId, reassignUserId },
  });
}

export async function getReassignmentProgress(userId: number | string) {
  return request({
    method: "get",
    url: `people/type/progress/${userId}`,
  });
}

export async function terminateReassignment(userId: number | string) {
  return request({
    method: "put",
    url: `people/type/terminate`,
    data: { userId },
  });
}

export async function reassignmentNecessary(
  userId: number | string,
  type: EmployeeType,
) {
  return request({
    method: "get",
    url: "people/reassign/necessary",
    params: { userId, type },
  });
}
export function linkOAuth(serializedProfile) {
  return request({
    method: "put",
    url: "people/thirdparty/linkaccount",
    data: { serializedProfile },
  });
}

export function signupOAuth(
  signupAccount,
  confirmKey: Nullable<string> = null,
) {
  const options = {
    method: "post",
    url: "people/thirdparty/signup",
    data: signupAccount,
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  return request(options);
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

export async function deleteUser(userId: string) {
  await request({
    method: "delete",
    url: `/people/${userId}`,
  });
}

export async function deleteGuests(userIds: string[]) {
  return request({
    method: "delete",
    url: `/people/guests`,
    data: { userIds },
  });
}

export async function getLinkToShareGuest(userId: string) {
  const link = (await request({
    method: "get",
    url: `people/guests/${userId}/share`,
  })) as string;

  return link;
}

export async function addGuest(
  email: string,
  confirmKey: Nullable<string> = null,
) {
  const options = {
    method: "post",
    url: `/people/guests/share/approve`,
    data: { email },
  };

  if (confirmKey) options.headers = { confirm: confirmKey };

  const res = await request(options);

  return res;
}

export function deleteUsers(userIds: string[]) {
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

export async function getMembersList(
  searchArea: AccountsSearchArea,
  roomId: string | number,
  filter = Filter.getDefault(),
  signal?: AbortSignal,
  targetEntityType: "file" | "folder" | "room" = "room",
) {
  let params = "";

  if (filter) {
    checkFilterInstance(filter, Filter);

    params = `?${filter.toApiUrlParams()}`;
  }

  // const excludeShared = filter.excludeShared ? filter.excludeShared : false;

  // if (params) {
  //   params += `&excludeShared=${excludeShared}`;
  // } else {
  //   params = `excludeShared=${excludeShared}`;
  // }

  let url = "";

  switch (searchArea) {
    case AccountsSearchArea.People:
      url = `people/${targetEntityType}/${roomId}${params}`;
      break;
    case AccountsSearchArea.Groups:
      url = `group/${targetEntityType}/${roomId}${params}`;
      break;
    default:
      url = `accounts/${targetEntityType}/${roomId}/search${params}`;
  }

  const res = (await request({
    method: "get",
    url,
    signal,
  })) as { items: (TUser | TGroup)[]; total: number };

  res.items = res.items.map((member) => {
    if (member && "displayName" in member && member.displayName) {
      member.displayName = Encoder.htmlDecode(member.displayName);
      if ("createdBy" in member && member.createdBy?.displayName) {
        member.createdBy = {
          ...member.createdBy,
          displayName: Encoder.htmlDecode(member.createdBy.displayName),
        };
      }
    }

    if ("membersCount" in member) {
      member.isGroup = true;
    }

    return member;
  });

  return res;
}

export async function setCustomUserQuota(
  userIds: string[],
  quota: string | number,
) {
  const data = {
    userIds,
    quota: +quota,
  };
  const options: AxiosRequestConfig = {
    method: "put",
    url: "/people/userquota",
    data,
  };

  const users = (await request(options)) as TUser[];

  return users;
}

export async function resetUserQuota(userIds: string[]) {
  const data = {
    userIds,
  };
  const options: AxiosRequestConfig = {
    method: "put",
    url: "/people/resetquota",
    data,
  };

  const users = (await request(options)) as TUser[];

  return users;
}
