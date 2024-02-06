import InfoReactSvgUrl from "PUBLIC_DIR/images/info.outline.react.svg?url";
import EnableReactSvgUrl from "PUBLIC_DIR/images/enable.react.svg?url";
import DisableReactSvgUrl from "PUBLIC_DIR/images/disable.react.svg?url";
import ChangeToEmployeeReactSvgUrl from "PUBLIC_DIR/images/change.to.employee.react.svg?url";
import InviteAgainReactSvgUrl from "PUBLIC_DIR/images/invite.again.react.svg?url";
import DeleteReactSvgUrl from "PUBLIC_DIR/images/delete.react.svg?url";
import ChangQuotaReactSvgUrl from "PUBLIC_DIR/images/change.quota.react.svg?url";
import DisableQuotaReactSvgUrl from "PUBLIC_DIR/images/disable.quota.react.svg?url";
import DefaultQuotaReactSvgUrl from "PUBLIC_DIR/images/default.quota.react.svg?url";
import { makeAutoObservable } from "mobx";
import GroupsStore from "./GroupsStore";
import UsersStore from "./UsersStore";
import TargetUserStore from "./TargetUserStore";
import SelectedGroupStore from "./SelectedGroupStore";
import EditingFormStore from "./EditingFormStore";
import FilterStore from "./FilterStore";
import SelectionStore from "./SelectionPeopleStore";
import HeaderMenuStore from "./HeaderMenuStore";
import AvatarEditorStore from "./AvatarEditorStore";
import InviteLinksStore from "./InviteLinksStore";
import DialogStore from "./DialogStore";

import AccountsContextOptionsStore from "./AccountsContextOptionsStore";
import { isMobile, isTablet, isDesktop } from "@docspace/shared/utils";

import { toastr } from "@docspace/shared/components/toast";
import { EmployeeStatus, Events } from "@docspace/shared/enums";
import Filter from "@docspace/shared/api/people/filter";

class PeopleStore {
  contextOptionsStore = null;
  authStore = null;
  dialogsStore = null;
  groupsStore = null;
  usersStore = null;
  targetUserStore = null;
  selectedGroupStore = null;
  editingFormStore = null;
  filterStore = null;
  selectionStore = null;
  headerMenuStore = null;
  avatarEditorStore = null;
  inviteLinksStore = null;
  dialogStore = null;
  setupStore = null;
  accessRightsStore = null;
  profileActionsStore = null;
  infoPanelStore = null;
  userStore = null;

  isInit = false;
  viewAs = isDesktop() ? "table" : "row";
  isLoadedProfileSectionBody = false;

  constructor(
    authStore,
    setupStore,
    accessRightsStore,
    dialogsStore,
    infoPanelStore,
    userStore,
    tfaStore,
    settingsStore
  ) {
    this.authStore = authStore;
    this.infoPanelStore = infoPanelStore;
    this.groupsStore = new GroupsStore(this);
    this.usersStore = new UsersStore(
      this,
      settingsStore,
      infoPanelStore,
      userStore
    );
    this.targetUserStore = new TargetUserStore(this, userStore);
    this.selectedGroupStore = new SelectedGroupStore(this);
    this.editingFormStore = new EditingFormStore(this);
    this.filterStore = new FilterStore();
    this.selectionStore = new SelectionStore(this);
    this.headerMenuStore = new HeaderMenuStore(this);
    this.avatarEditorStore = new AvatarEditorStore(this);
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
      settingsStore
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

    window.DocSpace.navigate(`accounts/filter?${filter.toUrlParams()}`);
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
        (item, index) => fromType.indexOf(item) === index && item !== type
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
    console.log("==changeUserQuota", userIDs);
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
    const { infoPanelStore } = this.authStore;
    const { setInfoPanelSelection } = infoPanelStore;

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
    const { infoPanelStore } = this.authStore;
    const { setInfoPanelSelection } = infoPanelStore;
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
      label: t("Common:DocSpaceAdmin"),
      title: t("Common:DocSpaceAdmin"),
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
      title: t("Common:PowerUser"),
      label: t("Common:PowerUser"),
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
  getHeaderMenu = (t) => {
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
}

export default PeopleStore;
