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

import PencilReactSvgUrl from "PUBLIC_DIR/images/pencil.react.svg?url";
import ChangeMailReactSvgUrl from "PUBLIC_DIR/images/email.react.svg?url";
import ChangeSecurityReactSvgUrl from "PUBLIC_DIR/images/change.security.react.svg?url";
import FolderReactSvgUrl from "PUBLIC_DIR/images/folder.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import RemoveReactSvgUrl from "PUBLIC_DIR/images/remove.react.svg?url";
import DelDataReactSvgUrl from "PUBLIC_DIR/images/del_data.react.svg?url";
import TrashReactSvgUrl from "PUBLIC_DIR/images/trash.react.svg?url";
import InfoOutlineReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import RestoreAuthReactSvgUrl from "PUBLIC_DIR/images/restore.auth.react.svg?url";
import DisableReactSvgUrl from "PUBLIC_DIR/images/disable.react.svg?url";
import ProfileReactSvgUrl from "PUBLIC_DIR/images/profile.react.svg?url";
import RefreshReactSvgUrl from "PUBLIC_DIR/images/icons/16/refresh.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import ReassignDataReactSvgUrl from "PUBLIC_DIR/images/reassign.data.svg?url";
import { makeAutoObservable } from "mobx";
import { toastr } from "@docspace/shared/components/toast";

import { combineUrl } from "@docspace/shared/utils/combineUrl";
import { EmployeeStatus, FilterSubject } from "@docspace/shared/enums";
import { resendUserInvites } from "@docspace/shared/api/people";
import { getCategoryUrl } from "SRC_DIR/helpers/utils";
import { CategoryType } from "SRC_DIR/helpers/constants";
import RoomsFilter from "@docspace/shared/api/rooms/filter";
import { showEmailActivationToast } from "SRC_DIR/helpers/people-helpers";

const PROXY_HOMEPAGE_URL = combineUrl(window.ClientConfig?.proxy?.url, "/");

const PROFILE_SELF_URL = "/profile";

class AccountsContextOptionsStore {
  settingsStore = null;
  infoPanelStore = null;
  peopleStore = null;
  userStore = null;
  tfaStore = null;

  constructor(peopleStore, infoPanelStore, userStore, tfaStore, settingsStore) {
    makeAutoObservable(this);
    this.settingsStore = settingsStore;
    this.infoPanelStore = infoPanelStore;
    this.peopleStore = peopleStore;
    this.userStore = userStore;
    this.tfaStore = tfaStore;
  }

