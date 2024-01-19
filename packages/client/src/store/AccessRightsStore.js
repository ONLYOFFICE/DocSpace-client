import { makeAutoObservable } from "mobx";

import {
  EmployeeActivationStatus,
  EmployeeStatus,
  FolderType,
  ShareAccessRights,
} from "@docspace/shared/enums";

class AccessRightsStore {
  authStore = null;
  selectedFolderStore = null;
  treeFoldersStore = null;

  constructor(authStore, selectedFolderStore) {
    this.authStore = authStore;
    this.selectedFolderStore = selectedFolderStore;

    makeAutoObservable(this);
  }

  get canCreateFiles() {
    const { security } = this.selectedFolderStore;

    return security?.Create;
  }

  canMoveItems = (item) => {
    const { editing: fileEditing, security, rootFolderType } = item;

    if (rootFolderType === FolderType.TRASH || fileEditing) return false;

    return security?.Move;
  };

  canSubmitToFormGallery = () => {
    const { isVisitor } = this.authStore.userStore.user;

    return !isVisitor;
  };

  canChangeUserType = (user) => {
    const { id, isOwner, isAdmin } = this.authStore.userStore.user;

    const { id: userId, statusType, role } = user;

    if (userId === id || statusType === "disabled") return false;

    switch (role) {
      case "owner":
        return false;

      case "admin":
      case "manager":
        if (isOwner) {
          return true;
        } else {
          return false;
        }

      case "collaborator":
      case "user":
        return true;

      default:
        return false;
    }
  };

  canMakeEmployeeUser = (user) => {
    const { id, isOwner } = this.authStore.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
      isVisitor: userIsVisitor,
      isCollaborator: userIsCollaborator,
    } = user;

    const needMakeEmployee =
      status !== EmployeeStatus.Disabled && userId !== id;

    if (isOwner) return needMakeEmployee;

    return (
      needMakeEmployee &&
      !userIsAdmin &&
      !userIsOwner &&
      (userIsVisitor || userIsCollaborator)
    );
  };
  canMakePowerUser = (user) => {
    const { isVisitor: userIsVisitor, isCollaborator: userIsCollaborator } =
      user;

    return userIsVisitor || userIsCollaborator;
  };

  canActivateUser = (user) => {
    const { id, isOwner, isAdmin } = this.authStore.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needActivate = status !== EmployeeStatus.Active && userId !== id;

    if (isOwner) return needActivate;

    if (isAdmin) return needActivate && !userIsAdmin && !userIsOwner;

    return false;
  };

  canDisableUser = (user) => {
    const { id, isOwner, isAdmin } = this.authStore.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needDisable = status !== EmployeeStatus.Disabled && userId !== id;

    if (isOwner) return needDisable;

    if (isAdmin) return needDisable && !userIsAdmin && !userIsOwner;

    return false;
  };

  canInviteUser = (user) => {
    const { id, isOwner } = this.authStore.userStore.user;

    const {
      activationStatus,
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needInvite =
      activationStatus === EmployeeActivationStatus.Pending &&
      status === EmployeeStatus.Active &&
      userId !== id;

    if (isOwner) return needInvite;

    return needInvite && !userIsAdmin && !userIsOwner;
  };

  canRemoveUser = (user) => {
    const { id, isOwner, isAdmin } = this.authStore.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needRemove = status === EmployeeStatus.Disabled && userId !== id;

    if (isOwner) return needRemove;

    if (isAdmin) return needRemove && !userIsAdmin && !userIsOwner;

    return false;
  };

  canChangeQuota = () => {
    const { isOwner, isAdmin } = this.authStore.userStore.user;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isOwner && !isAdmin) return false;

    return isDefaultUsersQuotaSet;
  };
  canDisableQuota = () => {
    const { isOwner, isAdmin } = this.authStore.userStore.user;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isOwner && !isAdmin) return false;

    return isDefaultUsersQuotaSet;
  };

  caResetCustomQuota = (user) => {
    const { isOwner, isAdmin } = this.authStore.userStore.user;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isDefaultUsersQuotaSet) return false;

    if (!isOwner && !isAdmin) return false;

    return user.isCustomQuota;
  };
}

export default AccessRightsStore;
