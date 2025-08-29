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
import { isMobile } from "react-device-detect";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import {
  EmployeeStatus,
  EmployeeType,
  FilterSubject,
} from "@docspace/shared/enums";
import { TTranslation } from "@docspace/shared/types";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { TContextMenuValueTypeOnClick } from "@docspace/shared/components/context-menu/ContextMenu.types";
import { SettingsStore } from "@docspace/shared/store/SettingsStore";
import { TfaStore } from "@docspace/shared/store/TfaStore";
import { UserStore } from "@docspace/shared/store/UserStore";
import { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";
import { checkDialogsOpen } from "@docspace/shared/utils/checkDialogsOpen";
import { getUserTypeTranslation } from "@docspace/shared/utils/common";
import { CategoryType } from "@docspace/shared/constants";

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import ChangeMailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import ChangeSecurityReactSvgUrl from "PUBLIC_DIR/images/change.security.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import DelDataReactSvgUrl from "PUBLIC_DIR/images/del_data.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/icons/16/trash.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import RestoreAuthReactSvgUrl from "PUBLIC_DIR/images/restore.auth.react.svg?url";
import DisableReactSvgUrl from "PUBLIC_DIR/images/disable.react.svg?url";
import ProfileReactSvgUrl from "PUBLIC_DIR/images/profile.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ReassignDataReactSvgUrl from "PUBLIC_DIR/images/reassign.data.svg?url";
import PersonAdminReactSvgUrl from "PUBLIC_DIR/images/person.admin.react.svg?url";
import PersonManagerReactSvgUrl from "PUBLIC_DIR/images/person.manager.react.svg?url";
import PersonDefaultReactSvgUrl from "PUBLIC_DIR/images/person.default.react.svg?url";
import PersonUserReactSvgUrl from "PUBLIC_DIR/images/person.user.react.svg?url";
import PersonShareReactSvgUrl from "PUBLIC_DIR/images/person.share.react.svg?url";
import GroupReactSvgUrl from "PUBLIC_DIR/images/group.react.svg?url";
import CatalogUserReactSvgUrl from "PUBLIC_DIR/images/icons/16/catalog.user.react.svg?url";

import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import {
  createGroup,
  onDeletePersonalDataClick,
  onInviteAgainClick,
  onInviteMultipleAgain,
  shareGuest,
} from "SRC_DIR/helpers/contacts";

import { getInfoPanelOpen, showInfoPanel } from "SRC_DIR/helpers/info-panel";

import ProfileActionsStore from "../ProfileActionsStore";
import DialogsStore from "../DialogsStore";
import SettingsSetupStore from "../SettingsSetupStore";

import UsersStore from "./UsersStore";
import DialogStore from "./DialogStore";
import TargetUserStore from "./TargetUserStore";

const PROXY_HOMEPAGE_URL = combineUrl(window.ClientConfig?.proxy?.url, "/");

type TItem = ReturnType<UsersStore["getPeopleListItem"]>;

class ContactsConextOptionsStore {
  constructor(
    public profileActionsStore: ProfileActionsStore,
    public userStore: UserStore,
    public tfaStore: TfaStore,
    public settingsStore: SettingsStore,
    public usersStore: UsersStore,
    public dialogStore: DialogStore,
    public targetUserStore: TargetUserStore,
    public dialogsStore: DialogsStore,
    public currentQuotaStore: CurrentQuotasStore,
    public setup: SettingsSetupStore,
  ) {
    this.settingsStore = settingsStore;
    this.profileActionsStore = profileActionsStore;
    this.userStore = userStore;
    this.tfaStore = tfaStore;
    this.usersStore = usersStore;
    this.dialogStore = dialogStore;
    this.targetUserStore = targetUserStore;
    this.dialogsStore = dialogsStore;
    this.currentQuotaStore = currentQuotaStore;
    this.setup = setup;
    makeAutoObservable(this);
  }

  onChangeType = (e: TContextMenuValueTypeOnClick) => {
    const action =
      "action" in e && e.action
        ? e.action
        : // @ts-expect-error TODO: need fix typing
          e?.currentTarget?.dataset?.action;

    const { getUsersToMakeEmployees } = this.usersStore!;

    this.usersStore.changeType(
      +action as EmployeeType,
      getUsersToMakeEmployees,
    );
  };

  onChangeStatus = (status: EmployeeStatus) => {
    const users = [];

    if (status === EmployeeStatus.Active) {
      const { getUsersToActivate } = this.usersStore;

      users.push(...getUsersToActivate);
    } else {
      const { getUsersToDisable } = this.usersStore;

      users.push(...getUsersToDisable);
    }

    this.usersStore.changeStatus(status, users);
  };

  toggleChangeOwnerDialog = () => {
    const { setChangeOwnerDialogVisible } = this.dialogStore;

    setChangeOwnerDialogVisible(true);
  };

  getUserContextOptions = (t: TTranslation, options: string[], item: TItem) => {
    const { contactsTab } = this.usersStore;
    const isGuests = contactsTab === "guests";
    const { isRoomAdmin } = this.userStore.user!;

    const contextMenu = options.map((option) => {
      switch (option) {
        case "separator-1":
          return { key: option, isSeparator: true };
        case "separator-2":
          return { key: option, isSeparator: true };
        case "separator-3":
          return { key: option, isSeparator: true };

        case "profile":
          return {
            id: "option_profile",
            key: option,
            icon: ProfileReactSvgUrl,
            label: t("Common:Profile"),
            onClick: this.profileActionsStore.onProfileClick,
          };

        case "change-name":
          return {
            id: "option_change-name",
            key: option,
            icon: PencilReactSvgUrl,
            label: t("PeopleTranslations:NameChangeButton"),
            onClick: this.toggleChangeNameDialog,
          };
        case "change-email":
          return {
            id: "option_change-email",
            key: option,
            icon: ChangeMailReactSvgUrl,
            label: t("PeopleTranslations:EmailChangeButton"),
            onClick: () => this.toggleChangeEmailDialog(item),
          };
        case "change-password":
          return {
            id: "option_change-password",
            key: option,
            icon: ChangeSecurityReactSvgUrl,
            label: t("PeopleTranslations:PasswordChangeButton"),
            onClick: () => this.toggleChangePasswordDialog(item),
          };
        case "change-owner":
          return {
            id: "option_change-owner",
            key: option,
            icon: RefreshReactSvgUrl,
            label: t("Translations:OwnerChange"),
            onClick: () => this.toggleChangeOwnerDialog(),
          };
        case "room-list":
          return {
            key: option,
            icon: FolderReactSvgUrl,
            label: t("Common:RoomList"),
            onClick: () => this.openUserRoomList(item),
          };
        case "enable":
          return {
            id: "option_enable",
            key: option,
            icon: EnableReactSvgUrl,
            label: t("PeopleTranslations:EnableUserButton"),
            onClick: () => this.onEnableClick(item),
          };
        case "disable":
          return {
            id: "option_disable",
            key: option,
            icon: RemoveReactSvgUrl,
            label: t("PeopleTranslations:DisableUserButton"),
            onClick: () => this.onDisableClick(item),
          };
        case "reassign-data":
          return {
            id: "option_reassign-data",
            key: option,
            icon: ReassignDataReactSvgUrl,
            label: t("DataReassignmentDialog:ReassignData"),
            onClick: () => this.toggleDataReassignmentDialog(item),
          };
        case "delete-personal-data":
          return {
            id: "option_delete-personal-data",
            key: option,
            icon: DelDataReactSvgUrl,
            label: t("PeopleTranslations:RemoveData"),
            onClick: () => onDeletePersonalDataClick(t),
          };
        case "delete-user":
          return {
            id: "option_delete-user",
            key: option,
            icon: TrashReactSvgUrl,
            label: item.isVisitor
              ? t("DeleteProfileEverDialog:DeleteGuest")
              : t("DeleteProfileEverDialog:DeleteUser"),
            onClick: () => this.toggleDeleteProfileEverDialog([item]),
          };

        case "details":
          return {
            id: "option_details",
            key: option,
            icon: InfoOutlineReactSvgUrl,
            label: t("Common:Info"),
            onClick: () => this.onDetailsClick(item),
          };

        case "invite-again":
          return !this.settingsStore.allowInvitingMembers
            ? null
            : {
                id: "option_invite-again",
                key: option,
                icon: InviteAgainReactSvgUrl,
                label: t("LblInviteAgain"),
                onClick: () => onInviteAgainClick(item, t),
              };
        case "reset-auth":
          return {
            id: "option_reset-auth",
            key: option,
            icon: RestoreAuthReactSvgUrl,
            label: t("PeopleTranslations:ResetAuth"),
            onClick: () => this.onResetAuth(item),
            disabled: !item.tfaAppEnabled,
          };
        case "share-guest":
          return {
            id: "option_share-guest",
            key: option,
            icon: PersonShareReactSvgUrl,
            label: t("PeopleTranslations:ShareGuest"),
            onClick: () => shareGuest(item, t),
          };
        case "change-type":
          return {
            id: "option_change-type",
            key: option,
            icon: ChangeToEmployeeReactSvgUrl,
            label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
            onClick:
              isGuests && isRoomAdmin
                ? () =>
                    this.usersStore.changeType(
                      EmployeeType.User,
                      this.usersStore.getUsersToMakeEmployees,
                    )
                : null,
            withDropDown: !isRoomAdmin,
            items: isRoomAdmin ? null : this.getUsersChangeTypeOptions(t, item),
          };
        case "remove-guest":
          return {
            id: "option_remove-guests",
            key: option,
            label: t("Common:Remove"),
            onClick: () => this.dialogStore.setRemoveGuestDialogVisible(true),
            icon: DisableReactSvgUrl,
          };
        default:
          break;
      }

      return undefined;
    });

    return contextMenu;
  };

  getUsersChangeTypeOptions = (
    t: TTranslation,
    item?: ReturnType<UsersStore["getPeopleListItem"]>,
  ) => {
    const { userSelectionRole, selectionUsersRights, contactsTab } =
      this.usersStore;

    const isGuests = contactsTab === "guests";

    const { isOwner: isUserOwner, isAdmin: isUserAdmin } = this.userStore.user!;
    const { standalone, allowInvitingGuests } = this.settingsStore;

    const { isCollaborator, isRoomAdmin, isAdmin, isVisitor } =
      item ?? selectionUsersRights;

    const options = [];

    const adminOption = {
      id: "menu_change-user_administrator",
      className: "group-menu_drop-down",
      label: getUserTypeTranslation(EmployeeType.Admin, t),
      title: getUserTypeTranslation(EmployeeType.Admin, t),
      icon: isGuests ? PersonAdminReactSvgUrl : null,
      badgeLabel: isGuests ? t("Common:Paid") : undefined,
      isPaidBadge: !standalone,
      onClick: (e: TContextMenuValueTypeOnClick) => this.onChangeType(e),
      "data-action": EmployeeType.Admin,
      action: EmployeeType.Admin,
      key: EmployeeType.Admin,
      isActive: item ? isAdmin : userSelectionRole === EmployeeType.Admin,
    };

    const roomAdminOption = {
      id: "menu_change-user_manager",
      className: "group-menu_drop-down",
      label: getUserTypeTranslation(EmployeeType.RoomAdmin, t),
      title: getUserTypeTranslation(EmployeeType.RoomAdmin, t),
      icon: isGuests ? PersonManagerReactSvgUrl : null,
      badgeLabel: isGuests ? t("Common:Paid") : undefined,
      isPaidBadge: !standalone,
      onClick: (e: TContextMenuValueTypeOnClick) => this.onChangeType(e),
      "data-action": EmployeeType.RoomAdmin,
      action: EmployeeType.RoomAdmin,
      key: EmployeeType.RoomAdmin,
      isActive: item
        ? isRoomAdmin
        : userSelectionRole === EmployeeType.RoomAdmin,
    };

    const userOption = {
      id: "menu_change-collaborator",
      key: EmployeeType.User,
      label: getUserTypeTranslation(EmployeeType.User, t),
      title: getUserTypeTranslation(EmployeeType.User, t),
      icon: isGuests ? CatalogUserReactSvgUrl : null,
      "data-action": EmployeeType.User,
      action: EmployeeType.User,
      onClick: (e: TContextMenuValueTypeOnClick) => this.onChangeType(e),
      isActive: item ? isCollaborator : userSelectionRole === EmployeeType.User,
    };

    const guestOption = {
      id: "menu_change-guest",
      key: EmployeeType.Guest,
      label: getUserTypeTranslation(EmployeeType.Guest, t),
      title: getUserTypeTranslation(EmployeeType.Guest, t),
      "data-action": EmployeeType.Guest,
      action: EmployeeType.Guest,
      onClick: (e: TContextMenuValueTypeOnClick) => this.onChangeType(e),
      isActive: item ? isVisitor : userSelectionRole === EmployeeType.Guest,
    };

    if (isUserAdmin) {
      if (isUserOwner) {
        options.push(adminOption);
      }

      options.push(roomAdminOption);
      options.push(userOption);

      if (!isVisitor && allowInvitingGuests) options.push(guestOption);
    }

    return options;
  };

  getUserGroupContextOptions = (t: TTranslation) => {
    const { onChangeStatus } = this;

    const {
      hasUsersToMakeEmployees,
      hasUsersToActivate,
      hasUsersToDisable,
      hasUsersToInvite,
      hasOnlyOneUserToRemove,
      contactsTab,
    } = this.usersStore;
    const {
      setSendInviteDialogVisible,
      setDeleteProfileDialogVisible,
      setRemoveGuestDialogVisible,
    } = this.dialogStore;

    const isGuests = contactsTab === "guests";

    const { isRoomAdmin } = this.userStore.user!;

    const options = this.getUsersChangeTypeOptions(t);

    const menu = [
      {
        key: "cm-change-type",
        label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
        disabled: !hasUsersToMakeEmployees,
        icon: ChangeToEmployeeReactSvgUrl,
        onClick:
          isGuests && isRoomAdmin
            ? () =>
                this.usersStore.changeType(
                  EmployeeType.User,
                  this.usersStore.getUsersToMakeEmployees,
                )
            : null,
        withDropDown: !isRoomAdmin,
        items: isRoomAdmin ? null : options,
      },
      {
        key: "cm-info",
        label: t("Common:Info"),
        disabled: getInfoPanelOpen(),
        onClick: showInfoPanel,
        icon: InfoOutlineReactSvgUrl,
      },
      {
        key: "cm-invite",
        label: t("Common:Invite"),
        disabled: !hasUsersToInvite,
        onClick: () => setSendInviteDialogVisible(true),
        icon: InviteAgainReactSvgUrl,
      },
      {
        key: "cm-enable",
        label: t("Common:Enable"),
        disabled: !hasUsersToActivate || (isRoomAdmin && isGuests),
        onClick: () => onChangeStatus(EmployeeStatus.Active),
        icon: EnableReactSvgUrl,
      },
      {
        key: "cm-disable",
        label: t("PeopleTranslations:DisableUserButton"),
        disabled: !hasUsersToDisable || (isRoomAdmin && isGuests),
        onClick: () => onChangeStatus(EmployeeStatus.Disabled),
        icon: DisableReactSvgUrl,
      },
      {
        key: "cm-delete",
        label: t("Common:Delete"),
        disabled: !hasOnlyOneUserToRemove || (isRoomAdmin && isGuests),
        onClick: () => setDeleteProfileDialogVisible(true),
        icon: DeleteReactSvgUrl,
      },
      {
        key: "cm-remove",
        label: t("Common:Remove"),
        disabled: !isGuests || !isRoomAdmin,
        onClick: () => setRemoveGuestDialogVisible(true),
        icon: DisableReactSvgUrl,
      },
    ];

    return menu;
  };

  getModel = (item: TItem, t: TTranslation) => {
    const { selection } = this.usersStore;

    const { options } = item;

    const contextOptionsProps =
      options && options.length > 0
        ? selection.length > 1
          ? this.getUserGroupContextOptions(t)
          : this.getUserContextOptions(t, options, item)
        : [];

    return contextOptionsProps;
  };

  openUserRoomList = (user: TItem) => {
    const filter = RoomsFilter.getDefault();

    filter.subjectId = user.id;
    filter.subjectFilter = FilterSubject.Member;

    const { id } = this.userStore.user!;

    const filterParamsStr = filter.toUrlParams(id);
    const url = getCategoryUrl(CategoryType.Shared);
    const type = this.settingsStore.isDesktopClient ? "_self" : "_blank";

    window.open(
      combineUrl(PROXY_HOMEPAGE_URL, `${url}?${filterParamsStr}`),
      type,
    );
  };

  toggleChangeNameDialog = () => {
    const { setChangeNameVisible } = this.targetUserStore;

    setChangeNameVisible(true);
  };

  toggleChangeEmailDialog = (item: TItem) => {
    const { setDialogData, setChangeEmailVisible } = this.dialogStore;

    setDialogData(item);
    setChangeEmailVisible(true);
  };

  toggleChangePasswordDialog = (item: TItem) => {
    const { setDialogData } = this.dialogStore;
    const { setChangePasswordVisible } = this.targetUserStore;
    const { email } = item;

    setDialogData({
      email,
    });
    setChangePasswordVisible(true);
  };

  onEnableClick = (item: TItem) => {
    const { changeStatus } = this.usersStore;

    changeStatus(EmployeeStatus.Active, [item]);
  };

  onDisableClick = (item: TItem) => {
    const { changeStatus } = this.usersStore;

    changeStatus(EmployeeStatus.Disabled, [item]);
  };

  toggleDeleteProfileEverDialog = (item: TItem[]) => {
    const { setDialogData, setDeleteProfileDialogVisible, closeDialogs } =
      this.dialogStore;

    closeDialogs();

    setDialogData(item);
    setDeleteProfileDialogVisible(true);
  };

  toggleDataReassignmentDialog = (item: TItem) => {
    const { setDialogData, setDataReassignmentDialogVisible, closeDialogs } =
      this.dialogStore;

    if (!this.setup) return;

    const {
      dataReassignment,
      dataReassignmentProgress,
      dataReassignmentTerminate,
    } = this.setup;

    const {
      id,
      displayName,
      userName,
      avatar,
      statusType,
      isCollaborator,
      isVisitor,
    } = item;

    closeDialogs();

    setDialogData({
      user: {
        id,
        avatar,
        displayName,
        statusType,
        userName,
        isCollaborator,
        isVisitor,
      },
      reassignUserData: dataReassignment,
      getReassignmentProgress: dataReassignmentProgress,
      cancelReassignment: dataReassignmentTerminate,
      showDeleteProfileCheckbox: true,
    });

    setDataReassignmentDialogVisible(true);
  };

  onDetailsClick = (item: TItem) => {
    const { setBufferSelection } = this.usersStore;
    setBufferSelection(item);
    showInfoPanel();
  };

  onResetAuth = (item: TItem) => {
    const { setDialogData, setResetAuthDialogVisible } = this.dialogStore;

    setResetAuthDialogVisible(true);
    setDialogData(item.id);
  };

  get contactsCanCreate() {
    const isInsideGroup = this.usersStore.contactsTab === "inside_group";

    const isCollaborator = this.userStore.user?.isCollaborator;

    const canCreate = !isInsideGroup && !isCollaborator;

    return canCreate;
  }

  getContactsModel = (t: TTranslation, isSectionMenu: boolean) => {
    const { isRoomAdmin, isOwner, isAdmin } = this.userStore.user!;

    const someDialogIsOpen = checkDialogsOpen();

    if (
      !this.contactsCanCreate ||
      (isSectionMenu && (isMobile || someDialogIsOpen))
    )
      return null;

    const accountsUserOptions = [
      isOwner && {
        id: "accounts-add_administrator",
        className: "main-button_drop-down",
        icon: PersonAdminReactSvgUrl,
        label: t("Common:PortalAdmin", {
          productName: t("Common:ProductName"),
        }),
        onClick: () => this.inviteUser(EmployeeType.Admin),
        "data-type": EmployeeType.Admin,
        action: EmployeeType.Admin,
        key: "administrator",
      },
      isAdmin && {
        id: "accounts-add_manager",
        className: "main-button_drop-down",
        icon: PersonManagerReactSvgUrl,
        label: t("Common:RoomAdmin"),
        onClick: () => this.inviteUser(EmployeeType.RoomAdmin),
        "data-type": EmployeeType.RoomAdmin,
        action: EmployeeType.RoomAdmin,
        key: "manager",
      },
      {
        id: "accounts-add_collaborator",
        className: "main-button_drop-down",
        icon: PersonDefaultReactSvgUrl,
        label: t("Common:User"),
        onClick: () => this.inviteUser(EmployeeType.User),
        "data-type": EmployeeType.User,
        action: EmployeeType.User,
        key: "collaborator",
      },
      {
        key: "separator",
        isSeparator: true,
      },
      {
        id: "accounts-add_invite-again",
        className: "main-button_drop-down",
        icon: InviteAgainReactSvgUrl,
        label: t("People:LblInviteAgain"),
        onClick: () => onInviteMultipleAgain(t),
        "data-action": "invite-again",
        key: "invite-again",
      },
    ];

    const accountsFullOptions = [
      {
        id: "actions_invite_user",
        className: "main-button_drop-down",
        icon: PersonUserReactSvgUrl,
        label: t("Common:Invite"),
        key: "new-user",
        openByDefault: true,
        items: accountsUserOptions,
      },
      {
        id: "create_group",
        className: "main-button_drop-down",
        icon: GroupReactSvgUrl,
        label: t("PeopleTranslations:CreateGroup"),
        onClick: createGroup,
        action: "group",
        key: "group",
      },
    ];

    // Delete Invite
    if (!this.settingsStore.allowInvitingMembers)
      accountsFullOptions.splice(0, 1);

    return isRoomAdmin
      ? !this.settingsStore.allowInvitingMembers
        ? []
        : accountsUserOptions
      : accountsFullOptions;
  };

  inviteUser = (userType: EmployeeType) => {
    const { setQuotaWarningDialogVisible, setInvitePanelOptions } =
      this.dialogsStore;

    if (this.currentQuotaStore.showWarningDialog(userType as number)) {
      setQuotaWarningDialogVisible(true);
      return;
    }

    setInvitePanelOptions({
      visible: true,
      roomId: -1,
      hideSelector: true,
      defaultAccess: userType,
    });
  };
}

export default ContactsConextOptionsStore;
