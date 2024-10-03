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

import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import DisableReactSvgUrl from "PUBLIC_DIR/images/disable.react.svg?url";
import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import { makeAutoObservable, runInAction } from "mobx";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import DefaultQuotaReactSvgUrl from "PUBLIC_DIR/images/default.quota.react.svg?url";
import GroupsStore from "./GroupsStore";
import UsersStore from "./UsersStore";
import TargetUserStore from "./TargetUserStore";
import SelectionStore from "./SelectionPeopleStore";
import AccountsHotkeysStore from "./AccountsHotkeysStore";
import HeaderMenuStore from "./HeaderMenuStore";

import InviteLinksStore from "./InviteLinksStore";
import DialogStore from "./DialogStore";

import AccountsContextOptionsStore from "./AccountsContextOptionsStore";
import { isMobile, isTablet, isDesktop } from "@docspace/shared/utils";

import { toastr } from "@docspace/shared/components/toast";
import api from "@docspace/shared/api";
import {
  EmployeeActivationStatus,
  EmployeeStatus,
  Events,
} from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";
import { deleteGroup } from "@docspace/shared/api/groups";

class PeopleStore {
  contextOptionsStore = null;
  authStore = null;
  dialogsStore = null;
  groupsStore = null;
  usersStore = null;
  targetUserStore = null;
  selectionStore = null;
  headerMenuStore = null;

  inviteLinksStore = null;
  dialogStore = null;
  setupStore = null;
  accessRightsStore = null;
  profileActionsStore = null;
  infoPanelStore = null;
  userStore = null;
  accountsHotkeysStore = null;

  isInit = false;
  viewAs = isDesktop() ? "table" : "row";
  isLoadedProfileSectionBody = false;
  enabledHotkeys = true;

  constructor(
    authStore,
    setupStore,
    accessRightsStore,
    dialogsStore,
    infoPanelStore,
    userStore,
    tfaStore,
    settingsStore,
    clientLoadingStore,
  ) {
    this.authStore = authStore;
    this.infoPanelStore = infoPanelStore;
    this.usersStore = new UsersStore(
      this,
      settingsStore,
      infoPanelStore,
      userStore,
    );
    this.accountsHotkeysStore = new AccountsHotkeysStore(this);
    this.groupsStore = new GroupsStore(
      authStore,
      this,
      infoPanelStore,
      clientLoadingStore,
    );
    this.targetUserStore = new TargetUserStore(this, userStore);
    this.selectionStore = new SelectionStore(this);
    this.headerMenuStore = new HeaderMenuStore(this);
    this.inviteLinksStore = new InviteLinksStore(this);
    this.dialogStore = new DialogStore();
    this.userStore = userStore;

    this.setupStore = setupStore;
    this.accessRightsStore = accessRightsStore;
    this.dialogsStore = dialogsStore;

    this.contextOptionsStore = new AccountsContextOptionsStore(
      this,
      infoPanelStore,
      userStore,
      tfaStore,
      settingsStore,
    );

    makeAutoObservable(this);
  }

  get isPeoplesAdmin() {
    return this.authStore.isAdmin;
  }

  init = async () => {
    if (this.isInit) return;
    this.isInit = true;

    //this.authStore.settingsStore.setModuleInfo(config.homepage, config.id);
  };

  reset = () => {
    this.isInit = false;
  };

  resetFilter = () => {
    const filter = Filter.getDefault();

    window.DocSpace.navigate(`accounts/people/filter?${filter.toUrlParams()}`);
  };

  onChangeType = (e) => {
    const action = e?.action ? e.action : e?.currentTarget?.dataset?.action;

    const { getUsersToMakeEmployees } = this.selectionStore;

    this.changeType(action, getUsersToMakeEmployees);
  };

  changeType = (type, users, successCallback, abortCallback) => {
    const { setDialogData } = this.dialogStore;
    const { getUserRole } = this.usersStore;
    const event = new Event(Events.CHANGE_USER_TYPE);

    let fromType =
      users.length === 1
        ? [users[0].role ? users[0].role : getUserRole(users[0])]
        : users.map((u) => (u.role ? u.role : getUserRole(u)));

    if (users.length > 1) {
      fromType = fromType.filter(
        (item, index) => fromType.indexOf(item) === index && item !== type,
      );

      if (fromType.length === 0) fromType = [fromType[0]];
    }

    if (fromType.length === 1 && fromType[0] === type) return false;

    const userIDs = users
      .filter((u) => u.role !== type)
      .map((user) => {
        return user?.id ? user.id : user;
      });

    setDialogData({
      toType: type,
      fromType,
      userIDs,
      successCallback,
      abortCallback,
    });

    window.dispatchEvent(event);

    return true;
  };

