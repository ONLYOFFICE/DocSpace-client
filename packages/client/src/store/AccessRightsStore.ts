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
import type {
  TFileSecurity,
  TFolderSecurity,
} from "@docspace/shared/api/files/types";
import type { TRoomSecurity } from "@docspace/shared/api/rooms/types";
import type { UserStore } from "@docspace/shared/store/UserStore";
import type { CurrentQuotasStore } from "@docspace/shared/store/CurrentQuotaStore";

import type { TPeopleListItem } from "SRC_DIR/helpers/contacts";

import type SelectedFolderStore from "./SelectedFolderStore";

// FABLE5-REVIEW: `userStore` and `currentQuotaStore` are declared `private`
// in the shared AuthStore class, but the original .js code reached into them
// externally (this.authStore.userStore.user, this.authStore.currentQuotaStore).
// This structural type mirrors that runtime access; replace with
// `import type { AuthStore }` once those members are made public.
type TAuthStore = {
  userStore: Pick<UserStore, "user">;
  currentQuotaStore: Pick<CurrentQuotasStore, "isDefaultUsersQuotaSet">;
};

// Minimal shape of the items FilesStore.js spreads into `canMoveItems`
// (file/folder/room list item plus the injected `editing` flag).
type TCanMoveItem = {
  editing?: boolean;
  security?: TFileSecurity | TFolderSecurity | TRoomSecurity | null;
  rootFolderType?: FolderType;
};

class AccessRightsStore {
  // `null!` keeps the original runtime field initializer (null) while the
  // constructor immediately assigns the real store.
  authStore: TAuthStore = null!;

  userStore: UserStore = null!;

  selectedFolderStore: SelectedFolderStore = null!;

  // FABLE5-REVIEW: `treeFoldersStore` is never assigned (the constructor takes
  // only three deps) and never read — it stays `null` forever. Kept as-is for
  // a types-only conversion; candidate for removal.
  treeFoldersStore: null = null;

  constructor(
    authStore: TAuthStore,
    selectedFolderStore: SelectedFolderStore,
    userStore: UserStore,
  ) {
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
    const { security, private: isPrivate } = this.selectedFolderStore;

    if (isPrivate) return false;

    return !!security && "UseChat" in security && security.UseChat;
  }

  canMoveItems = (item: TCanMoveItem) => {
    const { editing: fileEditing, security, rootFolderType } = item;

    if (rootFolderType === FolderType.TRASH || fileEditing) return false;

    return security?.Move;
  };

  canSubmitToFormGallery = () => {
    // FABLE5-REVIEW: `user` is `TUser | null`; the original .js dereferenced it
    // unconditionally (would throw if null), so `!` preserves that runtime.
    // Same applies to every `.user!` below.
    const { isVisitor } = this.userStore.user!;

    return !isVisitor;
  };

  canChangeUserType = (user: TPeopleListItem) => {
    const { id, isCollaborator, isRoomAdmin, isOwner } = this.userStore.user!;
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

  canMakeEmployeeUser = (user: TPeopleListItem) => {
    const { id, isOwner, isAdmin, isRoomAdmin } = this.userStore.user!;

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

  canMakeUserType = (user: TPeopleListItem) => {
    const { isVisitor: userIsVisitor, isCollaborator: userIsCollaborator } =
      user;

    return userIsVisitor || userIsCollaborator;
  };

  canActivateUser = (user: TPeopleListItem) => {
    const { id, isOwner, isAdmin } = this.userStore.user!;

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

  canDisableUser = (user: TPeopleListItem) => {
    const { id, isOwner, isAdmin } = this.userStore.user!;

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

  canInviteUser = (user: TPeopleListItem) => {
    const { id, isOwner } = this.userStore.user!;

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

  canRemoveUser = (user: TPeopleListItem) => {
    const { id, isOwner, isAdmin } = this.userStore.user!;

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
    const { isOwner, isAdmin } = this.authStore.userStore.user!;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isOwner && !isAdmin) return false;

    return isDefaultUsersQuotaSet;
  };

  canDisableQuota = () => {
    const { isOwner, isAdmin } = this.authStore.userStore.user!;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isOwner && !isAdmin) return false;

    return isDefaultUsersQuotaSet;
  };

  caResetCustomQuota = (user: TPeopleListItem) => {
    const { isOwner, isAdmin } = this.authStore.userStore.user!;
    const { isDefaultUsersQuotaSet } = this.authStore.currentQuotaStore;

    if (!isDefaultUsersQuotaSet) return false;

    if (!isOwner && !isAdmin) return false;

    return user.isCustomQuota;
  };
}

export default AccessRightsStore;
