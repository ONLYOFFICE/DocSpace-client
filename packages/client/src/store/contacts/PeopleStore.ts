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

import { makeAutoObservable } from "mobx";

import { isDesktop } from "@docspace/shared/utils";

import { UserStore } from "@docspace/shared/store/UserStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { Nullable } from "@docspace/shared/types";

import type { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import AccessRightsStore from "../AccessRightsStore";
import ClientLoadingStore from "../ClientLoadingStore";
import ProfileActionsStore from "../ProfileActionsStore";
import DialogsStore from "../DialogsStore";
import TreeFoldersStore from "../TreeFoldersStore";
import SettingsSetupStore from "../SettingsSetupStore";

import GroupsStore from "./GroupsStore";
import UsersStore from "./UsersStore";
import TargetUserStore from "./TargetUserStore";
import ContactsHotkeysStore from "./ContactsHotkeysStore";
import HeaderMenuStore from "./HeaderMenuStore";
import InviteLinksStore from "./InviteLinksStore";
import DialogStore from "./DialogStore";
import ContactsConextOptionsStore from "./ContactsContextOptionsStore";
import FilesStore from "../FilesStore";
import SelectedFolderStore from "../SelectedFolderStore";

class PeopleStore {
  viewAs: TContactsViewAs = isDesktop() ? "table" : "row";

  enabledHotkeys = true;

  contactsHotkeysStore: Nullable<ContactsHotkeysStore> = null;

  groupsStore: Nullable<GroupsStore> = null;

  targetUserStore: Nullable<TargetUserStore> = null;

  headerMenuStore: Nullable<HeaderMenuStore> = null;

  inviteLinksStore: Nullable<InviteLinksStore> = null;

  dialogStore: Nullable<DialogStore> = null;

  contextOptionsStore!: ContactsConextOptionsStore;

  usersStore: UsersStore;

  constructor(
    public accessRightsStore: AccessRightsStore,
    public userStore: UserStore,
    public tfaStore: TfaStore,
    public settingsStore: SettingsStore,
    public clientLoadingStore: ClientLoadingStore,
    public profileActionsStore: ProfileActionsStore,
    public dialogsStore: DialogsStore,
    public currentQuotaStore: CurrentQuotasStore,
    public treeFoldersStore: TreeFoldersStore,
    public setup: SettingsSetupStore,
    public filesStore: FilesStore,
    public selectedFolderStore: SelectedFolderStore,
  ) {
    this.accessRightsStore = accessRightsStore;
    this.userStore = userStore;
    this.tfaStore = tfaStore;
    this.settingsStore = settingsStore;
    this.clientLoadingStore = clientLoadingStore;
    this.profileActionsStore = profileActionsStore;
    this.dialogsStore = dialogsStore;
    this.currentQuotaStore = currentQuotaStore;
    this.treeFoldersStore = treeFoldersStore;
    this.setup = setup;
    this.filesStore = filesStore;
    this.selectedFolderStore = selectedFolderStore;

    this.dialogStore = new DialogStore();
    this.contactsHotkeysStore = new ContactsHotkeysStore(this);
    this.inviteLinksStore = new InviteLinksStore(userStore);

    this.groupsStore = new GroupsStore(
      this,
      clientLoadingStore,
      userStore,
      settingsStore,
      this.dialogStore,
    );
    this.targetUserStore = new TargetUserStore(userStore);

    this.usersStore = new UsersStore(
      settingsStore,
      userStore,
      this.groupsStore,
      this.contactsHotkeysStore,
      accessRightsStore,
      this.dialogStore,
      clientLoadingStore,
      treeFoldersStore,
      this.filesStore,
      this.dialogsStore,
      this.selectedFolderStore,
    );

    this.contextOptionsStore = new ContactsConextOptionsStore(
      profileActionsStore,
      userStore,
      tfaStore,
      settingsStore,
      this.usersStore,
      this.dialogStore,
      this.targetUserStore,
      this.dialogsStore,
      currentQuotaStore,
      this.setup,
    );

    this.headerMenuStore = new HeaderMenuStore(
      this.groupsStore,
      this.usersStore,
      this.dialogStore,
      this.contextOptionsStore,
      userStore,
    );

    makeAutoObservable(this);
  }

  setViewAs = (viewAs: TContactsViewAs) => {
    this.viewAs = viewAs;
  };

  setEnabledHotkeys = (enabledHotkeys: boolean) => {
    this.enabledHotkeys = enabledHotkeys;
  };
}

export default PeopleStore;
