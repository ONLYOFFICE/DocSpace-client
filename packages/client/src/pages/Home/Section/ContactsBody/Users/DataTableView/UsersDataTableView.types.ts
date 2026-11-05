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

import { type JSX } from "react";

import { TUser } from "@docspace/shared/api/people/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import { ContextMenuModel } from "@onlyoffice/apps-ui-kit/components/context-menu";

import AccessRightsStore from "SRC_DIR/store/AccessRightsStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import PeopleStore from "SRC_DIR/store/contacts/PeopleStore";
import UsersStore from "SRC_DIR/store/contacts/UsersStore";
import InfoPanelStore from "SRC_DIR/store/InfoPanelStore";
import TableStore from "SRC_DIR/store/TableStore";
import ContactsConextOptionsStore from "SRC_DIR/store/contacts/ContactsContextOptionsStore";
import ContactsHotkeysStore from "SRC_DIR/store/contacts/ContactsHotkeysStore";

export type TableViewStores = {
  peopleStore: PeopleStore;
  accessRightsStore: AccessRightsStore;
  settingsStore: SettingsStore;
  infoPanelStore: InfoPanelStore;
  userStore: UserStore;
  tableStore: TableStore;
};

export type TableHeaderStores = {
  peopleStore: PeopleStore;
  clientLoadingStore: ClientLoadingStore;
  settingsStore: SettingsStore;
  infoPanelStore: InfoPanelStore;
  userStore: UserStore;
  tableStore: TableStore;
  currentQuotaStore: CurrentQuotasStore;
};

export type TableRowStores = {
  currentQuotaStore: CurrentQuotasStore;
  peopleStore: PeopleStore;
  userStore: UserStore;
};

export type TItem = ReturnType<UsersStore["getPeopleListItem"]>;

/** What `withPeopleContent` and the stores give a users row. */
export type TableRowProps = {
  item: TItem;
  itemIndex?: number;

  isActive?: boolean;
  inProgress?: boolean;

  getContextModel?: () => ContextMenuModel[];

  element: JSX.Element;

  contactsTab: UsersStore["contactsTab"];

  checkedProps?: { checked: boolean };
  onContentRowSelect?: (checked: boolean, user: TItem) => void;
  onContentRowClick?: (e: React.MouseEvent, user: TItem) => void;
  onEmailClick: () => Window | null;
  onUserContextClick: (item: TItem, isSingleMenu: boolean) => void;

  getUsersChangeTypeOptions?: ContactsConextOptionsStore["getUsersChangeTypeOptions"];

  changeUserType: UsersStore["changeType"];
  canChangeUserType: AccessRightsStore["canChangeUserType"];

  isRoomAdmin?: TUser["isRoomAdmin"];
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];

  value?: string;
  standalone?: boolean;
  onOpenGroup?: (
    groupId: string,
    withBackURL: boolean,
    tempTitle?: string,
  ) => void;

  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];
  showAISpendingInfo?: UsersStore["showAISpendingInfo"];
  isMe?: UserStore["isMe"];
};
