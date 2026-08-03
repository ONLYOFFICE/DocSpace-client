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

import { TUser } from "@docspace/shared/api/people/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";

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
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
  isMe?: UserStore["isMe"];
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
  itemIndex?: number;
  isMe?: UserStore["isMe"];
};

export type UserContentProps = {
  item: TItem;

  sectionWidth: number;

  contactsTab: UsersStore["contactsTab"];
  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];
  isDefaultUsersQuotaSet?: CurrentQuotasStore["isDefaultUsersQuotaSet"];

  standalone?: boolean;

  isRoomAdmin?: TUser["isRoomAdmin"];
  itemIndex?: number;
  isMe?: UserStore["isMe"];
};