  getUserContextOptions = (t, options, item) => {
    const contextMenu = options.map((option) => {
      switch (option) {
        case "separator-1":
          return { key: option, isSeparator: true };
        case "separator-2":
          return { key: option, isSeparator: true };

        case "profile":
          return {
            id: "option_profile",
            key: option,
            icon: ProfileReactSvgUrl,
            label: t("Common:Profile"),
            onClick: this.peopleStore.profileActionsStore.onProfileClick,
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
            onClick: () => this.toggleChangeOwnerDialog(item),
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
            onClick: () => this.onEnableClick(t, item),
          };
        case "disable":
          return {
            id: "option_disable",
            key: option,
            icon: RemoveReactSvgUrl,
            label: t("PeopleTranslations:DisableUserButton"),
            onClick: () => this.onDisableClick(t, item),
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
            onClick: () => this.onDeletePersonalDataClick(t, item),
          };
        case "delete-user":
          return {
            id: "option_delete-user",
            key: option,
            icon: TrashReactSvgUrl,
            label: t("DeleteProfileEverDialog:DeleteUser"),
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
          return {
            id: "option_invite-again",
            key: option,
            icon: InviteAgainReactSvgUrl,
            label: t("LblInviteAgain"),
            onClick: () => this.onInviteAgainClick(t, item),
          };
        case "reset-auth":
          return {
            id: "option_reset-auth",
            key: option,
            icon: RestoreAuthReactSvgUrl,
            label: t("PeopleTranslations:ResetAuth"),
            onClick: () => this.onResetAuth(item),
            disabled: this.tfaStore.tfaSettings !== "app",
          };
        default:
          break;
      }

      return undefined;
    });

    return contextMenu;
  };

  getUserGroupContextOptions = (t) => {
    const { onChangeType, onChangeStatus } = this.peopleStore;

    const {
      hasUsersToMakeEmployees,
      hasUsersToActivate,
      hasUsersToDisable,
      hasUsersToInvite,
      hasUsersToRemove,
      hasFreeUsers,
    } = this.peopleStore.usersStore;
    const { setSendInviteDialogVisible, setDeleteProfileDialogVisible } =
      this.peopleStore.dialogStore;

    const { isOwner } = this.userStore.user;

    const { setIsVisible, isVisible } = this.infoPanelStore;

    const options = [];

    const adminOption = {
      id: "context-menu_administrator",
      className: "context-menu_drop-down",
      label: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      title: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      onClick: (e) => onChangeType(e, t),
      action: "admin",
      key: "cm-administrator",
    };
    const managerOption = {
      id: "context-menu_manager",
      className: "context-menu_drop-down",
      label: t("Common:RoomAdmin"),
      title: t("Common:RoomAdmin"),
      onClick: (e) => onChangeType(e, t),
      action: "manager",
      key: "cm-manager",
    };
    const userOption = {
      id: "context-menu_user",
      className: "context-menu_drop-down",
      label: t("Common:User"),
      title: t("Common:User"),
      onClick: (e) => onChangeType(e, t),
      action: "user",
      key: "cm-user",
    };

    isOwner && options.push(adminOption);

    options.push(managerOption);

    hasFreeUsers && options.push(userOption);

    const headerMenu = [
      {
        key: "cm-change-type",
        label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
        disabled: !hasUsersToMakeEmployees,
        icon: ChangeToEmployeeReactSvgUrl,
        items: options,
      },
      {
        key: "cm-info",
        label: t("Common:Info"),
        disabled: isVisible,
        onClick: () => setIsVisible(true),
        icon: InfoReactSvgUrl,
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
        disabled: !hasUsersToActivate,
        onClick: () => onChangeStatus(EmployeeStatus.Active),
        icon: EnableReactSvgUrl,
      },
      {
        key: "cm-disable",
        label: t("PeopleTranslations:DisableUserButton"),
        disabled: !hasUsersToDisable,
        onClick: () => onChangeStatus(EmployeeStatus.Disabled),
        icon: DisableReactSvgUrl,
      },
      {
        key: "cm-delete",
        label: t("Common:Delete"),
        disabled: !hasUsersToRemove,
        onClick: () => setDeleteProfileDialogVisible(true),
        icon: DeleteReactSvgUrl,
      },
    ];

    return headerMenu;
  };

  getModel = (item, t) => {
    const { selection } = this.peopleStore.usersStore;

    const { options } = item;

    const contextOptionsProps =
      options && options.length > 0
        ? selection.length > 1
          ? this.getUserGroupContextOptions(t)
          : this.getUserContextOptions(t, options, item)
        : [];

    return contextOptionsProps;
  };

  openUserRoomList = (user) => {
    const filter = RoomsFilter.getDefault();

    filter.subjectId = user.id;
    filter.subjectFilter = FilterSubject.Member;

    const { id } = this.userStore.user;

    const filterParamsStr = filter.toUrlParams(id);
    const url = getCategoryUrl(CategoryType.Shared);
    const type = this.settingsStore.isDesktopClient ? "_self" : "_blank";

    window.open(
      combineUrl(PROXY_HOMEPAGE_URL, `${url}?${filterParamsStr}`),
      type,
    );
  };

  toggleChangeNameDialog = () => {
    const { setChangeNameVisible } = this.peopleStore.targetUserStore;

    setChangeNameVisible(true);
  };

  toggleChangeEmailDialog = (item) => {
    const { setDialogData, setChangeEmailVisible } =
      this.peopleStore.dialogStore;

    setDialogData(item);
    setChangeEmailVisible(true);
  };

  toggleChangePasswordDialog = (item) => {
    const { setDialogData } = this.peopleStore.dialogStore;
    const { setChangePasswordVisible } = this.peopleStore.targetUserStore;
    const { email } = item;

    setDialogData({
      email,
    });
    setChangePasswordVisible(true);
  };

  toggleChangeOwnerDialog = () => {
    const { setChangeOwnerDialogVisible } = this.peopleStore.dialogStore;

    setChangeOwnerDialogVisible(true);
  };

  onEnableClick = (t, item) => {
    const { id } = item;

    const { changeStatus } = this.peopleStore;

    changeStatus(EmployeeStatus.Active, [id]);
  };

  onDisableClick = (t, item) => {
    const { id } = item;

    const { changeStatus } = this.peopleStore;

    changeStatus(EmployeeStatus.Disabled, [id]);
  };

  onDeletePersonalDataClick = (t, item) => {
    toastr.success(t("PeopleTranslations:SuccessDeletePersonalData"));
  };

  toggleDeleteProfileEverDialog = (item) => {
    const { setDialogData, setDeleteProfileDialogVisible, closeDialogs } =
      this.peopleStore.dialogStore;

    closeDialogs();

    setDialogData(item);
    setDeleteProfileDialogVisible(true);
  };

  toggleDataReassignmentDialog = (item) => {
    const { setDialogData, setDataReassignmentDialogVisible, closeDialogs } =
      this.peopleStore.dialogStore;
    const { id, displayName, userName, avatar, statusType } = item;

    closeDialogs();

    setDialogData({
      id,
      avatar,
      displayName,
      statusType,
      userName,
    });

    setDataReassignmentDialogVisible(true);
  };

  onDetailsClick = (item) => {
    const { setIsVisible } = this.infoPanelStore;
    const { setBufferSelection } = this.peopleStore.usersStore;
    setBufferSelection(item);
    setIsVisible(true);
  };

  onInviteAgainClick = (t, item) => {
    const { id, email } = item;
    resendUserInvites([id])
      .then(() => showEmailActivationToast(email))
      .catch((error) => toastr.error(error));
  };

  onResetAuth = (item) => {
    const { setDialogData, setResetAuthDialogVisible } =
      this.peopleStore.dialogStore;

    setResetAuthDialogVisible(true);
    setDialogData(item.id);
  };
}

export default AccountsContextOptionsStore;
