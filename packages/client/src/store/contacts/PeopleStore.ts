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

import { makeAutoObservable } from "mobx";

import { isDesktop } from "@docspace/shared/utils";

import { UserStore } from "@docspace/shared/store/UserStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { AuthStore } from "@docspace/shared/store/AuthStore";
import { Nullable } from "@docspace/shared/types";

import type { TContactsViewAs } from "SRC_DIR/helpers/contacts";

import SettingsSetupStore from "../SettingsSetupStore";
import AccessRightsStore from "../AccessRightsStore";
import InfoPanelStore from "../InfoPanelStore";
import ClientLoadingStore from "../ClientLoadingStore";
import ProfileActionsStore from "../ProfileActionsStore";

import GroupsStore from "./GroupsStore";
import UsersStore from "./UsersStore";
import TargetUserStore from "./TargetUserStore";
import ContactsHotkeysStore from "./ContactsHotkeysStore";
import HeaderMenuStore from "./HeaderMenuStore";
import InviteLinksStore from "./InviteLinksStore";
import DialogStore from "./DialogStore";
import ContactsConextOptionsStore from "./ContactsContextOptionsStore";

class PeopleStore {
  viewAs: TContactsViewAs = isDesktop() ? "table" : "row";

  enabledHotkeys = true;

  contactsHotkeysStore: Nullable<ContactsHotkeysStore> = null;

  groupsStore: Nullable<GroupsStore> = null;

  targetUserStore: Nullable<TargetUserStore> = null;

  headerMenuStore: Nullable<HeaderMenuStore> = null;

  inviteLinksStore: Nullable<InviteLinksStore> = null;

  dialogStore: Nullable<DialogStore> = null;

  contextOptionsStore: Nullable<ContactsConextOptionsStore> = null;

  usersStore: Nullable<UsersStore> = null;

  constructor(
    public authStore: AuthStore,
    public setupStore: SettingsSetupStore,
    public accessRightsStore: AccessRightsStore,
    public dialogsStore: DialogStore,
    public infoPanelStore: InfoPanelStore,
    public userStore: UserStore,
    public tfaStore: TfaStore,
    public settingsStore: SettingsStore,
    public clientLoadingStore: ClientLoadingStore,
    public profileActionsStore: ProfileActionsStore,
  ) {
    this.authStore = authStore;
    this.infoPanelStore = infoPanelStore;
    this.setupStore = setupStore;
    this.accessRightsStore = accessRightsStore;
    this.dialogsStore = dialogsStore;
    this.userStore = userStore;

    this.contactsHotkeysStore = new ContactsHotkeysStore(this);
    this.groupsStore = new GroupsStore(
      authStore,
      this,
      infoPanelStore,
      clientLoadingStore,
    );
    this.targetUserStore = new TargetUserStore(this, userStore);

    this.inviteLinksStore = new InviteLinksStore(userStore);
    this.dialogStore = new DialogStore();

    this.usersStore = new UsersStore(
      settingsStore,
      infoPanelStore,
      userStore,
      this.targetUserStore,
      this.groupsStore,
      this.contactsHotkeysStore,
      accessRightsStore,
      this.dialogStore,
    );

    this.contextOptionsStore = new ContactsConextOptionsStore(
      profileActionsStore,
      infoPanelStore,
      userStore,
      tfaStore,
      settingsStore,
      this.usersStore,
      this.dialogStore,
      this.targetUserStore,
    );

    this.headerMenuStore = new HeaderMenuStore(
      this.groupsStore,
      this.usersStore,
      this.dialogStore,
      this.contextOptionsStore,
      infoPanelStore,
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
