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

import { makeAutoObservable } from "mobx";

import { EmployeeStatus, EmployeeType } from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import { isMobile, isTablet, isDesktop } from "@docspace/shared/utils";
import {
  changeUserQuota,
  TContactsMenuItemdId,
} from "SRC_DIR/helpers/contacts";
import { TUser } from "@docspace/shared/api/people/types";
import { UserStore } from "@docspace/shared/store/UserStore";
import { toastr } from "@docspace/shared/components/toast";
import { TData } from "@docspace/shared/components/toast/Toast.type";
import api from "@docspace/shared/api";

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import DisableReactSvgUrl from "PUBLIC_DIR/images/disable.react.svg?url";
import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import DefaultQuotaReactSvgUrl from "PUBLIC_DIR/images/default.quota.react.svg?url";

import { getInfoPanelOpen, showInfoPanel } from "SRC_DIR/helpers/info-panel";

import GroupsStore from "./GroupsStore";
import UsersStore from "./UsersStore";
import DialogStore from "./DialogStore";
import AccountsContextOptionsStore from "./ContactsContextOptionsStore";

class HeaderMenuStore {
  constructor(
    public groupsStore: GroupsStore,
    public usersStore: UsersStore,
    public dialogStore: DialogStore,
    public contextOptionsStore: AccountsContextOptionsStore,
    public userStore: UserStore,
  ) {
    this.groupsStore = groupsStore;
    this.usersStore = usersStore;

    makeAutoObservable(this);
  }

  onDeleteClick = () => {
    const { setDeleteGroupDialogVisible } = this.dialogStore;
    const { selection, setGroupName } = this.groupsStore;

    setGroupName(selection[0].name);
    setDeleteGroupDialogVisible(true);
  };

  resetUserQuota = async (users: (TUser | string)[], t: TTranslation) => {
    const userIDs = users.map((user) => {
      return typeof user === "string" ? user : user.id;
    });

    try {
      await api.people.resetUserQuota(userIDs);

      toastr.success(t("Common:StorageQuotaReset"));
    } catch (e) {
      toastr.error(e as unknown as TData);
    }
  };

  disableUserQuota = async (users: (TUser | string)[], t: TTranslation) => {
    const userIDs = users.map((user) => {
      return typeof user === "string" ? user : user.id;
    });

    try {
      await api.people.setCustomUserQuota(userIDs, "-1");

      toastr.success(t("Common:StorageQuotaDisabled"));
    } catch (e) {
      toastr.error(e as unknown as TData);
    }
  };

