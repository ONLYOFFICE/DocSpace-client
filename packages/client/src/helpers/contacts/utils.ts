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
import { matchPath } from "react-router-dom";
import type { Location } from "@remix-run/router";

import Filter from "@docspace/shared/api/people/filter";
import { TUser } from "@docspace/shared/api/people/types";
import { EmployeeStatus, Events } from "@docspace/shared/enums";
import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { TTranslation } from "@docspace/shared/types";
import { resendUserInvites } from "@docspace/shared/api/people";
import { toastr } from "@docspace/shared/components/toast";

import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import config from "PACKAGE_FILE";

import { showEmailActivationToast } from "../people-helpers";

import {
  GROUPS_ROUTE,
  GUESTS_ROUTE,
  INSIDE_GROUP_ROUTE,
  PEOPLE_ROUTE,
} from "./constants";
import { TContactsSelected, TContactsMenuItemdId, TContactsTab } from "./types";

export const getContactsUrl = (contactsTab: TContactsTab, groupId?: string) => {
  let url = "";

  switch (contactsTab) {
    case "people":
      url = PEOPLE_ROUTE;
      break;
    case "guests":
      url = GUESTS_ROUTE;
      break;
    case "inside_group":
      url = INSIDE_GROUP_ROUTE.replace(":groupId", groupId ?? "");
      break;
    case "groups":
      url = GROUPS_ROUTE;
      break;
    default:
      break;
  }

  return url;
};

export const setContactsUsersFilterUrl = (
  filter: Filter,
  contactsTab: TContactsTab,
  groupId?: string,
) => {
  const urlFilter = filter.toUrlParams();

  const url = getContactsUrl(contactsTab, groupId);

  const newPath = combineUrl(`/${url}?${urlFilter}`);

  if (window.location.pathname + window.location.search === newPath) return;

  window.history.replaceState(
    "",
    "",
    combineUrl(window.ClientConfig?.proxy?.url, config.homepage, newPath),
  );
};

export const resetFilter = (contactsTab: TContactsTab, groupId?: string) => {
  const filter = Filter.getDefault();

  const url = getContactsUrl(contactsTab, groupId);

  if (groupId) {
    filter.group = groupId;
  }

  if (contactsTab === "people" || contactsTab === "guests") {
    filter.area = contactsTab;
  }

  window.DocSpace.navigate(`${url}?${filter.toUrlParams()}`);
};

export const employeeWrapperToMemberModel = (profile: TUser) => {
  const comment = profile.notes;
  const department = profile.groups
    ? profile.groups.map((group) => group.id)
    : [];
  const worksFrom = profile.workFrom;

  return { ...profile, comment, department, worksFrom };
};

export const getUserChecked = (user: TUser, selected: TContactsSelected) => {
  switch (selected) {
    case "all":
      return true;
    case "active":
      return user.status === EmployeeStatus.Active;
    case "pending":
      return user.status === EmployeeStatus.Pending;
    case "disabled":
      return user.status === EmployeeStatus.Disabled;
    default:
      return false;
  }
};

export const getContactsMenuItemId = (item: TContactsMenuItemdId) => {
  switch (item) {
    case "active":
      return "selected_active";
    case "pending":
      return "selected_pending";
    case "disabled":
      return "selected_disabled";
    case "all":
      return "selected_all";
    default:
      return "";
  }
};

export const getContactsCheckboxItemLabel = (
  t: TTranslation,
  item: TContactsMenuItemdId,
) => {
  switch (item) {
    case "active":
      return t("Common:Active");
    case "pending":
      return t("PeopleTranslations:PendingInviteTitle");
    case "disabled":
      return t("PeopleTranslations:DisabledEmployeeStatus");
    case "all":
      return t("All");
    default:
      return "";
  }
};

export const changeUserQuota = (
  users: TUser[],
  successCallback?: VoidFunction,
  abortCallback?: VoidFunction,
) => {
  const event: Event & { payload?: unknown } = new Event(Events.CHANGE_QUOTA);

  const userIDs = users.map((user) => {
    return user?.id ? user.id : user;
  });

  const payload = {
    visible: true,
    type: "user",
    ids: userIDs,
    successCallback,
    abortCallback,
  };

  event.payload = payload;

  window.dispatchEvent(event);
};

export const onDeletePersonalDataClick = (t: TTranslation) => {
  toastr.success(t("PeopleTranslations:SuccessDeletePersonalData"));
};

export const onInviteAgainClick = (
  item: ReturnType<UsersStore["getPeopleListItem"]>,
  t: TTranslation,
) => {
  const { id, email } = item;
  resendUserInvites([id])
    .then(() => showEmailActivationToast(email, t))
    .catch((error) => toastr.error(error));
};

export const getContactsView = (
  location?: Location,
): TContactsTab | boolean => {
  const { pathname } = location ?? window.DocSpace.location;

  if (pathname.includes(PEOPLE_ROUTE)) return "people";
  if (pathname.includes(GROUPS_ROUTE)) return "groups";
  if (pathname.includes(GUESTS_ROUTE)) return "guests";
  if (matchPath(INSIDE_GROUP_ROUTE, pathname)) return "inside_group";

  if (pathname.includes("accounts")) return true;

  return false;
};
