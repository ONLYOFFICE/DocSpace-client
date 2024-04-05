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
import { EmployeeStatus } from "@docspace/shared/enums";
import { getUserStatus } from "../helpers/people-helpers";

class SelectionStore {
  peopleStore = null;
  selection = [];
  selectionUsersRights = {
    isVisitor: 0,
    isCollaborator: 0,
    isRoomAdmin: 0,
    isAdmin: 0,
  };
  bufferSelection = null;
  selected = "none";

  constructor(peopleStore) {
    this.peopleStore = peopleStore;

    makeAutoObservable(this);
  }

  updateSelection = (peopleList) => {
    peopleList.some((el) => {
      if (el.id === this.selection[0].id) this.setSelection([el]);
    });
  };

  resetUsersRight = () => {
    for (const key in this.selectionUsersRights) {
      this.selectionUsersRights[key] = 0;
    }
  };

  incrementUsersRights = (selection) => {
    for (const key in this.selectionUsersRights) {
      if (selection[key]) {
        this.selectionUsersRights[key]++;
      }
    }
  };

  decrementUsersRights = (selection) => {
    for (const key in this.selectionUsersRights) {
      if (selection[key]) {
        this.selectionUsersRights[key]--;
      }
    }
  };

  setSelection = (selection) => {
    // console.log("setSelection", { selection });
    this.selection = selection;

    selection.length === 0 && this.resetUsersRight();
  };

  setSelections = (added, removed, clear = false) => {
    if (clear) {
      this.selection = [];
    }

    let newSelections = JSON.parse(JSON.stringify(this.selection));

    for (let item of added) {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      if (!value) return;
      const splitValue = value && value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const isFound = this.selection.findIndex((f) => f.id == id) === -1;

      if (isFound) {
        const user = this.peopleStore.usersStore.peopleList.find(
          (f) => f.id == id,
        );
        newSelections.push(user);

        this.incrementUsersRights(user);
      }
    }

    for (let item of removed) {
      if (!item) return;

      const value = item.getElementsByClassName("user-item")
        ? item.getElementsByClassName("user-item")[0]?.getAttribute("value")
        : null;

      const splitValue = value && value.split("_");
      const id = splitValue.slice(1, -3).join("_");

      const index = newSelections.findIndex((item) => item.id == id);

      if (index !== -1) {
        this.decrementUsersRights(newSelections[index]);
        newSelections.splice(index, 1);
      }
    }

    this.setSelection(newSelections);
  };

  setBufferSelection = (bufferSelection) => {
    this.bufferSelection = bufferSelection;
  };

  selectRow = (item) => {
    const isItemSelected = !!this.selection.find((s) => s.id === item.id);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (this.bufferSelection) {
      this.setBufferSelection(null);
    }

    if (isSingleSelected) {
      this.deselectUser(item);
    } else {
      this.clearSelection();
      this.selectUser(item);
    }
  };

  singleContextMenuAction = (item) => {
    if (this.selection.length) {
      this.clearSelection();
    }

    this.setBufferSelection(item);
  };

  multipleContextMenuAction = (item) => {
    const isItemSelected = !!this.selection.find((s) => s.id === item.id);
    const isSingleSelected = isItemSelected && this.selection.length === 1;

    if (!isItemSelected || isSingleSelected) {
      this.clearSelection();
      this.setBufferSelection(item);
    }
  };

  selectUser = (user) => {
    const index = this.selection.findIndex((el) => el.id === user.id);

    const exists = index > -1;

    // console.log("selectUser", { user, selection: this.selection, exists });

    if (exists) return;

    this.setSelection([...this.selection, user]);

    this.incrementUsersRights(user);
  };

  deselectUser = (user) => {
    const index = this.selection.findIndex((el) => el.id === user.id);

    const exists = index > -1;

    //console.log("deselectUser", { user, selection: this.selection, exists });

    if (!exists) return;

    const newData = [...this.selection];

    newData.splice(index, 1);

    this.decrementUsersRights(this.selection[index]);

    this.setSelection(newData);
  };

  selectAll = () => {
    this.bufferSelection = null;
    const list = this.peopleStore.usersStore.peopleList;
    this.setSelection(list);
  };

  clearSelection = () => {
    return this.setSelection([]);
  };

  selectByStatus = (status) => {
    this.bufferSelection = null;
    const list = this.peopleStore.usersStore.peopleList.filter(
      (u) => u.status === status,
    );

    this.setSelection(list);
  };

  getUserChecked = (user, selected) => {
    const status = getUserStatus(user);

    switch (selected) {
      case "all":
        return true;
      case "active":
        return status === "active";
      case "pending":
        return status === "pending";
      case "disabled":
        return status === "disabled";
      default:
        return false;
    }
  };

  getUsersBySelected = (users, selected) => {
    let newSelection = [];
    users.forEach((user) => {
      const checked = this.getUserChecked(user, selected);

      if (checked) newSelection.push(user);
    });

    return newSelection;
  };

  setSelected = (selected) => {
    this.bufferSelection = null;
    this.selected = selected;
    const list = this.peopleStore.usersStore.peopleList;
    this.setSelection(this.getUsersBySelected(list, selected));

    if (selected !== "none" && selected !== "close") {
      this.resetUsersRight();
      list.forEach((u) => this.incrementUsersRights(u));
    }

    return selected;
  };

  get hasAnybodySelected() {
    return this.selection.length > 0;
  }

  get hasUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canMakeEmployeeUser(x));

    return users.length > 0;
  }
  get hasUsersToMakePowerUser() {
    const { canMakePowerUser } = this.peopleStore.accessRightsStore;
    const users = this.selection.filter((x) => canMakePowerUser(x));

    return users.length > 0;
  }
  get getUsersToMakeEmployees() {
    const { canMakeEmployeeUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canMakeEmployeeUser(x));

    return users.map((u) => u);
  }

  get userSelectionRole() {
    if (this.selection.length !== 1) return null;

    return this.selection[0].role;
  }

  get isOneUserSelection() {
    return this.selection.length > 0 && this.selection.length === 1;
  }

  get hasFreeUsers() {
    const users = this.selection.filter(
      (x) => x.status !== EmployeeStatus.Disabled && x.isVisitor,
    );

    return users.length > 0;
  }

  get hasUsersToActivate() {
    const { canActivateUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.length > 0;
  }

  get getUsersToActivate() {
    const { canActivateUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canActivateUser(x));

    return users.map((u) => u);
  }

  get hasUsersToDisable() {
    const { canDisableUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.length > 0;
  }

  get getUsersToDisable() {
    const { canDisableUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canDisableUser(x));

    return users.map((u) => u);
  }

  get hasUsersToInvite() {
    const { canInviteUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0;
  }

  get getUsersToInviteIds() {
    const { canInviteUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canInviteUser(x));

    return users.length > 0 ? users.map((u) => u.id) : [];
  }

  get hasUsersToRemove() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.length > 0;
  }

  get hasOnlyOneUserToRemove() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.length === 1;
  }

  get getUsersToRemoveIds() {
    const { canRemoveUser } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => canRemoveUser(x));

    return users.map((u) => u.id);
  }

  get hasUsersToChangeQuota() {
    const { canChangeQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter(() => canChangeQuota());

    return users.length > 0;
  }

  get hasUsersToDisableQuota() {
    const { canDisableQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter(() => canDisableQuota());

    return users.length > 0;
  }

  get hasUsersToResetQuota() {
    const { caResetCustomQuota } = this.peopleStore.accessRightsStore;

    const users = this.selection.filter((x) => caResetCustomQuota(x));

    return users.length > 0;
  }
}

export default SelectionStore;
