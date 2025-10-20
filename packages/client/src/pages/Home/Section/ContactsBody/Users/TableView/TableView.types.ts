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

import React, { type JSX } from "react";
import { NavigateFunction, Location } from "react-router";

import { TFilterSortBy, TUser } from "@docspace/shared/api/people/types";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import { Nullable, TTranslation } from "@docspace/shared/types";
import { ContextMenuModel } from "@docspace/shared/components/context-menu";

import AccessRightsStore from "SRC_DIR/store/AccessRightsStore";
import ClientLoadingStore from "SRC_DIR/store/ClientLoadingStore";
import GroupsStore from "SRC_DIR/store/contacts/GroupsStore";
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

export type TableColumns = {
  typeColumnIsEnabled: boolean;
  emailColumnIsEnabled: boolean;
  groupColumnIsEnabled: boolean;
  storageColumnIsEnabled: boolean;
  inviterColumnIsEnabled: boolean;
  invitedDateColumnIsEnabled: boolean;
};

export type TableHeaderColumn = {
  key: string;
  title: string;
  enable: boolean;
  sortBy: TFilterSortBy;
  resizable: boolean;
  default?: boolean;
  minWidth?: number;
  onChange?: (key: string) => void;
  onClick: (sortBy: TFilterSortBy) => void;
};

export type TableViewProps = {
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

  isAdmin?: TUser["isAdmin"];
  isOwner?: TUser["isOwner"];
  userId?: TUser["id"];

  infoPanelVisible?: InfoPanelStore["isVisible"];

  currentDeviceType?: SettingsStore["currentDeviceType"];

  canChangeUserType?: AccessRightsStore["canChangeUserType"];

  setCurrentGroup?: GroupsStore["setCurrentGroup"];

  typePeopleColumnIsEnabled?: TableStore["typePeopleColumnIsEnabled"];
  emailPeopleColumnIsEnabled?: TableStore["emailPeopleColumnIsEnabled"];
  groupPeopleColumnIsEnabled?: TableStore["groupPeopleColumnIsEnabled"];
  storagePeopleColumnIsEnabled?: TableStore["storagePeopleColumnIsEnabled"];
  inviterGuestsColumnIsEnabled?: TableStore["inviterGuestsColumnIsEnabled"];
  emailGuestsColumnIsEnabled?: TableStore["emailGuestsColumnIsEnabled"];
  invitedDateGuestsColumnIsEnabled?: TableStore["invitedDateGuestsColumnIsEnabled"];
  typeInsideGroupColumnIsEnabled?: TableStore["typeInsideGroupColumnIsEnabled"];
  emailInsideGroupColumnIsEnabled?: TableStore["emailInsideGroupColumnIsEnabled"];
  groupInsideGroupColumnIsEnabled?: TableStore["groupInsideGroupColumnIsEnabled"];
  storageInsideGroupColumnIsEnabled?: TableStore["storageInsideGroupColumnIsEnabled"];
  columnStorageName?: TableStore["columnStorageName"];
  columnInfoPanelStorageName?: TableStore["columnInfoPanelStorageName"];
  withContentSelection?: ContactsHotkeysStore["withContentSelection"];
};

export type TableHeaderState = {
  columns: TableHeaderColumn[];
  resetColumnsSize: boolean;
};

export type TableHeaderProps = {
  t?: TTranslation;

  columnStorageName?: TableStore["columnStorageName"];
  columnInfoPanelStorageName?: TableStore["columnInfoPanelStorageName"];

  sectionWidth: number;

  containerRef: React.RefObject<Nullable<React.ForwardedRef<HTMLDivElement>>>;

  navigate: NavigateFunction;
  location: Location;

  setHideColumns: React.Dispatch<React.SetStateAction<boolean>>;

  filter?: UsersStore["filter"];
  setFilter?: UsersStore["setFilter"];
  contactsTab?: UsersStore["contactsTab"];

  setIsLoading?: ClientLoadingStore["setIsSectionBodyLoading"];

  isRoomAdmin?: TUser["isRoomAdmin"];

  infoPanelVisible?: InfoPanelStore["isVisible"];

  isDefaultUsersQuotaSet?: CurrentQuotasStore["isDefaultUsersQuotaSet"];
  showStorageInfo?: CurrentQuotasStore["showStorageInfo"];

  getColumns?: TableStore["getColumns"];
  setColumnEnable?: TableStore["setColumnEnable"];
  tableStorageName?: TableStore["tableStorageName"];
} & TableColumns;

export type TItem = ReturnType<UsersStore["getPeopleListItem"]>;

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

  hideColumns: boolean;

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
} & TableColumns;