  getContactsHeaderMenu = (t: TTranslation, isGroupsPage = false) => {
    const {
      hasUsersToMakeEmployees,
      hasUsersToChangeType,
      hasUsersToActivate,
      hasUsersToDisable,
      hasUsersToInvite,
      hasOnlyOneUserToRemove,
      hasUsersToChangeQuota,
      hasUsersToResetQuota,
      hasUsersToDisableQuota,
      selection,
      contactsTab,
      getUsersToMakeEmployees,
    } = this.usersStore!;
    const { setSendInviteDialogVisible, setRemoveGuestDialogVisible } =
      this.dialogStore;
    const { toggleDeleteProfileEverDialog, settingsStore } =
      this.contextOptionsStore;
    const { isRoomAdmin, isCollaborator } = this.userStore.user!;

    const isInfoPanelVisible = getInfoPanelOpen();

    const isGuests = contactsTab === "guests";

    if (isGroupsPage) {
      if (isRoomAdmin || isCollaborator) return [];
      return [
        {
          id: "menu-delete",
          key: "delete",
          label: t("Common:Delete"),
          onClick: this.onDeleteClick,
          iconUrl: DeleteReactSvgUrl,
        },
      ];
    }

    const headerMenu = [
      {
        id: "menu-change-type",
        key: "change-user",
        label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
        disabled: isGuests ? !hasUsersToMakeEmployees : !hasUsersToChangeType,
        iconUrl: ChangeToEmployeeReactSvgUrl,
        onClick:
          isGuests && isRoomAdmin
            ? () =>
                this.usersStore.changeType(
                  EmployeeType.User,
                  getUsersToMakeEmployees,
                )
            : null,
        withDropDown: !isRoomAdmin,
        options: isRoomAdmin
          ? null
          : this.contextOptionsStore.getUsersChangeTypeOptions(t),
      },
      {
        id: "menu-info",
        key: "info",
        label: t("Common:Info"),
        disabled:
          isInfoPanelVisible ||
          !(isTablet() || isMobile() || !isDesktop()) ||
          selection.length > 1,
        onClick: showInfoPanel,
        iconUrl: InfoReactSvgUrl,
      },
      {
        id: "menu-invite",
        key: "invite",
        label: t("Common:Invite"),
        disabled: !hasUsersToInvite,
        onClick: () => setSendInviteDialogVisible(true),
        iconUrl: InviteAgainReactSvgUrl,
      },
      {
        id: "menu-enable",
        key: "enable",
        label: t("Common:Enable"),
        disabled: !hasUsersToActivate,
        onClick: () =>
          this.contextOptionsStore.onChangeStatus(EmployeeStatus.Active),
        iconUrl: EnableReactSvgUrl,
      },
      {
        id: "menu-disable",
        key: "disable",
        label: t("PeopleTranslations:DisableUserButton"),
        disabled: !hasUsersToDisable,
        onClick: () =>
          this.contextOptionsStore.onChangeStatus(EmployeeStatus.Disabled),
        iconUrl: DisableReactSvgUrl,
      },
      {
        id: "menu-change-quota",
        key: "change-quota",
        label: t("Common:ChangeQuota"),
        disabled: !hasUsersToChangeQuota || isGuests,
        iconUrl: ChangQuotaReactSvgUrl,
        onClick: () => changeUserQuota(selection as unknown as TUser[]),
      },
      {
        id: "menu-default-quota",
        key: "default-quota",
        label: t("Common:SetToDefault"),
        disabled: !hasUsersToResetQuota || isGuests,
        iconUrl: DefaultQuotaReactSvgUrl,
        onClick: () => this.resetUserQuota(selection as unknown as TUser[], t),
      },
      {
        id: "menu-disable-quota",
        key: "disable-quota",
        label: t("Common:DisableQuota"),
        disabled: !hasUsersToDisableQuota || isGuests,
        iconUrl: DisableQuotaReactSvgUrl,
        onClick: () =>
          this.disableUserQuota(selection as unknown as TUser[], t),
      },
      {
        id: "menu-delete",
        key: "delete",
        label: t("Common:Delete"),
        disabled: !hasOnlyOneUserToRemove,
        onClick: () => toggleDeleteProfileEverDialog(selection),
        iconUrl: DeleteReactSvgUrl,
      },
      {
        key: "menu-remove",
        label: t("Common:Remove"),
        disabled: !isGuests || !isRoomAdmin,
        onClick: () => setRemoveGuestDialogVisible(true),
        iconUrl: DisableReactSvgUrl,
      },
    ];

    if (!settingsStore.allowInvitingMembers) {
      const indexInvite = headerMenu.findIndex(
        (item) => item.id === "menu-invite",
      );
      headerMenu.splice(indexInvite, 1);
    }

    return headerMenu;
  };

  get cbContactsMenuItems() {
    const { users } = this.usersStore;

    let cbMenu: TContactsMenuItemdId[] = ["all"];

    users.forEach((user) => {
      switch (user.status) {
        case EmployeeStatus.Active:
          cbMenu.push("active");
          break;
        case EmployeeStatus.Pending:
          cbMenu.push("pending");
          break;
        case EmployeeStatus.Disabled:
          cbMenu.push("disabled");
          break;
        default:
          break;
      }
    });

    cbMenu = cbMenu.filter((item, index) => cbMenu.indexOf(item) === index);

    return cbMenu;
  }

  // Users

  get isUsersHeaderVisible() {
    const { selection } = this.usersStore;
    return selection.length > 0;
  }

  get isUsersHeaderIndeterminate() {
    const { selection } = this.usersStore;
    const { users } = this.usersStore;

    return (
      this.isUsersHeaderVisible &&
      !!selection.length &&
      selection.length < users.length
    );
  }

  get isUsersHeaderChecked() {
    const { selection } = this.usersStore;
    const { users } = this.usersStore;

    return this.isUsersHeaderVisible && selection.length === users.length;
  }

  // Groups

  get isGroupsHeaderVisible() {
    const { selection } = this.groupsStore;
    return selection?.length > 0;
  }

  get isGroupsHeaderIndeterminate() {
    const { selection, groups } = this.groupsStore;

    return (
      this.isGroupsHeaderVisible &&
      !!selection?.length &&
      groups &&
      selection?.length < groups?.length
    );
  }

  get isGroupsHeaderChecked() {
    const { selection, groups } = this.groupsStore;
    return this.isGroupsHeaderVisible && selection?.length === groups?.length;
  }
}

export default HeaderMenuStore;
