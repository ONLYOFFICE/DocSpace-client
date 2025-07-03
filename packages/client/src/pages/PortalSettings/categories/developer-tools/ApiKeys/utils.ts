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

import React from "react";
import { getCookie, getCorrectDate } from "@docspace/shared/utils";
import { LANGUAGE } from "@docspace/shared/constants";
import { TTranslation } from "@docspace/shared/types";
import { TPermissionsList } from "./types";

export const maxKeyLifetimeDays = 365;

export enum PermissionGroup {
  profile = "profile",
  accounts = "accounts",
  files = "files",
  rooms = "rooms",
}

export const getCategoryTranslation = (
  group: PermissionGroup,
  t: TTranslation,
) => {
  switch (group) {
    case PermissionGroup.profile:
      return t("Common:OAuthProfilesName");
    case PermissionGroup.accounts:
      return t("Common:OAuthAccountsName");
    case PermissionGroup.files:
      return t("Common:OAuthFilesName");
    case PermissionGroup.rooms:
      return t("Common:OAuthRoomsName");
    default:
      return "";
  }
};

export const getFilteredOptions = (
  permissions: string[],
  itemPermissions: string[] = [],
) => {
  const options = {} as TPermissionsList;
  permissions.forEach((permission) => {
    const isChecked = itemPermissions.includes(permission);

    const obj = { isChecked, name: permission };
    const isRead = permission.includes("read");

    const defaultObj = {
      isRead: { isChecked, name: "" },
      isWrite: { isChecked, name: "" },
    };

    if (permission.includes("accounts.self")) {
      if (!options.profile) options.profile = defaultObj;
      if (isRead) options.profile.isRead = obj;
      else options.profile.isWrite = obj;
    } else if (permission.includes("accounts")) {
      if (!options.accounts) options.accounts = defaultObj;
      if (isRead) options.accounts.isRead = obj;
      else options.accounts.isWrite = obj;
    } else if (permission.includes("files")) {
      if (!options.files) options.files = defaultObj;
      if (isRead) options.files.isRead = obj;
      else options.files.isWrite = obj;
    } else if (permission.includes("rooms")) {
      if (!options.rooms) options.rooms = defaultObj;
      if (isRead) options.rooms.isRead = obj;
      else options.rooms.isWrite = obj;
    }
  });

  return options;
};

export const getItemPermissions = (itemPermissions: string[] = []) => {
  const option =
    !itemPermissions.length || itemPermissions[0] === "*"
      ? "all"
      : itemPermissions[0] === "*:read"
        ? "readonly"
        : "restricted";

  return option;
};

export const getPermissionsOptionTranslation = (
  key: "all" | "readonly" | "restricted",
  t: TTranslation,
) => {
  switch (key) {
    case "all":
      return t("Common:All");
    case "readonly":
      return t("Common:ReadOnly");
    case "restricted":
      return t("Common:Restricted");

    default:
      return t("Common:All");
  }
};

export const sortPermissions = (list: React.ReactNode[]) => {
  const keyOrder = ["files", "rooms", "profile", "accounts"];

  return list.sort((a, b) => {
    const aKey = (a as React.ReactElement).key ?? "";
    const bKey = (b as React.ReactElement).key ?? "";

    return keyOrder.indexOf(aKey) - keyOrder.indexOf(bKey);
  });
};

export const getStatusByDate = (date: string, culture?: string) => {
  const locale = getCookie(LANGUAGE) ?? culture ?? "en";
  const dateLabel = getCorrectDate(locale, date);
  return dateLabel;
};
