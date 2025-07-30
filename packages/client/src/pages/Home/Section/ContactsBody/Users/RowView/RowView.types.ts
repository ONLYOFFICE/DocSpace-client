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

import { TUser } from "@docspace/shared/api/people/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";

import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";

import type { JSX } from "react";

export type RowViewStores = {
  peopleStore: PeopleStore;
  settingsStore: SettingsStore;
  currentQuotaStore: CurrentQuotasStore;
  userStore: UserStore;
};

export type RowViewProps = {
  sectionWidth?: number;

  peopleList?: UsersStore["peopleList"];
  changeType?: UsersStore["changeType"];
  fetchMoreUsers?: UsersStore["fetchMoreUsers"];
  hasMoreUsers?: UsersStore["hasMoreUsers"];
  filterTotal?: UsersStore["filterTotal"];
  isUsersEmptyView?: UsersStore["isUsersEmptyView"];
  contactsTab?: UsersStore["contactsTab"];

  viewAs?: PeopleStore["viewAs"];
  setViewAs?: PeopleStore["setViewAs"];

  currentDeviceType?: SettingsStore["currentDeviceType"];

  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];
  isDefaultUsersQuotaSet?: CurrentQuotasStore["isDefaultUsersQuotaSet"];

  isRoomAdmin?: TUser["isRoomAdmin"];
};

export type TItem = ReturnType<UsersStore["getPeopleListItem"]>;

export type SimpleUserRowProps = {
  item: TItem;

  isActive?: boolean;

  getContextModel?: () => ContextMenuModel[];

  element: JSX.Element;

  isGuests: boolean;

  checkedProps?: { checked: boolean };
  onContentRowSelect?: (checked: boolean, user?: unknown) => void;
  onContentRowClick?: (e: React.MouseEvent, user: TItem) => void;
  onEmailClick: () => Window | null;
  onUserContextClick: (item: TItem, isSingleMenu: boolean) => void;

  isOwner?: boolean;
  isRoomAdmin?: TUser["isRoomAdmin"];

  hideColumns: boolean;

  value?: string;
  standalone?: boolean;
  onOpenGroup?: (
    groupId: string,
    withBackURL: boolean,
    tempTitle?: string,
  ) => void;

  sectionWidth: number;

  contactsTab: UsersStore["contactsTab"];
  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];
  isDefaultUsersQuotaSet?: CurrentQuotasStore["isDefaultUsersQuotaSet"];

  inProgress?: boolean;
};

export type UserContentProps = {
  item: TItem;

  sectionWidth: number;

  contactsTab: UsersStore["contactsTab"];
  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];
  isDefaultUsersQuotaSet?: CurrentQuotasStore["isDefaultUsersQuotaSet"];

  standalone?: boolean;

  isRoomAdmin?: TUser["isRoomAdmin"];
};
