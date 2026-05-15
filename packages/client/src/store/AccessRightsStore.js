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

import {
  EmployeeActivationStatus,
  EmployeeStatus,
  EmployeeType,
  FolderType,
} from "@docspace/shared/enums";

class AccessRightsStore {
  authStore = null;

  userStore = null;

  selectedFolderStore = null;

  treeFoldersStore = null;

  constructor(authStore, selectedFolderStore, userStore) {
    this.authStore = authStore;
    this.selectedFolderStore = selectedFolderStore;
    this.userStore = userStore;

    makeAutoObservable(this);
  }

  get canCreateFiles() {
    const { security } = this.selectedFolderStore;

    return security?.Create;
  }

  get canUseChat() {
    const { security } = this.selectedFolderStore;

    return !!security && "UseChat" in security && security.UseChat;
  }

  canMoveItems = (item) => {
    const { editing: fileEditing, security, rootFolderType } = item;

    if (rootFolderType === FolderType.TRASH || fileEditing) return false;

    return security?.Move;
  };

  canSubmitToFormGallery = () => {
    const { isVisitor } = this.userStore.user;

    return !isVisitor;
  };

  canChangeUserType = (user) => {
    const { id, isCollaborator, isRoomAdmin, isOwner } = this.userStore.user;
    if (isCollaborator || isRoomAdmin) return false;

    const { id: userId, statusType, role } = user;

    if (userId === id || statusType === "disabled") return false;

    switch (role) {
      case EmployeeType.Owner:
        return false;

      case EmployeeType.Admin:
        if (isOwner) {
          return true;
        }
        return false;
      case EmployeeType.RoomAdmin:
        return true;

      case EmployeeType.User:
      case EmployeeType.Guest:
        return true;

      default:
        return false;
    }
  };

  canMakeEmployeeUser = (user) => {
    const { id, isOwner, isAdmin, isRoomAdmin } = this.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
      isVisitor: userIsVisitor,
    } = user;

    const needMakeEmployee =
      status !== EmployeeStatus.Disabled && userId !== id;

    if (!needMakeEmployee) return false;

    if (isOwner) return true;

    if (isAdmin) return !userIsAdmin && !userIsOwner;

    if (isRoomAdmin && userIsVisitor) return true;

    return false;
  };

  canMakeUserType = (user) => {
    const { isVisitor: userIsVisitor, isCollaborator: userIsCollaborator } =
      user;

    return userIsVisitor || userIsCollaborator;
  };

  canActivateUser = (user) => {
    const { id, isOwner, isAdmin } = this.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needActivate = status === EmployeeStatus.Disabled && userId !== id;

    if (isOwner) return needActivate;

    if (isAdmin) return needActivate && !userIsAdmin && !userIsOwner;

    return false;
  };

  canDisableUser = (user) => {
    const { id, isOwner, isAdmin } = this.userStore.user;

    const {
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
      isLDAP,
    } = user;

    if (isLDAP) return false;

    const needDisable =
      (status == EmployeeStatus.Active || status == EmployeeStatus.Pending) &&
      userId !== id;

    if (isOwner) return needDisable;

    if (isAdmin) return needDisable && !userIsAdmin && !userIsOwner;

    return false;
  };

  canInviteUser = (user) => {
    const { id, isOwner } = this.userStore.user;

    const {
      activationStatus,
      status,
      id: userId,
      isAdmin: userIsAdmin,
      isOwner: userIsOwner,
    } = user;

    const needInvite =
      activationStatus === EmployeeActivationStatus.Pending &&
      status !== EmployeeStatus.Disabled &&
      status !== EmployeeStatus.Active &&
      userId !== id;

    if (isOwner) return needInvite;

    return needInvite && !userIsAdmin && !userIsOwner;
  };

  canRemoveUser = (user) => {
    const { id, isOwner, isAdmin } = this.userStore.user;

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