  changeUserQuota = (users, successCallback, abortCallback) => {
    const event = new Event(Events.CHANGE_QUOTA);

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
  disableUserQuota = async (users, t) => {
    const { setCustomUserQuota, getPeopleListItem } = this.usersStore;
    const { setInfoPanelSelection } = this.infoPanelStore;

    const userIDs = users.map((user) => {
      return user?.id ? user.id : user;
    });

    try {
      const items = await setCustomUserQuota(-1, userIDs);
      const users = [];
      items.map((u) => users.push(getPeopleListItem(u)));

      if (items.length === 1) {
        setInfoPanelSelection(getPeopleListItem(items[0]));
      } else {
        setInfoPanelSelection(items);
      }

      toastr.success(t("Common:StorageQuotaDisabled"));
    } catch (e) {
      toastr.error(e);
    }
  };
  resetUserQuota = async (users, t) => {
    const { resetUserQuota, getPeopleListItem } = this.usersStore;
    const { setInfoPanelSelection } = this.infoPanelStore;
    const userIDs = users.map((user) => {
      return user?.id ? user.id : user;
    });

    try {
      const items = await resetUserQuota(userIDs);

      const users = [];
      items.map((u) => users.push(getPeopleListItem(u)));

      if (items.length === 1) {
        setInfoPanelSelection(getPeopleListItem(items[0]));
      } else {
        setInfoPanelSelection(items);
      }

      toastr.success(t("Common:StorageQuotaReset"));
    } catch (e) {
      toastr.error(e);
    }
  };

  onChangeStatus = (status) => {
    const users = [];

    if (status === EmployeeStatus.Active) {
      const { getUsersToActivate } = this.selectionStore;

      users.push(...getUsersToActivate);
    } else {
      const { getUsersToDisable } = this.selectionStore;

      users.push(...getUsersToDisable);
    }

    this.changeStatus(status, users);
  };

  changeStatus = (status, users) => {
    const { setChangeUserStatusDialogVisible, setDialogData } =
      this.dialogStore;

    const userIDs = users.map((user) => {
      return user?.id ? user.id : user;
    });

    setDialogData({ status, userIDs });

    setChangeUserStatusDialogVisible(true);
  };

  onOpenInfoPanel = () => {
    const { setIsVisible } = this.infoPanelStore;
    setIsVisible(true);
  };

  getUsersRightsSubmenu = (t) => {
    const { userSelectionRole, selectionUsersRights } = this.selectionStore;

    const { isOwner } = this.userStore.user;

    const options = [];

    const adminOption = {
      id: "menu_change-user_administrator",
      className: "group-menu_drop-down",
      label: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      title: t("Common:PortalAdmin", { productName: t("Common:ProductName") }),
      onClick: (e) => this.onChangeType(e),
      "data-action": "admin",
      key: "administrator",
      isActive: userSelectionRole === "admin",
    };
    const managerOption = {
      id: "menu_change-user_manager",
      className: "group-menu_drop-down",
      label: t("Common:RoomAdmin"),
      title: t("Common:RoomAdmin"),
      onClick: (e) => this.onChangeType(e),
      "data-action": "manager",
      key: "manager",
      isActive: userSelectionRole === "manager",
    };
    // const userOption = {
    //   id: "menu_change-user_user",
    //   className: "group-menu_drop-down",
    //   label: t("Common:User"),
    //   title: t("Common:User"),
    //   onClick: (e) => this.onChangeType(e),
    //   "data-action": "user",
    //   key: "user",
    //   isActive: userSelectionRole === "user",
    // };

    const collaboratorOption = {
      id: "menu_change-collaborator",
      key: "collaborator",
      title: t("Common:User"),
      label: t("Common:User"),
      "data-action": "collaborator",
      onClick: (e) => this.onChangeType(e),
      isActive: userSelectionRole === "collaborator",
    };

    const { isVisitor, isCollaborator, isRoomAdmin, isAdmin } =
      selectionUsersRights;

    if (isVisitor > 0) {
      isOwner && options.push(adminOption);
      options.push(managerOption);
      options.push(collaboratorOption);

      return options;
    }

    if (isCollaborator > 0 || (isRoomAdmin > 0 && isAdmin > 0)) {
      isOwner && options.push(adminOption);
      options.push(managerOption);

      return options;
    }

    if (isRoomAdmin > 0) {
      isOwner && options.push(adminOption);

      return options;
    }

    if (isAdmin > 0) {
      options.push(managerOption);

      return options;
    }
  };

  onDeleteClick = () => {
    const { setDeleteGroupDialogVisible } = this.dialogStore;
    const { selection, setGroupName } = this.groupsStore;
    setGroupName(selection[0].name);
    setDeleteGroupDialogVisible(true);
  };

  getHeaderMenu = (t, isGroupsPage = false) => {
    const {
      hasUsersToMakeEmployees,
      hasUsersToActivate,
      hasUsersToDisable,
      hasUsersToInvite,
      hasUsersToRemove,
      hasUsersToChangeQuota,
      hasUsersToResetQuota,
      hasUsersToDisableQuota,
      selection,
    } = this.selectionStore;

    const { setSendInviteDialogVisible } = this.dialogStore;
    const { toggleDeleteProfileEverDialog } = this.contextOptionsStore;

    const { isVisible } = this.infoPanelStore;

    if (isGroupsPage)
      return [
        {
          id: "menu-delete",
          key: "delete",
          label: t("Common:Delete"),
          onClick: () => this.onDeleteClick(),
          iconUrl: DeleteReactSvgUrl,
        },
      ];

    const headerMenu = [
      {
        id: "menu-change-type",
        key: "change-user",
        label: t("ChangeUserTypeDialog:ChangeUserTypeButton"),
        disabled: !hasUsersToMakeEmployees,
        iconUrl: ChangeToEmployeeReactSvgUrl,
        withDropDown: true,
        options: this.getUsersRightsSubmenu(t),
      },
      {
        id: "menu-info",
        key: "info",
        label: t("Common:Info"),
        disabled:
          isVisible ||
          !(isTablet() || isMobile() || !isDesktop()) ||
          selection.length > 1,
        onClick: (item) => this.onOpenInfoPanel(item),
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
        onClick: () => this.onChangeStatus(EmployeeStatus.Active),
        iconUrl: EnableReactSvgUrl,
      },
      {
        id: "menu-disable",
        key: "disable",
        label: t("PeopleTranslations:DisableUserButton"),
        disabled: !hasUsersToDisable,
        onClick: () => this.onChangeStatus(EmployeeStatus.Disabled),
        iconUrl: DisableReactSvgUrl,
      },
      {
        id: "menu-change-quota",
        key: "change-quota",
        label: t("Common:ChangeQuota"),
        disabled: !hasUsersToChangeQuota,
        iconUrl: ChangQuotaReactSvgUrl,
        onClick: () => this.changeUserQuota(selection),
      },
      {
        id: "menu-default-quota",
        key: "default-quota",
        label: t("Common:SetToDefault"),
        disabled: !hasUsersToResetQuota,
        iconUrl: DefaultQuotaReactSvgUrl,
        onClick: () => this.resetUserQuota(selection, t),
      },
      {
        id: "menu-disable-quota",
        key: "disable-quota",
        label: t("Common:DisableQuota"),
        disabled: !hasUsersToDisableQuota,
        iconUrl: DisableQuotaReactSvgUrl,
        onClick: () => this.disableUserQuota(selection, t),
      },
      {
        id: "menu-delete",
        key: "delete",
        label: t("Common:Delete"),
        disabled: !hasUsersToRemove,
        onClick: () => toggleDeleteProfileEverDialog(selection),
        iconUrl: DeleteReactSvgUrl,
      },
    ];

    return headerMenu;
  };

  setViewAs = (viewAs) => {
    this.viewAs = viewAs;
  };

  setIsLoadedProfileSectionBody = (isLoadedProfileSectionBody) => {
    this.isLoadedProfileSectionBody = isLoadedProfileSectionBody;
  };

  getUserRole = (user) => {
    if (user.isOwner) return "owner";
    else if (user.isAdmin) return "admin";
    else if (user.isCollaborator) return "collaborator";
    else if (user.isVisitor) return "user";
    else return "manager";
  };

  setEnabledHotkeys = (enabledHotkeys) => {
    this.enabledHotkeys = enabledHotkeys;
  };
}

export default PeopleStore;
