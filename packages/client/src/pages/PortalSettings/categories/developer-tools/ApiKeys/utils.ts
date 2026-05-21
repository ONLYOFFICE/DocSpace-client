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

import React from "react";
import { getCorrectDate } from "@docspace/ui-kit/utils/date/getCorrectDate";
import { getCookie } from "@docspace/ui-kit/utils/cookie";
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
  isUser: boolean,
  itemPermissions: string[] = [],
) => {
  const options = {} as TPermissionsList;
  permissions.forEach((permission) => {
    const isChecked = itemPermissions.includes(permission);

    const obj = { isChecked, name: permission };
    const isRead = permission.includes("read");

    const defaultObj = {
      isRead: { isChecked, name: "", isDisabled: false },
      isWrite: { isChecked, name: "", isDisabled: false },
    };

    if (permission.includes("accounts.self")) {
      if (!options.profile) options.profile = defaultObj;
      if (isRead) options.profile.isRead = obj;
      else options.profile.isWrite = obj;
    } else if (permission.includes("accounts") && !isUser) {
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
      else options.rooms.isWrite = { ...obj, isDisabled: isUser };
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
